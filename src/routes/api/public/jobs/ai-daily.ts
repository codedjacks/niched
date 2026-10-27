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
        return Response.json({ success: true, days: out });
      },
    },
  },
});
