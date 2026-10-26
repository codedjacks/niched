import { describe, expect, it } from "vitest";
import { challengePool } from "./challenges";
import { QUESTIONS } from "./questions";

describe("sports practice pool", () => {
  it("has at least 60 unique sports questions", () => {
    const pool = challengePool("sports");
    expect(pool.length).toBeGreaterThanOrEqual(60);
    expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length);
  });
  it("keeps new practice questions out of the historical daily bank", () => {
    expect(QUESTIONS.some((q) => q.id.startsWith("sp-"))).toBe(false);
  });
});
