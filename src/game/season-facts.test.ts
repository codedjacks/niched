import { describe, expect, it } from "vitest";
import { factLabel, type SportsFact } from "./facts";
import { generateHeadToHead } from "./headtohead";

const f = (pid: string, metric: string, value: number, scope: string): SportsFact => ({ id: `${pid}${metric}${scope}`, league: "nba", player_id: pid, player_name: `P${pid}`, metric, value, unit: "", scope, source_id: "s", verified_at: "", source_url: "https://x" });
const S = "2025-26 regular season", C = "career regular season";

describe("season facts", () => {
  it("labels season stats by season", () => {
    expect(factLabel("nba", "points", S)).toBe("NBA 2025-26 points");
    expect(factLabel("nba", "points", C)).toBe("NBA career points");
  });
  it("never compares a season total against a career total", () => {
    const facts = ["points", "assists", "totalRebounds"].flatMap((m, i) => [f("1", m, 100 + i, C), f("2", m, 50 + i, S)]);
    expect(generateHeadToHead("2026-10-29", facts)).toBeNull();
  });
  it("builds season-vs-season matchups with a distinct key", () => {
    const facts = ["points", "assists", "totalRebounds"].flatMap((m, i) => [f("1", m, 100 + i, S), f("2", m, 50 + i, S)]);
    const r = generateHeadToHead("2026-10-29", facts)!;
    expect(r.key).toBe(`nba|1|2|${S}`);
    expect(r.puzzle.stats[0]!.label).toMatch(/2025-26/);
  });
});
