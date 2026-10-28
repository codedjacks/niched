import { describe, expect, it } from "vitest";
import { consensusTier, voteRarity, normalize, curatedRarity } from "./scoring";
import { SPORTS_PRACTICE_QUESTIONS } from "./questions";

const q = SPORTS_PRACTICE_QUESTIONS[0]!;
describe("rarity votes", () => {
  it("ignores answers with fewer than 3 votes", () => {
    expect(consensusTier({ goldstar: 2 })).toBeNull();
  });
  it("uses the median voted tier once 3 votes exist", () => {
    expect(consensusTier({ pencil: 1, backpack: 1, valedictorian: 1 })).toBe("backpack");
  });
  it("overrides the game's tier for a voted answer", () => {
    const key = normalize("Toronto Maple Leafs");
    const r = voteRarity({ [q.id]: { [key]: { goldstar: 3 } } }, curatedRarity);
    expect(r.tierFor(q, key, "pencil")).toBe("goldstar");
    expect(r.tierFor(q, normalize("Boston Bruins"), "pencil")).toBe("pencil");
  });
});
