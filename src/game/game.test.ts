import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { MAX_SCORE, TIERS, normalize, validateAnswer } from "./scoring";
import { dailyQuestions } from "./selection";
import { emptyStats, recordDaily } from "./storage";

const country = QUESTIONS.find((q) => q.id === "country")!;

describe("scoring", () => {
  it("tier points match spec", () => {
    expect([TIERS.plankton, TIERS.clever, TIERS.schooler, TIERS.rare, TIERS.deep, TIERS.million].map((t) => t.points)).toEqual([10, 15, 30, 60, 85, 100]);
    expect(MAX_SCORE).toBe(700);
  });
  it("normalizes case, spaces, punctuation", () => {
    expect(normalize("  São   Tomé & Príncipe! ")).toBe("sao tome and principe");
  });
  it("scores common vs rare", () => {
    expect(validateAnswer(country, "france", new Set())).toMatchObject({ ok: true, points: 10 });
    expect(validateAnswer(country, "TUVALU.", new Set())).toMatchObject({ ok: true, points: 100 });
  });
  it("rejects invalid and duplicate", () => {
    expect(validateAnswer(country, "Atlantis", new Set())).toEqual({ ok: false, reason: "invalid" });
    expect(validateAnswer(country, "Atlantis", new Set(["atlantis"]))).toEqual({ ok: false, reason: "duplicate" });
  });
});

describe("daily", () => {
  it("is deterministic per date with 7 unique questions", () => {
    const a = dailyQuestions("2026-10-23").map((q) => q.id);
    expect(a).toEqual(dailyQuestions("2026-10-23").map((q) => q.id));
    expect(new Set(a).size).toBe(7);
  });
  it("streak increments on consecutive days and resets after gap", () => {
    let s = recordDaily(emptyStats(), "2026-10-22", 100, []);
    s = recordDaily(s, "2026-10-23", 200, []);
    expect(s.streak).toBe(2);
    expect(recordDaily(s, "2026-10-23", 700, []).bestDaily).toBe(200);
    expect(recordDaily(s, "2026-10-26", 50, []).streak).toBe(1);
  });
});
