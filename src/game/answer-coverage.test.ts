import { describe, expect, it } from "vitest";
import { ALL_QUESTIONS } from "./questions";
import { validateAnswer } from "./scoring";

describe("known answer acceptance across every game mode", () => {
  for (const question of ALL_QUESTIONS) {
    it(`accepts every canonical answer and alias for ${question.id}`, () => {
      for (const [alias, entry] of question.answers) {
        expect(validateAnswer(question, alias, new Set()).ok, alias).toBe(true);
        expect(validateAnswer(question, entry.display, new Set()).ok, entry.display).toBe(true);
        expect(validateAnswer(question, `  ${entry.display.toUpperCase()}!!  `, new Set()).ok, entry.display).toBe(true);
      }
    });
  }
});