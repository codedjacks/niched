/** bun scripts/capture-sports-facts.ts nba 1035 'Michael Jordan' /tmp/jordan.json */
import { FACT_METRICS } from "../src/game/facts";
import { validateFactImport } from "../src/game/fact-import";

const [league, id, expectedName, output] = process.argv.slice(2);
const sport = { nba: "basketball", nfl: "football", mlb: "baseball", nhl: "hockey" };
if (!league || !(league in sport) || !id || !/^\d+$/.test(id) || !expectedName || !output) throw new Error("Supply league, reviewed source player ID, expected name and output path");
const base = `https://site.web.api.espn.com/apis/common/v3/sports/${sport[league as keyof typeof sport]}/${league}/athletes/${id}`;
async function read(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Source unavailable (${response.status})`);
  return response.json();
}
const [bio, stats] = await Promise.all([read(base), read(`${base}/stats`)]);
if (bio.athlete?.displayName !== expectedName) throw new Error("Source player name differs; review identity before importing");
const categories = (stats.categories ?? []).filter((c: { name: string }) => !/playoff|postseason/i.test(c.name)).map((c: { name: string; names: string[]; totals: string[] }) => ({ name: c.name, names: c.names ?? [], totals: c.totals ?? [] }));
const facts: { category: string; metric: string; value: number }[] = [];
for (const category of categories) {
  for (const [i, metric] of category.names.entries()) {
    if (!FACT_METRICS[`${league}:${metric}`]) continue;
    if (league === "nba" && category.name !== "totals") continue;
    if (league === "mlb" && category.name !== (["wins", "strikeouts"].includes(metric) ? "career-pitching" : "career-batting")) continue;
    if (league === "nfl" && !["passing", "rushing", "receiving"].includes(category.name)) continue;
    const raw = String(category.totals[i] ?? "").replace(/,/g, "");
    if (/^\d+$/.test(raw) && Number(raw) > 0) facts.push({ category: category.name, metric, value: Number(raw) });
  }
}
const record = validateFactImport({ league, player_id: id, player_name: expectedName, url: `${base}/stats`, retrieved_at: new Date().toISOString(), payload: { athlete: { id: String(bio.athlete.id), displayName: bio.athlete.displayName }, categories }, facts });
await Bun.write(output, JSON.stringify([record], null, 2));
console.log(`Captured ${record.facts.length} source-backed facts for ${expectedName}.`);