import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Stadium } from "./stadiums";

/** Source-backed team rows: last completed season record (ESPN) and home-venue capacity (Wikidata). */
export interface TeamFact {
  league: string; team_id: string; team_name: string; metric: string; value: number;
  venue_name: string | null; venue_aliases: string[];
}

export interface TeamInfo { league: string; name: string; wins: number; losses: number; extra: number; venue?: string; capacity?: number }

/** ESPN files NBA/NHL seasons under the year they end in. */
export const seasonLabel = (league: string) => (league === "nba" || league === "nhl" ? "2024–25" : "2025");

export function teamIndex(rows: TeamFact[]): TeamInfo[] {
  const m = new Map<string, TeamInfo>();
  for (const r of rows) {
    const k = `${r.league}|${r.team_id}`;
    const t = m.get(k) ?? { league: r.league, name: r.team_name, wins: 0, losses: 0, extra: 0 };
    if (r.metric === "wins") t.wins = r.value;
    else if (r.metric === "losses") t.losses = r.value;
    else if (r.metric === "ties" || r.metric === "otLosses") t.extra = r.value;
    else if (r.metric === "capacity" && r.venue_name) { t.venue = r.venue_name; t.capacity = r.value; }
    m.set(k, t);
  }
  return [...m.values()];
}

export const recordText = (t: TeamInfo) => `${t.wins}–${t.losses}${t.extra ? `–${t.extra}` : ""}`;

/** Match a short nickname ("Bulls", "76ers") to a team in that league. */
export function findTeam(teams: TeamInfo[], league: string, short: string): TeamInfo | undefined {
  const s = short.toLowerCase();
  return teams.find((t) => t.league === league.toLowerCase() && (t.name.toLowerCase().endsWith(` ${s}`) || t.name.toLowerCase() === s));
}

const key = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Curated stadiums get their verified capacity when the source has the venue;
 * every other sourced venue is appended so the deck grows with real data.
 */
export function stadiumDeck(curated: Stadium[], teams: TeamInfo[]): Stadium[] {
  const venues = new Map<string, { name: string; league: string; capacity: number; tenants: string[]; aliases: string[] }>();
  for (const t of teams) {
    if (!t.venue || !t.capacity) continue;
    const k = key(t.venue);
    const v = venues.get(k) ?? { name: t.venue, league: t.league.toUpperCase(), capacity: t.capacity, tenants: [], aliases: [] };
    if (!v.league.split(" / ").includes(t.league.toUpperCase())) v.league += ` / ${t.league.toUpperCase()}`;
    v.tenants.push(t.name);
    venues.set(k, v);
  }
  const seen = new Set<string>();
  const out = curated.map((s) => {
    const hit = s.name.map(key).map((k) => venues.get(k)).find(Boolean);
    if (!hit) return s;
    seen.add(key(hit.name));
    return { ...s, capacity: `${hit.capacity.toLocaleString("en-US")} seats`, verified: true };
  });
  for (const [k, v] of [...venues.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (seen.has(k)) continue;
    out.push({ name: [v.name], league: v.league, opened: 0, capacity: `${v.capacity.toLocaleString("en-US")} seats`, tenant: v.tenants.join(" and "), city: "", verified: true });
  }
  return out;
}

export function useTeamFacts() {
  return useQuery({
    queryKey: ["sports_team_facts"],
    staleTime: 60 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("sports_team_facts").select("league,team_id,team_name,metric,value,venue_name,venue_aliases").limit(2000);
      if (error) throw error;
      return teamIndex((data ?? []).map((r) => ({ ...r, value: Number(r.value) })));
    },
  });
}
