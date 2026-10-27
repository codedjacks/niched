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
  position: string | null; // ESPN abbreviation, e.g. QB, WR, SP
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
    position: a.position?.abbreviation ?? null,
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
      if (row && row.position && fresh(row.fetched_at)) return row as unknown as PlayerRecord;
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
    case "pick1": return p.draft ? /Rd 1, Pk 1 \(/.test(p.draft) : (p.seasons[0]?.year ?? 0) >= 1990 ? false : null; // modern players with no draft line went undrafted
    case "intl": {
      if (!p.birth_place) return null;
      const last = p.birth_place.split(",").pop()!.trim();
      return !(US_STATES.has(last) || /USA|United States/i.test(last));
    }
  }
}

/** 1 = household name … 6 = deep cut, from real honors and games played. */
export function fameOf(p: PlayerRecord): 1 | 2 | 3 | 4 | 5 | 6 {
  const big = p.awards.filter((a) => /^(MVP|Finals MVP|All-NBA|All-Pro|All-MLB|Cy Young|Hart|Conn Smythe|Super Bowl MVP|World Series MVP|Pro Bowl|All-Star)/.test(a)).length;
  const games = p.career["gamesPlayed"] ?? p.career["games"] ?? 0;
  if (big >= 10) return 1;
  if (big >= 6) return 2;
  if (big >= 3) return 3;
  if (big >= 1) return 4;
  const longCareer = { nba: 600, nfl: 100, mlb: 1000, nhl: 600 }[p.league];
  return games >= longCareer ? 5 : 6;
}

// ---------- NFL / MLB grid facts ----------

/** Super Bowl winners by season start year (the year ESPN labels the season). */
const SB_CHAMPS: Record<number, string[]> = {
  1966: ["packers"], 1967: ["packers"], 1968: ["jets"], 1969: ["chiefs"], 1970: ["colts"], 1971: ["cowboys"], 1972: ["dolphins"], 1973: ["dolphins"],
  1974: ["steelers"], 1975: ["steelers"], 1976: ["raiders"], 1977: ["cowboys"], 1978: ["steelers"], 1979: ["steelers"], 1980: ["raiders"], 1981: ["49ers"],
  1982: ["redskins", "commanders"], 1983: ["raiders"], 1984: ["49ers"], 1985: ["bears"], 1986: ["giants"], 1987: ["redskins", "commanders"], 1988: ["49ers"],
  1989: ["49ers"], 1990: ["giants"], 1991: ["redskins", "commanders"], 1992: ["cowboys"], 1993: ["cowboys"], 1994: ["49ers"], 1995: ["cowboys"], 1996: ["packers"],
  1997: ["broncos"], 1998: ["broncos"], 1999: ["rams"], 2000: ["ravens"], 2001: ["patriots"], 2002: ["buccaneers"], 2003: ["patriots"], 2004: ["patriots"],
  2005: ["steelers"], 2006: ["colts"], 2007: ["giants"], 2008: ["steelers"], 2009: ["saints"], 2010: ["packers"], 2011: ["giants"], 2012: ["ravens"],
  2013: ["seahawks"], 2014: ["patriots"], 2015: ["broncos"], 2016: ["patriots"], 2017: ["eagles"], 2018: ["patriots"], 2019: ["chiefs"], 2020: ["buccaneers"],
  2021: ["rams"], 2022: ["chiefs"], 2023: ["chiefs"], 2024: ["eagles"],
};
/** World Series winners by year. */
const WS_CHAMPS: Record<number, string[]> = {
  1970: ["orioles"], 1971: ["pirates"], 1972: ["athletics"], 1973: ["athletics"], 1974: ["athletics"], 1975: ["reds"], 1976: ["reds"], 1977: ["yankees"],
  1978: ["yankees"], 1979: ["pirates"], 1980: ["phillies"], 1981: ["dodgers"], 1982: ["cardinals"], 1983: ["orioles"], 1984: ["tigers"], 1985: ["royals"],
  1986: ["mets"], 1987: ["twins"], 1988: ["dodgers"], 1989: ["athletics"], 1990: ["reds"], 1991: ["twins"], 1992: ["blue-jays"], 1993: ["blue-jays"],
  1995: ["braves"], 1996: ["yankees"], 1997: ["marlins"], 1998: ["yankees"], 1999: ["yankees"], 2000: ["yankees"], 2001: ["diamondbacks"], 2002: ["angels"],
  2003: ["marlins"], 2004: ["red-sox"], 2005: ["white-sox"], 2006: ["cardinals"], 2007: ["red-sox"], 2008: ["phillies"], 2009: ["yankees"], 2010: ["giants"],
  2011: ["cardinals"], 2012: ["giants"], 2013: ["red-sox"], 2014: ["giants"], 2015: ["royals"], 2016: ["cubs"], 2017: ["astros"], 2018: ["red-sox"],
  2019: ["nationals"], 2020: ["dodgers"], 2021: ["braves"], 2022: ["astros"], 2023: ["rangers"], 2024: ["dodgers"], 2025: ["dodgers"],
};

function wonTitle(p: PlayerRecord, table: Record<number, string[]>, from: number): boolean | null {
  if (!p.seasons.length) return null;
  if (p.seasons.some((s) => (table[s.year] ?? []).some((c) => s.team === c || s.team.endsWith(`-${c}`)))) return true;
  return p.seasons[0]!.year >= from ? false : null; // careers older than our table can't be ruled out
}
function bornAbroad(p: PlayerRecord): boolean | null {
  if (!p.birth_place) return null;
  const last = p.birth_place.split(",").pop()!.trim();
  return !(US_STATES.has(last) || /USA|United States/i.test(last));
}

/** Tag ids match src/game/grid-pro.ts. */
export function proHasTag(league: "nfl" | "mlb", p: PlayerRecord, tag: string): boolean | null {
  const pos = (p.position ?? "").toUpperCase();
  const in2020s = p.seasons.length ? p.seasons.some((s) => s.year >= 2020) : null;
  if (league === "nfl") switch (tag) {
    case "qb": return pos ? pos === "QB" : null;
    case "skill": return pos ? ["RB", "WR", "FB", "HB"].includes(pos) : null;
    case "champ": return wonTitle(p, SB_CHAMPS, 1966);
    case "pick1": return p.draft ? /Rd 1, Pk 1 \(/.test(p.draft) : null;
    case "2020s": return in2020s;
  }
  if (league === "mlb") switch (tag) {
    case "pitcher": return pos ? /^(P|SP|RP|TWP)$/.test(pos) : null;
    case "mvp": return p.awards.includes("MVP");
    case "cy": return p.awards.some((a) => /Cy Young/i.test(a));
    case "champ": return wonTitle(p, WS_CHAMPS, 1971);
    case "intl": return bornAbroad(p);
    case "2020s": return in2020s;
  }
  return null;
}
