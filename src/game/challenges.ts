import { ALL_QUESTIONS } from "./questions";
import { practiceQuestions } from "./selection";
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

export function challengeQuestions(topic: ChallengeId, seen: Iterable<string> = []) {
  return practiceQuestions(seen, challengePool(topic));
}

type ChallengeProgress = { seen: string[]; best: number };
export function loadChallenge(topic: ChallengeId): ChallengeProgress {
  try {
    const data = JSON.parse(localStorage.getItem(`niched:challenge:${topic}`) || "{}");
    return { seen: Array.isArray(data.seen) ? data.seen.filter((id: unknown) => typeof id === "string") : [], best: typeof data.best === "number" ? data.best : 0 };
  } catch { return { seen: [], best: 0 }; }
}

export function saveChallenge(topic: ChallengeId, progress: ChallengeProgress) {
  try { localStorage.setItem(`niched:challenge:${topic}`, JSON.stringify(progress)); } catch { /* storage unavailable */ }
}

export function startChallenge(topic: ChallengeId) {
  const progress = loadChallenge(topic);
  const questions = challengeQuestions(topic, progress.seen);
  const seen = [...new Set([...progress.seen, ...questions.map((q) => q.id)])];
  saveChallenge(topic, { ...progress, seen: seen.length >= challengePool(topic).length ? questions.map((q) => q.id) : seen });
  return questions;
}