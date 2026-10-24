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

import { dayIsCurrent } from "./selection";
describe("ranked daily window", () => {
  const now = new Date("2026-10-23T18:00:00Z");
  it("accepts today and neighbouring time-zone days only", () => {
    expect(dayIsCurrent("2026-10-23", now)).toBe(true);
    expect(dayIsCurrent("2026-10-22", now)).toBe(true);
    expect(dayIsCurrent("2026-10-24", now)).toBe(true);
    expect(dayIsCurrent("2026-10-20", now)).toBe(false);
  });
});

import { DAILY_QUESTIONS } from "./questions";
describe("daily pool cutover", () => {
  it("keeps today's (2026-10-23) daily on the original pool", () => {
    const core = new Set(DAILY_QUESTIONS.map((q) => q.id));
    expect(dailyQuestions("2026-10-23").every((q) => core.has(q.id))).toBe(true);
  });
  it("draws from the full bank from 2026-10-24 on", () => {
    const core = new Set(DAILY_QUESTIONS.map((q) => q.id));
    const days = Array.from({ length: 30 }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`);
    expect(days.some((d) => dailyQuestions(d).some((q) => !core.has(q.id)))).toBe(true);
  });
});

import { practiceQuestions } from "./selection";
describe("no repeats", () => {
  it("daily never repeats a question until the whole bank (57) has been used", () => {
    const ids: string[] = [];
    for (let i = 0; i < 8; i++) ids.push(...dailyQuestions(`2026-10-${24 + i > 31 ? "" : ""}${String(24 + i).padStart(2, "0")}`.replace("2026-10-32", "2026-11-01")).map((q) => q.id));
    expect(new Set(ids).size).toBe(56);
  });
  it("no daily round ever contains the same question twice", () => {
    for (let i = 0; i < 400; i++) {
      const d = new Date(Date.UTC(2026, 9, 24 + i)).toISOString().slice(0, 10);
      const ids = dailyQuestions(d).map((q) => q.id);
      expect([0, 7]).toContain(ids.length);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("practice skips questions already seen", () => {
    const seen = QUESTIONS.slice(0, 50).map((q) => q.id);
    const ids = practiceQuestions(seen).map((q) => q.id);
    expect(ids.filter((id) => !seen.includes(id)).length).toBe(7);
  });
});
