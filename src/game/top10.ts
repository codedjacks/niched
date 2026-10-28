import { dailyItem, dayNumber, looseMatch } from "./daily-games";

export interface Top10 { title: string; league: string; unit: string; names: string[][] }
const l = (title: string, league: string, unit: string, rows: string): Top10 =>
  ({ title, league, unit, names: rows.split(" | ").map((r) => r.split("=")) });

/** Hand-picked all-time lists (order = rank 1..10). Append-only: the daily deck depends on this order. */
export const TOP10: Top10[] = [
  l("MLB career home runs", "MLB", "HR", "Barry Bonds | Hank Aaron | Babe Ruth | Albert Pujols | Alex Rodriguez=A-Rod | Willie Mays | Ken Griffey Jr.=Ken Griffey=Griffey | Jim Thome | Sammy Sosa | Frank Robinson"),
  l("NFL career rushing yards", "NFL", "yards", "Emmitt Smith | Walter Payton | Frank Gore | Barry Sanders | Adrian Peterson=AP | Curtis Martin | LaDainian Tomlinson=LT | Jerome Bettis | Eric Dickerson | Tony Dorsett"),
  l("NHL career goals", "NHL", "goals", "Alex Ovechkin=Ovi | Wayne Gretzky | Gordie Howe | Jaromir Jagr | Brett Hull | Marcel Dionne | Phil Esposito | Mike Gartner | Mark Messier | Steve Yzerman"),
  l("NBA career rebounds", "NBA", "rebounds", "Wilt Chamberlain | Bill Russell | Kareem Abdul-Jabbar=Kareem | Elvin Hayes | Moses Malone | Tim Duncan | Karl Malone | Robert Parish | Kevin Garnett=KG | Dwight Howard"),
  l("Men's World Cup career goals", "Soccer", "goals", "Miroslav Klose | Ronaldo=Ronaldo Nazario | Gerd Muller | Just Fontaine | Lionel Messi=Messi | Kylian Mbappe=Mbappe | Pele | Sandor Kocsis | Jurgen Klinsmann | Helmut Rahn"),
];

export const TOP10_SECONDS = 90;
/** Rank r (1..10) is worth 2r points — the deep cuts at the bottom pay the most. Max 110. */
export const top10Points = (rank: number) => rank * 2;
export const TOP10_MAX = 110;
export const top10ForDay = (day: string) => dailyItem("top10", TOP10, dayNumber(day));
/** Index of the slot the typed name fills, or -1. */
export const top10Slot = (list: Top10, typed: string, found: number[]) =>
  list.names.findIndex((n, i) => !found.includes(i) && looseMatch(typed, n));
