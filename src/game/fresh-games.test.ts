import { describe, expect, it } from "vitest";
import { HUDDLES, checkHuddle, huddleForDay, huddleScore } from "./huddle";
import { STANDINGS_FALLBACK, correctOrder, standingsForDay, standingsScore } from "./standings";
import { selloutPoints } from "./sellout";
import { radioPoints, callsForDay, isCallAnswer } from "./radiocall";
import { rebusesForDay } from "./emoji";
import { markGuess, scoreboardPoints } from "./scoreboard";

describe("fresh games", () => {
  it("huddle: 25 per group minus 5 per mistake", () => {
    expect(huddleScore(4, 0)).toBe(100);
    expect(huddleScore(3, 2)).toBe(65);
  });
  it("huddle groups have four unique members and check works", () => {
    for (const p of HUDDLES) expect(new Set(p.groups.flatMap((g) => g.members)).size).toBe(16);
    const { puzzle, tiles } = huddleForDay("2026-10-29");
    expect(tiles).toHaveLength(16);
    expect(checkHuddle(puzzle, puzzle.groups[0]!.members)).toBe(puzzle.groups[0]);
  });
  it("standings: perfect order scores 100", () => {
    const five = standingsForDay("2026-10-29", STANDINGS_FALLBACK);
    expect(five).toHaveLength(5);
    expect(standingsScore(correctOrder(five))).toBe(100);
  });
  it("sellout: within 1% scores 100", () => {
    expect(selloutPoints(70500, 70000)).toBe(100);
    expect(selloutPoints(35000, 70000)).toBe(0);
  });
  it("radio call: hints and second try cost 30 each", () => {
    expect(radioPoints(true, 0, false)).toBe(100);
    expect(radioPoints(true, 1, true)).toBe(40);
    expect(radioPoints(false, 0, false)).toBe(0);
    const c = callsForDay("x");
    expect(c).toHaveLength(3);
    expect(isCallAnswer(c[0]!, c[0]!.answers[0]!.toUpperCase())).toBe(true);
  });
  it("emoji: five per game", () => expect(rebusesForDay("x")).toHaveLength(5));
  it("scoreboard: wordle marks and points", () => {
    expect(markGuess("BETTS", "BONDS")).toEqual(["hit", "miss", "miss", "miss", "hit"]);
    expect(markGuess("SBRAT", "BRADY")).toEqual(["miss", "near", "near", "near", "miss"]);
    expect(scoreboardPoints(1, true)).toBe(100);
    expect(scoreboardPoints(6, false)).toBe(0);
  });
});
