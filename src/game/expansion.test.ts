import { describe, expect, it } from "vitest";
import { EXPANSION_QUESTIONS, QUESTIONS, ALL_QUESTIONS } from "./questions";
import { dailyQuestions, practiceQuestions } from "./selection";
import { validateAnswer } from "./scoring";

describe("expanded daily bank", () => {
  it("adds 30 distinct categories to daily and practice", () => {
    expect(EXPANSION_QUESTIONS).toHaveLength(30);
    expect(QUESTIONS).toHaveLength(87);
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(ALL_QUESTIONS.length);
    expect(new Set(QUESTIONS.map((q) => q.prompt)).size).toBe(87);
    expect(EXPANSION_QUESTIONS.every((q) => new Set([...q.answers.values()].map((a) => a.display)).size >= 20)).toBe(true);
    const old = QUESTIONS.filter((q) => !EXPANSION_QUESTIONS.includes(q));
    expect(practiceQuestions(old.map((q) => q.id)).every((q) => EXPANSION_QUESTIONS.includes(q))).toBe(true);
  });
  it("preserves the already-played October 24 round exactly", () => {
    expect(dailyQuestions("2026-10-24").map((q) => q.id)).toEqual([
      "superhero", "board-sport-brand", "cheese", "planet", "mountain", "constellation", "cocktail",
    ]);
  });
  it("mixes all new categories into daily from October 25 before any question repeats", () => {
    const ids: string[] = [];
    for (let i = 0; i < 13; i++) {
      const date = new Date(Date.UTC(2026, 9, 24 + i)).toISOString().slice(0, 10);
      ids.push(...dailyQuestions(date).map((q) => q.id));
    }
    expect(new Set(ids.slice(0, 87)).size).toBe(87);
    expect(EXPANSION_QUESTIONS.every((q) => ids.slice(7, 87).includes(q.id))).toBe(true);
    expect(dailyQuestions("2026-10-25").some((q) => EXPANSION_QUESTIONS.includes(q))).toBe(true);
  });
  it("keeps seven unique questions across reshuffles and out-of-order calls", () => {
    const first = dailyQuestions("2026-10-25").map((q) => q.id);
    for (let i = 0; i < 100; i++) {
      const date = new Date(Date.UTC(2026, 9, 25 + i)).toISOString().slice(0, 10);
      expect(new Set(dailyQuestions(date).map((q) => q.id)).size).toBe(7);
    }
    expect(dailyQuestions("2026-10-25").map((q) => q.id)).toEqual(first);
  });
  for (const question of EXPANSION_QUESTIONS) {
    it(`grades curated answers for ${question.id}`, () => {
      for (const [alias, answer] of question.answers) {
        expect(validateAnswer(question, alias, new Set())).toMatchObject({ ok: true, display: answer.display, tier: answer.tier });
      }
    });
  }
});