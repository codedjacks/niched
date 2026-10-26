import { TIERS } from "./scoring";
import type { TierId } from "./types";
import { dailyItem, dayNumber, namesMatch, seededShuffle } from "./daily-games";

export type Team = "Lakers" | "Celtics" | "Bulls" | "Warriors" | "Heat" | "Spurs" | "Knicks" | "Cavaliers" | "Rockets" | "Suns";
export type Tag = "mvp" | "champ" | "pick1" | "roy" | "intl" | "2020s";

export const TAGS: Record<Tag, string> = {
  mvp: "Won regular-season MVP",
  champ: "Won an NBA title",
  pick1: "#1 overall draft pick",
  roy: "Rookie of the Year",
  intl: "Born outside the USA",
  "2020s": "Played in the 2020s",
};

/** fame 1 = everyone says them … 6 = deep cut. Teams list only the ten grid franchises. */
export interface Player { name: string; aliases?: string[]; teams: Team[]; tags: Tag[]; fame: 1 | 2 | 3 | 4 | 5 | 6 }

export const PLAYERS: Player[] = [
  { name: "LeBron James", aliases: ["LeBron"], teams: ["Cavaliers", "Heat", "Lakers"], tags: ["mvp", "champ", "pick1", "roy", "2020s"], fame: 1 },
  { name: "Kobe Bryant", aliases: ["Kobe"], teams: ["Lakers"], tags: ["mvp", "champ"], fame: 1 },
  { name: "Michael Jordan", aliases: ["MJ"], teams: ["Bulls"], tags: ["mvp", "champ", "roy"], fame: 1 },
  { name: "Shaquille O'Neal", aliases: ["Shaq"], teams: ["Lakers", "Heat", "Suns", "Cavaliers", "Celtics"], tags: ["mvp", "champ", "pick1", "roy"], fame: 1 },
  { name: "Stephen Curry", aliases: ["Steph Curry"], teams: ["Warriors"], tags: ["mvp", "champ", "2020s"], fame: 1 },
  { name: "Kevin Durant", aliases: ["KD"], teams: ["Warriors", "Suns", "Rockets"], tags: ["mvp", "champ", "roy", "2020s"], fame: 2 },
  { name: "Tim Duncan", teams: ["Spurs"], tags: ["mvp", "champ", "pick1", "roy"], fame: 2 },
  { name: "Dwyane Wade", teams: ["Heat", "Bulls", "Cavaliers"], tags: ["champ"], fame: 2 },
  { name: "Kawhi Leonard", teams: ["Spurs"], tags: ["champ", "2020s"], fame: 3 },
  { name: "Hakeem Olajuwon", teams: ["Rockets"], tags: ["mvp", "champ", "pick1", "roy", "intl"], fame: 3 },
  { name: "Larry Bird", teams: ["Celtics"], tags: ["mvp", "champ", "roy"], fame: 2 },
  { name: "Magic Johnson", teams: ["Lakers"], tags: ["mvp", "champ", "pick1"], fame: 2 },
  { name: "Kareem Abdul-Jabbar", aliases: ["Kareem"], teams: ["Lakers"], tags: ["mvp", "champ", "pick1", "roy"], fame: 3 },
  { name: "Kyrie Irving", teams: ["Cavaliers", "Celtics"], tags: ["champ", "pick1", "roy", "intl", "2020s"], fame: 3 },
  { name: "Kevin Garnett", teams: ["Celtics"], tags: ["mvp", "champ"], fame: 3 },
  { name: "Paul Pierce", teams: ["Celtics"], tags: ["champ"], fame: 3 },
  { name: "Ray Allen", teams: ["Celtics", "Heat"], tags: ["champ"], fame: 3 },
  { name: "Scottie Pippen", teams: ["Bulls", "Rockets"], tags: ["champ"], fame: 3 },
  { name: "Dennis Rodman", teams: ["Bulls", "Spurs", "Lakers"], tags: ["champ"], fame: 3 },
  { name: "Tony Parker", teams: ["Spurs"], tags: ["champ", "intl"], fame: 4 },
  { name: "Manu Ginobili", teams: ["Spurs"], tags: ["champ", "intl"], fame: 4 },
  { name: "Pau Gasol", teams: ["Lakers", "Bulls", "Spurs"], tags: ["champ", "roy", "intl"], fame: 4 },
  { name: "Klay Thompson", teams: ["Warriors"], tags: ["champ", "2020s"], fame: 3 },
  { name: "Draymond Green", teams: ["Warriors"], tags: ["champ", "2020s"], fame: 3 },
  { name: "Andre Iguodala", teams: ["Warriors", "Heat"], tags: ["champ", "2020s"], fame: 4 },
  { name: "Jimmy Butler", teams: ["Bulls", "Heat", "Warriors"], tags: ["2020s"], fame: 3 },
  { name: "Jayson Tatum", teams: ["Celtics"], tags: ["champ", "2020s"], fame: 2 },
  { name: "Jaylen Brown", teams: ["Celtics"], tags: ["champ", "2020s"], fame: 4 },
  { name: "Anthony Davis", teams: ["Lakers"], tags: ["champ", "pick1", "2020s"], fame: 3 },
  { name: "James Harden", teams: ["Rockets"], tags: ["mvp", "2020s"], fame: 2 },
  { name: "Russell Westbrook", teams: ["Rockets", "Lakers"], tags: ["mvp", "2020s"], fame: 3 },
  { name: "Chris Paul", aliases: ["CP3"], teams: ["Rockets", "Suns", "Warriors", "Spurs"], tags: ["roy", "2020s"], fame: 3 },
  { name: "Steve Nash", teams: ["Suns", "Lakers"], tags: ["mvp", "intl"], fame: 3 },
  { name: "Charles Barkley", teams: ["Suns", "Rockets"], tags: ["mvp"], fame: 3 },
  { name: "Derrick Rose", teams: ["Bulls", "Knicks", "Cavaliers"], tags: ["mvp", "pick1", "roy", "2020s"], fame: 4 },
  { name: "Patrick Ewing", teams: ["Knicks"], tags: ["pick1", "roy"], fame: 4 },
  { name: "Carmelo Anthony", aliases: ["Melo"], teams: ["Knicks", "Rockets", "Lakers"], tags: ["2020s"], fame: 4 },
  { name: "Jalen Brunson", teams: ["Knicks"], tags: ["2020s"], fame: 4 },
  { name: "Devin Booker", teams: ["Suns"], tags: ["2020s"], fame: 4 },
  { name: "Luka Doncic", aliases: ["Luka"], teams: ["Lakers"], tags: ["roy", "intl", "2020s"], fame: 3 },
  { name: "David Robinson", teams: ["Spurs"], tags: ["mvp", "champ", "pick1", "roy"], fame: 4 },
  { name: "Victor Wembanyama", aliases: ["Wemby"], teams: ["Spurs"], tags: ["pick1", "roy", "intl", "2020s"], fame: 4 },
  { name: "Yao Ming", teams: ["Rockets"], tags: ["pick1", "intl"], fame: 4 },
  { name: "Wilt Chamberlain", teams: ["Lakers", "Warriors"], tags: ["mvp", "champ", "roy"], fame: 4 },
  { name: "Bill Russell", teams: ["Celtics"], tags: ["mvp", "champ"], fame: 4 },
  { name: "Dwight Howard", teams: ["Lakers", "Rockets"], tags: ["champ", "pick1", "2020s"], fame: 4 },
  { name: "Rajon Rondo", teams: ["Celtics", "Lakers", "Bulls", "Cavaliers"], tags: ["champ", "2020s"], fame: 5 },
  { name: "Kyle Lowry", teams: ["Rockets", "Heat"], tags: ["champ", "2020s"], fame: 5 },
  { name: "Bam Adebayo", teams: ["Heat"], tags: ["2020s"], fame: 5 },
  { name: "Donovan Mitchell", teams: ["Cavaliers"], tags: ["2020s"], fame: 4 },
  { name: "Zach LaVine", teams: ["Bulls"], tags: ["2020s"], fame: 5 },
  { name: "Julius Randle", teams: ["Lakers", "Knicks"], tags: ["2020s"], fame: 5 },
  { name: "Amar'e Stoudemire", aliases: ["Amare Stoudemire"], teams: ["Suns", "Knicks", "Heat"], tags: ["roy"], fame: 5 },
  { name: "Robert Horry", teams: ["Rockets", "Lakers", "Spurs", "Suns"], tags: ["champ"], fame: 6 },
  { name: "Steve Kerr", teams: ["Bulls", "Spurs"], tags: ["champ"], fame: 5 },
  { name: "Andrew Wiggins", teams: ["Warriors", "Heat"], tags: ["champ", "pick1", "roy", "intl", "2020s"], fame: 5 },
  { name: "Blake Griffin", teams: ["Celtics"], tags: ["pick1", "roy", "2020s"], fame: 5 },
  { name: "Tracy McGrady", aliases: ["T-Mac"], teams: ["Rockets", "Spurs", "Knicks"], tags: [], fame: 5 },
  { name: "Jason Kidd", teams: ["Suns", "Knicks"], tags: ["champ", "roy"], fame: 5 },
  { name: "Grant Hill", teams: ["Suns"], tags: ["roy"], fame: 6 },
  // ---- expanded roster (appended; puzzle selection only uses the first 60 entries) ----
  { name: "Giannis Antetokounmpo", aliases: ["Giannis"], teams: [], tags: ["mvp", "champ", "intl", "2020s"], fame: 2 },
  { name: "Nikola Jokic", aliases: ["Jokic"], teams: [], tags: ["mvp", "champ", "intl", "2020s"], fame: 3 },
  { name: "Joel Embiid", teams: [], tags: ["mvp", "intl", "2020s"], fame: 3 },
  { name: "Dirk Nowitzki", aliases: ["Dirk"], teams: [], tags: ["mvp", "champ", "intl"], fame: 3 },
  { name: "Allen Iverson", aliases: ["AI"], teams: [], tags: ["mvp", "pick1", "roy"], fame: 3 },
  { name: "Karl-Anthony Towns", aliases: ["KAT"], teams: ["Knicks"], tags: ["pick1", "roy", "2020s"], fame: 4 },
  { name: "Mikal Bridges", teams: ["Suns", "Knicks"], tags: ["2020s"], fame: 5 },
  { name: "OG Anunoby", teams: ["Knicks"], tags: ["champ", "intl", "2020s"], fame: 5 },
  { name: "Josh Hart", teams: ["Knicks"], tags: ["2020s"], fame: 5 },
  { name: "Mitchell Robinson", teams: ["Knicks"], tags: ["2020s"], fame: 6 },
  { name: "RJ Barrett", teams: ["Knicks"], tags: ["intl", "2020s"], fame: 5 },
  { name: "Immanuel Quickley", teams: ["Knicks"], tags: ["2020s"], fame: 6 },
  { name: "Derrick Rose", teams: ["Bulls"], tags: [], fame: 4 },
  { name: "Walt Frazier", teams: ["Knicks"], tags: ["champ"], fame: 6 },
  { name: "Willis Reed", teams: ["Knicks"], tags: ["mvp", "champ", "roy"], fame: 6 },
  { name: "Darius Garland", teams: ["Cavaliers"], tags: ["2020s"], fame: 5 },
  { name: "Evan Mobley", teams: ["Cavaliers"], tags: ["2020s"], fame: 5 },
  { name: "Jarrett Allen", teams: ["Cavaliers"], tags: ["2020s"], fame: 6 },
  { name: "Kevin Love", teams: ["Cavaliers", "Heat"], tags: ["champ", "2020s"], fame: 4 },
  { name: "Tristan Thompson", teams: ["Cavaliers", "Celtics", "Bulls", "Lakers"], tags: ["champ", "intl", "2020s"], fame: 6 },
  { name: "Anthony Bennett", teams: ["Cavaliers"], tags: ["pick1", "intl"], fame: 6 },
  { name: "Brad Daugherty", teams: ["Cavaliers"], tags: ["pick1"], fame: 6 },
  { name: "Mark Price", teams: ["Cavaliers"], tags: [], fame: 6 },
  { name: "Zydrunas Ilgauskas", aliases: ["Big Z"], teams: ["Cavaliers", "Heat"], tags: ["intl"], fame: 6 },
  { name: "Tyler Herro", teams: ["Heat"], tags: ["2020s"], fame: 5 },
  { name: "Alonzo Mourning", teams: ["Heat"], tags: ["champ"], fame: 5 },
  { name: "Udonis Haslem", teams: ["Heat"], tags: ["champ", "2020s"], fame: 6 },
  { name: "Chris Bosh", teams: ["Heat"], tags: ["champ", "intl"], fame: 4 },
  { name: "Goran Dragic", teams: ["Suns", "Heat", "Bulls"], tags: ["intl", "2020s"], fame: 6 },
  { name: "Tim Hardaway", teams: ["Warriors", "Heat"], tags: [], fame: 6 },
  { name: "Mario Chalmers", teams: ["Heat"], tags: ["champ"], fame: 6 },
  { name: "Shane Battier", teams: ["Rockets", "Heat"], tags: ["champ"], fame: 6 },
  { name: "Duncan Robinson", teams: ["Heat"], tags: ["2020s"], fame: 6 },
  { name: "Alperen Sengun", teams: ["Rockets"], tags: ["intl", "2020s"], fame: 5 },
  { name: "Jalen Green", teams: ["Rockets", "Suns"], tags: ["2020s"], fame: 5 },
  { name: "Fred VanVleet", teams: ["Rockets"], tags: ["champ", "2020s"], fame: 6 },
  { name: "Clyde Drexler", teams: ["Rockets"], tags: ["champ"], fame: 5 },
  { name: "Moses Malone", teams: ["Rockets", "Spurs"], tags: ["mvp", "champ"], fame: 5 },
  { name: "Ralph Sampson", teams: ["Rockets", "Warriors"], tags: ["pick1", "roy"], fame: 6 },
  { name: "Elvin Hayes", teams: ["Rockets"], tags: ["champ"], fame: 6 },
  { name: "Clint Capela", teams: ["Rockets"], tags: ["intl", "2020s"], fame: 6 },
  { name: "Eric Gordon", teams: ["Rockets", "Suns"], tags: ["2020s"], fame: 6 },
  { name: "Bradley Beal", teams: ["Suns"], tags: ["2020s"], fame: 5 },
  { name: "Deandre Ayton", teams: ["Suns"], tags: ["pick1", "intl", "2020s"], fame: 5 },
  { name: "Shawn Marion", teams: ["Suns", "Heat", "Cavaliers"], tags: ["champ"], fame: 6 },
  { name: "Alvan Adams", teams: ["Suns"], tags: ["roy"], fame: 6 },
  { name: "Kevin Johnson", teams: ["Suns", "Cavaliers"], tags: [], fame: 6 },
  { name: "Draymond Green", teams: ["Warriors"], tags: [], fame: 3 },
  { name: "Jonathan Kuminga", teams: ["Warriors"], tags: ["intl", "2020s"], fame: 6 },
  { name: "Andrew Bogut", teams: ["Warriors", "Cavaliers", "Lakers"], tags: ["champ", "pick1", "intl"], fame: 6 },
  { name: "Chris Webber", teams: ["Warriors"], tags: ["pick1", "roy"], fame: 6 },
  { name: "Chris Mullin", teams: ["Warriors"], tags: [], fame: 6 },
  { name: "Rick Barry", teams: ["Warriors", "Rockets"], tags: ["champ", "roy"], fame: 6 },
  { name: "Baron Davis", teams: ["Warriors", "Cavaliers", "Knicks"], tags: [], fame: 6 },
  { name: "Jordan Poole", teams: ["Warriors"], tags: ["champ", "2020s"], fame: 6 },
  { name: "Austin Reaves", teams: ["Lakers"], tags: ["2020s"], fame: 5 },
  { name: "Lamar Odom", teams: ["Lakers"], tags: ["champ"], fame: 5 },
  { name: "Derek Fisher", teams: ["Lakers"], tags: ["champ"], fame: 6 },
  { name: "James Worthy", teams: ["Lakers"], tags: ["champ", "pick1"], fame: 5 },
  { name: "Jerry West", teams: ["Lakers"], tags: ["champ"], fame: 5 },
  { name: "Elgin Baylor", teams: ["Lakers"], tags: ["pick1", "roy"], fame: 6 },
  { name: "Metta World Peace", aliases: ["Ron Artest"], teams: ["Lakers", "Rockets", "Knicks"], tags: ["champ"], fame: 5 },
  { name: "Kentavious Caldwell-Pope", aliases: ["KCP"], teams: ["Lakers"], tags: ["champ", "2020s"], fame: 6 },
  { name: "Isaiah Thomas", teams: ["Celtics", "Suns", "Cavaliers", "Lakers"], tags: ["2020s"], fame: 5 },
  { name: "Jrue Holiday", teams: ["Celtics"], tags: ["champ", "2020s"], fame: 5 },
  { name: "Kristaps Porzingis", aliases: ["Porzingis"], teams: ["Knicks", "Celtics"], tags: ["champ", "intl", "2020s"], fame: 5 },
  { name: "Al Horford", teams: ["Celtics"], tags: ["champ", "intl", "2020s"], fame: 5 },
  { name: "Derrick White", teams: ["Spurs", "Celtics"], tags: ["champ", "2020s"], fame: 6 },
  { name: "Marcus Smart", teams: ["Celtics"], tags: ["2020s"], fame: 5 },
  { name: "Kevin McHale", teams: ["Celtics"], tags: ["champ"], fame: 5 },
  { name: "Robert Parish", teams: ["Celtics", "Bulls"], tags: ["champ"], fame: 6 },
  { name: "John Havlicek", teams: ["Celtics"], tags: ["champ"], fame: 6 },
  { name: "Dave Cowens", teams: ["Celtics"], tags: ["mvp", "champ", "roy"], fame: 6 },
  { name: "Bob Cousy", teams: ["Celtics"], tags: ["mvp", "champ"], fame: 6 },
  { name: "DeMar DeRozan", teams: ["Spurs", "Bulls"], tags: ["2020s"], fame: 5 },
  { name: "Toni Kukoc", teams: ["Bulls"], tags: ["champ", "intl"], fame: 6 },
  { name: "Horace Grant", teams: ["Bulls", "Lakers"], tags: ["champ"], fame: 6 },
  { name: "Joakim Noah", teams: ["Bulls", "Knicks"], tags: ["intl"], fame: 5 },
  { name: "Luol Deng", teams: ["Bulls", "Heat", "Cavaliers", "Lakers"], tags: ["intl"], fame: 6 },
  { name: "Elton Brand", teams: ["Bulls"], tags: ["pick1", "roy"], fame: 6 },
  { name: "Coby White", teams: ["Bulls"], tags: ["2020s"], fame: 6 },
  { name: "Nikola Vucevic", teams: ["Bulls"], tags: ["intl", "2020s"], fame: 6 },
  { name: "LaMarcus Aldridge", teams: ["Spurs"], tags: ["2020s"], fame: 5 },
  { name: "George Gervin", aliases: ["Iceman"], teams: ["Spurs", "Bulls"], tags: [], fame: 6 },
  { name: "Bruce Bowen", teams: ["Heat", "Suns", "Spurs"], tags: ["champ"], fame: 6 },
  { name: "Boris Diaw", teams: ["Suns", "Spurs"], tags: ["champ", "intl"], fame: 6 },
  { name: "Patty Mills", teams: ["Spurs", "Heat"], tags: ["champ", "intl", "2020s"], fame: 6 },
  { name: "Dejounte Murray", teams: ["Spurs"], tags: ["2020s"], fame: 6 },
  { name: "De'Aaron Fox", teams: ["Spurs"], tags: ["2020s"], fame: 5 },
  { name: "Stephon Castle", teams: ["Spurs"], tags: ["roy", "2020s"], fame: 6 },
];

