import { dailyItem, dayNumber, namesMatch } from "./daily-games";

export interface Nickname { nickname: string; name: string; aliases?: string[]; league: "NBA" | "NFL" | "MLB" | "NHL"; position: string; era: string; teams: string; award: string }

const n = (nickname: string, league: Nickname["league"], name: string, position: string, era: string, teams: string, award: string, aliases?: string[]): Nickname =>
  ({ nickname, league, name, position, era, teams, award, ...(aliases ? { aliases } : {}) });

/** Famous sports nicknames. Frozen, append-only: the daily deck order depends on this list. */
export const NICKNAMES: Nickname[] = [
  // NBA
  n("His Airness", "NBA", "Michael Jordan", "Guard", "1980s", "Bulls, Wizards", "6× Finals MVP", ["MJ", "Jordan"]),
  n("The Black Mamba", "NBA", "Kobe Bryant", "Guard", "1990s", "Lakers", "5× NBA champion", ["Kobe"]),
  n("King James", "NBA", "LeBron James", "Forward", "2000s", "Cavaliers, Heat, Lakers", "4× MVP", ["LeBron"]),
  n("The Answer", "NBA", "Allen Iverson", "Guard", "1990s", "76ers", "2001 MVP", ["AI"]),
  n("The Big Aristotle", "NBA", "Shaquille O'Neal", "Center", "1990s", "Magic, Lakers, Heat", "2000 MVP", ["Shaq"]),
  n("The Mailman", "NBA", "Karl Malone", "Forward", "1980s", "Jazz, Lakers", "2× MVP"),
  n("The Logo", "NBA", "Jerry West", "Guard", "1960s", "Lakers", "1969 Finals MVP"),
  n("Dr. J", "NBA", "Julius Erving", "Forward", "1970s", "76ers", "1981 MVP"),
  n("The Admiral", "NBA", "David Robinson", "Center", "1980s", "Spurs", "1995 MVP"),
  n("Larry Legend", "NBA", "Larry Bird", "Forward", "1970s", "Celtics", "3× MVP"),
  n("The Dream", "NBA", "Hakeem Olajuwon", "Center", "1980s", "Rockets, Raptors", "2× NBA champion", ["Hakeem"]),
  n("The Worm", "NBA", "Dennis Rodman", "Forward", "1980s", "Pistons, Spurs, Bulls", "2× Defensive Player of the Year"),
  n("The Big Fundamental", "NBA", "Tim Duncan", "Forward", "1990s", "Spurs", "5× NBA champion"),
  n("The Big Ticket", "NBA", "Kevin Garnett", "Forward", "1990s", "Timberwolves, Celtics, Nets", "2004 MVP", ["KG"]),
  n("The Glove", "NBA", "Gary Payton", "Guard", "1990s", "SuperSonics, Bucks, Lakers, Celtics, Heat", "1996 Defensive Player of the Year"),
  n("The Round Mound of Rebound", "NBA", "Charles Barkley", "Forward", "1980s", "76ers, Suns, Rockets", "1993 MVP", ["Barkley"]),
  n("The Glide", "NBA", "Clyde Drexler", "Guard", "1980s", "Trail Blazers, Rockets", "10× All-Star"),
  n("Half Man, Half Amazing", "NBA", "Vince Carter", "Guard", "1990s", "Raptors, Nets, Magic", "1999 Rookie of the Year"),
  n("Flash", "NBA", "Dwyane Wade", "Guard", "2000s", "Heat, Bulls, Cavaliers", "2006 Finals MVP", ["D-Wade"]),
  n("The Truth", "NBA", "Paul Pierce", "Forward", "1990s", "Celtics, Nets, Wizards, Clippers", "2008 Finals MVP"),
  n("T-Mac", "NBA", "Tracy McGrady", "Guard", "1990s", "Magic, Rockets", "2× scoring champion"),
  n("The Brow", "NBA", "Anthony Davis", "Forward/Center", "2010s", "Pelicans, Lakers, Mavericks", "2020 NBA champion", ["AD"]),
  n("The Iceman", "NBA", "George Gervin", "Guard", "1970s", "Spurs, Bulls", "4× scoring champion"),
  n("The Human Highlight Film", "NBA", "Dominique Wilkins", "Forward", "1980s", "Hawks, Clippers, Celtics, Spurs", "9× All-Star"),
  // NFL
  n("Sweetness", "NFL", "Walter Payton", "Running back", "1970s", "Bears", "Super Bowl XX champion"),
  n("Broadway Joe", "NFL", "Joe Namath", "Quarterback", "1960s", "Jets, Rams", "Super Bowl III MVP"),
  n("Beast Mode", "NFL", "Marshawn Lynch", "Running back", "2000s", "Bills, Seahawks, Raiders", "Super Bowl XLVIII champion"),
  n("Megatron", "NFL", "Calvin Johnson", "Wide receiver", "2000s", "Lions", "Record 1,964 receiving yards in 2012"),
  n("Prime Time", "NFL", "Deion Sanders", "Cornerback", "1980s", "Falcons, 49ers, Cowboys, Commanders, Ravens", "1994 Defensive Player of the Year"),
  n("The Minister of Defense", "NFL", "Reggie White", "Defensive end", "1980s", "Eagles, Packers, Panthers", "2× Defensive Player of the Year"),
  n("The Fridge", "NFL", "William Perry", "Defensive tackle", "1980s", "Bears, Eagles", "Super Bowl XX champion"),
  n("The Sheriff", "NFL", "Peyton Manning", "Quarterback", "1990s", "Colts, Broncos", "5× MVP"),
  n("Superman", "NFL", "Cam Newton", "Quarterback", "2010s", "Panthers, Patriots", "2015 MVP"),
  n("Gronk", "NFL", "Rob Gronkowski", "Tight end", "2010s", "Patriots, Buccaneers", "4× Super Bowl champion"),
  n("Cheetah", "NFL", "Tyreek Hill", "Wide receiver", "2010s", "Chiefs, Dolphins", "Super Bowl LIV champion"),
  // MLB
  n("The Bambino", "MLB", "Babe Ruth", "Outfield", "1910s", "Red Sox, Yankees, Braves", "714 career home runs", ["George Herman Ruth"]),
  n("Joltin' Joe", "MLB", "Joe DiMaggio", "Outfield", "1930s", "Yankees", "56-game hitting streak"),
  n("Mr. October", "MLB", "Reggie Jackson", "Outfield", "1960s", "Athletics, Yankees, Angels", "1977 World Series MVP", ["Reggie"]),
  n("The Iron Horse", "MLB", "Lou Gehrig", "First base", "1920s", "Yankees", "2,130 consecutive games"),
  n("The Say Hey Kid", "MLB", "Willie Mays", "Outfield", "1950s", "Giants, Mets", "2× MVP"),
  n("Big Papi", "MLB", "David Ortiz", "Designated hitter", "1990s", "Twins, Red Sox", "3× World Series champion", ["Papi"]),
  n("The Big Unit", "MLB", "Randy Johnson", "Pitcher", "1980s", "Expos, Mariners, Astros, Diamondbacks, Yankees, Giants", "5× Cy Young", ["Randy"]),
  n("The Kid", "MLB", "Ken Griffey Jr.", "Outfield", "1980s", "Mariners, Reds, White Sox", "1997 MVP", ["Ken Griffey", "Junior"]),
  n("Mr. Cub", "MLB", "Ernie Banks", "Shortstop", "1950s", "Cubs", "2× MVP"),
  n("Stan the Man", "MLB", "Stan Musial", "Outfield", "1940s", "Cardinals", "3× MVP"),
  n("The Ryan Express", "MLB", "Nolan Ryan", "Pitcher", "1960s", "Mets, Angels, Astros, Rangers", "7 career no-hitters"),
  n("The Rocket", "MLB", "Roger Clemens", "Pitcher", "1980s", "Red Sox, Blue Jays, Yankees, Astros", "7× Cy Young"),
  n("Charlie Hustle", "MLB", "Pete Rose", "Outfield", "1960s", "Reds, Phillies, Expos", "All-time hits leader"),
  n("The Georgia Peach", "MLB", "Ty Cobb", "Outfield", "1900s", "Tigers, Athletics", "12× batting champion"),
  n("The Man of Steal", "MLB", "Rickey Henderson", "Outfield", "1970s", "Athletics, Yankees, Blue Jays", "All-time stolen base leader", ["Rickey"]),
  n("The Big Hurt", "MLB", "Frank Thomas", "First base", "1980s", "White Sox, Athletics, Blue Jays", "2× MVP"),
  n("The Iron Man", "MLB", "Cal Ripken Jr.", "Shortstop", "1980s", "Orioles", "2,632 consecutive games", ["Cal Ripken", "Ripken"]),
  // NHL
  n("The Great One", "NHL", "Wayne Gretzky", "Center", "1970s", "Oilers, Kings, Blues, Rangers", "All-time points leader", ["Wayne"]),
  n("Super Mario", "NHL", "Mario Lemieux", "Center", "1980s", "Penguins", "3× MVP", ["Mario"]),
  n("Sid the Kid", "NHL", "Sidney Crosby", "Center", "2000s", "Penguins", "3× Stanley Cup champion", ["Sid"]),
  // Expansion batch (appended; earlier order preserved).
  n("The Greek Freak", "NBA", "Giannis Antetokounmpo", "Forward", "2010s", "Bucks", "2× MVP", ["Giannis"]),
  n("The Joker", "NBA", "Nikola Jokic", "Center", "2010s", "Nuggets", "3× MVP", ["Jokic"]),
  n("Baby-Faced Assassin", "NBA", "Stephen Curry", "Guard", "2000s", "Warriors", "2× MVP", ["Steph", "Curry"]),
  n("The Beard", "NBA", "James Harden", "Guard", "2000s", "Thunder, Rockets, Nets, 76ers, Clippers", "2018 MVP", ["Harden"]),
  n("Agent Zero", "NBA", "Gilbert Arenas", "Guard", "2000s", "Warriors, Wizards, Magic, Grizzlies", "3× All-Star", ["Arenas"]),
  n("The Process", "NBA", "Joel Embiid", "Center", "2010s", "76ers", "2023 MVP", ["Embiid"]),
  n("Chocolate Thunder", "NBA", "Darryl Dawkins", "Center", "1970s", "76ers, Nets, Jazz, Pistons", "Shattered two backboards in 1979", ["Dawkins"]),
  n("Ochocinco", "NFL", "Chad Johnson", "Wide receiver", "2000s", "Bengals, Patriots", "6× Pro Bowl", ["Chad Ochocinco"]),
  n("Joe Cool", "NFL", "Joe Montana", "Quarterback", "1970s", "49ers, Chiefs", "4× Super Bowl champion", ["Montana"]),
  n("The Bus", "NFL", "Jerome Bettis", "Running back", "1990s", "Rams, Steelers", "Super Bowl XL champion", ["Bettis"]),
  n("Mean Joe", "NFL", "Joe Greene", "Defensive tackle", "1960s", "Steelers", "4× Super Bowl champion", ["Mean Joe Greene"]),
  n("T.O.", "NFL", "Terrell Owens", "Wide receiver", "1990s", "49ers, Eagles, Cowboys, Bills, Bengals", "6× Pro Bowl", ["TO", "Owens"]),
  n("Night Train", "NFL", "Dick Lane", "Cornerback", "1950s", "Rams, Cardinals, Lions", "14 interceptions as a rookie", ["Night Train Lane"]),
  n("Hammerin' Hank", "MLB", "Hank Aaron", "Outfielder", "1950s", "Braves, Brewers", "755 home runs", ["Aaron"]),
  n("Pudge", "MLB", "Ivan Rodriguez", "Catcher", "1990s", "Rangers, Marlins, Tigers, Yankees, Astros, Nationals", "1999 AL MVP", ["I-Rod", "Carlton Fisk"]),
  n("The Splendid Splinter", "MLB", "Ted Williams", "Outfielder", "1930s", "Red Sox", "Last .400 hitter", ["Williams"]),
  n("The Freak", "MLB", "Tim Lincecum", "Pitcher", "2000s", "Giants, Angels", "2× Cy Young", ["Lincecum"]),
  n("The Captain", "MLB", "Derek Jeter", "Shortstop", "1990s", "Yankees", "5× World Series champion", ["Jeter"]),
  n("Donnie Baseball", "MLB", "Don Mattingly", "First baseman", "1980s", "Yankees", "1985 AL MVP", ["Mattingly"]),
  n("The Golden Jet", "NHL", "Bobby Hull", "Left wing", "1950s", "Blackhawks, Jets, Whalers", "610 NHL goals", ["Hull"]),
  n("The Russian Rocket", "NHL", "Pavel Bure", "Right wing", "1990s", "Canucks, Panthers, Rangers", "2× Rocket Richard Trophy", ["Bure"]),
  n("Mr. Hockey", "NHL", "Gordie Howe", "Right wing", "1940s", "Red Wings, Whalers", "6× Hart Trophy", ["Howe"]),
  n("The Finnish Flash", "NHL", "Teemu Selanne", "Right wing", "1990s", "Jets, Ducks, Sharks, Avalanche", "76-goal rookie season", ["Selanne"]),
  n("The Dominator", "NHL", "Dominik Hasek", "Goalie", "1990s", "Blackhawks, Sabres, Red Wings, Senators", "2× Hart Trophy", ["Hasek"]),
  n("The Great Eight", "NHL", "Alex Ovechkin", "Left wing", "2000s", "Capitals", "NHL career goals leader", ["Ovi", "Ovechkin"]),
];

export const NICKNAME_POINTS = [100, 70, 40, 15] as const;
export const nicknameForDay = (day: string) => dailyItem("nickname", NICKNAMES, dayNumber(day));
export const nicknameHints = (p: Nickname) => [`League: ${p.league}`, `Position: ${p.position}`, `Debuted in the ${p.era}`, `Teams: ${p.teams}`, p.award];
export const isNicknameAnswer = (p: Nickname, typed: string) => namesMatch(typed, [p.name, ...(p.aliases ?? [])]);
