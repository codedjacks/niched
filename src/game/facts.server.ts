import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SportsFact } from "./facts";

/** Public facts only: never uses admin access or the private player cache. */
export async function readSportsFacts(url: string, key: string): Promise<SportsFact[]> {
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_")) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await db.from("sports_facts")
    .select("*, sports_fact_sources(url)").order("id").limit(5000);
  if (error) throw new Error("Sports facts are temporarily unavailable");
  return (data ?? []).map(row => ({ ...row, value: Number(row.value), source_url: row.sports_fact_sources?.url ?? "" }));
}