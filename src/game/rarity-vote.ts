import { SPORTS_PRACTICE_QUESTIONS } from "./questions";
import type { TierId } from "./types";

export interface VoteItem { questionId: string; prompt: string; answerKey: string; display: string; tier: TierId }

/** Every distinct (question, answer) pair players can rate — aliases collapse to one entry. */
export function voteItems(): VoteItem[] {
  const out: VoteItem[] = [];
  for (const q of SPORTS_PRACTICE_QUESTIONS) {
    const seen = new Set<string>();
    for (const [, a] of q.answers) {
      if (seen.has(a.display)) continue;
      seen.add(a.display);
      out.push({ questionId: q.id, prompt: q.prompt, answerKey: a.display.toLowerCase(), display: a.display, tier: a.tier });
    }
  }
  return out;
}

/** Random item, never the same as the previous one. */
export function pickItem(items: VoteItem[], prev?: VoteItem, rand = Math.random): VoteItem {
  let it = items[Math.floor(rand() * items.length)]!;
  if (prev && items.length > 1 && it.questionId === prev.questionId && it.answerKey === prev.answerKey) {
    it = items[(items.indexOf(it) + 1) % items.length]!;
  }
  return it;
}
