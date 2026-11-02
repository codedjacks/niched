import { seededShuffle } from "./daily-games";
import { DRAFTS } from "./draft";
import { NICKNAMES } from "./nickname";
import { TRIVIA_BANK } from "./trivia-bank";

export interface TriviaQuestion { id: string; prompt: string; answer: string; options: string[]; level: 1 | 2 | 3; fact: string }

export const TRIVIA_LENGTH = 10;
export const TRIVIA_SECONDS = 15;
export const TRIVIA_BASE = 100;
export const TRIVIA_SPEED_MAX = 50;
export const TRIVIA_STREAK_STEP = 10;
export const TRIVIA_STREAK_CAP = 50;

/** Points for one answer: 0 if wrong; else 100 + speed bonus (0–50 by time left) + streak bonus (+10 per prior correct in a row, max +50). */
export function triviaPoints(correct: boolean, secondsLeft: number, streakBefore: number, seconds = TRIVIA_SECONDS): number {
  if (!correct) return 0;
  const speed = Math.round(TRIVIA_SPEED_MAX * Math.max(0, Math.min(1, secondsLeft / seconds)));
  return TRIVIA_BASE + speed + Math.min(TRIVIA_STREAK_CAP, streakBefore * TRIVIA_STREAK_STEP);
}
export const TRIVIA_MAX = TRIVIA_LENGTH * TRIVIA_BASE + TRIVIA_LENGTH * TRIVIA_SPEED_MAX
  + Array.from({ length: TRIVIA_LENGTH }, (_, i) => Math.min(TRIVIA_STREAK_CAP, i * TRIVIA_STREAK_STEP)).reduce((a, b) => a + b, 0);

/** Survival clock: 15s at the start, one second less every 3 questions, never below 8s. */
export const survivalSeconds = (index: number) => Math.max(8, 15 - Math.floor(index / 3));
/** Survival difficulty ramps: easy first, then medium, then hard. */
export const survivalLevel = (index: number): 1 | 2 | 3 => (index < 5 ? 1 : index < 15 ? 2 : 3);

function wrongFrom(pool: string[], answer: string, seed: string): string[] {
  return seededShuffle(seed, [...new Set(pool)].filter((x) => x !== answer)).slice(0, 3);
}

function build(): TriviaQuestion[] {
  const out: TriviaQuestion[] = TRIVIA_BANK.map(([prompt, answer, a, b, c, level, fact], i) =>
    ({ id: `b${i}`, prompt, answer, options: [answer, a, b, c], level, fact }));
  for (const p of DRAFTS) {
    const pool = DRAFTS.filter((d) => d.league === p.league && Math.abs(d.year - p.year) <= 12).map((d) => d.name);
    out.push({ id: `d${p.league}${p.year}`, prompt: `Who was the No. 1 overall pick in the ${p.year} ${p.league} draft?`, answer: p.name,
      options: [p.name, ...wrongFrom(pool, p.name, `draft:${p.league}${p.year}`)], level: p.year < 1995 ? 3 : 2, fact: `${p.position} from ${p.school}, taken by the ${p.team}.` });
  }
  for (const n of NICKNAMES) {
    const pool = NICKNAMES.filter((x) => x.league === n.league).map((x) => x.name);
    out.push({ id: `n${n.nickname}`, prompt: `Which ${n.league} star is nicknamed "${n.nickname}"?`, answer: n.name,
      options: [n.name, ...wrongFrom(pool, n.name, `nick:${n.nickname}`)], level: 1, fact: `${n.position}, ${n.teams} — ${n.award}.` });
  }
  return out.filter((q) => q.options.length === 4 && new Set(q.options).size === 4);
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = build();

const shuffleOptions = (q: TriviaQuestion, seed: string): TriviaQuestion => ({ ...q, options: seededShuffle(`${seed}:${q.id}`, q.options) });

/** A per-player deck: every question once, shuffled, options shuffled. */
export function triviaDeck(seed: string): TriviaQuestion[] {
  return seededShuffle(`trivia:${seed}`, TRIVIA_QUESTIONS).map((q) => shuffleOptions(q, seed));
}
export const triviaRound = (seed: string) => triviaDeck(seed).slice(0, TRIVIA_LENGTH);

/** Survival deck ordered by difficulty ramp; no repeats within a run. */
export function survivalDeck(seed: string): TriviaQuestion[] {
  const by = (l: number) => seededShuffle(`survival:${seed}:${l}`, TRIVIA_QUESTIONS.filter((q) => q.level === l));
  const pools = { 1: by(1), 2: by(2), 3: by(3) } as Record<1 | 2 | 3, TriviaQuestion[]>;
  const out: TriviaQuestion[] = [];
  const used = new Set<string>();
  for (let i = 0; out.length < TRIVIA_QUESTIONS.length; i++) {
    const want = survivalLevel(i);
    const order = [want, 2, 3, 1] as const;
    let q: TriviaQuestion | undefined;
    for (const l of order) { while (pools[l].length && used.has(pools[l][0]!.id)) pools[l].shift(); q = pools[l].shift(); if (q) break; }
    if (!q) break;
    used.add(q.id); out.push(shuffleOptions(q, seed));
  }
  return out;
}

/** Survival ends on the first wrong answer or timeout (answer === null). */
export const survivalContinues = (q: TriviaQuestion, picked: string | null) => picked !== null && picked === q.answer;
