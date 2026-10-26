import { TIERS } from "./scoring";
import type { TierId } from "./types";
import { dailyItem, dayNumber, namesMatch, seededShuffle } from "./daily-games";

/**
 * NFL and MLB Daily Grids. Same rules as the NBA grid (grid.ts): 3 teams x 3 feats,
 * nine guesses, curated players checked locally, anyone else checked against the
 * shared ESPN player database server-side. Append players only at the end of a list:
 * puzzle selection is frozen to each league's first BASE_COUNT entries.
 */
export type ProLeague = "nfl" | "mlb";
export interface ProPlayer { name: string; aliases?: string[]; teams: string[]; tags: string[]; fame: 1 | 2 | 3 | 4 | 5 | 6 }
export interface ProGridConfig { league: ProLeague; label: string; emoji: string; teams: string[]; tags: Record<string, string>; players: ProPlayer[]; baseCount: number }

const P = (name: string, teams: string[], tags: string[], fame: ProPlayer["fame"], aliases?: string[]): ProPlayer => ({ name, teams, tags, fame, aliases });

const NFL_PLAYERS: ProPlayer[] = [
  P("Tom Brady", ["Patriots"], ["qb", "champ", "2020s"], 1, ["Brady"]),
  P("Patrick Mahomes", ["Chiefs"], ["qb", "champ", "2020s"], 1, ["Mahomes"]),
  P("Peyton Manning", ["Broncos"], ["qb", "champ", "pick1"], 1),
  P("Aaron Rodgers", ["Packers", "Steelers"], ["qb", "champ", "2020s"], 1),
  P("Eli Manning", ["Giants"], ["qb", "champ", "pick1"], 2),
  P("Joe Montana", ["49ers", "Chiefs"], ["qb", "champ"], 2),
  P("Steve Young", ["49ers"], ["qb", "champ"], 3),
  P("John Elway", ["Broncos"], ["qb", "champ", "pick1"], 2),
  P("Troy Aikman", ["Cowboys"], ["qb", "champ", "pick1"], 2),
  P("Dak Prescott", ["Cowboys"], ["qb", "2020s"], 3),
  P("Ben Roethlisberger", ["Steelers"], ["qb", "champ", "2020s"], 2, ["Big Ben"]),
  P("Brett Favre", ["Packers"], ["qb", "champ"], 2),
  P("Roger Staubach", ["Cowboys"], ["qb", "champ"], 4),
  P("Terry Bradshaw", ["Steelers"], ["qb", "champ", "pick1"], 3),
  P("Brock Purdy", ["49ers"], ["qb", "2020s"], 4),
  P("Russell Wilson", ["Broncos", "Steelers", "Giants"], ["qb", "champ", "2020s"], 3),
  P("Alex Smith", ["49ers", "Chiefs"], ["qb", "pick1", "2020s"], 5),
  P("Jimmy Garoppolo", ["Patriots", "49ers"], ["qb", "champ", "2020s"], 5),
  P("Drew Bledsoe", ["Patriots", "Cowboys"], ["qb", "pick1"], 5),
  P("Cam Newton", ["Patriots"], ["qb", "pick1", "2020s"], 4),
  P("Emmitt Smith", ["Cowboys"], ["skill", "champ"], 2),
  P("Ezekiel Elliott", ["Cowboys", "Patriots"], ["skill", "2020s"], 4, ["Zeke"]),
  P("Christian McCaffrey", ["49ers"], ["skill", "2020s"], 3, ["CMC"]),
  P("Jerry Rice", ["49ers"], ["skill", "champ"], 2),
  P("Terrell Owens", ["49ers", "Cowboys"], ["skill"], 3, ["T.O."]),
  P("Randy Moss", ["Patriots", "49ers"], ["skill"], 2),
  P("Julian Edelman", ["Patriots"], ["skill", "champ", "2020s"], 4),
  P("Wes Welker", ["Patriots", "Broncos"], ["skill"], 5),
  P("Demaryius Thomas", ["Broncos"], ["skill", "champ"], 5),
  P("Tyreek Hill", ["Chiefs"], ["skill", "champ", "2020s"], 3),
  P("Antonio Brown", ["Steelers", "Patriots"], ["skill", "champ", "2020s"], 4),
  P("Le'Veon Bell", ["Steelers", "Chiefs"], ["skill", "2020s"], 5),
  P("Jerome Bettis", ["Steelers"], ["skill", "champ"], 4, ["The Bus"]),
  P("Franco Harris", ["Steelers"], ["skill", "champ"], 5),
  P("Saquon Barkley", ["Giants"], ["skill", "champ", "2020s"], 3),
  P("Tiki Barber", ["Giants"], ["skill"], 5),
  P("Terrell Davis", ["Broncos"], ["skill", "champ"], 5),
  P("CeeDee Lamb", ["Cowboys"], ["skill", "2020s"], 4),
  P("Davante Adams", ["Packers"], ["skill", "2020s"], 4),
  P("Deebo Samuel", ["49ers"], ["skill", "2020s"], 5),
  P("Odell Beckham Jr.", ["Giants"], ["skill", "champ", "2020s"], 4, ["OBJ", "Odell Beckham"]),
  P("Jordy Nelson", ["Packers"], ["skill", "champ"], 5),
  P("Ahman Green", ["Packers"], ["skill"], 6),
];

