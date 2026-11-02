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
  // Expansion batch (appended; earlier order preserved).
  t("NBA", "Kevin Durant, Russell Westbrook, James Harden", "Oklahoma City Thunder", "Thunder, OKC", "2010s", "Reached the 2012 Finals"),
  t("NBA", "Shaquille O'Neal, Kobe Bryant, Derek Fisher", "Los Angeles Lakers", "Lakers, LA Lakers", "2000s", "Three-peat from 2000 to 2002"),
  t("NBA", "Hakeem Olajuwon, Clyde Drexler, Sam Cassell", "Houston Rockets", "Rockets, Houston", "1990s", "1995 champions as a sixth seed"),
  t("NBA", "Giannis Antetokounmpo, Khris Middleton, Jrue Holiday", "Milwaukee Bucks", "Bucks, Milwaukee", "2020s", "2021 champions"),
  t("NBA", "Nikola Jokic, Jamal Murray, Aaron Gordon", "Denver Nuggets", "Nuggets, Denver", "2020s", "2023 champions"),
  t("NBA", "Jayson Tatum, Jaylen Brown, Jrue Holiday", "Boston Celtics", "Celtics, Boston", "2020s", "2024 champions"),
  t("NBA", "Shai Gilgeous-Alexander, Jalen Williams, Chet Holmgren", "Oklahoma City Thunder", "Thunder, OKC", "2020s", "2025 champions"),
  t("NFL", "Tom Brady, Mike Evans, Rob Gronkowski", "Tampa Bay Buccaneers", "Buccaneers, Bucs, Tampa Bay", "2020s", "Won Super Bowl LV in their home stadium"),
  t("NFL", "Jalen Hurts, A.J. Brown, Saquon Barkley", "Philadelphia Eagles", "Eagles, Philadelphia", "2020s", "Won Super Bowl LIX"),
  t("NFL", "Matthew Stafford, Cooper Kupp, Aaron Donald", "Los Angeles Rams", "Rams, LA Rams", "2020s", "Won Super Bowl LVI"),
  t("NFL", "Ray Lewis, Ed Reed, Terrell Suggs", "Baltimore Ravens", "Ravens, Baltimore", "2000s", "Won Super Bowl XLVII in 2013"),
  t("NFL", "Joe Burrow, Ja'Marr Chase, Tee Higgins", "Cincinnati Bengals", "Bengals, Cincinnati", "2020s", "Reached Super Bowl LVI"),
  t("MLB", "Buster Posey, Madison Bumgarner, Pablo Sandoval", "San Francisco Giants", "Giants, San Francisco", "2010s", "Three titles in five years"),
  t("MLB", "Kris Bryant, Anthony Rizzo, Javier Baez", "Chicago Cubs", "Cubs, Chicago", "2010s", "Ended a 108-year title drought in 2016"),
  t("MLB", "Mike Trout, Shohei Ohtani, Anthony Rendon", "Los Angeles Angels", "Angels, LA Angels", "2020s", "Never reached the playoffs together"),
  t("MLB", "Albert Pujols, Yadier Molina, Adam Wainwright", "St. Louis Cardinals", "Cardinals, St. Louis", "2000s", "Won the 2006 and 2011 World Series"),
  t("NHL", "Patrick Roy, Joe Sakic, Peter Forsberg", "Colorado Avalanche", "Avalanche, Avs, Colorado", "1990s", "Won the 1996 Stanley Cup"),
  t("NHL", "Steve Yzerman, Sergei Fedorov, Nicklas Lidstrom", "Detroit Red Wings", "Red Wings, Detroit", "1990s", "Back-to-back Cups in 1997 and 1998"),
  t("NHL", "Nikita Kucherov, Steven Stamkos, Andrei Vasilevskiy", "Tampa Bay Lightning", "Lightning, Tampa Bay", "2020s", "Back-to-back Cups in 2020 and 2021"),
  t("NHL", "Connor McDavid, Leon Draisaitl, Evan Bouchard", "Edmonton Oilers", "Oilers, Edmonton", "2020s", "Back-to-back Final trips in 2024 and 2025"),
];

export const TRIO_POINTS = [100, 80, 60, 40, 20] as const;
export const trioForDay = (day: string) => dailyItem("trio", TRIOS, dayNumber(day));
export const trioHints = (p: Trio) => [`League: ${p.league}`, `Teammates in the ${p.decade}`, p.extra, `City starts with "${p.team[0]}"`];
export const isTrioAnswer = (p: Trio, typed: string) => namesMatch(typed, [p.team, ...p.aliases]);
