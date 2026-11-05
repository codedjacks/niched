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

/** Structural sports words that recur in almost every prompt; they don't define a question's angle. */
const STRUCTURAL_WORDS = new Set([
  "nba", "nfl", "mlb", "nhl", "player", "players", "team", "teams", "athlete", "athletes", "season", "seasons",
  "game", "games", "won", "win", "wins", "league", "leagues", "sport", "sports", "pro", "professional", "college",
  "coach", "coaches", "champion", "champions",
]);

/** Light plural stripping so "medals" and "medal" compare equal. */
const stem = (w: string) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);

/** The words that define what a question is actually about (structural words removed). */
function angleTokens(prompt: string): Set<string> {
  return new Set([...promptTokens(prompt)].filter((w) => !STRUCTURAL_WORDS.has(w)).map(stem));
}

/**
 * True when `prompt` repeats an already-used prompt: either the exact normalized text,
 * or a rewording whose "angle" words are contained in the used prompt's angle words —
 * so "known by a nickname" and "famous for his nickname" count as the same question,
 * while "won a championship" and "won MVP" stay distinct.
 */
export function isRepeatPrompt(prompt: string, usedKeys: Iterable<string>): boolean {
  const key = normalize(prompt);
  if (!key) return true;
  const angles = angleTokens(prompt);
  const full = promptTokens(prompt);
  for (const used of usedKeys) {
    if (used === key) return true;
    const otherAngles = angleTokens(used);
    if (angles.size > 0 && otherAngles.size > 0) {
      // Both prompts have angle words: a repeat shares at least one angle word covering
      // most of the smaller prompt's angle ("nickname" matches "nickname"; "championship" doesn't match "mvp").
      let sharedAngles = 0;
      for (const t of angles) if (otherAngles.has(t)) sharedAngles++;
      const smallerAngle = Math.min(angles.size, otherAngles.size);
      if (sharedAngles >= 1 && sharedAngles / smallerAngle >= 0.5) return true;
      continue;
    }
    // A prompt with no angle words (e.g. "Name an NBA player") falls back to full content-word overlap.
    const other = promptTokens(used);
    let shared = 0;
    for (const t of full) if (other.has(t)) shared++;
    const smaller = Math.min(full.size, other.size);
    if (smaller >= 3 && shared >= 3 && shared / smaller >= 0.8) return true;
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
