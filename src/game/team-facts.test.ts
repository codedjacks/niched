import { describe, expect, it } from "vitest";
import { STADIUMS } from "./stadiums";
import { findTeam, recordText, stadiumDeck, teamIndex, type TeamFact } from "./team-facts";

const row = (league: string, id: string, team: string, metric: string, value: number, venue: string | null = null, aliases: string[] = []): TeamFact =>
  ({ league, team_id: id, team_name: team, metric, value, venue_name: venue, venue_aliases: aliases });
const rows = [
  row("mlb", "16", "Chicago Cubs", "wins", 92), row("mlb", "16", "Chicago Cubs", "losses", 70),
  row("mlb", "16", "Chicago Cubs", "capacity", 41072, "Wrigley Field"),
  row("nhl", "1", "Boston Bruins", "wins", 33), row("nhl", "1", "Boston Bruins", "losses", 39), row("nhl", "1", "Boston Bruins", "otLosses", 10),
  row("nhl", "1", "Boston Bruins", "capacity", 18624, "TD Garden", ["FleetCenter"]),
];

describe("team facts", () => {
  const teams = teamIndex(rows);
  it("formats records with overtime losses", () => {
    expect(recordText(findTeam(teams, "NHL", "Bruins")!)).toBe("33–39–10");
    expect(recordText(findTeam(teams, "MLB", "Cubs")!)).toBe("92–70");
  });
  it("uses sourced capacity for curated stadiums and appends new venues", () => {
    const deck = stadiumDeck(STADIUMS, teams);
    expect(deck.slice(0, STADIUMS.length).map((s) => s.name[0])).toEqual(STADIUMS.map((s) => s.name[0]));
    expect(deck.find((s) => s.name[0] === "Wrigley Field")!.capacity).toBe("41,072 seats");
    const td = deck.find((s) => s.name[0] === "TD Garden")!;
    expect(td.name).toContain("FleetCenter");
    expect(deck.length).toBe(STADIUMS.length + 1);
  });
});
