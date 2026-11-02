export interface Top10 { title: string; league: string; unit: string; names: string[][] }
export const l = (title: string, league: string, unit: string, rows: string): Top10 =>
  ({ title, league, unit, names: rows.split(" | ").map((r) => r.split("=")) });
