/** Trusted operator CLI: bun scripts/capture-pfr-nfl.ts <dir-of-saved-pfr-player-pages> > pfr-records.json
 *  Parses saved Pro Football Reference NFL player pages (<pfr-id>.html) into import records
 *  for scripts/import-sports-facts.ts. Career totals come from each stat table's first tfoot
 *  row (the "N Yrs" career row; the "17 Game Avg" row that follows is ignored). */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("Usage: bun scripts/capture-pfr-nfl.ts <dir>");

const TABLE_METRICS: Record<string, { category: string; metric: string }> = {
  pass_yds: { category: "passing", metric: "passingYards" },
  pass_td: { category: "passing", metric: "passingTouchdowns" },
  rush_yds: { category: "rushing", metric: "rushingYards" },
  rush_td: { category: "rushing", metric: "rushingTouchdowns" },
  rec_yds: { category: "receiving", metric: "receivingYards" },
  rec: { category: "receiving", metric: "receptions" },
};
// QB/RB pages label the combined table "rushing_and_receiving"; WR/TE pages flip it.
const TABLE_IDS = ["passing", "rushing_and_receiving", "receiving_and_rushing"];

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

function careerCells(html: string, tableId: string): Map<string, string> | null {
  const t = html.match(new RegExp(`<table[^>]*id="${tableId}"[\\s\\S]*?</table>`));
  if (!t) return null;
  const foot = t[0].match(/<tfoot[\s\S]*?<\/tfoot>/);
  if (!foot) return null;
  const firstRow = foot[0].match(/<tr[\s\S]*?<\/tr>/);
  if (!firstRow) return null;
  const cells = new Map<string, string>();
  for (const m of firstRow[0].matchAll(/data-stat="([^"]+)"[^>]*>([\s\S]*?)<\/t[dh]>/g)) cells.set(m[1]!, strip(m[2]!));
  return cells;
}

const records = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".html")).sort()) {
  const id = file.replace(/\.html$/, "");
  const html = readFileSync(join(dir, file), "utf8");
  const name = strip(html.match(/<div id="meta"[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  if (!name) throw new Error(`No player name in ${file}`);
  const categories = new Map<string, { names: string[]; totals: string[] }>();
  const facts: { metric: string; value: number; category: string }[] = [];
  for (const tableId of TABLE_IDS) {
    const cells = careerCells(html, tableId);
    if (!cells) continue;
    for (const [stat, spec] of Object.entries(TABLE_METRICS)) {
      const raw = (cells.get(stat) ?? "").replace(/,/g, "");
      if (!/^\d+$/.test(raw) || Number(raw) <= 0) continue;
      if (!categories.has(spec.category)) categories.set(spec.category, { names: [], totals: [] });
      const cat = categories.get(spec.category)!;
      if (!cat.names.includes(spec.metric)) { cat.names.push(spec.metric); cat.totals.push(raw); }
      if (!facts.some((f) => f.metric === spec.metric)) facts.push({ metric: spec.metric, value: Number(raw), category: spec.category });
    }
  }
  if (!facts.length) { console.error(`skip ${id}: no usable career stats`); continue; }
  records.push({
    provider: "pfr", league: "nfl", player_id: id, player_name: name,
    url: `https://www.pro-football-reference.com/players/${id[0]}/${id}.htm`,
    retrieved_at: new Date().toISOString(),
    payload: {
      athlete: { id, displayName: name },
      categories: [...categories.entries()].map(([name, c]) => ({ name, names: c.names, totals: c.totals })),
    },
    facts,
  });
}
console.log(JSON.stringify(records, null, 2));
