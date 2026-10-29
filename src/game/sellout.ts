import { hash, mulberry32 } from "./selection";
import type { Stadium } from "./stadiums";

export interface Venue { name: string; league: string; tenant: string; capacity: number }
export const SELLOUT_ROUNDS = 3;
export const SELLOUT_MIN = 5000;
export const SELLOUT_MAX = 110000;

/** Only venues with a numeric recorded capacity. */
export function venuesFrom(deck: Stadium[]): Venue[] {
  return deck.flatMap((s) => {
    const n = Number(s.capacity.replace(/[^0-9]/g, ""));
    return n >= SELLOUT_MIN && n <= SELLOUT_MAX ? [{ name: s.name[0]!, league: s.league, tenant: s.tenant, capacity: n }] : [];
  });
}

export function selloutForDay(day: string, venues: Venue[]): Venue[] {
  const rand = mulberry32(hash(`sellout:${day}`));
  const pool = [...venues];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j]!, pool[i]!]; }
  return pool.slice(0, SELLOUT_ROUNDS);
}

/** Within 1% = 100; loses 4 points per extra percent off, 0 beyond ~26%. */
export function selloutPoints(guess: number, actual: number): number {
  const err = Math.abs(guess - actual) / actual;
  if (err <= 0.01) return 100;
  return Math.max(0, Math.round(100 - (err - 0.01) * 400));
}
