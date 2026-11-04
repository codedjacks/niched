import { dailyItem, dayNumber, looseMatch } from "./daily-games";

import { l, type Top10 } from "./top10-list";
import { TOP10_ESPN } from "./top10-espn";
export type { Top10 };

/** Hand-picked all-time lists (order = rank 1..10). Append-only: the daily deck depends on this order. */
const CURATED: Top10[] = [
  l("MLB career home runs", "MLB", "HR", "Barry Bonds | Hank Aaron | Babe Ruth | Albert Pujols | Alex Rodriguez=A-Rod | Willie Mays | Ken Griffey Jr.=Ken Griffey=Griffey | Jim Thome | Sammy Sosa | Frank Robinson"),
  l("NFL career rushing yards", "NFL", "yards", "Emmitt Smith | Walter Payton | Frank Gore | Barry Sanders | Adrian Peterson=AP | Curtis Martin | LaDainian Tomlinson=LT | Jerome Bettis | Eric Dickerson | Tony Dorsett"),
  l("NHL career goals", "NHL", "goals", "Alex Ovechkin=Ovi | Wayne Gretzky | Gordie Howe | Jaromir Jagr | Brett Hull | Marcel Dionne | Phil Esposito | Mike Gartner | Mark Messier | Steve Yzerman"),
  l("NBA career rebounds", "NBA", "rebounds", "Wilt Chamberlain | Bill Russell | Kareem Abdul-Jabbar=Kareem | Elvin Hayes | Moses Malone | Tim Duncan | Karl Malone | Robert Parish | Kevin Garnett=KG | Dwight Howard"),
  l("Men's World Cup career goals", "Soccer", "goals", "Miroslav Klose | Ronaldo=Ronaldo Nazario | Gerd Muller | Just Fontaine | Lionel Messi=Messi | Kylian Mbappe=Mbappe | Pele | Sandor Kocsis | Jurgen Klinsmann | Helmut Rahn"),
  // Last completed regular season (ESPN leaderboards).
  l("NBA 2025-26 points per game", "NBA", "PPG", "Luka Doncic=Luka | Shai Gilgeous-Alexander=SGA | Anthony Edwards=Ant | Jaylen Brown | Tyrese Maxey | Kawhi Leonard | Donovan Mitchell | Nikola Jokic=Jokic | Devin Booker | Jalen Brunson"),
  l("NFL 2025 passing yards", "NFL", "yards", "Matthew Stafford | Jared Goff | Dak Prescott | Drake Maye | Sam Darnold | Trevor Lawrence | Caleb Williams | Bo Nix | Justin Herbert | Baker Mayfield"),
  l("NFL 2025 rushing yards", "NFL", "yards", "James Cook III=James Cook | Derrick Henry | Jonathan Taylor | Bijan Robinson | De'Von Achane=Devon Achane | Kyren Williams | Jahmyr Gibbs | Christian McCaffrey=CMC | Javonte Williams | Saquon Barkley"),
  l("NFL 2025 receiving yards", "NFL", "yards", "Jaxon Smith-Njigba=JSN | Puka Nacua | George Pickens | Ja'Marr Chase | Amon-Ra St. Brown | Trey McBride | Zay Flowers | Chris Olave | Nico Collins | Jameson Williams"),
  l("MLB 2026 pitcher strikeouts", "MLB", "K", "Jacob Misiorowski | Gavin Williams | Dylan Cease | Cam Schlittler | Cristopher Sanchez | Jesus Luzardo | Reid Detmers | Logan Gilbert | Taj Bradley | Jacob deGrom"),
  l("NHL 2025-26 points", "NHL", "points", "Connor McDavid=McDavid | Nikita Kucherov | Nathan MacKinnon | Macklin Celebrini | Mark Scheifele | Nick Suzuki | David Pastrnak | Martin Necas | Leon Draisaitl | Jason Robertson"),
  // AP NFL MVP 2006-2025 (appended; earlier order preserved).
  l("NFL teams by most recent AP MVP", "NFL", "teams", "Los Angeles Rams=Rams | Buffalo Bills=Bills | Baltimore Ravens=Ravens | Kansas City Chiefs=Chiefs | Green Bay Packers=Packers | New England Patriots=Patriots | Atlanta Falcons=Falcons | Carolina Panthers=Panthers | Denver Broncos=Broncos | Minnesota Vikings=Vikings"),
  l("AP NFL MVP winners by most recent win", "NFL", "awards", "Matthew Stafford=Stafford | Josh Allen=Allen | Lamar Jackson=Jackson | Patrick Mahomes=Mahomes | Aaron Rodgers=Rodgers | Tom Brady=Brady | Matt Ryan=Ryan | Cam Newton=Newton | Peyton Manning=Manning | Adrian Peterson=Peterson"),
];

/** Curated lists first (order preserved), then ESPN season leaderboards not already covered. */
export const TOP10: Top10[] = [...CURATED, ...TOP10_ESPN.filter((e) => !CURATED.some((c) => c.title === e.title))];

export const TOP10_SECONDS = 90;
/** Rank r (1..10) is worth 2r points — the deep cuts at the bottom pay the most. Max 110. */
export const top10Points = (rank: number) => rank * 2;
export const TOP10_MAX = 110;
export const top10ForDay = (day: string) => dailyItem("top10", TOP10, dayNumber(day));
/** Index of the slot the typed name fills, or -1. */
export const top10Slot = (list: Top10, typed: string, found: number[]) =>
  list.names.findIndex((n, i) => !found.includes(i) && looseMatch(typed, n));
