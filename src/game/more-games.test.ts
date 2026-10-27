import { describe, it, expect } from "vitest";
import { NICKNAMES, nicknameForDay, isNicknameAnswer } from "./nickname";
import { JERSEYS, jerseyForDay } from "./jersey";
import { STAT_LINES, STAT_POINTS, statForDay, isStatAnswer } from "./statline";
import { TRIOS, TRIO_POINTS, trioForDay, isTrioAnswer } from "./trio";

describe("new daily games", () => {
  it("same puzzle for everyone on a day", () => {
    for (const f of [nicknameForDay, jerseyForDay, statForDay, trioForDay]) expect(f("2026-10-27")).toBe(f("2026-10-27"));
  });
  it("points 100/80/60/40/20", () => {
    expect([...STAT_POINTS]).toEqual([100, 80, 60, 40, 20]);
    expect([...TRIO_POINTS]).toEqual([100, 80, 60, 40, 20]);
  });
  it("accepts answers and aliases", () => {
    expect(isNicknameAnswer(NICKNAMES.find((n) => n.nickname === "The Mailman")!, "karl malone")).toBe(true);
    expect(isStatAnswer(STAT_LINES.find((s) => s.name === "Barry Bonds")!, "Barry Bonds")).toBe(true);
    expect(isTrioAnswer(TRIOS[0]!, "bulls")).toBe(true);
    expect(isTrioAnswer(TRIOS[0]!, "lakers")).toBe(false);
    expect(JERSEYS.length).toBeGreaterThan(10);
  });
});