const MLB_PLAYERS: ProPlayer[] = [
  P("Derek Jeter", ["Yankees"], ["champ"], 1, ["Jeter"]),
  P("Aaron Judge", ["Yankees"], ["mvp", "2020s"], 1),
  P("Shohei Ohtani", ["Dodgers"], ["pitcher", "mvp", "champ", "intl", "2020s"], 1, ["Ohtani"]),
  P("Clayton Kershaw", ["Dodgers"], ["pitcher", "mvp", "cy", "champ", "2020s"], 1),
  P("Mookie Betts", ["Red Sox", "Dodgers"], ["mvp", "champ", "2020s"], 2),
  P("David Ortiz", ["Red Sox"], ["champ", "intl"], 1, ["Big Papi"]),
  P("Pedro Martinez", ["Red Sox", "Dodgers"], ["pitcher", "cy", "champ", "intl"], 2),
  P("Alex Rodriguez", ["Yankees"], ["mvp", "champ"], 2, ["A-Rod"]),
  P("Mariano Rivera", ["Yankees"], ["pitcher", "champ", "intl"], 2),
  P("Barry Bonds", ["Giants"], ["mvp"], 2),
  P("Buster Posey", ["Giants"], ["mvp", "champ"], 3),
  P("Madison Bumgarner", ["Giants"], ["pitcher", "champ"], 3, ["MadBum"]),
  P("Tim Lincecum", ["Giants"], ["pitcher", "cy", "champ"], 3),
  P("Albert Pujols", ["Cardinals", "Dodgers"], ["mvp", "champ", "intl", "2020s"], 2),
  P("Yadier Molina", ["Cardinals"], ["champ", "intl", "2020s"], 3),
  P("Bob Gibson", ["Cardinals"], ["pitcher", "mvp", "cy", "champ"], 4),
  P("Adam Wainwright", ["Cardinals"], ["pitcher", "champ", "2020s"], 4),
  P("Jose Altuve", ["Astros"], ["mvp", "champ", "intl", "2020s"], 2),
  P("Justin Verlander", ["Astros", "Giants"], ["pitcher", "mvp", "cy", "champ", "2020s"], 2),
  P("Alex Bregman", ["Astros", "Red Sox"], ["champ", "2020s"], 4),
  P("Yordan Alvarez", ["Astros"], ["champ", "intl", "2020s"], 4),
  P("Greg Maddux", ["Cubs", "Braves", "Dodgers"], ["pitcher", "cy", "champ"], 2),
  P("Chipper Jones", ["Braves"], ["mvp", "champ"], 3),
  P("Ronald Acuna Jr.", ["Braves"], ["mvp", "champ", "intl", "2020s"], 3, ["Ronald Acuña Jr.", "Acuna"]),
  P("Freddie Freeman", ["Braves", "Dodgers"], ["mvp", "champ", "2020s"], 3),
  P("John Smoltz", ["Braves", "Red Sox", "Cardinals"], ["pitcher", "cy", "champ"], 4),
  P("Tom Glavine", ["Braves"], ["pitcher", "cy", "champ"], 4),
  P("Kris Bryant", ["Cubs", "Giants"], ["mvp", "champ", "2020s"], 4),
  P("Anthony Rizzo", ["Cubs", "Yankees"], ["champ", "2020s"], 4),
  P("Sammy Sosa", ["Cubs"], ["mvp", "intl"], 3),
  P("Javier Baez", ["Cubs"], ["champ", "intl", "2020s"], 5, ["Javy Baez"]),
  P("Jake Arrieta", ["Cubs"], ["pitcher", "cy", "champ"], 5),
  P("Gerrit Cole", ["Yankees", "Astros"], ["pitcher", "cy", "2020s"], 3),
  P("Roger Clemens", ["Red Sox", "Yankees", "Astros"], ["pitcher", "mvp", "cy", "champ"], 2),
  P("Manny Ramirez", ["Red Sox", "Dodgers"], ["champ", "intl"], 3),
  P("Dustin Pedroia", ["Red Sox"], ["mvp", "champ"], 4),
  P("Jon Lester", ["Red Sox", "Cubs", "Cardinals"], ["pitcher", "champ", "2020s"], 5),
  P("Randy Johnson", ["Yankees", "Astros", "Giants"], ["pitcher", "cy", "champ"], 3, ["Big Unit"]),
  P("CC Sabathia", ["Yankees"], ["pitcher", "cy", "champ"], 4),
  P("Zack Greinke", ["Dodgers", "Astros"], ["pitcher", "cy", "2020s"], 4),
  P("Max Scherzer", ["Dodgers"], ["pitcher", "cy", "champ", "2020s"], 3),
  P("Yoshinobu Yamamoto", ["Dodgers"], ["pitcher", "champ", "intl", "2020s"], 4),
  P("Pablo Sandoval", ["Giants", "Red Sox", "Braves"], ["champ", "intl", "2020s"], 5, ["Kung Fu Panda"]),
  P("Hunter Pence", ["Astros", "Giants"], ["champ"], 5),
];

