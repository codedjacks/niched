/**
 * Shared real-player database. Facts come from ESPN's public athlete endpoints
 * (NBA, NFL, MLB, NHL) and are cached in the sports_players table so every game
 * reads the same verified record. Server-only.
 */
export type League = "nba" | "nfl" | "mlb" | "nhl";
export const LEAGUES: League[] = ["nba", "nfl", "mlb", "nhl"];
const SPORT: Record<League, string> = { nba: "basketball", nfl: "football", mlb: "baseball", nhl: "hockey" };
const LEAGUE_ID: Record<League, string> = { nba: "46", nfl: "28", mlb: "10", nhl: "90" };
const TTL_MS = 7 * 24 * 3600 * 1000;

export interface PlayerRecord {
  league: League;
  espn_id: string;
  name: string;
  teams: string[]; // ESPN team slugs, e.g. "los-angeles-lakers"
  seasons: { year: number; team: string }[];
  awards: string[]; // e.g. "MVP", "Rookie of the Year"
  birth_place: string | null;
  draft: string | null;
  career: Record<string, number>; // regular-season career totals, e.g. points, homeRuns, goals
}

export const keyOf = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function getJson(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

const num = (v: unknown) => {
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

async function fetchFromEspn(league: League, query: string): Promise<PlayerRecord | null> {
  const search = await getJson(`https://site.web.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(query)}&limit=10&type=player`);
  let id: string | undefined = (search?.items ?? []).find((i: any) => i.league === league)?.id;
  if (!id) {
    // The v3 search only lists active players; v2 also finds retired ones (uid "s:40~l:46~a:609").
    const v2 = await getJson(`https://site.web.api.espn.com/apis/search/v2?query=${encodeURIComponent(query)}&limit=10`);
    const players = (v2?.results ?? []).find((r: any) => r.type === "player")?.contents ?? [];
    const m = players.map((c: any) => String(c.uid ?? "").match(/l:(\d+)~a:(\d+)/)).find((m: RegExpMatchArray | null) => m && m[1] === LEAGUE_ID[league]);
    id = m?.[2];
  }
  if (!id) return null;
  id = String(id);
  const base = `https://site.web.api.espn.com/apis/common/v3/sports/${SPORT[league]}/${league}/athletes/${id}`;
  const [bio, stats, awardList] = await Promise.all([
    getJson(base),
    getJson(`${base}/stats`),
    getJson(`https://sports.core.api.espn.com/v2/sports/${SPORT[league]}/leagues/${league}/athletes/${id}/awards?limit=100`),
  ]);
  const a = bio?.athlete;
  if (!a) return null;

  const seasons: { year: number; team: string }[] = [];
  const career: Record<string, number> = {};
  for (const c of stats?.categories ?? []) {
    if (/postseason|playoff/i.test(c.name ?? "")) continue;
    (c.names ?? []).forEach((n: string, i: number) => {
      const v = num(c.totals?.[i]);
      if (v != null && career[n] == null) career[n] = v;
    });
    for (const s of c.statistics ?? []) {
      const year = Number(s.season?.year);
      if (year && s.teamSlug && !seasons.some((x) => x.year === year && x.team === s.teamSlug)) seasons.push({ year, team: s.teamSlug });
    }
  }

  // Award refs look like .../seasons/2024/awards/33 — resolve each distinct award id once for its name.
  const ids = new Map<string, string>();
  for (const it of awardList?.items ?? []) {
    const m = String(it.$ref ?? "").match(/seasons\/(\d+)\/awards\/(\d+)/);
    if (m && !ids.has(m[2]!)) ids.set(m[2]!, m[1]!);
  }
  const names = new Map<string, string>();
  await Promise.all([...ids].map(async ([aid, yr]) => {
    const d = await getJson(`https://sports.core.api.espn.com/v2/sports/${SPORT[league]}/leagues/${league}/seasons/${yr}/awards/${aid}`);
    if (d?.name) names.set(aid, d.name);
  }));
  const awards: string[] = [];
  for (const it of awardList?.items ?? []) {
    const m = String(it.$ref ?? "").match(/awards\/(\d+)/);
    const n = m && names.get(m[1]!);
    if (n) awards.push(n);
  }

  return {
    league, espn_id: id, name: a.displayName ?? query,
    teams: [...new Set(seasons.map((s) => s.team))],
    seasons: seasons.sort((x, y) => x.year - y.year),
    awards,
    birth_place: a.displayBirthPlace ?? null,
    draft: a.displayDraft ?? null,
    career,
  };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Find a real player by typed name; cached lookups avoid repeat ESPN calls. Returns null if ESPN has no such player. */
export async function findRealPlayer(league: League, typed: string): Promise<PlayerRecord | null> {
  const q = keyOf(typed).slice(0, 60);
  if (q.length < 3) return null;
  let db: Awaited<ReturnType<typeof admin>> | null = null;
  try { db = await admin(); } catch { db = null; }
  const fresh = (t: string) => Date.now() - new Date(t).getTime() < TTL_MS;

  if (db) {
    const { data: alias } = await db.from("sports_player_aliases").select("espn_id, fetched_at").eq("league", league).eq("query_key", q).maybeSingle();
    // Misses are only trusted for a few hours so a temporary ESPN hiccup can't block a real player for long.
    const missFresh = (t: string) => Date.now() - new Date(t).getTime() < 6 * 3600 * 1000;
    if (alias && (alias.espn_id ? fresh(alias.fetched_at) : missFresh(alias.fetched_at))) {
      if (!alias.espn_id) return null;
      const { data: row } = await db.from("sports_players").select("*").eq("league", league).eq("espn_id", alias.espn_id).maybeSingle();
      if (row && fresh(row.fetched_at)) return row as unknown as PlayerRecord;
    }
  }

  const rec = await fetchFromEspn(league, typed);
  if (db) {
    if (rec) await db.from("sports_players").upsert({ ...rec, name_key: keyOf(rec.name), fetched_at: new Date().toISOString() } as never);
    await db.from("sports_player_aliases").upsert({ league, query_key: q, espn_id: rec?.espn_id ?? null, fetched_at: new Date().toISOString() });
  }
  return rec;
}

// ---------- NBA grid facts ----------

/** NBA champions by season end year, as team-slug suffixes (old franchise names included). */
const NBA_CHAMPS: Record<number, string[]> = {
  1957: ["celtics"], 1958: ["hawks"], 1959: ["celtics"], 1960: ["celtics"], 1961: ["celtics"], 1962: ["celtics"], 1963: ["celtics"],
  1964: ["celtics"], 1965: ["celtics"], 1966: ["celtics"], 1967: ["76ers"], 1968: ["celtics"], 1969: ["celtics"], 1970: ["knicks"],
  1971: ["bucks"], 1972: ["lakers"], 1973: ["knicks"], 1974: ["celtics"], 1975: ["warriors"], 1976: ["celtics"], 1977: ["trail-blazers"],
  1978: ["bullets", "wizards"], 1979: ["supersonics", "thunder"], 1980: ["lakers"], 1981: ["celtics"], 1982: ["lakers"], 1983: ["76ers"],
  1984: ["celtics"], 1985: ["lakers"], 1986: ["celtics"], 1987: ["lakers"], 1988: ["lakers"], 1989: ["pistons"], 1990: ["pistons"],
  1991: ["bulls"], 1992: ["bulls"], 1993: ["bulls"], 1994: ["rockets"], 1995: ["rockets"], 1996: ["bulls"], 1997: ["bulls"], 1998: ["bulls"],
  1999: ["spurs"], 2000: ["lakers"], 2001: ["lakers"], 2002: ["lakers"], 2003: ["spurs"], 2004: ["pistons"], 2005: ["spurs"], 2006: ["heat"],
  2007: ["spurs"], 2008: ["celtics"], 2009: ["lakers"], 2010: ["lakers"], 2011: ["mavericks"], 2012: ["heat"], 2013: ["heat"], 2014: ["spurs"],
  2015: ["warriors"], 2016: ["cavaliers"], 2017: ["warriors"], 2018: ["warriors"], 2019: ["raptors"], 2020: ["lakers"], 2021: ["bucks"],
  2022: ["warriors"], 2023: ["nuggets"], 2024: ["celtics"], 2025: ["thunder"],
};
const US_STATES = new Set("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "));

export const playedFor = (p: PlayerRecord, nickname: string) => {
  const suffix = nickname.toLowerCase().replace(/\s+/g, "-");
  return p.teams.some((t) => t === suffix || t.endsWith(`-${suffix}`));
};

export type NbaTag = "mvp" | "champ" | "pick1" | "roy" | "intl" | "2020s";
/** True/false when the record settles the question; null when ESPN data is too thin to say. */
export function nbaHasTag(p: PlayerRecord, tag: NbaTag): boolean | null {
  switch (tag) {
    case "mvp": return p.awards.includes("MVP");
    case "roy": return p.awards.includes("Rookie of the Year");
    case "2020s": return p.seasons.length ? p.seasons.some((s) => s.year >= 2020) : null;
    case "champ": return p.seasons.length ? p.seasons.some((s) => (NBA_CHAMPS[s.year] ?? []).some((c) => s.team === c || s.team.endsWith(`-${c}`))) : null;
    case "pick1": return p.draft ? /Rd 1, Pk 1 \(/.test(p.draft) : null;
    case "intl": {
      if (!p.birth_place) return null;
      const last = p.birth_place.split(",").pop()!.trim();
      return !(US_STATES.has(last) || /USA|United States/i.test(last));
    }
  }
}

/** 1 = household name … 6 = deep cut, from real honors and games played. */
export function fameOf(p: PlayerRecord): 1 | 2 | 3 | 4 | 5 | 6 {
  const big = p.awards.filter((a) => /^(MVP|Finals MVP|All-NBA|All-Pro|Cy Young|Hart|Conn Smythe|Super Bowl MVP|World Series MVP)/.test(a)).length;
  const games = p.career["gamesPlayed"] ?? p.career["games"] ?? 0;
  if (big >= 10) return 1;
  if (big >= 6) return 2;
  if (big >= 3) return 3;
  if (big >= 1) return 4;
  return games >= 600 ? 5 : 6;
}
