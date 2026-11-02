import { describe, expect, it } from "vitest";
import { TRIVIA_QUESTIONS, triviaPoints, triviaRound, survivalDeck, survivalSeconds, survivalContinues, TRIVIA_MAX } from "./trivia";

describe("trivia", () => {
  it("has a large bank with 4 unique options and one correct answer", () => {
    expect(TRIVIA_QUESTIONS.length).toBeGreaterThanOrEqual(300);
    for (const q of TRIVIA_QUESTIONS) {
      expect(new Set(q.options).size).toBe(4);
      expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
    }
    expect(new Set(TRIVIA_QUESTIONS.map((q) => q.id)).size).toBe(TRIVIA_QUESTIONS.length);
  });
  it("scores 100 + speed + streak, 0 when wrong", () => {
    expect(triviaPoints(false, 15, 3)).toBe(0);
    expect(triviaPoints(true, 15, 0)).toBe(150);
    expect(triviaPoints(true, 0, 0)).toBe(100);
    expect(triviaPoints(true, 0, 2)).toBe(120);
    expect(triviaPoints(true, 0, 9)).toBe(150);
    expect(TRIVIA_MAX).toBe(10 * 150 + (0 + 10 + 20 + 30 + 40 + 50 * 5));
  });
  it("round has 10 distinct questions", () => {
    const r = triviaRound("2001-01-01");
    expect(r).toHaveLength(10);
    expect(new Set(r.map((q) => q.id)).size).toBe(10);
  });
  it("survival: no repeats, ramps difficulty, timer 15→8", () => {
    const d = survivalDeck("x");
    expect(new Set(d.map((q) => q.id)).size).toBe(d.length);
    expect(d.slice(0, 5).every((q) => q.level === 1)).toBe(true);
    expect(survivalSeconds(0)).toBe(15);
    expect(survivalSeconds(3)).toBe(14);
    expect(survivalSeconds(100)).toBe(8);
  });
  it("survival ends on wrong answer or timeout", () => {
    const q = TRIVIA_QUESTIONS[0]!;
    expect(survivalContinues(q, q.answer)).toBe(true);
    expect(survivalContinues(q, q.options.find((o) => o !== q.answer)!)).toBe(false);
    expect(survivalContinues(q, null)).toBe(false);
  });
});
