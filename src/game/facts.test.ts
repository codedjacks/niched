import { describe, expect, it } from "vitest";
import { validateFactImport } from "./fact-import";

const record = {
  league: "nfl", player_id: "2330", player_name: "Tom Brady", url: "https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/2330/stats", retrieved_at: "2026-10-27T18:00:00+00:00",
  payload: { athlete: { id: "2330", displayName: "Tom Brady" }, categories: [{ name: "passing", names: ["passingYards"], totals: ["89,214"] }] },
  facts: [{ metric: "passingYards", value: 89214, category: "passing" }],
};
describe("Source-backed sports facts", () => {
  it("accepts a total that matches captured source evidence", () => expect(validateFactImport(record).facts[0]?.value).toBe(89214));
  it("rejects guessed totals", () => expect(() => validateFactImport({ ...record, facts: [{ ...record.facts[0], value: 89520 }] })).toThrow("evidence"));
  it("rejects a different athlete identity", () => expect(() => validateFactImport({ ...record, player_name: "Drew Brees" })).toThrow("identity"));
  it("rejects ESPN's ambiguous Tony Gwynn Jr. label", () => expect(() => validateFactImport({ ...record, league: "mlb", player_id: "28516", player_name: "Tony Gwynn", url: "https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/28516/stats", payload: { ...record.payload, athlete: { id: "28516", displayName: "Tony Gwynn" } } })).toThrow("Ambiguous"));
  it("rejects AI or arbitrary source URLs", () => expect(() => validateFactImport({ ...record, url: "https://example.com/guess" })).toThrow("identity"));
  it("rejects postseason scope", () => expect(() => validateFactImport({ ...record, facts: [{ ...record.facts[0], category: "postseason" }] })).toThrow("statistic"));
});
