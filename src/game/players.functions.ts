import { createServerFn } from "@tanstack/react-start";

/** Higher/Lower groups backed by the shared player database: league + ESPN career-total stat name. */
export const VERIFIED_GROUPS: Record<string, { league: "nba" | "mlb" | "nhl" | "nfl"; stat: string }> = {
  "NBA career points": { league: "nba", stat: "points" },
  "MLB career home runs": { league: "mlb", stat: "homeRuns" },
  "NHL career goals": { league: "nhl", stat: "goals" },
};

/** Real career totals for the named players; players ESPN can't confirm are left out so the bundled value stands. */
export const getVerifiedStats = createServerFn({ method: "POST" })
  .inputValidator((d: { group: string; names: string[] }) => {
    if (!VERIFIED_GROUPS[d.group]) throw new Error("Unknown group");
    return { group: d.group, names: d.names.slice(0, 20).map((n) => String(n).slice(0, 60)) };
  })
  .handler(async ({ data }) => {
    const { findRealPlayer } = await import("./players.server");
    const { league, stat } = VERIFIED_GROUPS[data.group]!;
    const out: Record<string, number> = {};
    await Promise.all(data.names.map(async (n) => {
      const rec = await findRealPlayer(league, n).catch(() => null);
      const v = rec?.career[stat];
      if (typeof v === "number" && v > 0) out[n] = v;
    }));
    return out;
  });

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
