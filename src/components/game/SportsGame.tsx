import { useEffect, useState, type ReactNode } from "react";
import { GeoBackground } from "./ui";
import { dateKey } from "@/game/selection";
import { loadGame, recordGame, saveGame, type GameProgress } from "@/game/daily-games";

/** Page frame shared by the daily sports mini-games. */
export function GameFrame({ note, title, subtitle, children }: { note: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="stadium-glow min-h-screen">
      <GeoBackground />
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0 z-50 opacity-40" />
      <main className="relative mx-auto max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
        <div className="arcade-panel inline-flex items-center gap-2 rounded-md px-3 py-1">
          <span aria-hidden className="h-2 w-2 rounded-full bg-primary animate-blink" />
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-secondary">{note}</p>
        </div>
        <h1 className="mt-4 font-jersey text-5xl uppercase leading-none text-foreground text-glow sm:text-7xl">{title}</h1>
        <p className="mt-5 max-w-lg font-sans text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

/** Event that remounts the current page with a fresh puzzle (see __root). */
export const REPLAY_EVENT = "niched:replay";

/** Unlimited play: each player gets their own random walk through a game's deck (no repeats until it cycles).
 * `day` is a per-play seed shaped like a date so existing seeded pickers work; only the Daily Challenge is shared. */
function playSeed(game: string): string {
  const k = `niched:seed:${game}`;
  let st: { base: number; n: number } | null = null;
  try { st = JSON.parse(localStorage.getItem(k) ?? "null"); } catch { /* ignore */ }
  if (!st || typeof st.base !== "number") st = { base: Math.floor(Math.random() * 40000), n: 0 };
  try { localStorage.setItem(k, JSON.stringify(st)); } catch { /* storage unavailable */ }
  return new Date(Date.UTC(2000, 0, 1) + (st.base + st.n) * 864e5).toISOString().slice(0, 10);
}
function advanceSeed(game: string) {
  const k = `niched:seed:${game}`;
  try { const st = JSON.parse(localStorage.getItem(k) ?? "null"); if (st) localStorage.setItem(k, JSON.stringify({ ...st, n: st.n + 1 })); } catch { /* ignore */ }
}

export function useDailyGame(game: string) {
  const [day, setDay] = useState("");
  const [progress, setProgress] = useState<GameProgress>({ best: 0, streak: 0 });
  useEffect(() => { setDay(playSeed(game)); setProgress(loadGame(game)); }, [game]);
  const finish = (score: number) => {
    const today = dateKey();
    const prev = loadGame(game);
    const next = prev.day === today
      ? { ...prev, score, best: Math.max(prev.best, score) }
      : recordGame(prev, today, score);
    saveGame(game, next);
    advanceSeed(game);
    setProgress(next);
  };
  return { day, progress, doneToday: false, finish };
}

export function ResultCard({ score, max, progress, share }: { score: number; max: number; progress: GameProgress; share: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="animate-rise arcade-panel mt-6 rounded-lg p-6" role="status">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Final score</p>
      <p className="mt-1 font-display text-5xl font-black text-primary led-glow tabular-nums">{score}<span className="text-xl text-muted-foreground">/{max}</span></p>
      <p className="mt-2 font-sans text-sm text-muted-foreground">Best {progress.best} · Streak {progress.streak} day{progress.streak === 1 ? "" : "s"}</p>
      <button
        onClick={() => navigator.clipboard?.writeText(share).then(() => setCopied(true)).catch(() => {})}
        className="mt-4 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm shimmer"
      >{copied ? "Copied!" : "Copy & share"}</button>
      <button autoFocus onClick={() => window.dispatchEvent(new Event(REPLAY_EVENT))}
        className="ml-3 mt-4 rounded-lg border-2 border-border px-5 py-3 font-display text-sm font-bold uppercase hover:border-primary"
      >Play again ▸</button>
    </section>
  );
}
