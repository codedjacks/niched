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
 * Rarity source abstraction. Answers are identified by canonical key = normalize(display).
 * `fallback` is the curated (or AI-estimated) tier, used when no real data applies.
 */
export interface RaritySource {
  tierFor(question: Question, canonicalKey: string, fallback: TierId): TierId;
}
export const curatedRarity: RaritySource = {
  tierFor: (_q, _k, fallback) => fallback,
};

/** Map a real frequency (0..1 share of players who gave this answer) to a tier. */
export function tierFromFrequency(share: number): TierId {
  if (share >= 0.25) return "pencil";
  if (share >= 0.12) return "paperclip";
  if (share >= 0.06) return "notebook";
  if (share >= 0.025) return "backpack";
  if (share >= 0.008) return "goldstar";
  return "valedictorian";
}

/** Minimum correct answers recorded for a question before real frequencies replace curated tiers. */
export const MIN_SAMPLES = 25;
export type QuestionCounts = { total: number; counts: Record<string, number> };

/** Real answer-frequency rarity, with curated fallback while a question has too few plays. */
export function frequencyRarity(data: Record<string, QuestionCounts>, min = MIN_SAMPLES): RaritySource {
  return {
    tierFor: (q, key, fallback) => {
      const d = data[q.id];
      if (!d || d.total < min) return fallback;
      return tierFromFrequency((d.counts[key] ?? 0) / d.total);
    },
  };
}
export function usesRealData(data: Record<string, QuestionCounts> | undefined, qid: string, min = MIN_SAMPLES) {
  return (data?.[qid]?.total ?? 0) >= min;
}

/** Levenshtein distance (small strings only). */
export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}
/** Allowed typos scale with length: 0 for <=3 chars, 1 for <=5, 2 for <=10, else 3. */
export function typoAllowance(len: number) {
  return len <= 3 ? 0 : len <= 5 ? 1 : len <= 10 ? 2 : 3;
}
/** Closest curated key within typo allowance, or null. */
export function fuzzyMatch(q: Question, key: string): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const k of q.answers.keys()) {
    if (Math.abs(k.length - key.length) > 3) continue;
    const d = editDistance(key, k);
    if (d <= typoAllowance(Math.min(k.length, key.length)) && d < bestD) { best = k; bestD = d; }
  }
  return best;
}

export type Validation =
  | { ok: true; display: string; tier: TierId; points: number; didYouMean: boolean }
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
  const exact = q.answers.get(key);
  const matchKey = exact ? key : fuzzyMatch(q, key);
  if (!matchKey) return { ok: false, reason: "invalid" };
  const entry = q.answers.get(matchKey)!;
  const tier = source.tierFor(q, normalize(entry.display), entry.tier);
  return { ok: true, display: entry.display, tier, points: TIERS[tier].points, didYouMean: !exact };
}
