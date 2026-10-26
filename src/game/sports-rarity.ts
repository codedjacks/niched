import { TIER_ORDER } from "./scoring";
import type { TierId } from "./types";

export const RECOGNITION_LEVELS = ["household", "star", "well_known", "specialist", "obscure", "deep_cut"] as const;
export type Recognition = typeof RECOGNITION_LEVELS[number];

/** Recognition leads; older, non-iconic answers receive a bounded era bonus. */
export function sportsTier(recognition: Recognition, lastRelevantYear: number | null, referenceYear: number): TierId {
  const base = RECOGNITION_LEVELS.indexOf(recognition);
  const old = lastRelevantYear !== null && Number.isInteger(lastRelevantYear) && lastRelevantYear <= referenceYear - 20;
  const bonus = old && base >= 2 ? 1 : 0;
  return TIER_ORDER[Math.min(base + bonus, TIER_ORDER.length - 1)] ?? "pencil";
}

export function isSportsCategory(category: string) {
  return /sport|nba|nfl|nhl|mlb|basketball|football|baseball|hockey|soccer|tennis|golf|boxing|wrestling|olympic|motorsport|cricket|rugby/i.test(category);
}

export function rarityReferenceYear(questionId: string) {
  const match = /^ai-(?:(?:sports|entertainment|history)-)?(\d{4})-/.exec(questionId);
  return match ? Number(match[1]) : new Date().getUTCFullYear();
}

export const SPORTS_RARITY_GUIDANCE =
  "For sports answers, assess recognition independently of athletic greatness: household (global icons/obvious answers), star (widely known stars), well_known (regular sports fans know them), specialist (mainly team/league or dedicated fans), obscure (few fans recall them), deep_cut (genuinely little-known but verifiable). " +
  "Set recognition and last_relevant_year (last playing/coaching year or year of the historical event; null for active players, current teams/venues/equipment, timeless answers, or uncertain dates). " +
  "Older non-iconic answers get an era bonus after 20 years; do not pre-apply this bonus to recognition. Old household legends like Michael Jordan, Babe Ruth, Muhammad Ali and Wayne Gretzky remain household; age alone never makes them obscure. " +
  "Judge the canonical entity, not unusual spelling, translations, nicknames, or absence from the examples. Recognition is an editorial estimate, not measured player frequency. ";