import { createServerFn } from "@tanstack/react-start";

/** Shared lookup: the canonical real name for a typed player, if ESPN knows them in any of the four leagues. */
export const resolvePlayerName = createServerFn({ method: "POST" })
  .inputValidator((d: { typed: string }) => ({ typed: String(d.typed).slice(0, 60) }))
  .handler(async ({ data }) => {
    const { findRealPlayer, LEAGUES } = await import("./players.server");
    for (const l of LEAGUES) {
      const rec = await findRealPlayer(l, data.typed).catch(() => null);
      if (rec) return { name: rec.name, league: l };
    }
    return null;
  });
