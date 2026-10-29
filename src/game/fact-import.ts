import { z } from "zod";
import { CAREER_SCOPE, FACT_METRICS, SEASON_SCOPES } from "./facts";

const sourceSchema = z.object({
  league: z.enum(["nba", "nfl", "mlb", "nhl"]), player_id: z.string().regex(/^\d+$/), player_name: z.string().min(1),
  scope: z.string().default(CAREER_SCOPE), url: z.url(), retrieved_at: z.iso.datetime({ offset: true }),
  payload: z.object({ season: z.number().int().optional(), athlete: z.object({ id: z.string(), displayName: z.string() }), categories: z.array(z.object({ name: z.string(), names: z.array(z.string()), totals: z.array(z.string()) })) }),
  facts: z.array(z.object({ metric: z.string(), value: z.number().int().nonnegative(), category: z.string() })).min(1),
});
const sports = { nba: "basketball", nfl: "football", mlb: "baseball", nhl: "hockey" };
const categories: Record<string, string[]> = {
  nba: ["totals"], nfl: ["passing", "rushing", "receiving"], mlb: ["career-batting", "career-pitching"], nhl: ["center"],
};
const seasonCategories: Record<string, string[]> = {
  ...categories, nhl: ["center", "leftWing", "rightWing", "defense", "forward"],
};
/** Reject mislabeled athletes, fabricated totals, unsupported categories and unofficial URLs. */
export function validateFactImport(input: unknown) {
  const record = sourceSchema.parse(input);
  const expected = `https://site.web.api.espn.com/apis/common/v3/sports/${sports[record.league]}/${record.league}/athletes/${record.player_id}/stats`;
  if (record.url !== expected || record.payload.athlete.id !== record.player_id || record.payload.athlete.displayName !== record.player_name) throw new Error("Source identity mismatch");
  // ESPN labels Tony Gwynn Jr. as "Tony Gwynn"; a name-only search picks the wrong generation.
  if (record.league === "mlb" && record.player_id === "28516" && record.player_name === "Tony Gwynn") throw new Error("Ambiguous athlete identity: use Tony Gwynn Jr. and review explicitly");
  const season = record.scope === CAREER_SCOPE ? null : SEASON_SCOPES[record.league];
  if (season ? (record.scope !== season.scope || record.payload.season !== season.year) : record.payload.season !== undefined) throw new Error("Unsupported season scope");
  const allowed = (season ? seasonCategories : categories)[record.league];
  for (const fact of record.facts) {
    if (!FACT_METRICS[`${record.league}:${fact.metric}`] || !allowed?.includes(fact.category)) throw new Error("Unsupported statistic");
    if (record.league === "mlb" && ["strikeouts", "wins"].includes(fact.metric) && fact.category !== "career-pitching") throw new Error("Pitching scope required");
    const category = record.payload.categories.find(c => c.name === fact.category);
    const index = category?.names.indexOf(fact.metric) ?? -1;
    const raw = index >= 0 ? category?.totals[index]?.replace(/,/g, "") : undefined;
    if (!raw || !/^\d+$/.test(raw) || Number(raw) !== fact.value) throw new Error("Statistic does not match evidence");
  }
  return record;
}