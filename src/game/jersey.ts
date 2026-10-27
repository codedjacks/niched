import { dailyItem, dayNumber, namesMatch } from "./daily-games";

export interface Jersey { league: "NBA" | "NFL" | "MLB" | "NHL"; number: number; team: string; name: string; aliases?: string[]; position: string; era: string; award: string }

const j = (league: Jersey["league"], number: number, team: string, name: string, position: string, era: string, award: string, aliases?: string[]): Jersey =>
  ({ league, number, team, name, position, era, award, ...(aliases ? { aliases } : {}) });

/** Iconic jersey numbers. Frozen, append-only: the daily deck order depends on this list. */
export const JERSEYS: Jersey[] = [
  // NBA
  j("NBA", 23, "Bulls", "Michael Jordan", "Guard", "1980s", "6× Finals MVP", ["MJ", "Jordan"]),
  j("NBA", 23, "Cavaliers", "LeBron James", "Forward", "2000s", "4× MVP", ["LeBron"]),
  j("NBA", 24, "Lakers", "Kobe Bryant", "Guard", "1990s", "5× NBA champion", ["Kobe"]),
  j("NBA", 34, "Lakers", "Shaquille O'Neal", "Center", "1990s", "2000 MVP", ["Shaq"]),
  j("NBA", 33, "Lakers", "Kareem Abdul-Jabbar", "Center", "1960s", "6× MVP", ["Kareem"]),
  j("NBA", 33, "Celtics", "Larry Bird", "Forward", "1970s", "3× MVP"),
  j("NBA", 6, "Celtics", "Bill Russell", "Center", "1950s", "11× NBA champion"),
  j("NBA", 32, "Jazz", "Karl Malone", "Forward", "1980s", "2× MVP"),
  j("NBA", 34, "Bucks", "Giannis Antetokounmpo", "Forward", "2010s", "2× MVP", ["Giannis", "Greek Freak"]),
  j("NBA", 3, "76ers", "Allen Iverson", "Guard", "1990s", "2001 MVP", ["AI"]),
  j("NBA", 3, "Heat", "Dwyane Wade", "Guard", "2000s", "2006 Finals MVP", ["D-Wade"]),
  j("NBA", 21, "Spurs", "Tim Duncan", "Forward", "1990s", "5× NBA champion"),
  j("NBA", 33, "Knicks", "Patrick Ewing", "Center", "1980s", "11× All-Star"),
  j("NBA", 15, "Nuggets", "Carmelo Anthony", "Forward", "2000s", "10× All-Star", ["Melo"]),
  j("NBA", 41, "Mavericks", "Dirk Nowitzki", "Forward", "1990s", "2007 MVP"),
  j("NBA", 11, "Rockets", "Yao Ming", "Center", "2000s", "8× All-Star", ["Yao"]),
  j("NBA", 34, "Rockets", "Hakeem Olajuwon", "Center", "1980s", "2× NBA champion", ["Hakeem"]),
  j("NBA", 91, "Bulls", "Dennis Rodman", "Forward", "1980s", "2× Defensive Player of the Year"),
  j("NBA", 30, "Warriors", "Stephen Curry", "Guard", "2000s", "2× MVP", ["Steph", "Steph Curry"]),
  j("NBA", 35, "Thunder", "Kevin Durant", "Forward", "2000s", "2014 MVP", ["KD"]),
  j("NBA", 21, "Hawks", "Dominique Wilkins", "Forward", "1980s", "9× All-Star"),
  // NFL
  j("NFL", 12, "Patriots", "Tom Brady", "Quarterback", "2000s", "7× Super Bowl champion", ["Brady"]),
  j("NFL", 12, "Packers", "Aaron Rodgers", "Quarterback", "2000s", "4× MVP"),
  j("NFL", 4, "Packers", "Brett Favre", "Quarterback", "1990s", "3× MVP", ["Favre"]),
  j("NFL", 18, "Colts", "Peyton Manning", "Quarterback", "1990s", "5× MVP"),
  j("NFL", 56, "Giants", "Lawrence Taylor", "Linebacker", "1980s", "3× Defensive Player of the Year", ["LT", "L.T."]),
  j("NFL", 16, "49ers", "Joe Montana", "Quarterback", "1970s", "3× Super Bowl MVP"),
  j("NFL", 34, "Bears", "Walter Payton", "Running back", "1970s", "Super Bowl XX champion"),
  j("NFL", 20, "Lions", "Barry Sanders", "Running back", "1980s", "1997 MVP"),
  j("NFL", 84, "Vikings", "Randy Moss", "Wide receiver", "1990s", "1998 Offensive Rookie of the Year"),
  j("NFL", 22, "Cowboys", "Emmitt Smith", "Running back", "1990s", "All-time rushing leader"),
  j("NFL", 15, "Chiefs", "Patrick Mahomes", "Quarterback", "2010s", "3× Super Bowl champion"),
  j("NFL", 13, "Dolphins", "Dan Marino", "Quarterback", "1980s", "1984 MVP"),
  j("NFL", 7, "Broncos", "John Elway", "Quarterback", "1980s", "2× Super Bowl champion"),
  j("NFL", 9, "Saints", "Drew Brees", "Quarterback", "2000s", "Super Bowl XLIV MVP"),
  j("NFL", 8, "Ravens", "Lamar Jackson", "Quarterback", "2010s", "2× MVP"),
  j("NFL", 12, "Bills", "Jim Kelly", "Quarterback", "1980s", "4 straight Super Bowls"),
  // MLB
  j("MLB", 2, "Yankees", "Derek Jeter", "Shortstop", "1990s", "5× World Series champion", ["Jeter"]),
  j("MLB", 99, "Yankees", "Aaron Judge", "Outfield", "2010s", "2022 MVP"),
  j("MLB", 42, "Yankees", "Mariano Rivera", "Pitcher", "1990s", "All-time saves leader"),
  j("MLB", 42, "Dodgers", "Jackie Robinson", "Second base", "1940s", "Only number retired by every MLB team"),
  j("MLB", 34, "Red Sox", "David Ortiz", "Designated hitter", "1990s", "3× World Series champion", ["Big Papi", "Papi"]),
  j("MLB", 24, "Mariners", "Ken Griffey Jr.", "Outfield", "1980s", "1997 MVP", ["Ken Griffey", "Junior"]),
  j("MLB", 27, "Angels", "Mike Trout", "Outfield", "2010s", "3× MVP"),
  j("MLB", 5, "Cardinals", "Albert Pujols", "First base", "2000s", "3× MVP"),
  j("MLB", 25, "Giants", "Barry Bonds", "Outfield", "1980s", "7× MVP"),
  j("MLB", 44, "Braves", "Hank Aaron", "Outfield", "1950s", "All-time record 755 home runs"),
  j("MLB", 14, "Reds", "Pete Rose", "Outfield", "1960s", "All-time hits leader"),
  j("MLB", 19, "Padres", "Tony Gwynn", "Outfield", "1980s", "8× batting champion"),
  j("MLB", 8, "Orioles", "Cal Ripken Jr.", "Shortstop", "1980s", "2,632 consecutive games", ["Cal Ripken", "Ripken"]),
  j("MLB", 34, "Rangers", "Nolan Ryan", "Pitcher", "1960s", "7 career no-hitters"),
  // NHL
  j("NHL", 99, "Oilers", "Wayne Gretzky", "Center", "1970s", "All-time points leader", ["Wayne"]),
  j("NHL", 66, "Penguins", "Mario Lemieux", "Center", "1980s", "3× MVP", ["Mario"]),
  j("NHL", 87, "Penguins", "Sidney Crosby", "Center", "2000s", "3× Stanley Cup champion", ["Sid"]),
];

export const JERSEY_POINTS = [100, 70, 40, 15] as const;
export const jerseyForDay = (day: string) => dailyItem("locker", JERSEYS, dayNumber(day));
export const jerseyHints = (p: Jersey) => [`League: ${p.league}`, `Position: ${p.position}`, `Debuted in the ${p.era}`, p.award];
export const isJerseyAnswer = (p: Jersey, typed: string) => namesMatch(typed, [p.name, ...(p.aliases ?? [])]);
