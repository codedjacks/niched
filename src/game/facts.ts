export const FACT_METRICS: Record<string, { group: string; unit: string }> = {
  "nba:points": { group: "NBA career points", unit: "points" },
  "nba:totalRebounds": { group: "NBA career rebounds", unit: "rebounds" },
  "nba:assists": { group: "NBA career assists", unit: "assists" },
  "nfl:passingYards": { group: "NFL career passing yards", unit: "yards" },
  "nfl:passingTouchdowns": { group: "NFL career passing touchdowns", unit: "touchdowns" },
  "nfl:rushingYards": { group: "NFL career rushing yards", unit: "yards" },
  "nfl:rushingTouchdowns": { group: "NFL career rushing touchdowns", unit: "touchdowns" },
  "nfl:receivingYards": { group: "NFL career receiving yards", unit: "yards" },
  "nfl:receptions": { group: "NFL career receptions", unit: "receptions" },
  "mlb:homeRuns": { group: "MLB career home runs", unit: "home runs" },
  "mlb:hits": { group: "MLB career hits", unit: "hits" },
  "mlb:RBIs": { group: "MLB career RBI", unit: "RBI" },
  "mlb:strikeouts": { group: "MLB pitcher strikeouts", unit: "strikeouts" },
  "mlb:wins": { group: "MLB pitcher wins", unit: "wins" },
  "nhl:goals": { group: "NHL career goals", unit: "goals" },
  "nhl:points": { group: "NHL career points", unit: "points" },
  "nhl:assists": { group: "NHL career assists", unit: "assists" },
};

export interface SportsFact {
  id: string; league: string; player_id: string; player_name: string;
  metric: string; value: number; unit: string; scope: string;
  source_id: string; verified_at: string; source_url: string;
}

/** Last completed regular season per league; ESPN keys seasons by their ending year. */
export const SEASON_SCOPES: Record<string, { year: number; scope: string }> = {
  nba: { year: 2026, scope: "2025-26 regular season" },
  nfl: { year: 2025, scope: "2025 regular season" },
  mlb: { year: 2026, scope: "2026 regular season" },
  nhl: { year: 2026, scope: "2025-26 regular season" },
};
export const CAREER_SCOPE = "career regular season";

/** "NBA career points" for career facts, "NBA 2025-26 points" for season facts. */
export function factLabel(league: string, metric: string, scope: string = CAREER_SCOPE): string {
  const group = FACT_METRICS[`${league}:${metric}`]?.group ?? metric;
  if (scope === CAREER_SCOPE) return group;
  const season = scope.replace(/ regular season$/, "");
  return group.replace(/ career /, ` ${season} `).replace(/^(MLB) pitcher /, `$1 ${season} pitcher `);
}
