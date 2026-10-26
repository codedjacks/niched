import { describe, expect, it } from "vitest";
import { fameOf, type PlayerRecord } from "./players.server";

const player: PlayerRecord = { league: "nba", espn_id: "test", name: "Unlisted player", teams: [], seasons: [], awards: ["All-Star"], birth_place: null, position: null, draft: null, career: {} };

describe("verified grid player rarity", () => {
  it("awards older unlisted players a bounded era bonus", () => {
    expect(fameOf({ ...player, seasons: [{ year: 2000, team: "test" }] }, 2026)).toBe(5);
    expect(fameOf({ ...player, seasons: [{ year: 2025, team: "test" }] }, 2026)).toBe(4);
  });
  it("keeps canonical roster rarity even when career awards are incomplete", () => {
    expect(fameOf({ ...player, name: "Michael Jordan", awards: [], seasons: [{ year: 2003, team: "test" }] }, 2026)).toBe(1);
    expect(fameOf({ ...player, name: "Robert Horry", awards: [], seasons: [] }, 2026)).toBe(6);
  });
});