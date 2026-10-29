import { hash, mulberry32 } from "./selection";

export interface HuddleGroup { label: string; members: string[]; level: 0 | 1 | 2 | 3 }
export interface HuddlePuzzle { id: string; groups: HuddleGroup[] }

/** Hand-written groups of four. Append-only. */
export const HUDDLES: HuddlePuzzle[] = [
  { id: "nba-1", groups: [
    { level: 0, label: "Born outside the U.S.", members: ["Dirk Nowitzki", "Giannis Antetokounmpo", "Nikola Jokic", "Luka Doncic"] },
    { level: 1, label: "Spurs champions", members: ["Tim Duncan", "Tony Parker", "Manu Ginobili", "Kawhi Leonard"] },
    { level: 2, label: "Played at Duke", members: ["Kyrie Irving", "Zion Williamson", "Grant Hill", "Jayson Tatum"] },
    { level: 3, label: "Wore #23", members: ["Michael Jordan", "LeBron James", "Anthony Davis", "Draymond Green"] },
  ] },
  { id: "nfl-1", groups: [
    { level: 0, label: "Quarterbacks", members: ["Tom Brady", "Patrick Mahomes", "Peyton Manning", "Eli Manning"] },
    { level: 1, label: "Wide receivers", members: ["Jerry Rice", "Randy Moss", "Calvin Johnson", "Larry Fitzgerald"] },
    { level: 2, label: "Running backs", members: ["Barry Sanders", "Emmitt Smith", "Walter Payton", "LaDainian Tomlinson"] },
    { level: 3, label: "Defenders", members: ["Lawrence Taylor", "Ray Lewis", "J.J. Watt", "Aaron Donald"] },
  ] },
  { id: "mlb-1", groups: [
    { level: 0, label: "Born in Japan", members: ["Shohei Ohtani", "Ichiro Suzuki", "Hideki Matsui", "Yu Darvish"] },
    { level: 1, label: "Pitchers", members: ["Clayton Kershaw", "Pedro Martinez", "Greg Maddux", "Randy Johnson"] },
    { level: 2, label: "500-homer club", members: ["Barry Bonds", "Hank Aaron", "Albert Pujols", "Ken Griffey Jr."] },
    { level: 3, label: "Yankees captains", members: ["Derek Jeter", "Thurman Munson", "Don Mattingly", "Aaron Judge"] },
  ] },
  { id: "mix-1", groups: [
    { level: 0, label: "Hockey", members: ["Wayne Gretzky", "Sidney Crosby", "Alex Ovechkin", "Connor McDavid"] },
    { level: 1, label: "Tennis", members: ["Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Djokovic"] },
    { level: 2, label: "Golf", members: ["Tiger Woods", "Jack Nicklaus", "Rory McIlroy", "Phil Mickelson"] },
    { level: 3, label: "Soccer", members: ["Lionel Messi", "Cristiano Ronaldo", "Pele", "Zinedine Zidane"] },
  ] },
];

export const HUDDLE_MISTAKES = 4;

export function huddleForDay(day: string): { puzzle: HuddlePuzzle; tiles: string[] } {
  const puzzle = HUDDLES[hash(`huddle:${day}`) % HUDDLES.length]!;
  const rand = mulberry32(hash(`huddle-tiles:${day}`));
  const tiles = puzzle.groups.flatMap((g) => g.members);
  for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!]; }
  return { puzzle, tiles };
}

/** Returns the group if all four picks belong to it. */
export function checkHuddle(p: HuddlePuzzle, picks: string[]): HuddleGroup | null {
  if (picks.length !== 4) return null;
  return p.groups.find((g) => picks.every((x) => g.members.includes(x))) ?? null;
}

/** 25 per group found, minus 5 per mistake. */
export const huddleScore = (found: number, mistakes: number) => Math.max(0, found * 25 - mistakes * 5);
