import { hash, mulberry32 } from "./selection";
import type { TeamInfo } from "./team-facts";

/** Fallback NBA 2024–25 records, used only if sourced team records fail to load. */
export const STANDINGS_FALLBACK: TeamInfo[] = [
  ["Oklahoma City Thunder", 68, 14], ["Cleveland Cavaliers", 64, 18], ["Boston Celtics", 61, 21],
  ["New York Knicks", 51, 31], ["Los Angeles Lakers", 50, 32], ["Detroit Pistons", 44, 38], ["Washington Wizards", 18, 64],
].map(([name, wins, losses]) => ({ league: "nba", name: name as string, wins: wins as number, losses: losses as number, extra: 0 }));

export const winPct = (t: TeamInfo) => { const g = t.wins + t.losses + t.extra; return g ? (t.wins + t.extra / 2) / g : 0; };

/** Five teams from one league with distinct win percentages, in shuffled order. */
export function standingsForDay(day: string, teams: TeamInfo[]): TeamInfo[] {
  const rand = mulberry32(hash(`standings:${day}`));
  const leagues = [...new Set(teams.filter((t) => t.wins + t.losses > 0).map((t) => t.league))].sort();
  const league = leagues[Math.floor(rand() * leagues.length)];
  const pool = teams.filter((t) => t.league === league && t.wins + t.losses > 0).sort((a, b) => a.name.localeCompare(b.name));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j]!, pool[i]!]; }
  const out: TeamInfo[] = [];
  for (const t of pool) { if (out.length < 5 && !out.some((o) => Math.abs(winPct(o) - winPct(t)) < 0.001)) out.push(t); }
  return out;
}

export const correctOrder = (teams: TeamInfo[]) => [...teams].sort((a, b) => winPct(b) - winPct(a));

/** 20 per team in the right spot (100 for a perfect order). */
export function standingsScore(guess: TeamInfo[]): number {
  const right = correctOrder(guess);
  return guess.reduce((s, t, i) => s + (t.name === right[i]?.name ? 20 : 0), 0);
}
