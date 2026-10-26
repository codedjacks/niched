import { describe, expect, it } from "vitest";
import { sportsTier, rarityReferenceYear } from "./sports-rarity";
import { TIERS } from "./scoring";

describe("sports recognition and era rarity", () => {
  it("gives lesser-known responses more credit than familiar stars", () => {
    expect(TIERS[sportsTier("specialist", null, 2026)].points).toBe(60);
    expect(TIERS[sportsTier("star", null, 2026)].points).toBe(15);
  });
  it("makes older non-iconic responses rarer at the 20-year boundary", () => {
    expect(sportsTier("specialist", 2006, 2026)).toBe("goldstar");
    expect(sportsTier("specialist", 2007, 2026)).toBe("backpack");
  });
  it("does not turn historical household legends into obscure answers", () => {
    expect(sportsTier("household", 2003, 2026)).toBe("pencil"); // Michael Jordan
    expect(sportsTier("household", 1935, 2026)).toBe("pencil"); // Babe Ruth
  });
  it("caps old deep cuts at 100 points", () => {
    expect(TIERS[sportsTier("deep_cut", 1960, 2026)].points).toBe(100);
  });
  it("keeps daily era grading anchored to the question year", () => {
    expect(rarityReferenceYear("ai-2026-10-26-0")).toBe(2026);
    expect(rarityReferenceYear("ai-sports-2026-10-26-0")).toBe(2026);
  });
});