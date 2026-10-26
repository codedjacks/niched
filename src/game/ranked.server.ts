import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { dailyQuestions, dayIsCurrent } from "./selection";
import { usesAiDaily } from "./ai-daily";
import { frequencyRarity, normalize } from "./scoring";

export type RankedResult = { ok: true; score: number; already: boolean } | { ok: false; error: string };

export const sbUrl = () => process.env["SUPABASE_URL"] || import.meta.env.VITE_SUPABASE_URL;
export const sbKey = () => process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const UPSTREAM = () => process.env["NICHED_UPSTREAM_URL"] || "https://niched.lovable.app";

export function publicClient(token?: string) {
  const key = sbKey();
  return createClient<Database>(sbUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        if (token) h.set("Authorization", `Bearer ${token}`);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Verifies a player's sign-in token and returns their user id, or null. */
export async function userIdFromToken(token: string | null): Promise<string | null> {
  if (!token || token.split(".").length !== 3) return null;
  const { data, error } = await publicClient().auth.getClaims(token);
  return error || !data?.claims?.sub ? null : data.claims.sub;
}

export const cleanTyped = (typed: unknown) =>
  (Array.isArray(typed) ? typed : []).slice(0, 7).map((t) => (t ? String(t).slice(0, 60) : null));

/** Re-score and save a ranked daily. Without the admin key (self-hosted copies) it forwards to the main site. */
export async function saveRanked(token: string, userId: string, day: string, typed: (string | null)[]): Promise<RankedResult> {
  if (!dayIsCurrent(day)) return { ok: false, error: "That daily has closed" };
  if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
    try {
      const r = await fetch(`${UPSTREAM()}/api/public/ranked`, {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ day, typed }),
      });
      return (await r.json()) as RankedResult;
    } catch {
      return { ok: false, error: "Couldn't reach the leaderboard" };
    }
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing } = await supabaseAdmin.from("ranked_scores").select("score")
    .eq("user_id", userId).eq("day", day).maybeSingle();
  if (existing) return { ok: true, score: existing.score, already: true };

  const { verifyAnswer, loadCounts } = await import("./judge.server");
  const qs = usesAiDaily(day) ? await (await import("./ai-daily.server")).aiDailyQuestions(day) : dailyQuestions(day);
  if (qs.length !== 7) return { ok: false, error: "Today's questions aren't ready yet" };
  const rarity = frequencyRarity(await loadCounts(qs.map((q) => q.id)));
  const results = await Promise.all(qs.map((q, i) => verifyAnswer(q, typed[i] ?? null, rarity)));
  const score = results.reduce((s, r) => s + (r?.points ?? 0), 0);

  const { error } = await supabaseAdmin.from("ranked_scores").insert({
    user_id: userId, day, score,
    tiers: results.map((r) => r?.tier ?? "none"),
    answers: results.map((r, i) => ({ q: qs[i]!.id, typed: typed[i] ?? null, display: r?.display ?? null, points: r?.points ?? 0 })),
  });
  if (error) {
    if (error.code === "23505") return { ok: true, score, already: true };
    console.error(error);
    return { ok: false, error: "Couldn't save your score" };
  }
  const hits = results.flatMap((r, i) => (r ? [{ q: qs[i]!.id, k: normalize(r.display) }] : []));
  if (hits.length) await supabaseAdmin.rpc("bump_answers", { _question_ids: hits.map((h) => h.q), _keys: hits.map((h) => h.k) });
  return { ok: true, score, already: false };
}
