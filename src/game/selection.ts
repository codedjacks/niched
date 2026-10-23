import { QUESTIONS } from "./questions";
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
function pick(rand: () => number, bank: Question[] = QUESTIONS) {
  const arr = [...bank];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, QUESTIONS_PER_ROUND);
}

export function dateKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export function dailyQuestions(key = dateKey()) {
  return pick(mulberry32(hash("niched:" + key)));
}
export function practiceQuestions() {
  return pick(Math.random);
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
