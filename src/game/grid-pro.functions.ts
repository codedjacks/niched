import { createServerFn } from "@tanstack/react-start";
import { PRO_GRIDS, type ProLeague } from "./grid-pro";

export type ProGridJudge = { ok: true; name: string; fame: 1 | 2 | 3 | 4 | 5 | 6 } | { ok: false; message: string };

/** Checks an NFL/MLB grid guess that isn't on the curated list against real ESPN records. */
export const judgeProGridGuess = createServerFn({ method: "POST" })
  .inputValidator((d: { league: string; team: string; tag: string; answer: string }) => {
    const cfg = PRO_GRIDS[d.league as ProLeague];
    if (!cfg || !cfg.teams.includes(d.team) || !(d.tag in cfg.tags)) throw new Error("Bad square");
    return { league: cfg.league, team: d.team, tag: d.tag, answer: String(d.answer).slice(0, 80) };
  })
  .handler(async ({ data }): Promise<ProGridJudge> => {
    const { findRealPlayer, playedFor, proHasTag, fameOf } = await import("./players.server");
    const label = PRO_GRIDS[data.league].label;
    try {
      const rec = await findRealPlayer(data.league, data.answer);
      if (!rec) return { ok: false, message: `Couldn't find that ${label} player — check the spelling.` };
      if (!playedFor(rec, data.team)) return { ok: false, message: `${rec.name} doesn't fit that square.` };
      const has = proHasTag(data.league, rec, data.tag);
      if (has === null) return { ok: false, message: `Couldn't confirm ${rec.name}'s record — try someone else.` };
      return has ? { ok: true, name: rec.name, fame: fameOf(rec) } : { ok: false, message: `${rec.name} doesn't fit that square.` };
    } catch (e) {
      console.error("pro grid judge failed", e);
      return { ok: false, message: "Couldn't check that one — try again." };
    }
  });
