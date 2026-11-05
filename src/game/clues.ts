/** Shared scoring for clue-by-clue guessing games (Stadium Guesser, Trade Machine). */
export const CLUE_POINTS = [100, 80, 60, 40, 20] as const;
/** Points for solving after `clues` clues were showing (1..5). */
export const cluePoints = (clues: number) => CLUE_POINTS[clues - 1] ?? 0;
