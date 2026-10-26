import { normalize } from "./scoring";
import type { Question, TierId } from "./types";

/** From this day on, Daily Challenge questions are written by AI (earlier days keep the static schedule). */
export const AI_DAILY_FROM = "2026-10-26";
/** From this day on, the AI-written Daily Challenge is sports-only. */
export const SPORTS_DAILY_FROM = "2026-10-26";
export const usesAiDaily = (day: string) => day >= AI_DAILY_FROM;

export interface WireAnswer { name: string; tier: TierId; aliases: string[] }
export interface WireQuestion { id: string; category: string; prompt: string; answers: WireAnswer[] }

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
