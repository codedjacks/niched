import { describe, expect, it } from "vitest";
import { GRID_MAX, VALID_GRIDS, cellAnswers, gridForDay, guessCell } from "./grid";
import { mysteryForDay, mysteryScore, isMysteryAnswer, MYSTERIES } from "./mystery";
import { recordGame } from "./daily-games";

describe("daily sports games", () => {
  it("gives everyone the same puzzle each day", () => {
    expect(gridForDay("2026-10-27")).toEqual(gridForDay("2026-10-27"));
    expect(mysteryForDay("2026-10-27")).toBe(mysteryForDay("2026-10-27"));
  });
  it("every grid square has at least two valid players", () => {
    expect(VALID_GRIDS.length).toBeGreaterThan(20);
    const g = gridForDay("2026-11-01");
    for (const t of g.teams) for (const c of g.tags) expect(cellAnswers(t, c).length).toBeGreaterThanOrEqual(2);
  });
  it("scores grid picks by rarity and blocks reuse", () => {
    expect(GRID_MAX).toBe(900);
    expect(guessCell("lebron james", "Lakers", "champ", [])).toMatchObject({ ok: true, points: 10 });
    expect(guessCell("Robert Horry", "Spurs", "champ", [])).toMatchObject({ ok: true, points: 100 });
    expect(guessCell("Kobe", "Lakers", "pick1", [])).toMatchObject({ ok: false, reason: "wrong" });
    expect(guessCell("LeBron", "Heat", "champ", ["LeBron James"])).toMatchObject({ ok: false, reason: "used" });
  });
  it("mystery athlete pays more for fewer clues", () => {
    expect([1, 2, 3, 4, 5, 6].map(mysteryScore)).toEqual([100, 85, 60, 30, 15, 10]);
    expect(isMysteryAnswer(MYSTERIES[0]!, "serena")).toBe(true);
  });
  it("streak grows on consecutive days and ignores replays", () => {
    let s = recordGame({ best: 0, streak: 0 }, "2026-10-27", 5);
    s = recordGame(s, "2026-10-28", 7);
    expect(s).toMatchObject({ streak: 2, best: 7 });
    expect(recordGame(s, "2026-10-28", 10)).toBe(s);
    expect(recordGame(s, "2026-10-31", 1).streak).toBe(1);
  });
});
