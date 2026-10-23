import type { Question, Tier, TierId } from "./types";

export const TIERS: Record<TierId, Tier> = {
  pencil: { id: "pencil", label: "Pencil", points: 10, emoji: "✏️" },
  paperclip: { id: "paperclip", label: "Paperclip", points: 15, emoji: "📎" },
  notebook: { id: "notebook", label: "Notebook", points: 30, emoji: "📓" },
  backpack: { id: "backpack", label: "Backpack", points: 60, emoji: "🎒" },
  goldstar: { id: "goldstar", label: "Gold Star", points: 85, emoji: "⭐" },
  valedictorian: { id: "valedictorian", label: "Valedictorian", points: 100, emoji: "🎓" },
};
export const TIER_ORDER: TierId[] = ["pencil", "paperclip", "notebook", "backpack", "goldstar", "valedictorian"];
export const QUESTIONS_PER_ROUND = 7;
export const MAX_SCORE = QUESTIONS_PER_ROUND * TIERS.valedictorian.points; // 700

/** Normalize: lowercase, strip accents/punctuation, collapse spaces, drop leading "the". */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^the /, "");
}

/**
 * Rarity source abstraction. Today: curated tiers. Later: swap in a provider
 * backed by real answer-frequency data (e.g. share of players who gave the answer).
 */
export interface RaritySource {
  tierFor(question: Question, key: string): TierId | null;
}
export const curatedRarity: RaritySource = {
  tierFor: (q, key) => q.answers.get(key)?.tier ?? null,
};
/** Map a real frequency (0..1 share of players) to a tier, for future use. */
export function tierFromFrequency(share: number): TierId {
  if (share >= 0.2) return "pencil";
  if (share >= 0.08) return "notebook";
  if (share >= 0.03) return "backpack";
  if (share >= 0.005) return "goldstar";
  return "valedictorian";
}

export type Validation =
  | { ok: true; display: string; tier: TierId; points: number }
  | { ok: false; reason: "empty" | "invalid" | "duplicate" };

export function validateAnswer(
  q: Question,
  raw: string,
  tried: Set<string>,
  source: RaritySource = curatedRarity,
): Validation {
  const key = normalize(raw);
  if (!key) return { ok: false, reason: "empty" };
  if (tried.has(key)) return { ok: false, reason: "duplicate" };
  const tier = source.tierFor(q, key);
  if (!tier) return { ok: false, reason: "invalid" };
  return { ok: true, display: q.answers.get(key)!.display, tier, points: TIERS[tier].points };
}
