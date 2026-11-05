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

  const pfrRecord = {
    league: "nfl", provider: "pfr", player_id: "RiceJe00", player_name: "Jerry Rice",
    url: "https://www.pro-football-reference.com/players/R/RiceJe00.htm", retrieved_at: "2026-11-05T16:00:00+00:00",
    payload: { athlete: { id: "RiceJe00", displayName: "Jerry Rice" }, categories: [{ name: "receiving", names: ["receivingYards", "receptions"], totals: ["22,895", "1,549"] }] },
    facts: [{ metric: "receivingYards", value: 22895, category: "receiving" }, { metric: "receptions", value: 1549, category: "receiving" }],
  };
  it("accepts Pro Football Reference NFL career totals with matching evidence", () => expect(validateFactImport(pfrRecord).facts).toHaveLength(2));
  it("rejects PFR records for other leagues", () => expect(() => validateFactImport({ ...pfrRecord, league: "nba" })).toThrow("NFL"));
  it("rejects PFR records with an ESPN-style numeric id", () => expect(() => validateFactImport({ ...pfrRecord, player_id: "2330" })).toThrow("Pro Football Reference"));
  it("rejects PFR records whose URL does not match the player id", () => expect(() => validateFactImport({ ...pfrRecord, url: "https://www.pro-football-reference.com/players/R/MossRa00.htm" })).toThrow("identity"));
  it("rejects PFR records with guessed totals", () => expect(() => validateFactImport({ ...pfrRecord, facts: [{ ...pfrRecord.facts[0], value: 23000 }] })).toThrow("evidence"));
});