const FAME_TIER: Record<Player["fame"], TierId> = { 1: "pencil", 2: "paperclip", 3: "notebook", 4: "backpack", 5: "goldstar", 6: "valedictorian" };
export const tierForPlayer = (p: Player) => FAME_TIER[p.fame];
export const pointsForPlayer = (p: Player) => TIERS[tierForPlayer(p)].points;

export const fits = (p: Player, team: Team, tag: Tag) => p.teams.includes(team) && p.tags.includes(tag);
export const cellAnswers = (team: Team, tag: Tag) => PLAYERS.filter((p) => fits(p, team, tag));

/** Frozen base roster for puzzle selection so adding players never changes past or current grids. */
const GRID_BASE = PLAYERS.slice(0, 60);
export interface GridPuzzle { teams: Team[]; tags: Tag[] }
const ALL_TEAMS: Team[] = ["Lakers", "Celtics", "Bulls", "Warriors", "Heat", "Spurs", "Knicks", "Cavaliers", "Rockets", "Suns"];
const ALL_TAGS = Object.keys(TAGS) as Tag[];

/** Every 3 teams x 3 tags combo where each square has at least two valid players. */
export const VALID_GRIDS: GridPuzzle[] = (() => {
  const out: GridPuzzle[] = [];
  const triples = <T,>(a: T[]) => a.flatMap((x, i) => a.slice(i + 1).flatMap((y, j) => a.slice(i + j + 2).map((z) => [x, y, z])));
  for (const teams of triples(ALL_TEAMS)) for (const tags of triples(ALL_TAGS))
    if (teams.every((t) => tags.every((g) => GRID_BASE.filter((p) => fits(p, t, g)).length >= 2))) out.push({ teams, tags });
  return out;
})();

