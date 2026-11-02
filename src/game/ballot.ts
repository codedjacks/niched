import { dailyItem, dayNumber, seededShuffle } from "./daily-games";

export interface Ballot { award: string; season: string; order: string[] }
const b = (award: string, season: string, order: string): Ballot => ({ award, season, order: order.split(", ") });

/** Actual top-five finishes (index 0 = winner). Append-only (daily deck order). */
export const BALLOTS: Ballot[] = [
  b("NBA MVP", "2022–23", "Joel Embiid, Nikola Jokic, Giannis Antetokounmpo, Jayson Tatum, Shai Gilgeous-Alexander"),
  b("NBA MVP", "2023–24", "Nikola Jokic, Shai Gilgeous-Alexander, Luka Doncic, Giannis Antetokounmpo, Jalen Brunson"),
  b("NBA MVP", "2015–16", "Stephen Curry, Kawhi Leonard, LeBron James, Russell Westbrook, Kevin Durant"),
  b("NBA MVP", "2021–22", "Nikola Jokic, Joel Embiid, Giannis Antetokounmpo, Devin Booker, Luka Doncic"),
  b("NBA MVP", "2024–25", "Shai Gilgeous-Alexander, Nikola Jokic, Giannis Antetokounmpo, Jayson Tatum, Donovan Mitchell"),
  b("NBA MVP", "2020–21", "Nikola Jokic, Joel Embiid, Stephen Curry, Giannis Antetokounmpo, Chris Paul"),
  b("NBA MVP", "2017–18", "James Harden, LeBron James, Anthony Davis, Damian Lillard, Russell Westbrook"),
  b("NBA MVP", "2018–19", "Giannis Antetokounmpo, James Harden, Paul George, Nikola Jokic, Stephen Curry"),
  b("NBA MVP", "2019–20", "Giannis Antetokounmpo, LeBron James, James Harden, Luka Doncic, Kawhi Leonard"),
  // Expansion batch (appended; earlier order preserved).
  b("NBA MVP", "2016–17", "Russell Westbrook, James Harden, Kawhi Leonard, LeBron James, Isaiah Thomas"),
  b("NBA MVP", "2014–15", "Stephen Curry, James Harden, LeBron James, Russell Westbrook, Anthony Davis"),
  b("NBA MVP", "2013–14", "Kevin Durant, LeBron James, Blake Griffin, Joakim Noah, James Harden"),
  b("NBA MVP", "2012–13", "LeBron James, Kevin Durant, Carmelo Anthony, Chris Paul, Kobe Bryant"),
  b("NBA MVP", "2011–12", "LeBron James, Kevin Durant, Chris Paul, Kobe Bryant, Tony Parker"),
  b("NBA MVP", "2010–11", "Derrick Rose, Dwight Howard, LeBron James, Kobe Bryant, Kevin Durant"),
  b("NBA MVP", "2009–10", "LeBron James, Kevin Durant, Kobe Bryant, Dwight Howard, Dwyane Wade"),
  b("NBA MVP", "2008–09", "LeBron James, Kobe Bryant, Dwyane Wade, Dwight Howard, Chris Paul"),
  b("NBA MVP", "2007–08", "Kobe Bryant, Chris Paul, Kevin Garnett, LeBron James, Dwight Howard"),
  b("NBA MVP", "2006–07", "Dirk Nowitzki, Steve Nash, Kobe Bryant, Tim Duncan, LeBron James"),
  b("NBA MVP", "2005–06", "Steve Nash, LeBron James, Kobe Bryant, Chauncey Billups, Dirk Nowitzki"),
  b("NBA MVP", "2004–05", "Steve Nash, Shaquille O'Neal, Dirk Nowitzki, Tim Duncan, Allen Iverson"),
];

export const BALLOT_SPOT = 15;
export const BALLOT_BONUS = 25;
export const BALLOT_MAX = BALLOT_SPOT * 5 + BALLOT_BONUS; // 100
export const ballotForDay = (day: string) => dailyItem("ballot", BALLOTS, dayNumber(day));
/** Starting order shown to the player — never the real order and never the winner on top. */
export function ballotStart(day: string, p: Ballot): string[] {
  const s = seededShuffle(`ballot:${day}`, p.order);
  // Never open with the winner on top (or the whole real order).
  return s[0] === p.order[0] ? [...s.slice(1), s[0]!] : s;
}
/** 15 per finalist in the right spot, plus 25 for a perfect ballot. */
export function scoreBallot(p: Ballot, guess: string[]) {
  const right = guess.filter((n, i) => n === p.order[i]).length;
  return right * BALLOT_SPOT + (right === p.order.length ? BALLOT_BONUS : 0);
}
