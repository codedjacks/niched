import { seededShuffle } from "./daily-games";
import { FACT_METRICS, type SportsFact } from "./facts";

export interface H2HStat { metric: string; label: string; a: number; b: number; source: string }
export interface H2H { league: string; a: string; b: string; stats: H2HStat[] }
export const H2H_CATS = 5;
export const H2H_POINT = 20;
export const H2H_MIN_CATS = 3;

/** Stable identity of a matchup: league + the two athletes, order-independent. */
export const h2hKey = (league: string, idA: string, idB: string) => `${league.toLowerCase()}|${[idA, idB].sort().join("|")}`;

function groupFacts(facts: SportsFact[]) {
  const byPlayer = new Map<string, SportsFact[]>();
  for (const f of facts) {
    if (!FACT_METRICS[`${f.league}:${f.metric}`] || !f.source_url?.startsWith("https://") || !Number.isFinite(f.value)) continue;
    const k = `${f.league}|${f.player_id}`;
    byPlayer.set(k, [...(byPlayer.get(k) ?? []), f]);
  }
  return byPlayer;
}

function build(A: SportsFact[], B: SportsFact[]): H2H | null {
  if (A[0]!.league !== B[0]!.league) return null;
  const stats: H2HStat[] = [];
  for (const fa of A) {
    const fb = B.find((x) => x.metric === fa.metric);
    if (!fb || fb.value === fa.value || stats.some((s) => s.metric === fa.metric)) continue;
    stats.push({ metric: fa.metric, label: FACT_METRICS[`${fa.league}:${fa.metric}`]!.group, a: fa.value, b: fb.value, source: fa.source_url });
  }
  if (stats.length < H2H_MIN_CATS) return null;
  return { league: A[0]!.league.toUpperCase(), a: A[0]!.player_name, b: B[0]!.player_name, stats: stats.slice(0, H2H_CATS) };
}

/**
 * Puzzle generator: the day's matchup, skipping any matchup key in `used`.
 * Returns null only when every valid matchup has been used.
 */
export function generateHeadToHead(day: string, facts: SportsFact[], used: ReadonlySet<string> = new Set()): { key: string; puzzle: H2H } | null {
  const byPlayer = groupFacts(facts);
  const keys = seededShuffle(`h2h:${day}`, [...byPlayer.keys()].sort());
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const A = byPlayer.get(keys[i]!)!, B = byPlayer.get(keys[j]!)!;
      if (A[0]!.league !== B[0]!.league) continue;
      const key = h2hKey(A[0]!.league, A[0]!.player_id, B[0]!.player_id);
      if (used.has(key)) continue;
      const puzzle = build(A, B);
      if (puzzle) return { key, puzzle };
    }
  }
  return null;
}

/** Stateless fallback (may repeat): today's matchup ignoring history. */
export function headToHead(day: string, facts: SportsFact[]): H2H | null {
  return generateHeadToHead(day, facts)?.puzzle ?? null;
}

export const h2hScore = (m: H2H, picks: ("a" | "b")[]) =>
  picks.filter((p, i) => { const s = m.stats[i]; return s && (p === "a" ? s.a > s.b : s.b > s.a); }).length * H2H_POINT;
