import { describe, expect, it } from "vitest";
import { choicesFor, draftPickScore, letterMask, lockerScore, trioPickScore } from "./modes";
import { DRAFTS } from "./draft";

describe("game modes", () => {
  it("draft: fast right 100, late right 60, wrong/timeout 0", () => {
    expect(draftPickScore(true, 15)).toBe(100);
    expect(draftPickScore(true, 5)).toBe(60);
    expect(draftPickScore(false, 15)).toBe(0);
    expect(draftPickScore(true, 0)).toBe(0);
  });
  it("trio: -20 per wrong pennant, floor 20", () => { expect(trioPickScore(0)).toBe(100); expect(trioPickScore(2)).toBe(60); expect(trioPickScore(9)).toBe(20); });
  it("locker: -20 per locker, -15 per miss, floor 10", () => { expect(lockerScore(0, 0)).toBe(100); expect(lockerScore(2, 1)).toBe(45); expect(lockerScore(4, 3)).toBe(10); });
  it("letters: hidden at 0, full at max", () => {
    expect(letterMask("Karl Malone", 0, 4)).toBe("____ ______");
    expect(letterMask("Karl Malone", 1, 4)).toBe("K___ M_____");
    expect(letterMask("Karl Malone", 4, 4)).toBe("Karl Malone");
  });
  it("draft choices: 4 unique, include answer, same for everyone", () => {
    const p = DRAFTS[0]!;
    const c = choicesFor(p, DRAFTS, (d) => d.name, 4, "2026-10-27");
    expect(new Set(c).size).toBe(4);
    expect(c).toContain(p.name);
    expect(choicesFor(p, DRAFTS, (d) => d.name, 4, "2026-10-27")).toEqual(c);
  });
});
