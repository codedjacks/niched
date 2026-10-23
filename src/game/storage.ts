import type { RoundAnswer } from "./types";

export interface Stats {
  lastDailyDate: string | null;
  streak: number;
  bestStreak: number;
  bestDaily: number;
  bestPractice: number;
  practiceGames: number;
  history: { date: string; score: number }[];
  todayAnswers: RoundAnswer[] | null;
}
const KEY = "niched:stats:v1";
export const emptyStats = (): Stats => ({
  lastDailyDate: null, streak: 0, bestStreak: 0, bestDaily: 0, bestPractice: 0,
  practiceGames: 0, history: [], todayAnswers: null,
});

export function loadStats(): Stats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyStats(), ...JSON.parse(raw) } : emptyStats();
  } catch {
    return emptyStats();
  }
}
export function saveStats(s: Stats) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function prevDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y!, m! - 1, d! - 1);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/** Pure: apply a finished daily round. Ignores replays of an already-completed day. */
export function recordDaily(s: Stats, date: string, score: number, answers: RoundAnswer[]): Stats {
  if (s.lastDailyDate === date) return s;
  const streak = s.lastDailyDate === prevDay(date) ? s.streak + 1 : 1;
  return {
    ...s,
    lastDailyDate: date,
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    bestDaily: Math.max(s.bestDaily, score),
    history: [{ date, score }, ...s.history].slice(0, 60),
    todayAnswers: answers,
  };
}
export function recordPractice(s: Stats, score: number): Stats {
  return { ...s, practiceGames: s.practiceGames + 1, bestPractice: Math.max(s.bestPractice, score) };
}
/** Streak shown to the user: broken if they missed yesterday. */
export function liveStreak(s: Stats, today: string) {
  return s.lastDailyDate === today || s.lastDailyDate === prevDay(today) ? s.streak : 0;
}