export const PRO_GRIDS: Record<ProLeague, ProGridConfig> = {
  nfl: {
    league: "nfl", label: "NFL", emoji: "🏈",
    teams: ["Patriots", "Cowboys", "Packers", "Steelers", "49ers", "Chiefs", "Giants", "Broncos"],
    tags: { qb: "Played quarterback", skill: "Running back or receiver", champ: "Won a Super Bowl", pick1: "#1 overall draft pick", "2020s": "Played in the 2020s" },
    players: NFL_PLAYERS, baseCount: 43,
  },
  mlb: {
    league: "mlb", label: "MLB", emoji: "⚾",
    teams: ["Yankees", "Red Sox", "Dodgers", "Cubs", "Giants", "Cardinals", "Astros", "Braves"],
    tags: { pitcher: "Pitcher", mvp: "Won an MVP", cy: "Won a Cy Young", champ: "Won the World Series", intl: "Born outside the USA", "2020s": "Played in the 2020s" },
    players: MLB_PLAYERS, baseCount: 44,
  },
};

const FAME_TIER: Record<ProPlayer["fame"], TierId> = { 1: "pencil", 2: "paperclip", 3: "notebook", 4: "backpack", 5: "goldstar", 6: "valedictorian" };
export const proTier = (p: ProPlayer) => FAME_TIER[p.fame];
export const proPoints = (p: ProPlayer) => TIERS[proTier(p)].points;
export const proFits = (p: ProPlayer, team: string, tag: string) => p.teams.includes(team) && p.tags.includes(tag);
export const proCellAnswers = (cfg: ProGridConfig, team: string, tag: string) => cfg.players.filter((p) => proFits(p, team, tag));

export interface ProPuzzle { teams: string[]; tags: string[] }
const cache = new Map<ProLeague, ProPuzzle[]>();
/** Every 3x3 combo where each square has at least two curated answers (from the frozen base roster). */
export function validProGrids(cfg: ProGridConfig): ProPuzzle[] {
  const hit = cache.get(cfg.league);
  if (hit) return hit;
  const base = cfg.players.slice(0, cfg.baseCount);
  const triples = <T,>(a: T[]) => a.flatMap((x, i) => a.slice(i + 1).flatMap((y, j) => a.slice(i + j + 2).map((z) => [x, y, z])));
  const out: ProPuzzle[] = [];
  for (const teams of triples(cfg.teams)) for (const tags of triples(Object.keys(cfg.tags)))
    if (teams.every((t) => tags.every((g) => base.filter((p) => proFits(p, t, g)).length >= 2))) out.push({ teams, tags });
  cache.set(cfg.league, out);
  return out;
}

export function proGridForDay(cfg: ProGridConfig, day: string): ProPuzzle {
  const g = dailyItem(`grid-${cfg.league}`, validProGrids(cfg), dayNumber(day));
  return { teams: seededShuffle(`grid-${cfg.league}-rows:${day}`, g.teams), tags: seededShuffle(`grid-${cfg.league}-cols:${day}`, g.tags) };
}

export function findProPlayer(cfg: ProGridConfig, typed: string): ProPlayer | null {
  const exact = cfg.players.find((p) => namesMatch(typed, [p.name, ...(p.aliases ?? [])]));
  if (exact) return exact;
  const m = cfg.players.filter((p) => namesMatch(typed, [p.name.split(" ").slice(1).join(" ")]));
  return m.length === 1 ? m[0]! : null;
}
