/** Trusted operator CLI: bun scripts/import-sports-facts.ts <captured-source-records.json> */
import postgres from "postgres";
import { createHash } from "node:crypto";
import { validateFactImport } from "../src/game/fact-import";
import { FACT_METRICS } from "../src/game/facts";

const file = process.argv[2];
const connection = process.env.SUPABASE_DB_URL;
if (!file || !connection) throw new Error("A captured records JSON file and server database connection are required");
const records = (await Bun.file(file).json() as unknown[]).map(validateFactImport);
const db = postgres(connection, { max: 1, prepare: false });
let count = 0;
try {
  await db.begin(async sql => {
    for (const record of records) {
      const hash = createHash("sha256").update(JSON.stringify(record.payload)).digest("hex");
      const sourceId = `espn:${record.league}:${record.player_id}:${hash}`;
      await sql`INSERT INTO public.sports_fact_sources (id,provider,url,retrieved_at,payload,payload_hash) VALUES (${sourceId},'ESPN',${record.url},${record.retrieved_at},${sql.json(record.payload)},${hash}) ON CONFLICT (id) DO NOTHING`;
      for (const fact of record.facts) {
        const spec = FACT_METRICS[`${record.league}:${fact.metric}`];
        if (!spec) continue;
        const id = `${record.league}:${record.player_id}:${fact.metric}`;
        await sql`INSERT INTO public.sports_facts (id,league,player_id,player_name,metric,value,unit,source_id,verified_at) VALUES (${id},${record.league},${record.player_id},${record.player_name},${fact.metric},${fact.value},${spec.unit},${sourceId},${record.retrieved_at}) ON CONFLICT (id) DO NOTHING`;
        count++;
      }
    }
  });
  console.log(`Imported ${records.length} sourced athlete records / ${count} fact candidates. Existing facts preserved.`);
} finally { await db.end(); }