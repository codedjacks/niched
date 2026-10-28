import { describe, expect, it } from "vitest";
import { TOP10, top10ForDay, top10Points, top10Slot, TOP10_MAX } from "./top10";
import { SILHOUETTES, cluePoints, isSilhouette } from "./silhouette";
import { CHAINS, chainOver, chainIndex } from "./jerseychain";
import { TRADES, isTradePlayer } from "./trades";
import { BALLOTS, scoreBallot, ballotStart } from "./ballot";
import { STADIUMS, isStadium } from "./stadiums";
import { headToHead, h2hScore } from "./headtohead";
import type { SportsFact } from "./facts";

describe("seven new daily games", () => {
  it("everyone gets the same Top 10 today and it changes tomorrow", () => {
    expect(top10ForDay("2026-10-28")).toBe(top10ForDay("2026-10-28"));
    expect(top10ForDay("2026-10-28")).not.toBe(top10ForDay("2026-10-29"));
  });
  it("Top 10 bottom slots pay more; full list is 110", () => {
    expect(top10Points(10)).toBeGreaterThan(top10Points(1));
    expect(TOP10_MAX).toBe([...Array(10)].reduce((s, _, i) => s + top10Points(i + 1), 0));
    expect(top10Slot(TOP10[0]!, "barry bonds", [])).toBe(0);
    expect(top10Slot(TOP10[0]!, "barry bonds", [0])).toBe(-1);
  });
  it("Silhouette scores 100/80/60/40/20 by clue", () => {
    expect([1, 2, 3, 4, 5].map(cluePoints)).toEqual([100, 80, 60, 40, 20]);
    expect(isSilhouette(SILHOUETTES[0]!, "jordan")).toBe(true);
    expect(isSilhouette(SILHOUETTES[0]!, "Micheal Jordan")).toBe(true);
  });
  it("Jersey Chain ends after three misses", () => {
    const ch = CHAINS[0]!;
    expect(chainOver(ch, 1, 2)).toBe(false);
    expect(chainOver(ch, 1, 3)).toBe(true);
    expect(chainIndex(ch, "LeBron James", [])).toBe(1);
  });
  it("Award Ballot: 15 per spot plus 25 for a perfect ballot", () => {
    const b = BALLOTS[0]!;
    expect(scoreBallot(b, b.order)).toBe(100);
    const swapped = [b.order[1]!, b.order[0]!, ...b.order.slice(2)];
    expect(scoreBallot(b, swapped)).toBe(45);
    expect(ballotStart("2026-10-28", b)).not.toEqual(b.order);
  });
  it("trades and stadiums accept typed names", () => {
    expect(isTradePlayer(TRADES[0]!, "gretzky")).toBe(true);
    expect(isStadium(STADIUMS[0]!, "wrigley")).toBe(true);
  });
  it("no empty or duplicate puzzles", () => {
    expect(TOP10.every((l) => l.names.length === 10)).toBe(true);
    expect(BALLOTS.every((b) => b.order.length === 5 && new Set(b.order).size === 5)).toBe(true);
    for (const list of [SILHOUETTES.map((s) => s.name[0]), TRADES.map((t) => t.player[0]), STADIUMS.map((s) => s.name[0]), CHAINS.map((c) => c.league + c.number)]) {
      expect(new Set(list).size).toBe(list.length);
    }
  });
  it("Head to Head only uses shared sourced categories", () => {
    const f = (p: string, metric: string, value: number): SportsFact => ({ id: p + metric, league: "nba", player_id: p, player_name: p, metric, value, unit: "", scope: "", source_id: "s", verified_at: "", source_url: "https://espn.com/x" });
    const facts = ["points", "assists", "totalRebounds"].flatMap((m, i) => [f("A", m, 100 + i), f("B", m, 50)]);
    const m = headToHead("2026-10-28", facts)!;
    expect(m.stats).toHaveLength(3);
    const winners = m.stats.map((s) => (s.a > s.b ? "a" : "b") as "a" | "b");
    expect(h2hScore(m, winners)).toBe(60);
    expect(headToHead("2026-10-28", facts.slice(0, 4))).toBeNull();
  });
});
