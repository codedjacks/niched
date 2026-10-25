import { createFileRoute } from "@tanstack/react-router";
import { usesAiDaily } from "@/game/ai-daily";
import { dayIsCurrent } from "@/game/selection";

const TRACKS = ["main", "sports", "entertainment", "history"] as const;

/** Public read of a current day's AI round (same data the game already sends players), used by self-hosted copies of Niched. */
export const Route = createFileRoute("/api/public/daily-round")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const day = url.searchParams.get("day") ?? "";
        const track = TRACKS.find((t) => t === url.searchParams.get("track"));
        const cors = { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };
        if (!track || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !dayIsCurrent(day) || (track === "main" && !usesAiDaily(day)))
          return Response.json({ status: "failed", error: "That round isn't available" }, { status: 400, headers: cors });
        const { getOrCreateAiDaily } = await import("@/game/ai-daily.server");
        return Response.json(await getOrCreateAiDaily(day, track), { headers: cors });
      },
    },
  },
});