export function gridForDay(day: string): GridPuzzle {
  const g = dailyItem("grid", VALID_GRIDS, dayNumber(day));
  return { teams: seededShuffle(`grid-rows:${day}`, g.teams), tags: seededShuffle(`grid-cols:${day}`, g.tags) };
}

export function findPlayer(typed: string): Player | null {
  return PLAYERS.find((p) => namesMatch(typed, [p.name, ...(p.aliases ?? [])])) ??
    // unique last name, e.g. "Wembanyama"
    (() => { const m = PLAYERS.filter((p) => namesMatch(typed, [p.name.split(" ").slice(1).join(" ")])); return m.length === 1 ? m[0]! : null; })();
}

export type GridGuess = { ok: true; player: Player; points: number } | { ok: false; reason: "unknown" | "wrong" | "used" };
/** Check a guess for a square; each player may be used once per grid. */
export function guessCell(typed: string, team: Team, tag: Tag, used: string[]): GridGuess {
  const p = findPlayer(typed);
  if (!p) return { ok: false, reason: "unknown" };
  if (used.includes(p.name)) return { ok: false, reason: "used" };
  if (!fits(p, team, tag)) return { ok: false, reason: "wrong" };
  return { ok: true, player: p, points: pointsForPlayer(p) };
}
export const GRID_GUESSES = 9;
export const GRID_MAX = 900;
