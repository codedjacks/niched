import { useEffect, useState } from "react";
import { TIERS, TIER_ORDER, MAX_SCORE } from "@/game/scoring";
import { msUntilNextDaily } from "@/game/selection";
import type { Stats } from "@/game/storage";
import { TierBadge } from "./ui";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function Home({ stats, streak, doneToday, todayScore, onDaily, onPractice, onViewToday }: {
  stats: Stats; streak: number; doneToday: boolean; todayScore: number | null;
  onDaily: () => void; onPractice: () => void; onViewToday: () => void;
}) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = () => setLeft(msUntilNextDaily());
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:py-16">
      <header className="animate-rise">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-secondary">The rarity trivia game</p>
        <h1 className="mt-3 font-display text-7xl font-black leading-none tracking-tight sm:text-9xl">
          Niched<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">
          Seven questions. Any right answer counts — but the less common it is, the more it's worth.
        </p>
      </header>

      <section className="mt-10 grid gap-3 animate-rise [animation-delay:80ms]">
        {doneToday ? (
          <button onClick={onViewToday} className="group rounded-3xl bg-primary p-7 text-left text-primary-foreground transition hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="font-display text-sm font-bold uppercase tracking-widest opacity-70">Daily done · {todayScore}/{MAX_SCORE}</span>
            <span className="mt-1 block font-display text-3xl font-black sm:text-4xl">View today's results →</span>
            <span className="mt-2 block text-sm opacity-70">Next challenge in {left != null ? fmt(left) : "--:--:--"}</span>
          </button>
        ) : (
          <button autoFocus onClick={onDaily} className="group rounded-3xl bg-primary p-7 text-left text-primary-foreground shadow-[0_20px_60px_-20px_var(--primary)] transition hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="font-display text-sm font-bold uppercase tracking-widest opacity-70">Today · not played</span>
            <span className="mt-1 block font-display text-4xl font-black sm:text-5xl">Start Daily Challenge →</span>
            <span className="mt-2 block text-sm opacity-70">Same 7 questions for everyone today</span>
          </button>
        )}
        <button onClick={onPractice} className="rounded-2xl border-2 border-border bg-card px-6 py-4 text-left font-display text-lg font-bold transition hover:border-secondary focus-visible:outline-2 focus-visible:outline-secondary">
          Practice Mode <span className="font-sans text-sm font-normal text-muted-foreground">— unlimited random rounds, no streak impact</span>
        </button>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3 animate-rise [animation-delay:160ms]">
        {[
          ["Streak", `${streak}🔥`],
          ["Best daily", stats.bestDaily || "—"],
          ["Best practice", stats.bestPractice || "—"],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-card p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-2xl font-black">{v}</div>
          </div>
        ))}
      </section>

      <section className="mt-10 animate-rise [animation-delay:240ms]">
        <h2 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">How scoring works</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every valid answer earns points by rarity tier — from a plain Pencil up to Valedictorian. The more obscure your answer, the more it's worth. 25 seconds per question. Max {MAX_SCORE}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TIER_ORDER.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3">
              <TierBadge tier={t} />
              <span className="font-display text-sm font-bold">{TIERS[t].points}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground/70">
          "Valedictorian" = the rarest picks in the class. Rarity tiers are hand-curated for now, not live player stats.
        </p>
      </section>
    </main>
  );
}
