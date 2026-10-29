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
