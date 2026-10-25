import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { usesAiDaily } from "@/game/ai-daily";

/** Scheduled: pre-writes today's and tomorrow's AI Daily Challenge so players never wait. */
export const Route = createFileRoute("/api/public/jobs/ai-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { getOrCreateAiDaily } = await import("@/game/ai-daily.server");
        const days = [0, 1].map((n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10)).filter(usesAiDaily);
        const out: Record<string, string> = {};
        // Sequential, at most two rounds per run; DB lease prevents overlap with player requests.
        for (const d of days) out[d] = (await getOrCreateAiDaily(d)).status;
        // Topic challenges: pre-write tomorrow's (and today's if missing) rounds.
        const topicDays = [0, 1].map((n) => new Date(Date.now() + n * 86_400_000).toISOString().slice(0, 10));
        for (const d of topicDays) for (const t of ["sports", "entertainment", "history"] as const) out[`${d}:${t}`] = (await getOrCreateAiDaily(d, t)).status;
        return Response.json({ success: true, days: out });
      },
    },
  },
});
