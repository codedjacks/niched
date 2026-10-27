import { seededShuffle } from "./daily-games";
import type { HLPair } from "./higherlower";

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
export type SourcedPair = HLPair & { a: HLPair["a"] & { source: string }; b: HLPair["b"] & { source: string } };

/** Only complete, distinct, citation-backed pairs can enter a scored round. */
export function sourcedPairs(day: string, facts: SportsFact[]): SourcedPair[] {
  const groups = new Map<string, SportsFact[]>();
  for (const fact of facts) {
    const spec = FACT_METRICS[`${fact.league}:${fact.metric}`];
    if (!spec || !fact.source_url.startsWith("https://") || !Number.isFinite(fact.value)) continue;
    const rows = groups.get(spec.group) ?? [];
    rows.push(fact); groups.set(spec.group, rows);
  }
  const available = [...groups.keys()].filter(g => new Set(groups.get(g)?.map(f => f.value)).size >= 2);
  if (!available.length) return [];
  const order = seededShuffle(`sourced-hl:${day}`, available);
  const pairs: SourcedPair[] = [];
  for (let i = 0; i < 10; i++) {
    const group = order[i % order.length];
    if (!group) break;
    const rows = seededShuffle(`sourced-hl:${day}:${i}`, groups.get(group) ?? []);
    const a = rows[0]; const b = rows.find(f => a && f.player_id !== a.player_id && f.value !== a.value);
    if (!a || !b) continue;
    pairs.push({ group, a: { group, name: a.player_name, value: a.value, source: a.source_url }, b: { group, name: b.player_name, value: b.value, source: b.source_url } });
  }
  return pairs;
}