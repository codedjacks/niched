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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-16 pt-12 sm:pt-20">
      <header className="animate-rise relative">
        <p className="font-hand text-2xl text-secondary">the rarity trivia game — no homework today, just answers</p>
        {/* highlighter swipe behind the wordmark */}
        <div aria-hidden className="absolute left-0 top-6 hidden h-14 w-52 -skew-x-12 rounded-sm bg-primary/50 blur-[3px] sm:block sm:top-8 sm:h-20 sm:w-72" />
        <h1 className="relative mt-1 font-display text-6xl font-black uppercase leading-none tracking-tight text-foreground sm:text-8xl">
          Niched<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 max-w-lg font-sans text-base text-muted-foreground sm:text-lg">
          Seven questions. Any right answer counts — but the less common it is, the more it's worth.
        </p>
      </header>

      <section className="mt-10 grid animate-rise gap-4 [animation-delay:80ms]">
        {doneToday ? (
          <button onClick={onViewToday} className="group rounded-lg border-2 border-border bg-card px-7 py-6 text-left transition hover:-translate-y-0.5 hover:border-primary focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">Daily turned in · {todayScore}/{MAX_SCORE}</span>
            <span className="mt-1 block font-display text-2xl font-bold uppercase sm:text-3xl">View today's results ▸</span>
            <span className="mt-2 block font-sans text-sm text-muted-foreground">Next assignment in {left != null ? fmt(left) : "--:--:--"}</span>
          </button>
        ) : (
          <button autoFocus onClick={onDaily} className="group relative rounded-lg bg-primary px-7 py-7 text-left text-primary-foreground shadow-pop-marker transition hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--secondary)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span className="font-display text-xs font-bold uppercase tracking-widest opacity-80">Today's assignment · not turned in</span>
            <span className="mt-1 block font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">Start Daily Challenge ▸</span>
            <span className="mt-2 block font-sans text-sm opacity-80">Same 7 questions for everyone today</span>
          </button>
        )}
        <div className="relative rounded-lg border-2 border-dashed border-border bg-card/70 px-6 py-4">
          <span aria-hidden className="tape" />
          <button onClick={onPractice} className="w-full text-left font-display text-base font-bold uppercase transition hover:text-primary focus-visible:outline-2 focus-visible:outline-secondary sm:text-lg">
            Practice Mode <span className="font-sans text-sm font-normal normal-case text-muted-foreground">— unlimited random rounds, no streak impact</span>
          </button>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3 animate-rise [animation-delay:160ms]">
        {[
          ["Streak", `${streak}🔥`],
          ["Best daily", stats.bestDaily || "—"],
          ["Best practice", stats.bestPractice || "—"],
        ].map(([k, v]) => (
          <div key={k as string} className="ruled rounded-lg border-2 border-border bg-card p-4">
            <div className="font-sans text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-xl font-bold sm:text-2xl">{v}</div>
          </div>
        ))}
      </section>

      <section className="relative mt-12 animate-rise rounded-lg border-2 border-border bg-card p-6 [animation-delay:240ms]">
        <span aria-hidden className="tape -rotate-3" />
        <p className="absolute -right-1 -top-5 hidden font-hand text-xl text-secondary [transform:rotate(3deg)] sm:block">the cheat sheet ↓</p>
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">How scoring works</h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Every valid answer earns points by rarity tier — from a plain Pencil up to Valedictorian. The more obscure your answer, the more it's worth. 25 seconds per question. Max {MAX_SCORE}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {TIER_ORDER.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-md border-2 border-border bg-background py-1 pl-2 pr-3">
              <TierBadge tier={t} />
              <span className="font-display text-sm font-bold">{TIERS[t].points}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 font-hand text-lg leading-tight text-muted-foreground">
          "Valedictorian" = the rarest picks in the class. Tiers are hand-graded for now, not live player stats.
        </p>
      </section>
    </main>
  );
}
