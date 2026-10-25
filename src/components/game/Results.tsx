import { useState } from "react";
import { useCountUp } from "@/game/hooks";
import { MAX_SCORE, TIERS, TIER_ORDER } from "@/game/scoring";
import type { Mode, RoundAnswer, TierId } from "@/game/types";
import { cn } from "@/lib/utils";
import { TierBadge } from "./ui";
import { RankStatus } from "./RankStatus";
import { ALL_QUESTIONS } from "@/game/questions";

export function buildShareText(answers: RoundAnswer[], mode: Mode, date: string, challengeName?: string) {
  const score = answers.reduce((s, a) => s + a.outcome.points, 0);
  const row = answers.map((a) => (a.outcome.kind === "correct" ? TIERS[a.outcome.tier].emoji : "⬛")).join("");
  return `Niched ${challengeName ? `${challengeName} Challenge` : mode === "daily" ? date : "Practice"} — ${score}/${MAX_SCORE}\n${row}\nCan you find nichier answers?`;
}

function gradeFor(score: number) {
  if (score >= 650) return "A+";
  if (score >= 550) return "A";
  if (score >= 450) return "B";
  if (score >= 300) return "C";
  if (score > 0) return "D";
  return "F";
}

export function Results({ answers, mode, date, challengeName, streak, isNewBest, best, onAgain, onHome }: {
  answers: RoundAnswer[]; mode: Mode; date: string; streak: number; isNewBest: boolean; best: number;
  challengeName?: string;
  onAgain?: () => void; onHome: () => void;
}) {
  const score = answers.reduce((s, a) => s + a.outcome.points, 0);
  const shown = useCountUp(score, 1400);
  const [copied, setCopied] = useState(false);
  const rarestIdx = answers.reduce((bi, a, i) => (a.outcome.points > (answers[bi]?.outcome.points ?? 0) ? i : bi), -1);
  const counts = TIER_ORDER.map((t) => [t, answers.filter((a) => a.outcome.kind === "correct" && a.outcome.tier === t).length] as const).filter(([, n]) => n);

  const share = async () => {
    const text = buildShareText(answers, mode, date, challengeName);
    try {
      if (navigator.share && /Mobi/.test(navigator.userAgent)) await navigator.share({ text });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* cancelled */ }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 pt-10 lg:max-w-4xl">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-secondary">
        {challengeName ? `${challengeName} · Report card` : mode === "daily" ? `Report card · ${date}` : "Practice round"}
      </p>
      <div className="mt-4 flex items-start gap-5">
        <div>
          <div className="flex items-end gap-3">
            <span className="font-display text-7xl font-bold leading-none tabular-nums text-primary sm:text-8xl">{shown}</span>
            <span className="mb-1 font-display text-xl font-bold text-muted-foreground">/ {MAX_SCORE}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 font-sans text-sm">
            {isNewBest && <span className="animate-pop -rotate-2 font-hand text-2xl font-bold text-secondary">new personal best!</span>}
            <span className="rounded-md border-2 border-border bg-card px-2.5 py-0.5">Best: <b className="font-display">{best}</b></span>
            {mode === "daily" && <span className="rounded-md border-2 border-border bg-card px-2.5 py-0.5">Streak: <b className="font-display">{streak}🔥</b></span>}
          </div>
        </div>
        {/* red-pen grade stamp */}
        <div aria-hidden className="ml-auto shrink-0">
          <div className="animate-stamp rounded-lg border-4 border-secondary px-4 py-2 font-display text-4xl font-bold uppercase text-secondary opacity-90 sm:text-5xl">
            {gradeFor(score)}
          </div>
        </div>
      </div>

      {counts.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2.5">
          {counts.map(([t, n]) => (
            <span key={t} className="flex items-center gap-1.5"><TierBadge tier={t as TierId} /> <b className="font-display text-sm">×{n}</b></span>
          ))}
        </div>
      )}

      {mode === "daily" && <RankStatus />}

      <ol className="relative mt-10 grid gap-3">
        {answers.map((a, i) => {
          const o = a.outcome;
          const rarest = i === rarestIdx && o.points > 0;
          const question = ALL_QUESTIONS.find((q) => q.id === a.questionId);
          const knownAnswers = question ? [...new Set([...question.answers.values()].map((answer) => answer.display))] : a.known ?? [];
          return (
            <li key={i} style={{ animationDelay: `${i * 70}ms` }}
              className={cn("ruled relative rounded-lg border-2 border-border bg-card p-4", rarest && "border-primary shadow-[4px_4px_0_0_var(--tier-valedictorian)]")}>
              <span aria-hidden className="tape -rotate-2 opacity-70" />
              <div className="flex items-center gap-4">
              <span className="w-5 font-display text-sm font-bold text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="break-words font-sans text-xs text-muted-foreground">
                  {a.prompt}
                  {rarest && <span className="ml-2 font-hand text-base font-bold text-primary">★ rarest pick!</span>}
                </div>
                <div className="break-words font-display text-base font-bold sm:text-lg">
                  {o.kind === "correct" ? o.display : <span className="text-muted-foreground">{o.kind === "timeout" ? "Time's up" : "Skipped"}</span>}
                </div>
              </div>
              {o.kind === "correct" && <TierBadge tier={o.tier} className="hidden sm:inline-flex" />}
              <span className="w-12 text-right font-display text-lg font-bold tabular-nums sm:text-xl">{o.points}</span>
              </div>
              {knownAnswers.length > 0 && <details open className="mt-4 border-t border-border pt-3">
                <summary className="cursor-pointer font-sans text-xs font-bold text-secondary">Known answers · {knownAnswers.length}</summary>
                <ul className="mt-3 flex max-h-48 flex-wrap gap-x-4 gap-y-2 overflow-y-auto font-sans text-xs leading-relaxed">
                  {knownAnswers.map((display) => <li key={display} className={cn("max-w-full break-words", o.kind === "correct" && o.display === display ? "font-bold text-primary" : "text-muted-foreground")}>{display}</li>)}
                </ul>
              </details>}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <button onClick={share} className="rounded-lg bg-primary px-5 py-4 font-display text-base font-bold uppercase text-primary-foreground shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop active:translate-y-0 active:shadow-pop-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:col-span-3">
          {copied ? "Copied! Send it to a friend" : "Copy results to share"}
        </button>
        {onAgain && (
          <button onClick={onAgain} className="rounded-lg border-2 border-border px-5 py-3 font-display text-sm font-bold uppercase hover:border-secondary focus-visible:outline-2 focus-visible:outline-secondary sm:col-span-2">
            {mode === "daily" ? "Practice round" : "Play again"}
          </button>
        )}
        <button onClick={onHome} className={cn("rounded-lg border-2 border-border px-5 py-3 font-display text-sm font-bold uppercase hover:border-secondary focus-visible:outline-2 focus-visible:outline-secondary", !onAgain && "sm:col-span-3")}>Home</button>
      </div>
      <p className="mt-5 text-center font-hand text-lg text-muted-foreground">want a real race? start a live head-to-head from the home page.</p>
    </main>
  );
}
