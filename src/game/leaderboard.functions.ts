import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { QUESTIONS } from "./questions";
import { dailyQuestions } from "./selection";
import type { QuestionCounts } from "./scoring";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Real answer counts for a set of questions (powers frequency-based tiers). */
export const getAnswerCounts = createServerFn({ method: "POST" })
  .inputValidator((d: { questionIds: string[] }) => ({ questionIds: d.questionIds.slice(0, 20).map(String) }))
  .handler(async ({ data }) => {
    const out: Record<string, QuestionCounts> = {};
    const { data: rows, error } = await publicClient()
      .from("answer_counts").select("question_id, answer_key, count").in("question_id", data.questionIds);
    if (error) { console.error(error); return out; }
    for (const r of rows ?? []) {
      const d = (out[r.question_id] ??= { total: 0, counts: {} });
      d.counts[r.answer_key] = r.count;
      d.total += r.count;
    }
    return out;
  });

const UUID = /^[0-9a-f-]{36}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Record a finished round: bump answer frequencies, and post daily scores to the leaderboard. */
export const submitRound = createServerFn({ method: "POST" })
  .inputValidator((d: {
    playerId: string; name: string | null; mode: "daily" | "practice"; day: string;
    score: number; tiers: string[]; answers: { questionId: string; key: string }[];
  }) => {
    if (!UUID.test(d.playerId) || !DAY.test(d.day)) throw new Error("Bad request");
    return {
      playerId: d.playerId,
      name: d.name ? String(d.name).trim().slice(0, 20) : null,
      mode: d.mode === "daily" ? "daily" as const : "practice" as const,
      day: d.day,
      score: Math.max(0, Math.min(700, Math.round(Number(d.score) || 0))),
      tiers: (d.tiers ?? []).slice(0, 7).map(String),
      answers: (d.answers ?? []).slice(0, 7).map((a) => ({ questionId: String(a.questionId), key: String(a.key).slice(0, 80) })),
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const valid = new Set(data.mode === "daily" ? dailyQuestions(data.day).map((q) => q.id) : QUESTIONS.map((q) => q.id));
    const answers = data.answers.filter((a) => valid.has(a.questionId) && a.key);
    let posted = false;
    if (data.mode === "daily") {
      // One leaderboard entry (and one set of counted answers) per player per day.
      const { error } = await supabaseAdmin.from("daily_scores").insert({
        day: data.day, player_id: data.playerId, player_name: data.name || "Anonymous", score: data.score, tiers: data.tiers,
      });
      if (error && error.code !== "23505") console.error(error);
      if (error) return { posted: false };
      posted = true;
    }
    if (answers.length) {
      const { error } = await supabaseAdmin.rpc("bump_answers", {
        _question_ids: answers.map((a) => a.questionId), _keys: answers.map((a) => a.key),
      });
      if (error) console.error(error);
    }
    return { posted };
  });

/** Rename yourself on the leaderboard (today's entry). */
export const renameEntry = createServerFn({ method: "POST" })
  .inputValidator((d: { playerId: string; name: string }) => {
    if (!UUID.test(d.playerId)) throw new Error("Bad request");
    const name = String(d.name).trim().slice(0, 20);
    if (!name) throw new Error("Name required");
    return { playerId: d.playerId, name };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("daily_scores").update({ player_name: data.name }).eq("player_id", data.playerId);
    return { ok: true };
  });

export const getLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d: { day: string }) => {
    if (!DAY.test(d.day)) throw new Error("Bad day");
    return d;
  })
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [today, all] = await Promise.all([
      sb.from("daily_scores").select("id, player_name, score, tiers, created_at").eq("day", data.day)
        .order("score", { ascending: false }).order("created_at").limit(50),
      sb.rpc("leaderboard_alltime", { _limit: 50 }),
    ]);
    if (today.error) console.error(today.error);
    if (all.error) console.error(all.error);
    return {
      today: today.data ?? [],
      allTime: (all.data ?? []).map((r) => ({ ...r, total: Number(r.total), games: Number(r.games) })),
    };
  });
