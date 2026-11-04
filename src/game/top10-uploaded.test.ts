import { describe, expect, it } from "vitest";
import { TOP10 } from "./top10";
import { TOP10_UPLOADED } from "./top10-uploaded";

describe("uploaded Top 10 leaderboards", () => {
  it("adds the uploaded season leaderboards to the deck", () => {
    expect(TOP10_UPLOADED.length).toBe(37);
    for (const u of TOP10_UPLOADED) {
      expect(TOP10.some((t) => t.title === u.title)).toBe(true);
    }
  });

  it("keeps every title in the full deck unique", () => {
    const titles = TOP10.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("gives every uploaded list exactly ten distinct players", () => {
    for (const u of TOP10_UPLOADED) {
      expect(u.names).toHaveLength(10);
      const primaries = u.names.map((n) => n[0]);
      expect(new Set(primaries).size).toBe(10);
    }
  });

  it("covers the new stat categories from the upload", () => {
    const titles = TOP10_UPLOADED.map((t) => t.title);
    expect(titles).toContain("NBA 2024-25 total points");
    expect(titles).toContain("NBA 2015-16 total assists");
    expect(titles).toContain("MLB 2025 runs scored");
    expect(titles).toContain("MLB 2019 pitcher strikeouts");
  });
});
