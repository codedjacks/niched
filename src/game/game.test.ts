import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { MAX_SCORE, TIERS, normalize, validateAnswer } from "./scoring";
import { dailyQuestions } from "./selection";
import { emptyStats, recordDaily } from "./storage";

const country = QUESTIONS.find((q) => q.id === "country")!;

describe("scoring", () => {
  it("tier points match spec", () => {
    expect([TIERS.pencil, TIERS.paperclip, TIERS.notebook, TIERS.backpack, TIERS.goldstar, TIERS.valedictorian].map((t) => t.points)).toEqual([10, 15, 30, 60, 85, 100]);
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

import { frequencyRarity, tierFromFrequency, MIN_SAMPLES, fuzzyMatch } from "./scoring";
import type { Question as Q2 } from "./types";
describe("leniency + real frequency", () => {
  const movie: Q2 = { id: "m", prompt: "", category: "", answers: new Map([["happy mite", { display: "Happy Mite", tier: "backpack" }]]) };
  it("accepts a typo and flags did-you-mean", () => {
    expect(validateAnswer(movie, "happy time", new Set())).toMatchObject({ ok: true, display: "Happy Mite", didYouMean: true });
    expect(validateAnswer(movie, "Happy Mite", new Set())).toMatchObject({ ok: true, didYouMean: false });
  });
  it("rejects answers too far off", () => {
    expect(fuzzyMatch(movie, "sad dog")).toBeNull();
  });
  it("uses curated tier until enough plays, then real frequency", () => {
    const few = frequencyRarity({ m: { total: MIN_SAMPLES - 1, counts: { "happy mite": 20 } } });
    expect(validateAnswer(movie, "happy mite", new Set(), few)).toMatchObject({ tier: "backpack" });
    const many = frequencyRarity({ m: { total: 100, counts: { "happy mite": 50 } } });
    expect(validateAnswer(movie, "happy mite", new Set(), many)).toMatchObject({ tier: "pencil", points: 10 });
    expect(tierFromFrequency(0.001)).toBe("valedictorian");
  });
});
