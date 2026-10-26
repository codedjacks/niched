import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { QuestionCounts } from "./scoring";

const publicClient = async () => (await import("./ranked.server")).publicClient();

/** Real answer counts for a set of questions (powers frequency-based tiers). */
export const getAnswerCounts = createServerFn({ method: "POST" })
  .inputValidator((d: { questionIds: string[] }) => ({ questionIds: d.questionIds.slice(0, 20).map(String) }))
  .handler(async ({ data }) => {
    const out: Record<string, QuestionCounts> = {};
    const { data: rows, error } = await (await publicClient())
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
  .inputValidator((d: { day: string; typed: (string | null)[] }) => {
    if (!DAY.test(d.day) || !Array.isArray(d.typed)) throw new Error("Bad request");
    return { day: d.day, typed: d.typed };
  })
  .handler(async ({ data }) => {
    const { userIdFromToken, saveRanked, cleanTyped } = await import("./ranked.server");
    const token = getRequest()?.headers.get("authorization")?.replace(/^Bearer /, "") ?? null;
    const userId = await userIdFromToken(token);
    if (!userId) return { ok: false as const, error: "Sign in to rank" };
    return saveRanked(token!, userId, data.day, cleanTyped(data.typed));
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
