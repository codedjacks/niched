import { dailyItem, dayNumber, looseMatch, seededShuffle } from "./daily-games";

export interface Stadium { name: string[]; league: string; opened: number; capacity: string; tenant: string; city: string; verified?: boolean }
const s = (name: string, league: string, opened: number, capacity: string, tenant: string, city: string): Stadium =>
  ({ name: name.split("="), league, opened, capacity, tenant, city });

/** Capacities are approximate. Append-only (daily deck order). */
export const STADIUMS: Stadium[] = [
  s("Wrigley Field=Wrigley", "MLB", 1914, "about 41,600", "Chicago Cubs", "Chicago"),
  s("Fenway Park=Fenway", "MLB", 1912, "about 37,700", "Boston Red Sox", "Boston"),
  s("Lambeau Field=Lambeau", "NFL", 1957, "about 81,400", "Green Bay Packers", "Green Bay"),
  s("Madison Square Garden=MSG=The Garden", "NBA / NHL", 1968, "about 19,800 for basketball", "New York Knicks and Rangers", "New York City"),
  s("Dodger Stadium", "MLB", 1962, "about 56,000", "Los Angeles Dodgers", "Los Angeles"),
  s("Arrowhead Stadium=Arrowhead=GEHA Field at Arrowhead Stadium", "NFL", 1972, "about 76,400", "Kansas City Chiefs", "Kansas City"),
  s("Yankee Stadium", "MLB", 2009, "about 46,500", "New York Yankees", "The Bronx"),
  s("AT&T Stadium=Jerry World=Cowboys Stadium", "NFL", 2009, "about 80,000", "Dallas Cowboys", "Arlington, Texas"),
  s("Camp Nou=Spotify Camp Nou", "Soccer", 1957, "about 99,000", "FC Barcelona", "Barcelona"),
  s("Wembley Stadium=Wembley", "Soccer", 2007, "90,000", "England national team", "London"),
  s("Oracle Park=AT&T Park=Pac Bell Park", "MLB", 2000, "about 41,900", "San Francisco Giants", "San Francisco"),
  s("Soldier Field", "NFL", 1924, "about 61,500", "Chicago Bears", "Chicago"),
  s("Lucas Oil Stadium", "NFL", 2008, "about 67,000", "Indianapolis Colts", "Indianapolis"),
  s("Bell Centre=Centre Bell", "NHL", 1996, "about 21,100", "Montreal Canadiens", "Montreal"),
  s("Rose Bowl", "College football", 1922, "about 89,700", "UCLA Bruins", "Pasadena"),
];

export const stadiumForDay = (day: string, deck: Stadium[] = STADIUMS) => dailyItem("stadium", deck, dayNumber(day));
export const stadiumClues = (p: Stadium) => [
  p.opened ? `${p.league} venue · opened ${p.opened}` : `${p.league} venue`,
  `Capacity: ${p.capacity}${p.verified ? " (sourced)" : ""}`,
  p.city ? `City: ${p.city}` : `${p.name[0]!.split(" ").length}-word name`,
  `Home of the ${p.tenant}`,
  `Starts with "${p.name[0]![0]}"`,
];
export const isStadium = (p: Stadium, typed: string) => looseMatch(typed, p.name);
/** Deterministic pixel skyline heights (1..8) for the scoreboard art. */
export const skyline = (p: Stadium) => seededShuffle(`sky:${p.name[0]}`, [2, 3, 5, 8, 6, 4, 7, 3, 2, 5, 6, 4, 3, 7, 5, 2]);
