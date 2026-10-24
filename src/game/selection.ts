import { DAILY_QUESTIONS, QUESTIONS } from "./questions";
import { QUESTIONS_PER_ROUND } from "./scoring";
import type { Question } from "./types";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function pick(rand: () => number, bank: Question[] = QUESTIONS, n = QUESTIONS_PER_ROUND) {
  const arr = [...bank];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, n);
}

export function dateKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
/** First day the daily pool includes the full bank. Earlier days keep the original pool so past results still verify. */
export const FULL_BANK_DAILY_FROM = "2026-10-24";
export function dailyQuestions(key = dateKey()) {
  const bank = key >= FULL_BANK_DAILY_FROM ? QUESTIONS : DAILY_QUESTIONS;
  if (key < FULL_BANK_DAILY_FROM) return pick(mulberry32(hash("niched:" + key)), bank);
  return dailyDeal(daysBetween(FULL_BANK_DAILY_FROM, key)).map((id) => QUESTIONS.find((q) => q.id === id)!);
}

function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

/**
 * Daily questions are dealt from a seeded deck of the whole bank, 7 per day, so no
 * question repeats until every question has been used; then the deck is reshuffled.
 * A question is never dealt twice in the same day, even across a reshuffle.
 */
const dealt: string[][] = [];
let deck: string[] = [];
let epoch = 0;
function dailyDeal(day: number): string[] {
  while (dealt.length <= day) {
    const today: string[] = [];
    const held: string[] = [];
    while (today.length < QUESTIONS_PER_ROUND) {
      if (!deck.length) {
        deck = pick(mulberry32(hash("niched:deck:" + epoch++)), QUESTIONS, QUESTIONS.length).map((q) => q.id);
      }
      const id = deck.shift()!;
      if (today.includes(id)) held.push(id);
      else today.push(id);
    }
    deck.unshift(...held);
    dealt.push(today);
  }
  return dealt[day]!;
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
