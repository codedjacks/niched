import { useState } from "react";
import { useCountUp } from "@/game/hooks";
import { MAX_SCORE, TIERS, TIER_ORDER } from "@/game/scoring";
import type { Mode, RoundAnswer, TierId } from "@/game/types";
import { cn } from "@/lib/utils";
import { TierBadge } from "./ui";

export function buildShareText(answers: RoundAnswer[], mode: Mode, date: string) {
  const score = answers.reduce((s, a) => s + a.outcome.points, 0);
  const row = answers.map((a) => (a.outcome.kind === "correct" ? TIERS[a.outcome.tier].emoji : "⬛")).join("");
  return `Niched ${mode === "daily" ? date : "Practice"} — ${score}/${MAX_SCORE}\n${row}\nCan you find nichier answers?`;
}

export function Results({ answers, mode, date, streak, isNewBest, best, onAgain, onHome }: {
  answers: RoundAnswer[]; mode: Mode; date: string; streak: number; isNewBest: boolean; best: number;
  onAgain?: () => void; onHome: () => void;
}) {
  const score = answers.reduce((s, a) => s + a.outcome.points, 0);
  const shown = useCountUp(score, 1400);
  const [copied, setCopied] = useState(false);
  const rarestIdx = answers.reduce((bi, a, i) => (a.outcome.points > (answers[bi]?.outcome.points ?? 0) ? i : bi), -1);
  const counts = TIER_ORDER.map((t) => [t, answers.filter((a) => a.outcome.kind === "correct" && a.outcome.tier === t).length] as const).filter(([, n]) => n);

  const share = async () => {
    const text = buildShareText(answers, mode, date);
    try {
      if (navigator.share && /Mobi/.test(navigator.userAgent)) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* cancelled */ }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-secondary">{mode === "daily" ? `Daily · ${date}` : "Practice round"}</p>
      <div className="mt-3 flex items-end gap-3">
        <span className="font-display text-8xl font-black leading-none tabular-nums text-primary sm:text-9xl">{shown}</span>
        <span className="mb-2 font-display text-2xl font-bold text-muted-foreground">/ {MAX_SCORE}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {isNewBest && <span className="animate-pop rounded-full bg-primary px-3 py-1 font-display font-bold text-primary-foreground">New personal best!</span>}
        <span className="rounded-full bg-card px-3 py-1">Best: <b>{best}</b></span>
        {mode === "daily" && <span className="rounded-full bg-card px-3 py-1">Streak: <b>{streak}🔥</b></span>}
      </div>

      {counts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {counts.map(([t, n]) => (
            <span key={t} className="flex items-center gap-1.5"><TierBadge tier={t as TierId} /> <b className="font-display">×{n}</b></span>
          ))}
        </div>
      )}

      <ol className="mt-8 grid gap-2">
        {answers.map((a, i) => {
          const o = a.outcome;
          const rarest = i === rarestIdx && o.points > 0;
          return (
            <li key={i} style={{ animationDelay: `${i * 70}ms` }}
              className={cn("animate-rise flex items-center gap-4 rounded-2xl bg-card p-4", rarest && "ring-2 ring-primary")}>
              <span className="w-5 font-display text-sm font-bold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-muted-foreground">{a.prompt}{rarest && <span className="ml-2 font-bold text-primary">★ Rarest pick</span>}</div>
                <div className="truncate font-display text-lg font-bold">
                  {o.kind === "correct" ? o.display : <span className="text-muted-foreground">{o.kind === "timeout" ? "Time's up" : "Skipped"}</span>}
                </div>
              </div>
              {o.kind === "correct" && <TierBadge tier={o.tier} className="hidden sm:inline-flex" />}
              <span className="w-12 text-right font-display text-xl font-black tabular-nums">{o.points}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <button onClick={share} className="rounded-2xl bg-primary px-5 py-4 font-display font-black text-primary-foreground transition hover:brightness-110 active:scale-95 sm:col-span-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {copied ? "Copied! Send it to a friend" : "Challenge a friend — copy results"}
        </button>
        {onAgain && (
          <button onClick={onAgain} className="rounded-2xl border-2 border-border px-5 py-3 font-display font-bold hover:border-secondary sm:col-span-2 focus-visible:outline-2 focus-visible:outline-secondary">
            {mode === "daily" ? "Practice round" : "Play again"}
          </button>
        )}
        <button onClick={onHome} className={cn("rounded-2xl border-2 border-border px-5 py-3 font-display font-bold hover:border-secondary focus-visible:outline-2 focus-visible:outline-secondary", !onAgain && "sm:col-span-3")}>Home</button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground/70">Live head-to-head is coming later — for now, share your score and compare.</p>
    </main>
  );
}
