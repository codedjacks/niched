import { describe, expect, it } from "vitest";
import { CHALLENGES, challengePool, challengeQuestions, loadChallenge, saveChallenge } from "./challenges";
import { ALL_QUESTIONS, QUESTIONS, THEMED_QUESTIONS } from "./questions";
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
  it("uses unseen subject questions before repeating without leaking other topics", () => {
    const first = challengeQuestions("entertainment");
    const seen = first.map((q) => q.id);
    const second = challengeQuestions("entertainment", seen);
    expect(second.every((q) => !seen.includes(q.id))).toBe(true);
    const sports = challengePool("sports");
    const last = sports.at(-1);
    if (!last) throw new Error("Missing sports questions");
    const exhausted = challengeQuestions("sports", sports.slice(0, -1).map((q) => q.id));
    expect(exhausted[0]?.id).toBe(last.id);
    expect(exhausted).toHaveLength(7);
    expect(new Set(exhausted.map((q) => q.id)).size).toBe(7);
    expect(exhausted.every((q) => sports.includes(q))).toBe(true);
  });
  it("keeps the 57-question published daily deck unchanged", () => {
    expect(QUESTIONS).toHaveLength(57);
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
    expect(loadChallenge("sports")).toEqual({ best: 100, seen: ["nfl"] });
    expect(loadChallenge("history")).toEqual({ best: 200, seen: ["president"] });
    expect(loadChallenge("entertainment")).toEqual({ best: 0, seen: [] });
  });
});