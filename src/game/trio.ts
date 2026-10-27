import { dailyItem, dayNumber, namesMatch } from "./daily-games";

export interface Trio { league: "NBA" | "NFL" | "MLB" | "NHL"; players: string[]; team: string; aliases: string[]; decade: string; extra: string }

const t = (league: Trio["league"], players: string, team: string, aliases: string, decade: string, extra: string): Trio =>
  ({ league, players: players.split(", "), team, aliases: aliases ? aliases.split(", ") : [], decade, extra });

/** Famous teammate trios; answer is the team. Frozen, append-only: the daily deck order depends on this list. */
export const TRIOS: Trio[] = [
  t("NBA", "Michael Jordan, Scottie Pippen, Dennis Rodman", "Chicago Bulls", "Bulls, Chicago", "1990s", "Won 72 games in 1995–96"),
  t("NBA", "LeBron James, Dwyane Wade, Chris Bosh", "Miami Heat", "Heat, Miami", "2010s", "Back-to-back titles in 2012 and 2013"),
  t("NBA", "Stephen Curry, Klay Thompson, Draymond Green", "Golden State Warriors", "Warriors, Golden State", "2010s", "Won 73 games in 2015–16"),
  t("NBA", "Tim Duncan, Tony Parker, Manu Ginóbili", "San Antonio Spurs", "Spurs, San Antonio", "2000s", "Four titles together"),
  t("NBA", "Larry Bird, Kevin McHale, Robert Parish", "Boston Celtics", "Celtics, Boston", "1980s", "Three titles in the '80s"),
  t("NBA", "Paul Pierce, Kevin Garnett, Ray Allen", "Boston Celtics", "Celtics, Boston", "2000s", "2008 champions"),
  t("NBA", "Magic Johnson, Kareem Abdul-Jabbar, James Worthy", "Los Angeles Lakers", "Lakers, LA Lakers", "1980s", "Showtime"),
  t("NBA", "Isiah Thomas, Joe Dumars, Bill Laimbeer", "Detroit Pistons", "Pistons, Detroit", "1980s", "The Bad Boys"),
  t("NFL", "Joe Montana, Jerry Rice, Ronnie Lott", "San Francisco 49ers", "49ers, Niners, San Francisco", "1980s", "Won Super Bowls XXIII and XXIV"),
  t("NFL", "Troy Aikman, Emmitt Smith, Michael Irvin", "Dallas Cowboys", "Cowboys, Dallas", "1990s", "Three Super Bowls in four years"),
  t("NFL", "Patrick Mahomes, Travis Kelce, Chris Jones", "Kansas City Chiefs", "Chiefs, Kansas City", "2020s", "Back-to-back Super Bowl champions"),
  t("NFL", "Terry Bradshaw, Franco Harris, Lynn Swann", "Pittsburgh Steelers", "Steelers, Pittsburgh", "1970s", "Four Super Bowls in six years"),
  t("NFL", "Russell Wilson, Marshawn Lynch, Richard Sherman", "Seattle Seahawks", "Seahawks, Seattle", "2010s", "The Legion of Boom"),
  t("NFL", "Peyton Manning, Marvin Harrison, Reggie Wayne", "Indianapolis Colts", "Colts, Indianapolis", "2000s", "Won Super Bowl XLI"),
  t("NFL", "Tom Brady, Rob Gronkowski, Julian Edelman", "New England Patriots", "Patriots, New England, Pats", "2010s", "Won three Super Bowls together"),
  t("MLB", "Derek Jeter, Mariano Rivera, Jorge Posada", "New York Yankees", "Yankees, New York", "1990s", "Part of the Core Four"),
  t("MLB", "David Ortiz, Manny Ramírez, Pedro Martínez", "Boston Red Sox", "Red Sox, Boston", "2000s", "Broke the curse in 2004"),
  t("MLB", "Greg Maddux, Tom Glavine, John Smoltz", "Atlanta Braves", "Braves, Atlanta", "1990s", "Won the 1995 World Series"),
  t("MLB", "Johnny Bench, Pete Rose, Joe Morgan", "Cincinnati Reds", "Reds, Cincinnati", "1970s", "The Big Red Machine"),
  t("MLB", "Jose Altuve, Alex Bregman, Carlos Correa", "Houston Astros", "Astros, Houston", "2010s", "Won the 2017 World Series"),
  t("MLB", "Mookie Betts, Freddie Freeman, Shohei Ohtani", "Los Angeles Dodgers", "Dodgers, LA Dodgers", "2020s", "Won the 2024 World Series"),
  t("NHL", "Wayne Gretzky, Mark Messier, Jari Kurri", "Edmonton Oilers", "Oilers, Edmonton", "1980s", "Four Stanley Cups in five years"),
  t("NHL", "Sidney Crosby, Evgeni Malkin, Kris Letang", "Pittsburgh Penguins", "Penguins, Pittsburgh, Pens", "2010s", "Back-to-back Cups in 2016 and 2017"),
  t("NHL", "Jonathan Toews, Patrick Kane, Duncan Keith", "Chicago Blackhawks", "Blackhawks, Chicago", "2010s", "Three Cups in six years"),
];

export const TRIO_POINTS = [100, 80, 60, 40, 20] as const;
export const trioForDay = (day: string) => dailyItem("trio", TRIOS, dayNumber(day));
export const trioHints = (p: Trio) => [`League: ${p.league}`, `Teammates in the ${p.decade}`, p.extra, `City starts with "${p.team[0]}"`];
export const isTrioAnswer = (p: Trio, typed: string) => namesMatch(typed, [p.team, ...p.aliases]);
