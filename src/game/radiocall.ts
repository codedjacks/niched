import { normalize } from "./scoring";
import { hash, mulberry32 } from "./selection";

export interface RadioCall { text: string; answers: string[]; caller: string; year: number; team: string }

/** Famous broadcast calls; ____ marks the bleeped word. Append-only. */
export const CALLS: RadioCall[] = [
  { text: "Do you believe in ____? Yes!", answers: ["miracles"], caller: "Al Michaels", year: 1980, team: "U.S. Olympic hockey vs. the Soviet Union" },
  { text: "The ____ win the pennant! The ____ win the pennant!", answers: ["giants"], caller: "Russ Hodges", year: 1951, team: "New York Giants vs. Brooklyn Dodgers" },
  { text: "____ stole the ball!", answers: ["havlicek", "john havlicek"], caller: "Johnny Most", year: 1965, team: "Boston Celtics vs. Philadelphia 76ers" },
  { text: "Down goes ____! Down goes ____!", answers: ["frazier", "joe frazier"], caller: "Howard Cosell", year: 1973, team: "George Foreman's heavyweight title fight" },
  { text: "And we'll see you ____ night!", answers: ["tomorrow"], caller: "Jack Buck", year: 1991, team: "Minnesota Twins, World Series Game 6" },
  { text: "The ____ is out on the field!", answers: ["band"], caller: "Joe Starkey", year: 1982, team: "Cal vs. Stanford" },
  { text: "____ is going to win the football game!", answers: ["auburn"], caller: "Rod Bramblett", year: 2013, team: "Iron Bowl, Auburn vs. Alabama" },
  { text: "Go ____, folks! Go ____!", answers: ["crazy"], caller: "Jack Buck", year: 1985, team: "St. Louis Cardinals, Ozzie Smith's homer" },
];

export const RADIO_ROUNDS = 3;
export const RADIO_HINT_COST = 30;

export function callsForDay(day: string): RadioCall[] {
  const rand = mulberry32(hash(`radio:${day}`));
  const pool = [...CALLS];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j]!, pool[i]!]; }
  return pool.slice(0, RADIO_ROUNDS);
}

export const isCallAnswer = (c: RadioCall, typed: string) => c.answers.includes(normalize(typed));

/** 100 per call, minus 30 per hint and 30 for needing the second try; at least 10 when solved. */
export function radioPoints(solved: boolean, hints: number, secondTry: boolean): number {
  if (!solved) return 0;
  return Math.max(10, 100 - hints * RADIO_HINT_COST - (secondTry ? 30 : 0));
}
