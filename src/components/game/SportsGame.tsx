import { useEffect, useState, type ReactNode } from "react";
import { GeoBackground } from "./ui";
import { dateKey } from "@/game/selection";
import { loadGame, recordGame, saveGame, type GameProgress } from "@/game/daily-games";

/** Page frame shared by the daily sports mini-games. */
export function GameFrame({ note, title, subtitle, children }: { note: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <>
      <GeoBackground />
      <main className="relative mx-auto max-w-3xl px-5 pb-16 pt-10 sm:pt-16">
        <p className="font-hand text-2xl text-secondary">{note}</p>
        <h1 className="mt-1 font-display text-4xl font-black uppercase leading-none sm:text-6xl">{title}<span className="text-primary">.</span></h1>
        <p className="mt-3 max-w-lg font-sans text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}

/** Today's key + saved progress for a mini-game (client-only to avoid hydration mismatch). */
export function useDailyGame(game: string) {
  const [day, setDay] = useState("");
  const [progress, setProgress] = useState<GameProgress>({ best: 0, streak: 0 });
  useEffect(() => { setDay(dateKey()); setProgress(loadGame(game)); }, [game]);
  const finish = (score: number) => {
    const next = recordGame(loadGame(game), day, score);
    saveGame(game, next);
    setProgress(next);
  };
  return { day, progress, doneToday: !!day && progress.day === day, finish };
}

export function ResultCard({ score, max, progress, share }: { score: number; max: number; progress: GameProgress; share: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="animate-rise mt-6 rounded-lg border-2 border-border bg-card p-6 shadow-pop-sm" role="status">
      <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Turned in for today</p>
      <p className="mt-1 font-display text-5xl font-black text-primary">{score}<span className="text-xl text-muted-foreground">/{max}</span></p>
      <p className="mt-2 font-sans text-sm text-muted-foreground">Best {progress.best} · Streak {progress.streak} day{progress.streak === 1 ? "" : "s"} · New one at midnight</p>
      <button
        onClick={() => navigator.clipboard?.writeText(share).then(() => setCopied(true)).catch(() => {})}
        className="mt-4 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm"
      >{copied ? "Copied!" : "Copy & share"}</button>
    </section>
  );
}
