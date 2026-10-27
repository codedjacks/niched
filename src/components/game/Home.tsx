import { useEffect, useState } from "react";
import { TIERS, TIER_ORDER, MAX_SCORE } from "@/game/scoring";
import { msUntilNextDaily } from "@/game/selection";
import type { Stats } from "@/game/storage";
import { TierBadge } from "./ui";
import { AccountNav } from "./AccountNav";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const GAMES = [
  { to: "/mystery", icon: "🕵️", name: "Mystery Athlete", blurb: "Guess the star in six clues" },
  { to: "/higher-lower", icon: "📈", name: "Higher / Lower", blurb: "Which career stat is bigger?" },
  { to: "/career-path", icon: "🧭", name: "Career Path", blurb: "Name the player from their teams" },
  { to: "/draft-day", icon: "🎤", name: "Draft Day", blurb: "Who went #1 overall?" },
  { to: "/nicknames", icon: "🏷️", name: "Nicknames", blurb: "Who goes by this name?" },
  { to: "/locker-number", icon: "👕", name: "Locker Number", blurb: "Who wore this number?" },
  { to: "/stat-line", icon: "📊", name: "Stat Line", blurb: "Whose season was this?" },
  { to: "/team-trio", icon: "🤝", name: "Team Trio", blurb: "Name the team of three teammates" },
] as const;

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function Home({ stats, streak, doneToday, todayScore, dailyAvailable = true, onDaily, onPractice, onViewToday }: {
  stats: Stats; streak: number; doneToday: boolean; todayScore: number | null;
  onDaily: () => void; onPractice: () => void; onViewToday: () => void;
  dailyAvailable?: boolean;
}) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const t = () => setLeft(msUntilNextDaily());
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-16 pt-12 sm:pt-20 lg:max-w-6xl lg:px-10">
      <AccountNav />
      <header className="animate-rise relative text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-secondary sm:text-sm sm:tracking-[0.3em]">★ Sports trivia arcade ★</p>
        <h1 className="mt-3 font-jersey text-6xl uppercase leading-none text-foreground [text-shadow:4px_4px_0_var(--primary)] sm:text-8xl lg:text-9xl">
          Niched
        </h1>
        <p className="mx-auto mt-5 max-w-xl font-sans text-base text-muted-foreground sm:text-lg">
          Daily sports games. Any right answer counts.
          The rarer it is, The more it's worth.
        </p>
      </header>

      <section aria-label="Choose a game" className="mt-10 grid animate-rise gap-4 [animation-delay:80ms] sm:grid-cols-2">
        {doneToday ? (
          <button onClick={onViewToday} className="rounded-lg border-2 border-primary bg-card px-6 py-6 text-left transition hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary sm:col-span-2">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">🏆 Daily Challenge · Final {todayScore}/{MAX_SCORE}</span>
            <span className="mt-1 block font-jersey text-2xl uppercase sm:text-3xl">View today's results ▸</span>
            <span className="mt-2 block font-sans text-sm text-muted-foreground">Next game in {left != null ? fmt(left) : "--:--:--"}</span>
          </button>
        ) : !dailyAvailable ? (
          <Button disabled variant="outline" className="h-auto whitespace-normal px-7 py-7 font-display text-xl uppercase sm:col-span-2">
            New daily questions coming soon
          </Button>
        ) : (
          <button autoFocus onClick={onDaily} className="rounded-lg bg-primary px-6 py-7 text-center text-primary-foreground shadow-pop-marker transition hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary sm:col-span-2">
            <span className="block text-4xl" aria-hidden>🏆</span>
            <span className="mt-2 block font-jersey text-3xl uppercase leading-tight sm:text-5xl">Play Daily Challenge</span>
            <span className="mt-2 block font-sans text-sm opacity-80">7 sports questions · same for everyone today</span>
          </button>
        )}
        {GAMES.map((g) => (
          <Link key={g.to} to={g.to} className="group flex items-center gap-4 rounded-lg border-2 border-border bg-card px-5 py-5 transition hover:-translate-y-1 hover:border-primary focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <span aria-hidden className="text-4xl">{g.icon}</span>
            <span>
              <span className="block font-jersey text-xl uppercase group-hover:text-primary sm:text-2xl">{g.name}</span>
              <span className="block font-sans text-sm text-muted-foreground">{g.blurb}</span>
            </span>
          </Link>
        ))}
        <button onClick={onPractice} className="group flex items-center gap-4 rounded-lg border-2 border-dashed border-border bg-card/70 px-5 py-5 text-left transition hover:-translate-y-1 hover:border-secondary focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-secondary">
          <span aria-hidden className="text-4xl">🎯</span>
          <span>
            <span className="block font-jersey text-xl uppercase group-hover:text-secondary sm:text-2xl">Practice</span>
            <span className="block font-sans text-sm text-muted-foreground">Unlimited rounds, no streak impact</span>
          </span>
        </button>
      </section>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start lg:gap-8">
      <div>
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
      </div>

      <section className="relative mt-6 animate-rise rounded-lg border-2 border-border bg-card p-6 [animation-delay:240ms]">
        <span aria-hidden className="tape -rotate-3" />
        <p className="absolute -right-1 -top-5 hidden font-hand text-xl text-secondary [transform:rotate(3deg)] sm:block">the playbook ↓</p>
        <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">How scoring works</h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground">
          Every valid answer earns points by rarity tier — from Common all the way up to Insane. The more obscure your answer, the more it's worth. 25 seconds per question. Max {MAX_SCORE}.
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
          "Insane" = the rarest picks in the league. Your single rarest answer each round is crowned The Nichest. Tiers come from how often real players give each answer, once a question has 25+ answers; until then they use our hand-graded guesses.
        </p>
      </section>
      </div>
    </main>
  );
}
