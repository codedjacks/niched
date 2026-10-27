import { dailyItem, dayNumber, namesMatch } from "./daily-games";

export interface StatLine { line: string; season: string; team: string; league: "NBA" | "NFL" | "MLB" | "NHL"; position: string; name: string; aliases?: string[] }

const s = (league: StatLine["league"], line: string, season: string, team: string, position: string, name: string, aliases?: string[]): StatLine =>
  ({ league, line, season, team, position, name, ...(aliases ? { aliases } : {}) });

/** Famous single-season stat lines. Frozen, append-only: the daily deck order depends on this list. */
export const STAT_LINES: StatLine[] = [
  s("NBA", "50.4 points · 25.7 rebounds per game", "1961–62", "Philadelphia Warriors", "Center", "Wilt Chamberlain", ["Wilt"]),
  s("NBA", "30.8 points · 12.5 rebounds · 11.4 assists per game", "1961–62", "Cincinnati Royals", "Guard", "Oscar Robertson", ["Big O"]),
  s("NBA", "35.4 points per game", "2005–06", "Lakers", "Guard", "Kobe Bryant", ["Kobe"]),
  s("NBA", "30.1 points · 402 three-pointers made", "2015–16", "Warriors", "Guard", "Stephen Curry", ["Steph Curry", "Steph"]),
  s("NBA", "36.1 points per game", "2018–19", "Rockets", "Guard", "James Harden"),
  s("NBA", "31.6 points · 10.7 rebounds · 10.4 assists per game", "2016–17", "Thunder", "Guard", "Russell Westbrook"),
  s("NBA", "37.1 points per game", "1986–87", "Bulls", "Guard", "Michael Jordan", ["MJ", "Jordan"]),
  s("NBA", "29.7 points · 13.6 rebounds · 2.9 blocks", "1999–2000", "Lakers", "Center", "Shaquille O'Neal", ["Shaq"]),
  s("NFL", "55 touchdown passes · 5,477 yards", "2013", "Broncos", "Quarterback", "Peyton Manning"),
  s("NFL", "2,105 rushing yards", "1984", "Rams", "Running back", "Eric Dickerson"),
  s("NFL", "1,964 receiving yards", "2012", "Lions", "Wide receiver", "Calvin Johnson", ["Megatron"]),
  s("NFL", "31 total touchdowns · 2,101 scrimmage yards", "2006", "Chargers", "Running back", "LaDainian Tomlinson", ["LT"]),
  s("NFL", "22.5 sacks", "2021", "Steelers", "Linebacker", "T.J. Watt", ["TJ Watt"]),
  s("NFL", "50 touchdown passes · 16–0 regular season", "2007", "Patriots", "Quarterback", "Tom Brady", ["Brady"]),
  s("NFL", "2,027 rushing yards", "2020", "Titans", "Running back", "Derrick Henry"),
  s("NFL", "50 touchdown passes · 5,250 yards", "2018", "Chiefs", "Quarterback", "Patrick Mahomes", ["Mahomes"]),
  s("MLB", "73 home runs", "2001", "Giants", "Outfield", "Barry Bonds"),
  s("MLB", ".406 batting average", "1941", "Red Sox", "Outfield", "Ted Williams"),
  s("MLB", "1.12 ERA", "1968", "Cardinals", "Pitcher", "Bob Gibson"),
  s("MLB", "262 hits", "2004", "Mariners", "Outfield", "Ichiro Suzuki", ["Ichiro"]),
  s("MLB", "130 stolen bases", "1982", "Athletics", "Outfield", "Rickey Henderson", ["Rickey"]),
  s("MLB", "62 home runs (AL record)", "2022", "Yankees", "Outfield", "Aaron Judge", ["Judge"]),
  s("MLB", "54 home runs · 59 stolen bases", "2024", "Dodgers", "Designated hitter", "Shohei Ohtani", ["Ohtani"]),
  s("MLB", "24–4 record · 1.74 ERA (Triple Crown)", "1985", "Mets", "Pitcher", "Dwight Gooden", ["Doc Gooden"]),
  s("NHL", "92 goals · 215 points", "1981–82", "Oilers", "Center", "Wayne Gretzky", ["Wayne"]),
  s("NHL", "85 goals · 199 points", "1988–89", "Penguins", "Center", "Mario Lemieux", ["Mario"]),
  s("NHL", "86 goals", "1990–91", "Blues", "Right wing", "Brett Hull"),
  s("NHL", "153 points", "2022–23", "Oilers", "Center", "Connor McDavid", ["McDavid"]),
];

export const STAT_POINTS = [100, 80, 60, 40, 20] as const;
export const statForDay = (day: string) => dailyItem("statline", STAT_LINES, dayNumber(day));
export const statHints = (p: StatLine) => [`Season: ${p.season}`, `League: ${p.league}`, `Position: ${p.position}`, `Team: ${p.team}`];
export const isStatAnswer = (p: StatLine, typed: string) => namesMatch(typed, [p.name, ...(p.aliases ?? [])]);
