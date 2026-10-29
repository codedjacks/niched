/** bun scripts/capture-season-facts.ts /tmp/season.json — last completed regular season for each league's ESPN leaders. */
import { FACT_METRICS, SEASON_SCOPES } from "../src/game/facts";
import { validateFactImport } from "../src/game/fact-import";

const output = process.argv[2];
if (!output) throw new Error("Supply an output path");
const sport = { nba: "basketball", nfl: "football", mlb: "baseball", nhl: "hockey" } as const;
const sorts: Record<keyof typeof sport, string[]> = {
  nba: ["offensive.avgPoints", "general.avgRebounds", "offensive.avgAssists"],
  nfl: ["passing.passingYards", "rushing.rushingYards", "receiving.receivingYards"],
  mlb: ["batting.homeRuns", "batting.hits", "pitching.strikeouts", "pitching.wins"],
  nhl: ["offensive.points", "offensive.goals"],
};
const seasonCategory: Record<string, (metric: string, name: string) => boolean> = {
  nba: (_m, n) => n === "totals",
  nfl: (_m, n) => ["passing", "rushing", "receiving"].includes(n),
  mlb: (m, n) => n === (["wins", "strikeouts"].includes(m) ? "career-pitching" : "career-batting"),
  nhl: (_m, n) => ["center", "leftWing", "rightWing", "defense", "forward"].includes(n),
};
async function read(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Source unavailable (${r.status}) ${url}`);
  return r.json();
}
const records: unknown[] = [];
for (const league of Object.keys(sport) as (keyof typeof sport)[]) {
  const { year, scope } = SEASON_SCOPES[league]!;
  const ids = new Map<string, string>();
  for (const s of sorts[league]) {
    const d = await read(`https://site.web.api.espn.com/apis/common/v3/sports/${sport[league]}/${league}/statistics/byathlete?season=${year}&seasontype=2&limit=40&sort=${s}:desc`);
    for (const a of d.athletes ?? []) ids.set(String(a.athlete.id), a.athlete.displayName);
  }
  const list = [...ids];
  for (let i = 0; i < list.length; i += 8) {
    await Promise.all(list.slice(i, i + 8).map(async ([id, name]) => {
      try {
        const base = `https://site.web.api.espn.com/apis/common/v3/sports/${sport[league]}/${league}/athletes/${id}`;
        const [bio, stats] = await Promise.all([read(base), read(`${base}/stats`)]);
        if (bio.athlete?.displayName !== name) return;
        const categories: { name: string; names: string[]; totals: string[] }[] = [];
        for (const c of stats.categories ?? []) {
          const rows = (c.statistics ?? []).filter((r: { season?: { year?: number } }) => r.season?.year === year);
          if (rows.length === 1) categories.push({ name: c.name, names: c.names ?? [], totals: rows[0].stats ?? [] }); // skip split (traded) seasons
        }
        const facts: { category: string; metric: string; value: number }[] = [];
        for (const c of categories) for (const [j, metric] of c.names.entries()) {
          if (!FACT_METRICS[`${league}:${metric}`] || !seasonCategory[league]!(metric, c.name) || facts.some(f => f.metric === metric)) continue;
          const raw = String(c.totals[j] ?? "").replace(/,/g, "");
          if (/^\d+$/.test(raw) && Number(raw) > 0) facts.push({ category: c.name, metric, value: Number(raw) });
        }
        if (facts.length < 2) return;
        records.push(validateFactImport({ league, player_id: id, player_name: name, scope, url: `${base}/stats`, retrieved_at: new Date().toISOString(),
          payload: { season: year, athlete: { id: String(bio.athlete.id), displayName: bio.athlete.displayName }, categories }, facts }));
      } catch (e) { console.warn(`skip ${league} ${name}: ${(e as Error).message}`); }
    }));
  }
  console.log(league, list.length, "leaders checked");
}
await Bun.write(output, JSON.stringify(records, null, 2));
console.log(`Captured ${records.length} season records.`);
