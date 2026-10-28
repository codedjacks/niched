import { dailyItem, dayNumber, looseMatch } from "./daily-games";

export interface Chain { league: string; number: string; players: string[][] }
const c = (league: string, number: string, rows: string): Chain => ({ league, number, players: rows.split(" | ").map((r) => r.split("=")) });

/** Famous wearers of one number across a league. Append-only (daily deck order). */
export const CHAINS: Chain[] = [
  c("NBA", "23", "Michael Jordan | LeBron James | Anthony Davis | Draymond Green | Fred VanVleet | Lou Williams | Mitchell Robinson | Jason Richardson"),
  c("NBA", "33", "Larry Bird | Kareem Abdul-Jabbar=Kareem | Scottie Pippen | Patrick Ewing | Grant Hill | Alonzo Mourning"),
  c("NFL", "12", "Tom Brady | Aaron Rodgers | Terry Bradshaw | Roger Staubach | Joe Namath | Jim Kelly | Andrew Luck | Randall Cunningham"),
  c("NFL", "80", "Jerry Rice | Steve Largent | Cris Carter | Kellen Winslow | Jimmy Graham | Andre Johnson"),
  c("MLB", "24", "Willie Mays | Ken Griffey Jr.=Griffey | Rickey Henderson | Miguel Cabrera | Manny Ramirez | Tony Perez | Barry Bonds"),
  c("NHL", "9", "Gordie Howe | Maurice Richard=Rocket Richard | Bobby Hull | Mike Modano | Paul Kariya | Jack Eichel | Lanny McDonald | Johnny Bucyk"),
];

export const CHAIN_MISSES = 3;
export const CHAIN_LINK_POINTS = 15;
export const chainMax = (ch: Chain) => ch.players.length * CHAIN_LINK_POINTS;
export const chainForDay = (day: string) => dailyItem("jerseychain", CHAINS, dayNumber(day));
export const chainIndex = (ch: Chain, typed: string, found: number[]) =>
  ch.players.findIndex((p, i) => !found.includes(i) && looseMatch(typed, p));
/** The chain ends after three misses or when every listed wearer is found. */
export const chainOver = (ch: Chain, found: number, misses: number) => misses >= CHAIN_MISSES || found >= ch.players.length;
