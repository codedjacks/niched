import { describe, expect, it } from "vitest";
import { generateHeadToHead } from "./headtohead";
import { FACT_METRICS, type SportsFact } from "./facts";

const metrics = Object.keys(FACT_METRICS).filter((k) => k.startsWith("nba:")).slice(0, 3).map((k) => k.split(":")[1]!);
const facts: SportsFact[] = [];
for (let p = 0; p < 6; p++) metrics.forEach((m, i) => facts.push({
  id: `${p}-${m}`, league: "nba", player_id: `p${p}`, player_name: `Player ${p}`, metric: m, value: 100 + p * 10 + i, source_url: "https://espn.com/x",
} as SportsFact));

describe("Head to Head generator", () => {
  it("never repeats a matchup across days until all 15 pairs are used", () => {
    if (metrics.length < 3) return;
    const used = new Set<string>();
    for (let d = 1; d <= 15; d++) {
      const g = generateHeadToHead(`2026-11-${String(d).padStart(2, "0")}`, facts, used);
      expect(g).not.toBeNull();
      expect(used.has(g!.key)).toBe(false);
      used.add(g!.key);
    }
    expect(used.size).toBe(15);
    expect(generateHeadToHead("2026-11-16", facts, used)).toBeNull();
  });
});
