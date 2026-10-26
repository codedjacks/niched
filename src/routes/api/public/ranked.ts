import { createFileRoute } from "@tanstack/react-router";

/** Ranked submissions from self-hosted copies of Niched. The caller's sign-in token is verified here; scores are re-graded server-side. */
export const Route = createFileRoute("/api/public/ranked")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { userIdFromToken, saveRanked, cleanTyped } = await import("@/game/ranked.server");
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? null;
        const userId = await userIdFromToken(token);
        if (!userId || !process.env["SUPABASE_SERVICE_ROLE_KEY"])
          return Response.json({ ok: false, error: "Sign in to rank" }, { status: 401 });
        const body = (await request.json().catch(() => ({}))) as { day?: unknown; typed?: unknown };
        const day = String(body.day ?? "");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return Response.json({ ok: false, error: "Bad request" }, { status: 400 });
        return Response.json(await saveRanked(token!, userId, day, cleanTyped(body.typed)));
      },
    },
  },
});
