import { seededShuffle } from "./daily-games";

export interface Stat { group: string; name: string; value: number }

/** Settled career totals only (retired players / fixed records), so answers never go stale. */
const RAW: Record<string, [string, number][]> = {
  "NBA career points": [["Kareem Abdul-Jabbar", 38387], ["Karl Malone", 36928], ["Kobe Bryant", 33643], ["Michael Jordan", 32292], ["Dirk Nowitzki", 31560], ["Wilt Chamberlain", 31419], ["Shaquille O'Neal", 28596], ["Tim Duncan", 26496], ["Larry Bird", 21791], ["Magic Johnson", 17707]],
  "MLB career home runs": [["Barry Bonds", 762], ["Hank Aaron", 755], ["Babe Ruth", 714], ["Albert Pujols", 703], ["Alex Rodriguez", 696], ["Willie Mays", 660], ["Ken Griffey Jr.", 630], ["Derek Jeter", 260], ["Mickey Mantle", 536], ["Ted Williams", 521]],
  "NHL career goals": [["Wayne Gretzky", 894], ["Gordie Howe", 801], ["Jaromir Jagr", 766], ["Brett Hull", 741], ["Mario Lemieux", 690], ["Steve Yzerman", 692], ["Mark Messier", 694], ["Bobby Orr", 270]],
  "Grand Slam singles titles": [["Margaret Court", 24], ["Serena Williams", 23], ["Rafael Nadal", 22], ["Roger Federer", 20], ["Pete Sampras", 14], ["Martina Navratilova", 18], ["Bjorn Borg", 11], ["Andre Agassi", 8], ["Andy Murray", 3]],
  "Olympic gold medals": [["Michael Phelps", 23], ["Carl Lewis", 9], ["Usain Bolt", 8], ["Mark Spitz", 9], ["Simone Biles", 7], ["Katie Ledecky", 9], ["Jesse Owens", 4], ["Nadia Comaneci", 5]],
  "Golf major championships": [["Jack Nicklaus", 18], ["Tiger Woods", 15], ["Walter Hagen", 11], ["Ben Hogan", 9], ["Gary Player", 9], ["Arnold Palmer", 7], ["Phil Mickelson", 6], ["Rory McIlroy", 5]],
};
export const STATS: Stat[] = Object.entries(RAW).flatMap(([group, rows]) => rows.map(([name, value]) => ({ group, name, value })));

export const HL_ROUNDS = 10;
export interface HLPair { group: string; a: Stat; b: Stat }

/** Ten same-group pairs with different values, identical for everyone on a given day. */
export function pairsForDay(day: string): HLPair[] {
  const groups = seededShuffle(`hl-groups:${day}`, Object.keys(RAW));
  const out: HLPair[] = [];
  for (let i = 0; out.length < HL_ROUNDS; i++) {
    const group = groups[i % groups.length]!;
    const [a, b] = seededShuffle(`hl:${day}:${i}`, STATS.filter((s) => s.group === group));
    if (a && b && a.value !== b.value) out.push({ group, a, b });
  }
  return out;
}

export const isHigher = (p: HLPair, choice: "a" | "b") => (choice === "a" ? p.a.value > p.b.value : p.b.value > p.a.value);
