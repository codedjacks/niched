/**
 * Daily puzzle generator. Each game registers a generator; the first request (or the
 * scheduled job) for a day generates a puzzle not used on any earlier day and stores it
 * in daily_puzzles, so everyone gets the same puzzle and matchups never repeat.
 */
import type { SportsFact } from "./facts";
import { generateHeadToHead } from "./headtohead";

type Generated = { key: string; puzzle: unknown };
type Generator = (day: string, used: ReadonlySet<string>) => Promise<Generated | null>;

let factsCache: { at: number; facts: SportsFact[] } | null = null;
async function facts(): Promise<SportsFact[]> {
  if (factsCache && Date.now() - factsCache.at < 5 * 60_000) return factsCache.facts;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Sports facts are temporarily unavailable");
  const { readSportsFacts } = await import("./facts.server");
  factsCache = { at: Date.now(), facts: await readSportsFacts(url, key) };
  return factsCache.facts;
}

export const GENERATORS: Record<string, Generator> = {
  h2h: async (day, used) => generateHeadToHead(day, await facts(), used),
};
export type PuzzleGame = keyof typeof GENERATORS;

export async function getOrCreatePuzzle(game: string, day: string): Promise<unknown | null> {
  const gen = GENERATORS[game];
  if (!gen) throw new Error("Unknown game");
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const read = async () => (await db.from("daily_puzzles").select("puzzle").eq("game", game).eq("day", day).maybeSingle()).data?.puzzle ?? null;
  const existing = await read();
  if (existing) return existing;

  const { data: rows } = await db.from("daily_puzzles").select("puzzle_key, day").eq("game", game).order("day", { ascending: false }).limit(10000);
  const history = rows ?? [];
  // Never repeat; if every matchup has been used, only avoid the last year's.
  const attempts = [new Set(history.map((r) => r.puzzle_key)), new Set(history.slice(0, 365).map((r) => r.puzzle_key))];
  for (const used of attempts) {
    const tried = new Set(used);
    for (let i = 0; i < 5; i++) {
      const next = await gen(day, tried);
      if (!next) break;
      const { error } = await db.from("daily_puzzles").insert({ game, day, puzzle_key: next.key, puzzle: next.puzzle as never });
      if (!error) return next.puzzle;
      const winner = await read(); // another request stored today's puzzle first
      if (winner) return winner;
      tried.add(next.key); // key taken by a different day in a race; try the next one
    }
  }
  // Last resort so the game is never unavailable: unstored, same for everyone that day.
  return (await gen(day, new Set()))?.puzzle ?? null;
}
