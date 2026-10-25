import { describe, expect, it } from "vitest";
import { CHALLENGES, challengePool, challengeQuestions, loadChallenge, saveChallenge } from "./challenges";
import { ALL_QUESTIONS, ORIGINAL_FULL_QUESTIONS, THEMED_QUESTIONS } from "./questions";
import { dailyQuestions } from "./selection";
import { validateAnswer } from "./scoring";

describe("subject challenges", () => {
  for (const topic of ["sports", "entertainment", "history"] as const) {
    it(`${topic} deals seven unique questions from only that subject`, () => {
      const pool = challengePool(topic);
      const round = challengeQuestions(topic);
      expect(pool.length).toBeGreaterThanOrEqual(7);
      expect(round).toHaveLength(7);
      expect(new Set(round.map((q) => q.id)).size).toBe(7);
      expect(round.every((q) => pool.includes(q))).toBe(true);
      expect(pool.every((q) => (CHALLENGES[topic].categories as readonly string[]).includes(q.category))).toBe(true);
    });
  }
  it("gives everyone the same seven questions per day and new ones the next day", () => {
    for (const topic of ["sports", "entertainment", "history"] as const) {
      const today = challengeQuestions(topic, "2026-10-26").map((q) => q.id);
      expect(challengeQuestions(topic, "2026-10-26").map((q) => q.id)).toEqual(today);
      const tomorrow = challengeQuestions(topic, "2026-10-27").map((q) => q.id);
      expect(tomorrow).toHaveLength(7);
      expect(tomorrow.some((id) => !today.includes(id))).toBe(true);
    }
  });
  it("keeps the 57-question published daily deck unchanged", () => {
    expect(ORIGINAL_FULL_QUESTIONS).toHaveLength(57);
    const extra = new Set(THEMED_QUESTIONS.map((q) => q.id));
    expect(dailyQuestions("2026-10-24").some((q) => extra.has(q.id))).toBe(false);
    expect(new Set(ALL_QUESTIONS.map((q) => q.id)).size).toBe(ALL_QUESTIONS.length);
  });
  it("recognizes curated NFL answers with the school scoring tiers", () => {
    const nfl = ALL_QUESTIONS.find((q) => q.id === "nfl");
    if (!nfl) throw new Error("Missing NFL question");
    expect(validateAnswer(nfl, "Cowboys", new Set())).toMatchObject({ ok: true, display: "Dallas Cowboys", tier: "pencil", points: 10 });
  });
  it("keeps subject personal bests and seen questions independent", () => {
    localStorage.clear();
    saveChallenge("sports", { best: 100, seen: ["nfl"] });
    saveChallenge("history", { best: 200, seen: ["president"] });
    expect(loadChallenge("sports").best).toBe(100);
    expect(loadChallenge("history").best).toBe(200);
    expect(loadChallenge("entertainment").best).toBe(0);
  });
});