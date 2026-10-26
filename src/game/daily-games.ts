import { hash, mulberry32 } from "./selection";
import { normalize } from "./scoring";

/** Deterministic shuffle: same seed → same order for every player. */
export function seededShuffle<T>(seed: string, items: readonly T[]): T[] {
  const rand = mulberry32(hash(seed));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Index of the day's item, cycling through a seeded deck so items don't repeat until all are used. */
export function dailyItem<T>(game: string, items: readonly T[], dayNumber: number): T {
  const cycle = Math.floor(dayNumber / items.length);
  return seededShuffle(`niched:${game}:${cycle}`, items)[dayNumber % items.length]!;
}

export const dayNumber = (day: string) => Math.floor(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86_400_000);

/** Does typed text name this person? Accepts full name, aliases, or a unique last name. */
export function namesMatch(typed: string, names: string[]): boolean {
  const t = normalize(typed);
  return !!t && names.some((n) => normalize(n) === t);
}

export type GameProgress = { day?: string; score?: number; best: number; streak: number; last?: string };
const prevDay = (d: string) => new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10) - 1)).toISOString().slice(0, 10);

export function loadGame(game: string): GameProgress {
  try {
    const d = JSON.parse(localStorage.getItem(`niched:game:${game}`) || "{}");
    return { best: Number(d.best) || 0, streak: Number(d.streak) || 0, day: d.day, score: d.score, last: d.last };
  } catch { return { best: 0, streak: 0 }; }
}

/** Pure: record a finished day; replays of the same day are ignored. */
export function recordGame(p: GameProgress, day: string, score: number): GameProgress {
  if (p.day === day) return p;
  const streak = p.last === prevDay(day) ? p.streak + 1 : 1;
  return { day, score, best: Math.max(p.best, score), streak, last: day };
}

export function saveGame(game: string, p: GameProgress) {
  try { localStorage.setItem(`niched:game:${game}`, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
