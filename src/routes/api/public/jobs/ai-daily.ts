import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { usesAiDaily } from "@/game/ai-daily";
import { dateKey } from "@/game/selection";

/** Scheduled: pre-writes today's and tomorrow's AI Daily Challenge so players never wait. */
export const Route = createFileRoute("/api/public/jobs/ai-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { getOrCreateAiDaily } = await import("@/game/ai-daily.server");
        const days = [...new Set([0, 1].map((n) => dateKey(new Date(Date.now() + n * 86_400_000))))].filter(usesAiDaily);
        const out: Record<string, string> = {};
        // Sequential, at most two rounds per run; DB lease prevents overlap with player requests.
        for (const d of days) out[d] = (await getOrCreateAiDaily(d)).status;
        // Also pre-generate today's and tomorrow's non-repeating mini-game puzzles.
        const { GENERATORS, getOrCreatePuzzle } = await import("@/game/puzzles.server");
        const puzzles: Record<string, boolean> = {};
        for (const game of Object.keys(GENERATORS)) for (const n of [0, 1]) {
          const d = dateKey(new Date(Date.now() + n * 86_400_000));
          puzzles[`${game}:${d}`] = !!(await getOrCreatePuzzle(game, d).catch(() => null));
        }
        return Response.json({ success: true, days: out, puzzles });
      },
    },
  },
});
