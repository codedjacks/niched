import { normalize } from "./scoring";
import type { Question, TierId } from "./types";

/** From this day on, Daily Challenge questions are written by AI (earlier days keep the static schedule). */
export const AI_DAILY_FROM = "2026-10-26";
/** From this day on, the AI-written Daily Challenge is sports-only. */
export const SPORTS_DAILY_FROM = "2026-10-26";
export const usesAiDaily = (day: string) => day >= AI_DAILY_FROM;

export interface WireAnswer { name: string; tier: TierId; aliases: string[] }
export interface WireQuestion { id: string; category: string; prompt: string; answers: WireAnswer[] }

/** Words that carry no meaning for prompt identity. */
const PROMPT_STOPWORDS = new Set([
  "a", "an", "the", "name", "who", "what", "which", "that", "this", "has", "have", "had", "in", "of", "for", "to",
  "and", "or", "with", "on", "their", "its", "his", "her", "been", "is", "are", "was", "were", "by", "at", "from",
  "as", "an", "one", "ever", "your", "you", "can", "still", "currently", "current",
]);

/** Content words of a prompt (normalized, stopwords removed) — used to spot reworded repeats. */
export function promptTokens(prompt: string): Set<string> {
  return new Set(normalize(prompt).split(" ").filter((w) => w.length > 1 && !PROMPT_STOPWORDS.has(w)));
}

/**
 * True when `prompt` repeats an already-used prompt: either the exact normalized text,
 * or a rewording whose content words mostly overlap (≥75% of the smaller prompt's words,
 * with at least 3 shared words) so "known by a nickname" and "famous for his nickname" both count as the same question.
 */
export function isRepeatPrompt(prompt: string, usedKeys: Iterable<string>): boolean {
  const key = normalize(prompt);
  if (!key) return true;
  const tokens = promptTokens(prompt);
  for (const used of usedKeys) {
    if (used === key) return true;
    const other = promptTokens(used);
    let shared = 0;
    for (const t of tokens) if (other.has(t)) shared++;
    const smaller = Math.min(tokens.size, other.size);
    if (shared >= 3 && smaller >= 3 && shared / smaller >= 0.75) return true;
  }
  return false;
}

/** Rebuild a playable Question (normalized answer map) from its stored form. */
export function toQuestion(w: WireQuestion): Question {
  const answers = new Map<string, { display: string; tier: TierId }>();
  for (const a of w.answers) {
    for (const n of [a.name, ...a.aliases]) {
      const k = normalize(n);
      if (k && !answers.has(k)) answers.set(k, { display: a.name, tier: a.tier });
    }
  }
  return { id: w.id, category: w.category, prompt: w.prompt, answers };
}
