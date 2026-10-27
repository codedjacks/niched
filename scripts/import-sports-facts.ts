/** Trusted operator CLI: bun scripts/import-sports-facts.ts <captured-source-records.json> */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { validateFactImport } from "../src/game/fact-import";
import { FACT_METRICS } from "../src/game/facts";

const file = process.argv[2];
const url = process.env['SUPABASE_URL'];
const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];
if (!file || !url || !key) throw new Error("A captured records JSON file and trusted server database access are required");
const records = (await Bun.file(file).json() as unknown[]).map(validateFactImport);
const db = createClient(url, key, { auth: { persistSession: false }, global: { fetch: (input, init) => {
  const headers = new Headers(init?.headers);
  if (key.startsWith('sb_')) headers.delete('Authorization');
  headers.set('apikey', key);
  return fetch(input, { ...init, headers, signal: AbortSignal.timeout(15000) });
} } });
let count = 0;
try {
    for (const record of records) {
      const hash = createHash("sha256").update(JSON.stringify(record.payload)).digest("hex");
      const sourceId = `espn:${record.league}:${record.player_id}:${hash}`;
      const { error: sourceError } = await db.from('sports_fact_sources').upsert({ id: sourceId, provider: 'ESPN', url: record.url, retrieved_at: record.retrieved_at, payload: record.payload, payload_hash: hash }, { onConflict: 'id', ignoreDuplicates: true });
      if (sourceError) throw new Error(`Source import failed: ${sourceError.message}`);
      for (const fact of record.facts) {
        const spec = FACT_METRICS[`${record.league}:${fact.metric}`];
        if (!spec) continue;
        const id = `${record.league}:${record.player_id}:${fact.metric}`;
        const { error } = await db.from('sports_facts').upsert({ id, league: record.league, player_id: record.player_id, player_name: record.player_name, metric: fact.metric, value: fact.value, unit: spec.unit, source_id: sourceId, verified_at: record.retrieved_at }, { onConflict: 'id', ignoreDuplicates: true });
        if (error) throw new Error(`Fact import failed: ${error.message}`);
        count++;
      }
    }
  console.log(`Imported ${records.length} sourced athlete records / ${count} fact candidates. Existing facts preserved.`);
} catch (error) { throw error; }