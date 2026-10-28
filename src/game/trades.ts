import { dailyItem, dayNumber, looseMatch } from "./daily-games";

export interface Trade { player: string[]; league: string; year: number; from: string; to: string; with: string; got: string }
const t = (player: string, league: string, year: number, from: string, to: string, withP: string, got: string): Trade =>
  ({ player: player.split("="), league, year, from, to, with: withP, got });

/** Blockbuster trades; the headline player is hidden. Append-only (daily deck order). */
export const TRADES: Trade[] = [
  t("Wayne Gretzky=Gretzky", "NHL", 1988, "Edmonton Oilers", "Los Angeles Kings", "Marty McSorley and Mike Krushelnyski", "Jimmy Carson, Martin Gelinas, three first-round picks and cash"),
  t("Babe Ruth", "MLB", 1920, "Boston Red Sox", "New York Yankees", "nobody — it was a straight sale", "$100,000 in cash"),
  t("Kawhi Leonard=Kawhi", "NBA", 2018, "San Antonio Spurs", "Toronto Raptors", "Danny Green", "DeMar DeRozan, Jakob Poeltl and a first-round pick"),
  t("Kevin Garnett=KG", "NBA", 2007, "Minnesota Timberwolves", "Boston Celtics", "nobody else of note", "Al Jefferson, Ryan Gomes, Sebastian Telfair, Gerald Green, Theo Ratliff and two first-round picks"),
  t("Luka Doncic=Luka", "NBA", 2025, "Dallas Mavericks", "Los Angeles Lakers", "Maxi Kleber and Markieff Morris", "Anthony Davis, Max Christie and a 2029 first-round pick"),
  t("Mookie Betts=Mookie", "MLB", 2020, "Boston Red Sox", "Los Angeles Dodgers", "David Price", "Alex Verdugo, Jeter Downs and Connor Wong"),
  t("Matthew Stafford=Stafford", "NFL", 2021, "Detroit Lions", "Los Angeles Rams", "nobody else", "Jared Goff, two first-round picks and a third-round pick"),
  t("Kareem Abdul-Jabbar=Kareem", "NBA", 1975, "Milwaukee Bucks", "Los Angeles Lakers", "Walt Wesley", "Elmore Smith, Brian Winters, Dave Meyers and Junior Bridgeman"),
  t("Miguel Cabrera=Miggy", "MLB", 2007, "Florida Marlins", "Detroit Tigers", "Dontrelle Willis", "Cameron Maybin, Andrew Miller and four other prospects"),
  t("James Harden=Harden", "NBA", 2012, "Oklahoma City Thunder", "Houston Rockets", "Cole Aldrich, Daequan Cook and Lazar Hayward", "Kevin Martin, Jeremy Lamb and draft picks"),
  t("Tyreek Hill=Tyreek", "NFL", 2022, "Kansas City Chiefs", "Miami Dolphins", "nobody else", "five draft picks, including a first-rounder"),
];

export const tradeForDay = (day: string) => dailyItem("trade", TRADES, dayNumber(day));
export const tradeClues = (p: Trade) => [
  `${p.league}, ${p.year}: ??? was traded to the ${p.to}`,
  `Going the other way: ${p.got}`,
  `Also in the deal: ${p.with}`,
  `Traded away by the ${p.from}`,
  `Initials: ${p.player[0]!.split(" ").map((w) => w[0]).join(".")}.`,
];
export const isTradePlayer = (p: Trade, typed: string) => looseMatch(typed, p.player);
