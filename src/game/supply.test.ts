import { describe, expect, it } from "vitest";
import frozenRounds from "./daily-frozen.fixture.json";
import { ALL_QUESTIONS, QUESTIONS, SUPPLY_QUESTIONS, REVIEWED_QUESTIONS } from "./questions";
import { dailyQuestions, practiceQuestions } from "./selection";
import { validateAnswer } from "./scoring";

describe("extended reviewed daily supply", () => {
  it("adds 84 distinct questions within the same 12 categories", () => {
    expect(SUPPLY_QUESTIONS).toHaveLength(84);
    expect(QUESTIONS).toHaveLength(243);
    const categories = new Set(REVIEWED_QUESTIONS.map((q) => q.category));
    expect(categories.size).toBe(12);
    for (const category of categories) {
      expect(SUPPLY_QUESTIONS.filter((q) => q.category === category)).toHaveLength(7);
    }
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(ALL_QUESTIONS.length);
    expect(new Set(ALL_QUESTIONS.map((q) => q.prompt)).size).toBe(ALL_QUESTIONS.length);
  });

  it("preserves every previously available daily question in order", () => {
    for (const { date, ids } of frozenRounds) {
      expect(dailyQuestions(date).map((q) => q.id)).toEqual(ids);
    }
  });

  it("provides twelve more seven-question days without any repeats", () => {
    const ids: string[] = [];
    for (let day = 0; day < 34; day++) {
      const date = new Date(Date.UTC(2026, 9, 24 + day)).toISOString().slice(0, 10);
      const round = dailyQuestions(date);
      expect(round).toHaveLength(7);
      ids.push(...round.map((q) => q.id));
    }
    expect(ids).toHaveLength(238);
    expect(new Set(ids).size).toBe(238);
    expect(dailyQuestions("2026-11-27")).toEqual([]);
    expect(dailyQuestions("2027-01-01")).toEqual([]);
  });

  it("is deterministic for out-of-order future dates", () => {
    const expected = dailyQuestions("2026-11-20");
    dailyQuestions("2027-01-01");
    dailyQuestions("2026-10-24");
    expect(dailyQuestions("2026-11-20")).toEqual(expected);
  });

  it("makes the additional questions available in practice", () => {
    const exclude = QUESTIONS.filter((q) => !SUPPLY_QUESTIONS.includes(q)).map((q) => q.id);
    const round = practiceQuestions(exclude);
    expect(round).toHaveLength(7);
    expect(round.every((q) => SUPPLY_QUESTIONS.includes(q))).toBe(true);
  });

  for (const question of SUPPLY_QUESTIONS) {
    it(`accepts reviewed examples for ${question.id}`, () => {
      expect(question.answers.size).toBeGreaterThanOrEqual(5);
      for (const [answer, canonical] of question.answers) {
        expect(validateAnswer(question, answer, new Set())).toMatchObject({
          ok: true, display: canonical.display, tier: canonical.tier,
        });
      }
    });
  }
});