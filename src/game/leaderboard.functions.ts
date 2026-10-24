import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { dailyQuestions, dayIsCurrent } from "./selection";
import { frequencyRarity, normalize, type QuestionCounts } from "./scoring";

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
      .rpc("question_answer_counts", { _question_ids: data.questionIds });
    if (error) { console.error(error); return out; }
    for (const r of rows ?? []) {
      const d = (out[r.question_id] ??= { total: 0, counts: {} });
      d.counts[r.answer_key] = r.count;
      d.total += r.count;
    }
    return out;
  });

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Submit a Daily Challenge for ranking. The server re-scores every typed answer itself,
 * so the leaderboard can't be faked by sending a made-up score.
 */
export const submitRanked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { day: string; typed: (string | null)[] }) => {
    if (!DAY.test(d.day) || !Array.isArray(d.typed)) throw new Error("Bad request");
    return { day: d.day, typed: d.typed.slice(0, 7).map((t) => (t ? String(t).slice(0, 60) : null)) };
  })
  .handler(async ({ data, context }) => {
    if (!dayIsCurrent(data.day)) return { ok: false as const, error: "That daily has closed" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin.from("ranked_scores").select("score")
      .eq("user_id", context.userId).eq("day", data.day).maybeSingle();
    if (existing) return { ok: true as const, score: existing.score, already: true };

    const { verifyAnswer, loadCounts } = await import("./judge.server");
    const qs = dailyQuestions(data.day);
    if (qs.length !== 7) return { ok: false as const, error: "New daily questions are awaiting review" };
    const rarity = frequencyRarity(await loadCounts(qs.map((q) => q.id)));
    const results = await Promise.all(qs.map((q, i) => verifyAnswer(q, data.typed[i] ?? null, rarity)));
    const score = results.reduce((s, r) => s + (r?.points ?? 0), 0);

    const { error } = await supabaseAdmin.from("ranked_scores").insert({
      user_id: context.userId, day: data.day, score,
      tiers: results.map((r) => r?.tier ?? "none"),
      answers: results.map((r, i) => ({ q: qs[i]!.id, typed: data.typed[i] ?? null, display: r?.display ?? null, points: r?.points ?? 0 })),
    });
    if (error) {
      if (error.code === "23505") return { ok: true as const, score, already: true };
      console.error(error);
      return { ok: false as const, error: "Couldn't save your score" };
    }
    const hits = results.flatMap((r, i) => (r ? [{ q: qs[i]!.id, k: normalize(r.display) }] : []));
    if (hits.length) {
      await supabaseAdmin.rpc("bump_answers", { _question_ids: hits.map((h) => h.q), _keys: hits.map((h) => h.k) });
    }
    return { ok: true as const, score, already: false };
  });

export const getLeaderboard = createServerFn({ method: "POST" })
  .inputValidator((d: { day: string }) => {
    if (!DAY.test(d.day)) throw new Error("Bad day");
    return d;
  })
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [today, all] = await Promise.all([
      sb.rpc("ranked_daily", { _day: data.day }),
      sb.rpc("ranked_alltime", { _limit: 50 }),
    ]);
    if (today.error) console.error(today.error);
    if (all.error) console.error(all.error);
    return {
      today: today.data ?? [],
      allTime: (all.data ?? []).map((r) => ({ ...r, total: Number(r.total), games: Number(r.games) })),
    };
  });
