import { hash } from "./selection";

export interface Target { name: string; league: string; full: string }

/** Last names to guess. Append-only. */
export const TARGETS: Target[] = [
  ["BRADY", "NFL", "Tom Brady"], ["CURRY", "NBA", "Stephen Curry"], ["JUDGE", "MLB", "Aaron Judge"],
  ["OHTANI", "MLB", "Shohei Ohtani"], ["KELCE", "NFL", "Travis Kelce"], ["JOKIC", "NBA", "Nikola Jokic"],
  ["CROSBY", "NHL", "Sidney Crosby"], ["GRETZKY", "NHL", "Wayne Gretzky"], ["MESSI", "Soccer", "Lionel Messi"],
  ["JETER", "MLB", "Derek Jeter"], ["BONDS", "MLB", "Barry Bonds"], ["MANNING", "NFL", "Peyton Manning"],
  ["DURANT", "NBA", "Kevin Durant"], ["TROUT", "MLB", "Mike Trout"], ["MAHOMES", "NFL", "Patrick Mahomes"],
  ["BRYANT", "NBA", "Kobe Bryant"], ["MCDAVID", "NHL", "Connor McDavid"], ["BETTS", "MLB", "Mookie Betts"],
  ["BARKLEY", "NBA", "Charles Barkley"], ["FEDERER", "Tennis", "Roger Federer"],
].map(([name, league, full]) => ({ name: name!, league: league!, full: full! }));

export const SCOREBOARD_TRIES = 6;
export const SCOREBOARD_POINTS = [100, 85, 70, 55, 40, 25];
export type Mark = "hit" | "near" | "miss";

export const targetForDay = (day: string) => TARGETS[hash(`scoreboard:${day}`) % TARGETS.length]!;

/** Wordle rules, including repeated letters. */
export function markGuess(guess: string, answer: string): Mark[] {
  const g = guess.toUpperCase(), a = answer.toUpperCase();
  const out: Mark[] = [...g].map(() => "miss");
  const left: Record<string, number> = {};
  [...a].forEach((ch, i) => { if (g[i] === ch) out[i] = "hit"; else left[ch] = (left[ch] ?? 0) + 1; });
  [...g].forEach((ch, i) => { if (out[i] !== "hit" && left[ch]) { out[i] = "near"; left[ch]!--; } });
  return out;
}

export const scoreboardPoints = (guessesUsed: number, solved: boolean) => (solved ? SCOREBOARD_POINTS[guessesUsed - 1] ?? 0 : 0);
