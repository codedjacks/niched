import { ALL_QUESTIONS } from "./questions";
import { daysBetween, dateKey, hash, mulberry32, pick } from "./selection";
import type { Question } from "./types";

export const CHALLENGES = {
  sports: { name: "Sports", emoji: "🏆", note: "Gym class", subtitle: "Big leagues. Small details.", categories: ["Sports"] },
  entertainment: { name: "Entertainment", emoji: "🎬", note: "Drama club", subtitle: "Find the deep cuts beyond the credits.", categories: ["Movies", "TV", "Music", "Games", "Gaming", "Comics", "Books", "Literature", "Pop Culture"] },
  history: { name: "History", emoji: "🏛️", note: "History class", subtitle: "The past is full of niche answers.", categories: ["History"] },
} as const;
export type ChallengeId = keyof typeof CHALLENGES;

export function challengePool(topic: ChallengeId): Question[] {
  const categories: readonly string[] = CHALLENGES[topic].categories;
  return ALL_QUESTIONS.filter((q) => categories.includes(q.category));
}

export const TOPIC_DAILY_FROM = "2026-10-25";
/** Same seven questions for everyone each day; walks a seeded deck, reshuffling only after the topic's pool is used up. */
export function challengeQuestions(topic: ChallengeId, key = dateKey()): Question[] {
  const pool = challengePool(topic);
  const per = Math.floor(pool.length / 7);
  if (per < 1) return pool.slice(0, 7);
  const day = Math.max(0, daysBetween(TOPIC_DAILY_FROM, key));
  const cycle = Math.floor(day / per);
  const deck = pick(mulberry32(hash(`niched:topic:${topic}:${cycle}`)), pool, pool.length);
  const slot = day % per;
  return deck.slice(slot * 7, slot * 7 + 7);
}

type ChallengeProgress = { seen: string[]; best: number; day?: string; score?: number };
export function loadChallenge(topic: ChallengeId): ChallengeProgress {
  try {
    const data = JSON.parse(localStorage.getItem(`niched:challenge:${topic}`) || "{}");
    return { seen: [], best: typeof data.best === "number" ? data.best : 0, day: typeof data.day === "string" ? data.day : undefined, score: typeof data.score === "number" ? data.score : undefined };
  } catch { return { seen: [], best: 0 }; }
}

export function saveChallenge(topic: ChallengeId, progress: ChallengeProgress) {
  try { localStorage.setItem(`niched:challenge:${topic}`, JSON.stringify(progress)); } catch { /* storage unavailable */ }
}

export function startChallenge(topic: ChallengeId) {
  return challengeQuestions(topic);
}
