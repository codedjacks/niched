import { hash, mulberry32 } from "./selection";

export interface HuddleGroup { label: string; members: string[]; level: 0 | 1 | 2 | 3 }
export interface HuddlePuzzle { id: string; groups: HuddleGroup[] }

/** Hand-written groups of four. Append-only. */
export const HUDDLES: HuddlePuzzle[] = [
  { id: "nba-1", groups: [
    { level: 0, label: "Born outside the U.S.", members: ["Dirk Nowitzki", "Giannis Antetokounmpo", "Nikola Jokic", "Luka Doncic"] },
    { level: 1, label: "Spurs champions", members: ["Tim Duncan", "Tony Parker", "Manu Ginobili", "Kawhi Leonard"] },
    { level: 2, label: "Played at Duke", members: ["Kyrie Irving", "Zion Williamson", "Grant Hill", "Jayson Tatum"] },
    { level: 3, label: "Wore #23", members: ["Michael Jordan", "LeBron James", "Anthony Davis", "Draymond Green"] },
  ] },
  { id: "nfl-1", groups: [
    { level: 0, label: "Quarterbacks", members: ["Tom Brady", "Patrick Mahomes", "Peyton Manning", "Eli Manning"] },
    { level: 1, label: "Wide receivers", members: ["Jerry Rice", "Randy Moss", "Calvin Johnson", "Larry Fitzgerald"] },
    { level: 2, label: "Running backs", members: ["Barry Sanders", "Emmitt Smith", "Walter Payton", "LaDainian Tomlinson"] },
    { level: 3, label: "Defenders", members: ["Lawrence Taylor", "Ray Lewis", "J.J. Watt", "Aaron Donald"] },
  ] },
  { id: "mlb-1", groups: [
    { level: 0, label: "Born in Japan", members: ["Shohei Ohtani", "Ichiro Suzuki", "Hideki Matsui", "Yu Darvish"] },
    { level: 1, label: "Pitchers", members: ["Clayton Kershaw", "Pedro Martinez", "Greg Maddux", "Randy Johnson"] },
    { level: 2, label: "500-homer club", members: ["Barry Bonds", "Hank Aaron", "Albert Pujols", "Ken Griffey Jr."] },
    { level: 3, label: "Yankees captains", members: ["Derek Jeter", "Thurman Munson", "Don Mattingly", "Aaron Judge"] },
  ] },
  { id: "mix-1", groups: [
    { level: 0, label: "Hockey", members: ["Wayne Gretzky", "Sidney Crosby", "Alex Ovechkin", "Connor McDavid"] },
    { level: 1, label: "Tennis", members: ["Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Djokovic"] },
    { level: 2, label: "Golf", members: ["Tiger Woods", "Jack Nicklaus", "Rory McIlroy", "Phil Mickelson"] },
    { level: 3, label: "Soccer", members: ["Lionel Messi", "Cristiano Ronaldo", "Pele", "Zinedine Zidane"] },
  ] },
  { id: "nba-2", groups: [
    { level: 0, label: "Lakers legends", members: ["Magic Johnson", "Kareem Abdul-Jabbar", "Kobe Bryant", "Shaquille O'Neal"] },
    { level: 1, label: "Celtics legends", members: ["Larry Bird", "Bill Russell", "Paul Pierce", "Kevin McHale"] },
    { level: 2, label: "Bulls of the '90s", members: ["Scottie Pippen", "Dennis Rodman", "Toni Kukoc", "Steve Kerr"] },
    { level: 3, label: "Warriors dynasty", members: ["Stephen Curry", "Klay Thompson", "Andre Iguodala", "Kevin Durant"] },
  ] },
  { id: "nba-3", groups: [
    { level: 0, label: "Centers", members: ["Hakeem Olajuwon", "David Robinson", "Patrick Ewing", "Dikembe Mutombo"] },
    { level: 1, label: "Point guards", members: ["John Stockton", "Steve Nash", "Chris Paul", "Jason Kidd"] },
    { level: 2, label: "Played at North Carolina", members: ["Vince Carter", "James Worthy", "Rasheed Wallace", "Antawn Jamison"] },
    { level: 3, label: "Played at Kentucky", members: ["Anthony Davis", "Devin Booker", "Karl-Anthony Towns", "John Wall"] },
  ] },
  { id: "nfl-2", groups: [
    { level: 0, label: "Patriots", members: ["Rob Gronkowski", "Julian Edelman", "Tedy Bruschi", "Vince Wilfork"] },
    { level: 1, label: "Steelers", members: ["Terry Bradshaw", "Franco Harris", "Troy Polamalu", "Ben Roethlisberger"] },
    { level: 2, label: "49ers", members: ["Joe Montana", "Steve Young", "Ronnie Lott", "Frank Gore"] },
    { level: 3, label: "Cowboys", members: ["Troy Aikman", "Michael Irvin", "Deion Sanders", "Tony Romo"] },
  ] },
  { id: "nfl-3", groups: [
    { level: 0, label: "Kickers", members: ["Adam Vinatieri", "Justin Tucker", "Morten Andersen", "Jason Elam"] },
    { level: 1, label: "Tight ends", members: ["Tony Gonzalez", "Travis Kelce", "Antonio Gates", "Shannon Sharpe"] },
    { level: 2, label: "Played at Alabama", members: ["Derrick Henry", "Julio Jones", "Tua Tagovailoa", "Joe Namath"] },
    { level: 3, label: "Played at USC", members: ["Marcus Allen", "Carson Palmer", "Troy Polamalu", "Junior Seau"] },
  ] },
  { id: "mlb-2", groups: [
    { level: 0, label: "Red Sox", members: ["David Ortiz", "Ted Williams", "Carl Yastrzemski", "Dustin Pedroia"] },
    { level: 1, label: "Cardinals", members: ["Stan Musial", "Bob Gibson", "Yadier Molina", "Ozzie Smith"] },
    { level: 2, label: "Catchers", members: ["Johnny Bench", "Mike Piazza", "Ivan Rodriguez", "Buster Posey"] },
    { level: 3, label: "Closers", members: ["Mariano Rivera", "Trevor Hoffman", "Dennis Eckersley", "Craig Kimbrel"] },
  ] },
  { id: "mlb-3", groups: [
    { level: 0, label: "Born in the Dominican Republic", members: ["Pedro Martinez", "Vladimir Guerrero", "Juan Soto", "Robinson Cano"] },
    { level: 1, label: "Born in Venezuela", members: ["Miguel Cabrera", "Felix Hernandez", "Ronald Acuna Jr.", "Jose Altuve"] },
    { level: 2, label: "Born in Puerto Rico", members: ["Roberto Clemente", "Carlos Beltran", "Francisco Lindor", "Yadier Molina"] },
    { level: 3, label: "Born in Cuba", members: ["Jose Abreu", "Yoenis Cespedes", "Aroldis Chapman", "Tony Perez"] },
  ] },
  { id: "nhl-1", groups: [
    { level: 0, label: "Oilers", members: ["Mark Messier", "Jari Kurri", "Leon Draisaitl", "Grant Fuhr"] },
    { level: 1, label: "Goalies", members: ["Patrick Roy", "Martin Brodeur", "Dominik Hasek", "Henrik Lundqvist"] },
    { level: 2, label: "Red Wings", members: ["Steve Yzerman", "Gordie Howe", "Nicklas Lidstrom", "Pavel Datsyuk"] },
    { level: 3, label: "Penguins", members: ["Mario Lemieux", "Evgeni Malkin", "Jaromir Jagr", "Kris Letang"] },
  ] },
  { id: "mix-2", groups: [
    { level: 0, label: "Boxers", members: ["Muhammad Ali", "Mike Tyson", "Floyd Mayweather", "Manny Pacquiao"] },
    { level: 1, label: "Sprinters", members: ["Usain Bolt", "Carl Lewis", "Florence Griffith Joyner", "Michael Johnson"] },
    { level: 2, label: "Swimmers", members: ["Michael Phelps", "Katie Ledecky", "Mark Spitz", "Ryan Lochte"] },
    { level: 3, label: "Gymnasts", members: ["Simone Biles", "Nadia Comaneci", "Mary Lou Retton", "Kohei Uchimura"] },
  ] },
  { id: "mix-3", groups: [
    { level: 0, label: "NASCAR", members: ["Dale Earnhardt", "Jeff Gordon", "Jimmie Johnson", "Richard Petty"] },
    { level: 1, label: "Formula 1", members: ["Lewis Hamilton", "Michael Schumacher", "Ayrton Senna", "Max Verstappen"] },
    { level: 2, label: "Tennis women", members: ["Steffi Graf", "Martina Navratilova", "Venus Williams", "Coco Gauff"] },
    { level: 3, label: "Golf majors winners", members: ["Ben Hogan", "Arnold Palmer", "Scottie Scheffler", "Gary Player"] },
  ] },
  { id: "mix-4", groups: [
    { level: 0, label: "Played MLB and NFL", members: ["Bo Jackson", "Brian Jordan", "Jim Thorpe", "Drew Henson"] },
    { level: 1, label: "WNBA stars", members: ["Diana Taurasi", "Sue Bird", "Candace Parker", "Caitlin Clark"] },
    { level: 2, label: "USWNT soccer", members: ["Mia Hamm", "Abby Wambach", "Megan Rapinoe", "Alex Morgan"] },
    { level: 3, label: "UFC champions", members: ["Georges St-Pierre", "Anderson Silva", "Jon Jones", "Ronda Rousey"] },
  ] },
];

export const HUDDLE_MISTAKES = 4;

export function huddleForDay(day: string): { puzzle: HuddlePuzzle; tiles: string[] } {
  const puzzle = HUDDLES[hash(`huddle:${day}`) % HUDDLES.length]!;
  const rand = mulberry32(hash(`huddle-tiles:${day}`));
  const tiles = puzzle.groups.flatMap((g) => g.members);
  for (let i = tiles.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [tiles[i], tiles[j]] = [tiles[j]!, tiles[i]!]; }
  return { puzzle, tiles };
}

/** Returns the group if all four picks belong to it. */
export function checkHuddle(p: HuddlePuzzle, picks: string[]): HuddleGroup | null {
  if (picks.length !== 4) return null;
  return p.groups.find((g) => picks.every((x) => g.members.includes(x))) ?? null;
}

/** 25 per group found, minus 5 per mistake. */
export const huddleScore = (found: number, mistakes: number) => Math.max(0, found * 25 - mistakes * 5);
