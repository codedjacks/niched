import { useCallback, useEffect, useRef, useState } from "react";
import { useCountdown, useCountUp } from "@/game/hooks";
import { useServerFn } from "@tanstack/react-start";
import { validateAnswer, normalize, curatedRarity, TIERS, TIER_ORDER, type RaritySource } from "@/game/scoring";
import { judgeAnswer } from "@/game/judge.functions";
import type { Mode, Outcome, Question, RoundAnswer } from "@/game/types";
import { cn } from "@/lib/utils";
import { Progress, TierBadge } from "./ui";

export const SECONDS = 25;

export function Play({ questions, mode, rarity = curatedRarity, onDone, onQuit, onAnswered, opponent }: {
  questions: Question[]; mode: Mode; rarity?: RaritySource; onDone: (a: RoundAnswer[]) => void; onQuit: () => void;
  /** Fires once per question with what the player typed (null for skip/timeout). */
  onAnswered?: (index: number, typed: string | null) => void;
  /** Live opponent status in a head-to-head round. */
  opponent?: { name: string; avatar: string; score: number; answered: number };
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<RoundAnswer[]>([]);
  const [revealing, setRevealing] = useState<Outcome | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [checking, setChecking] = useState(false);
  const judge = useServerFn(judgeAnswer);
  const tried = useRef(new Set<string>());
  const locked = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const q = questions[idx]!;

  const score = answers.reduce((s, a) => s + a.outcome.points, 0);
  const shown = useCountUp(score, 700);

  const finish = useCallback((o: Outcome) => {
    if (locked.current) return;
    locked.current = true;
    setRevealing(o);
    setAnswers((prev) => [...prev, { questionId: q.id, prompt: q.prompt, outcome: o }]);
    onAnswered?.(idx, o.kind === "correct" ? o.typed ?? o.display : null);
  }, [q, idx, onAnswered]);

  const left = useCountdown(SECONDS, !revealing, idx, () => finish({ kind: "timeout", points: 0 }));

  const next = useCallback(() => {
    if (!revealing) return;
    if (idx + 1 >= questions.length) return onDone(answers);
    setIdx(idx + 1);
    setRevealing(null);
    setValue("");
    setError(null);
    tried.current = new Set();
    locked.current = false;
  }, [revealing, idx, questions.length, answers, onDone]);

  useEffect(() => {
    if (!revealing) inputRef.current?.focus();
  }, [revealing, idx]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (locked.current || checking) return;
    const v = validateAnswer(q, value, tried.current, rarity);
    if (v.ok) return finish({ kind: "correct", display: v.display, tier: v.tier, points: v.points, didYouMean: v.didYouMean, typed: value.trim() });
    const raw = value;
    const fail = (msg: string) => { setError(msg); setShakeKey((k) => k + 1); setValue(""); };
    if (v.reason === "empty") return fail("Type an answer first");
    if (v.reason === "duplicate") return fail("Already tried that one");
    tried.current.add(normalize(raw));
    // Not on the curated list exactly — ask the AI referee.
    setChecking(true);
    setError(null);
    const qid = q.id;
    try {
      const r = await judge({ data: { questionId: qid, answer: raw } });
      if (locked.current || qid !== questions[idx]?.id) return;
      if (r.ok) {
        const tier = rarity.tierFor(q, normalize(r.display), r.tier);
        return finish({ kind: "correct", display: r.display, tier, points: TIERS[tier].points, didYouMean: normalize(r.display) !== normalize(raw), typed: raw.trim() });
      }
      fail(r.message);
    } catch {
      fail("Answer checker is busy — try another answer");
    } finally {
      setChecking(false);
    }
  };

  const pct = (left / SECONDS) * 100;
  const urgent = left <= 5;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onQuit} className="font-sans text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">← Quit</button>
        {opponent ? (
          <span className="flex items-center gap-2 rounded-md border-2 border-secondary bg-card px-2.5 py-1 font-sans text-xs" aria-live="polite">
            <span aria-hidden>{opponent.avatar}</span>
            <b className="max-w-24 truncate">{opponent.name}</b>
            <b className="font-display text-secondary tabular-nums">{opponent.score}</b>
            <span className="text-muted-foreground">Q{Math.min(opponent.answered + 1, 7)}</span>
          </span>
        ) : (
          <span className="font-display text-xs font-bold uppercase tracking-widest text-secondary">{mode === "daily" ? "Daily Challenge" : "Practice"}</span>
        )}
        <div className="relative font-display text-xl font-bold tabular-nums sm:text-2xl" aria-live="polite">
          {shown}
          <span className="text-xs text-muted-foreground">/700</span>
          {revealing && revealing.points > 0 && (
            <span className="absolute -top-2 right-0 animate-float-up font-hand text-xl text-primary">+{revealing.points}</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Progress current={idx} results={answers.map((a) => (a.outcome.kind === "correct" ? a.outcome.tier : null))} />
      </div>

      <div key={idx} className="relative mt-8 animate-rise rounded-lg border-2 border-border bg-card p-7 sm:p-10">
        <span aria-hidden className="tape" />
        <div className="flex items-center justify-between font-sans text-sm text-muted-foreground">
          <span className="font-display font-bold">{idx + 1} <span className="opacity-50">/ 7</span></span>
          <span className="-rotate-1 rounded-md border-2 border-border bg-muted px-2.5 py-0.5 text-xs uppercase tracking-wider">{q.category}</span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold leading-snug sm:text-4xl">{q.prompt}</h2>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted" role="timer" aria-label={`${Math.ceil(left)} seconds left`}>
          <div className={cn("h-full rounded-full transition-[width] duration-100 ease-linear", urgent ? "bg-destructive" : "bg-primary")} style={{ width: `${pct}%` }} />
        </div>
        <div className={cn("mt-2 text-right font-display text-sm font-bold tabular-nums", urgent ? "text-destructive" : "text-muted-foreground")}>{Math.ceil(left)}s</div>
      </div>

      <div className="mt-6 min-h-[180px]">
        {revealing ? (
          <Reveal key={idx} o={revealing} last={idx + 1 >= questions.length} onNext={next} />
        ) : (
          <form onSubmit={submit} className="animate-rise">
            <label htmlFor="answer" className="sr-only">Your answer</label>
            <div key={shakeKey} className={cn("flex gap-2", shakeKey > 0 && "animate-shake")}>
              <input
                id="answer"
                ref={inputRef}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(null); }}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={60}
                placeholder="Think niche…"
                aria-invalid={!!error}
                aria-describedby="answer-msg"
                className="min-w-0 flex-1 rounded-lg border-2 border-border bg-background px-5 py-4 font-sans text-lg font-bold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary"
              />
              <button type="submit" disabled={checking} className="rounded-lg bg-primary px-6 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop active:translate-y-0 active:shadow-pop-sm disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {checking ? "Grading…" : "Submit"}
              </button>
            </div>
            <div id="answer-msg" className="mt-3 flex items-center justify-between gap-4 font-sans text-sm" aria-live="assertive">
              <span className={error ? "text-destructive" : "text-muted-foreground"}>{checking ? "The teacher is grading your answer…" : error ?? "Press Enter to submit. Wrong guesses can be retried."}</span>
              <button type="button" onClick={() => finish({ kind: "skipped", points: 0 })} className="shrink-0 rounded-md border-2 border-dashed border-border px-4 py-1.5 font-display text-xs font-bold uppercase text-muted-foreground transition hover:border-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-secondary">
                Skip (0)
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function Reveal({ o, last, onNext }: { o: Outcome; last: boolean; onNext: () => void }) {
  const target = o.kind === "correct" ? TIER_ORDER.indexOf(o.tier) : -1;
  const [step, setStep] = useState(o.kind === "correct" ? 0 : -1);
  const [done, setDone] = useState(o.kind !== "correct");
  const btnRef = useRef<HTMLButtonElement>(null);

  // Climb the tier ladder one rung at a time, slowing down near the top.
  useEffect(() => {
    if (done) return;
    if (step >= target) {
      const t = setTimeout(() => setDone(true), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 380 + step * 140);
    return () => clearTimeout(t);
  }, [step, target, done]);

  useEffect(() => { if (done) btnRef.current?.focus(); }, [done]);

  const nextBtn = (
    <button
      ref={btnRef}
      onClick={onNext}
      className={cn("mt-6 w-full rounded-lg bg-primary px-6 py-4 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", done ? "animate-rise" : "invisible")}
    >
      {last ? "See report card →" : "Next question →"}
    </button>
  );

  if (o.kind !== "correct")
    return (
      <div role="status">
        <div className="animate-pop rounded-lg border-2 border-dashed border-border bg-card p-6 text-center">
          <div className="font-display text-xl font-bold uppercase text-muted-foreground">{o.kind === "timeout" ? "Time's up" : "Skipped"}</div>
          <div className="mt-1 font-sans text-sm text-muted-foreground">+0 points</div>
        </div>
        {nextBtn}
      </div>
    );

  const shownTier = TIER_ORDER[Math.max(step, 0)]!;
  return (
    <div role="status" aria-live="polite">
      <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-card p-6 text-center">
        {o.didYouMean && (
          <div className="mb-1 font-hand text-xl text-secondary">
            you wrote “{o.typed}” — did you mean…
          </div>
        )}
        <div className="font-display text-2xl font-bold sm:text-3xl">{o.display}{o.didYouMean ? "?" : ""}</div>
        {o.didYouMean && <div className="mt-1 font-sans text-xs text-muted-foreground">Close enough — we'll count it.</div>}
        <div className="mt-1 font-sans text-xs uppercase tracking-widest text-muted-foreground">
          {done ? "Graded!" : "Grading rarity…"}
        </div>

        {/* tier ladder */}
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          {TIER_ORDER.map((t, i) => (
            <span
              key={t}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border-2 text-lg transition-all duration-300",
                i <= step ? "border-primary bg-primary/15 scale-110" : "border-border opacity-30 grayscale",
                i === step && !done && "animate-pulse",
                done && i === target && "scale-125 border-primary bg-primary/30",
              )}
            >
              {TIERS[t].emoji}
            </span>
          ))}
        </div>

        <div className="mt-5 flex min-h-16 items-center justify-center">
          {done ? (
            <div className="animate-stamp">
              <TierBadge tier={o.tier} className="scale-150" />
            </div>
          ) : (
            <span key={shownTier} className="animate-pop font-display text-lg font-bold uppercase text-muted-foreground">
              {TIERS[shownTier].label}?
            </span>
          )}
        </div>
        {done && <div className="mt-2 animate-pop font-hand text-3xl font-bold text-primary">+{o.points}</div>}
      </div>
      {nextBtn}
    </div>
  );
}
