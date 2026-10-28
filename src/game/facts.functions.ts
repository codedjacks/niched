import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sourcedPairs } from "./facts";

export const getSportsFacts = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
  if (!url || !key) throw new Error("Sports facts are temporarily unavailable");
  const { readSportsFacts } = await import("./facts.server");
  return readSportsFacts(url, key);
});

export const getSourcedMatchups = createServerFn({ method: "GET" })
  .inputValidator(z.object({ day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['SUPABASE_ANON_KEY'];
    if (!url || !key) throw new Error("Sports facts are temporarily unavailable");
    const { readSportsFacts } = await import("./facts.server");
    return sourcedPairs(data.day, await readSportsFacts(url, key));
  });
export const getHeadToHead = createServerFn({ method: "GET" })
  .inputValidator(z.object({ day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
  .handler(async ({ data }) => {
    const { dateKey } = await import("./selection");
    const tomorrow = dateKey(new Date(Date.now() + 86_400_000));
    if (data.day > tomorrow) throw new Error("That puzzle isn't out yet");
    const { getOrCreatePuzzle } = await import("./puzzles.server");
    return (await getOrCreatePuzzle("h2h", data.day)) as import("./headtohead").H2H | null;
  });
