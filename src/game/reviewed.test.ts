import { describe, expect, it } from "vitest";
import { QUESTIONS, REVIEWED_QUESTIONS, ORIGINAL_FULL_QUESTIONS, EXPANSION_QUESTIONS, SUPPLY_QUESTIONS } from "./questions";
import { dailyQuestions } from "./selection";
import { validateAnswer } from "./scoring";

describe("reviewed questions within existing categories", () => {
  it("adds 72 questions across 12 existing categories without introducing categories", () => {
    expect(REVIEWED_QUESTIONS).toHaveLength(72);
    expect(QUESTIONS).toHaveLength(159 + SUPPLY_QUESTIONS.length);
    const existing = new Set([...ORIGINAL_FULL_QUESTIONS, ...EXPANSION_QUESTIONS].map((q) => q.category));
    expect(REVIEWED_QUESTIONS.every((q) => existing.has(q.category))).toBe(true);
    const categories = new Set(REVIEWED_QUESTIONS.map((q) => q.category));
    expect(categories.size).toBe(12);
    for (const category of categories) expect(REVIEWED_QUESTIONS.filter((q) => q.category === category)).toHaveLength(6);
    expect(new Set(QUESTIONS.map((q) => q.prompt)).size).toBe(QUESTIONS.length);
  });
  it("deals exactly seven fresh questions each day, then stops instead of recycling", () => {
    const dealt: string[] = [];
    for (let day = 0; day < 22; day++) {
      const date = new Date(Date.UTC(2026, 9, 24 + day)).toISOString().slice(0, 10);
      const round = dailyQuestions(date);
      expect(round).toHaveLength(7);
      dealt.push(...round.map((q) => q.id));
    }
    expect(dealt).toHaveLength(154);
    expect(new Set(dealt).size).toBe(154);
    expect(dailyQuestions("2026-11-15")).toHaveLength(7);
    expect(dailyQuestions("2027-01-01")).toEqual([]);
  });
  it("is deterministic regardless of date lookup order", () => {
    const round = dailyQuestions("2026-11-04");
    dailyQuestions("2027-01-01");
    dailyQuestions("2026-10-24");
    expect(dailyQuestions("2026-11-04")).toEqual(round);
  });
  for (const question of REVIEWED_QUESTIONS) {
    it(`grades the curated answers for ${question.id}`, () => {
      expect(question.answers.size).toBeGreaterThanOrEqual(8);
      for (const [answer, canonical] of question.answers) {
        expect(validateAnswer(question, answer, new Set())).toMatchObject({ ok: true, display: canonical.display, tier: canonical.tier });
      }
    });
  }
});