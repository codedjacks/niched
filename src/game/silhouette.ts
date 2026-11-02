import { dailyItem, dayNumber, looseMatch } from "./daily-games";

export type Kit = "primary" | "destructive" | "secondary" | "accent";
export interface Silhouette { name: string[]; league: string; era: string; position: string; number: string; team: string; stat: string; kit: Kit; pose: "shoot" | "throw" | "swing" | "skate" | "kick" }
const s = (name: string, league: string, era: string, position: string, number: string, team: string, stat: string, kit: Kit, pose: Silhouette["pose"]): Silhouette =>
  ({ name: name.split("="), league, era, position, number, team, stat, kit, pose });

/** Append-only (daily deck order). */
export const SILHOUETTES: Silhouette[] = [
  s("Michael Jordan=MJ", "NBA", "1980s–90s", "Shooting guard", "23", "Chicago Bulls", "Six Finals MVPs", "destructive", "shoot"),
  s("Tom Brady", "NFL", "2000s–2020s", "Quarterback", "12", "New England Patriots", "Seven Super Bowl wins", "accent", "throw"),
  s("Wayne Gretzky=The Great One", "NHL", "1980s–90s", "Center", "99", "Edmonton Oilers", "All-time NHL assists leader", "primary", "skate"),
  s("Derek Jeter", "MLB", "1990s–2010s", "Shortstop", "2", "New York Yankees", "3,465 career hits", "accent", "swing"),
  s("Lionel Messi=Messi", "Soccer", "2000s–2020s", "Forward", "10", "FC Barcelona", "2022 World Cup winner", "secondary", "kick"),
  s("Shaquille O'Neal=Shaq", "NBA", "1990s–2000s", "Center", "34", "Los Angeles Lakers", "Three straight Finals MVPs", "primary", "shoot"),
  s("Jerry Rice", "NFL", "1980s–2000s", "Wide receiver", "80", "San Francisco 49ers", "All-time receiving yards leader", "destructive", "throw"),
  s("Ken Griffey Jr.=Griffey", "MLB", "1990s–2000s", "Center fielder", "24", "Seattle Mariners", "630 career home runs", "secondary", "swing"),
  s("Sidney Crosby", "NHL", "2000s–2020s", "Center", "87", "Pittsburgh Penguins", "Three Stanley Cups", "primary", "skate"),
  s("Stephen Curry=Steph Curry", "NBA", "2010s–2020s", "Point guard", "30", "Golden State Warriors", "All-time 3-pointers leader", "primary", "shoot"),
  s("Peyton Manning", "NFL", "1990s–2010s", "Quarterback", "18", "Indianapolis Colts", "Five MVP awards", "accent", "throw"),
  s("Babe Ruth", "MLB", "1910s–30s", "Right fielder", "3", "New York Yankees", "714 career home runs", "accent", "swing"),
  s("Larry Bird", "NBA", "1980s–90s", "Small forward", "33", "Boston Celtics", "Three straight MVPs", "secondary", "shoot"),
  s("Walter Payton=Sweetness", "NFL", "1970s–80s", "Running back", "34", "Chicago Bears", "16,726 rushing yards", "accent", "throw"),
  // Expansion batch (appended; earlier order preserved).
  s("LeBron James=LeBron", "NBA", "2000s\u20132020s", "Small forward", "23", "Cleveland Cavaliers", "NBA all-time leading scorer", "destructive", "shoot"),
  s("Kobe Bryant=Kobe", "NBA", "1990s\u20132010s", "Shooting guard", "24", "Los Angeles Lakers", "81-point game", "secondary", "shoot"),
  s("Patrick Mahomes=Mahomes", "NFL", "2010s\u20132020s", "Quarterback", "15", "Kansas City Chiefs", "Three Super Bowl MVPs", "destructive", "throw"),
  s("Joe Montana", "NFL", "1980s\u201390s", "Quarterback", "16", "San Francisco 49ers", "Four Super Bowl wins", "destructive", "throw"),
  s("Mario Lemieux", "NHL", "1980s\u20132000s", "Center", "66", "Pittsburgh Penguins", "Two Stanley Cups as a player", "primary", "skate"),
  s("Alex Ovechkin=Ovi", "NHL", "2000s\u20132020s", "Left wing", "8", "Washington Capitals", "NHL career goals leader", "destructive", "skate"),
  s("Shohei Ohtani=Ohtani", "MLB", "2010s\u20132020s", "Two-way player", "17", "Los Angeles Dodgers", "First 50-homer, 50-steal season", "accent", "swing"),
  s("Hank Aaron", "MLB", "1950s\u201370s", "Right fielder", "44", "Atlanta Braves", "755 career home runs", "destructive", "swing"),
  s("Cristiano Ronaldo=CR7", "Soccer", "2000s\u20132020s", "Forward", "7", "Real Madrid", "Five Champions League titles", "secondary", "kick"),
  s("Pele=Pel\u00e9", "Soccer", "1950s\u201370s", "Forward", "10", "Santos", "Three World Cup wins", "primary", "kick"),
];

export const CLUE_POINTS = [100, 80, 60, 40, 20] as const;
export const silhouetteForDay = (day: string) => dailyItem("silhouette", SILHOUETTES, dayNumber(day));
export const silhouetteClues = (p: Silhouette) => [`League: ${p.league}`, `Era: ${p.era}`, `${p.position} · #${p.number}`, `Team: ${p.team}`, p.stat];
export const isSilhouette = (p: Silhouette, typed: string) => looseMatch(typed, p.name);
/** Points for solving after `clues` clues were showing (1..5). */
export const cluePoints = (clues: number) => CLUE_POINTS[clues - 1] ?? 0;
