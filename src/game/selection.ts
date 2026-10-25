import { DAILY_QUESTIONS, ORIGINAL_FULL_QUESTIONS, EXPANSION_QUESTIONS, QUESTIONS, REVIEWED_QUESTIONS, SUPPLY_QUESTIONS } from "./questions";
import { QUESTIONS_PER_ROUND } from "./scoring";
import type { Question } from "./types";

export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function pick(rand: () => number, bank: Question[] = QUESTIONS, n = QUESTIONS_PER_ROUND) {
  const arr = [...bank];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = arr[i];
    const b = arr[j];
    if (a && b) [arr[i], arr[j]] = [b, a];
  }
  return arr.slice(0, n);
}

export function dateKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/** First day the daily pool includes the full bank. Earlier days keep the original pool so past results still verify. */
export const FULL_BANK_DAILY_FROM = "2026-10-24";
/** New categories begin tomorrow; today's already-played round stays identical. */
export const EXPANDED_BANK_DAILY_FROM = "2026-10-25";
export function dailyQuestions(key = dateKey()) {
  if (key < FULL_BANK_DAILY_FROM) return pick(mulberry32(hash("niched:" + key)), DAILY_QUESTIONS);
  const preserved = pick(mulberry32(hash("niched:deck:0")), ORIGINAL_FULL_QUESTIONS);
  if (key < EXPANDED_BANK_DAILY_FROM) return preserved;
  return dailyDeal(daysBetween(EXPANDED_BANK_DAILY_FROM, key), preserved);
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/** Append-only reviewed batches: new additions never reorder already scheduled days. */
function dailyDeal(day: number, preserved: Question[]): Question[] {
  const used = new Set(preserved.map((q) => q.id));
  const previous = [...ORIGINAL_FULL_QUESTIONS, ...EXPANSION_QUESTIONS].filter((q) => !used.has(q.id));
  const schedule = [
    ...pick(mulberry32(hash("niched:expanded:0")), previous, previous.length),
    ...pick(mulberry32(hash("niched:reviewed:2026-10-24")), REVIEWED_QUESTIONS, REVIEWED_QUESTIONS.length),
    ...pick(mulberry32(hash("niched:supply:2026-10-24")), SUPPLY_QUESTIONS, SUPPLY_QUESTIONS.length),
  ];
  const round = schedule.slice(day * QUESTIONS_PER_ROUND, (day + 1) * QUESTIONS_PER_ROUND);
  return round.length === QUESTIONS_PER_ROUND ? round : [];
}

/**
 * Random round that avoids every id in `exclude` (e.g. questions this player has
 * already seen). When fewer than 7 unseen remain, the leftovers are used first and
 * the rest is topped up from the full bank.
 */
export function practiceQuestions(exclude: Iterable<string> = [], bank: Question[] = QUESTIONS) {
  const seen = new Set(exclude);
  const fresh = pick(Math.random, bank.filter((q) => !seen.has(q.id)));
  if (fresh.length === QUESTIONS_PER_ROUND) return fresh;
  const ids = new Set(fresh.map((q) => q.id));
  return [...fresh, ...pick(Math.random, bank.filter((q) => !ids.has(q.id)), QUESTIONS_PER_ROUND - fresh.length)];
}
export function msUntilNextDaily(now = new Date()) {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** A client's local date may differ from the server's UTC date by at most one day. */
export function dayIsCurrent(day: string, now = new Date()) {
  const d = new Date(`${day}T12:00:00Z`).getTime();
  const utc = now.toISOString().slice(0, 10);
  return Number.isFinite(d) && Math.abs(d - new Date(`${utc}T12:00:00Z`).getTime()) <= 36 * 3600_000;
}
