import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProgress } from "@/game/daily-games";
import { ResultCard } from "./SportsGame";
import { ThrowField, throwTarget } from "./ThrowField";
import {
  TRIVIA_MAX, TRIVIA_SECONDS, survivalContinues, survivalDeck, survivalSeconds, triviaPoints, triviaRound, type TriviaQuestion,
} from "@/game/trivia";

type Game = { day: string; progress: GameProgress; finish: (score: number) => void };

/** One multiple-choice question with its own countdown. Calls onPick once (null = timed out). */
function QuestionCard({ q, seconds, onPick, picked }: { q: TriviaQuestion; seconds: number; picked: string | null | undefined; onPick: (o: string | null, left: number) => void }) {
  const [left, setLeft] = useState(seconds);
  const done = picked !== undefined;
  const sent = useRef(false);
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 0.1)), 100);
    return () => clearInterval(t);
  }, [done]);
  useEffect(() => {
    if (left <= 0 && !done && !sent.current) { sent.current = true; onPick(null, 0); }
  }, [left, done, onPick]);
  const pick = (o: string) => { if (done || sent.current) return; sent.current = true; onPick(o, left); };
  return (
    <section className="animate-rise arcade-panel rounded-lg p-5">
      <div className="h-2 w-full overflow-hidden rounded bg-muted" role="progressbar" aria-label="Time left" aria-valuenow={Math.ceil(left)} aria-valuemax={seconds}>
        <div className={`h-full transition-[width] duration-100 ${left < 4 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${(left / seconds) * 100}%` }} />
      </div>
      <p className="mt-1 text-right font-display text-xs tabular-nums text-muted-foreground">{Math.ceil(left)}s</p>
      <h2 className="mt-2 font-display text-xl font-bold leading-snug sm:text-2xl">{q.prompt}</h2>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const isAns = o === q.answer;
          const state = !done ? "border-border bg-card hover:border-primary" : isAns ? "border-accent bg-accent/20 text-foreground" : o === picked ? "border-destructive bg-destructive/20" : "border-border opacity-50";
          return (
            <button key={o} autoFocus={i === 0} disabled={done} onClick={() => pick(o)}
              className={`min-h-14 rounded-lg border-2 px-4 py-3 text-left font-display text-sm font-bold transition ${state}`}>
              <span className="mr-2 text-muted-foreground">{"ABCD"[i]}</span>{o}
            </button>
          );
        })}
      </div>
      {done && (
        <p className="animate-rise mt-4 font-sans text-sm" role="status">
          <span className={`font-display font-black uppercase ${picked === q.answer ? "text-accent" : "text-destructive"}`}>
            {picked === q.answer ? "Correct!" : picked === null ? "Time's up" : "Wrong"}
          </span>{" "}
          {picked !== q.answer && <>Answer: <b>{q.answer}</b>. </>}{q.fact}
        </p>
      )}
    </section>
  );
}

function useKeys(options: string[], onKey: (o: string) => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => { const i = "1234abcd".indexOf(e.key.toLowerCase()) % 4; if (i >= 0 && options[i]) onKey(options[i]!); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [options, onKey, active]);
}

function Bar({ left, right }: { left: string; right: string }) {
  return (
    <div className="mb-3 flex items-center justify-between font-display text-xs font-bold uppercase tracking-widest">
      <span className="text-muted-foreground">{left}</span><span className="text-primary led-glow tabular-nums">{right}</span>
    </div>
  );
}

export function QuickTrivia({ game }: { game: Game }) {
  const round = useMemo(() => triviaRound(game.day), [game.day]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [right, setRight] = useState(0);
  const [over, setOver] = useState(false);
  const [landed, setLanded] = useState(false);
  const q = round[i]!;
  const onPick = (o: string | null, left: number) => {
    if (picked !== undefined) return;
    const ok = o === q.answer;
    const pts = triviaPoints(ok, left, streak);
    const s = ok ? streak + 1 : 0;
    setPicked(o); setScore((x) => x + pts); setStreak(s); setBest((b) => Math.max(b, s)); if (ok) setRight((r) => r + 1);
    const total = score + pts;
    setTimeout(() => {
      if (i + 1 >= round.length) { setOver(true); game.finish(total); }
      else { setI(i + 1); setPicked(undefined); }
    }, 1600);
  };
  useKeys(q.options, (o) => document.querySelectorAll<HTMLButtonElement>("[data-trivia] button")[q.options.indexOf(o)]?.click(), picked === undefined && !over);
  if (over) {
    const share = `Niched Quick Trivia: ${score}/${TRIVIA_MAX} · ${right}/10 correct · best streak ${best}\nniched.site/trivia`;
    return (
      <div>
        <ThrowField target={throwTarget(score, TRIVIA_MAX)} caption={`${right}/10 correct · best streak ${best}`} onLanded={() => setLanded(true)} />
        {landed && <ResultCard score={score} max={TRIVIA_MAX} progress={game.progress} share={share} />}
      </div>
    );
  }
  return (
    <div data-trivia>
      <Bar left={`Q ${i + 1}/10 · streak ${streak}`} right={`${score} pts`} />
      <QuestionCard key={q.id} q={q} seconds={TRIVIA_SECONDS} picked={picked} onPick={onPick} />
    </div>
  );
}

export function Survival({ game }: { game: Game }) {
  const deck = useMemo(() => survivalDeck(game.day), [game.day]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [over, setOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const q = deck[i]!;
  const onPick = (o: string | null) => {
    if (picked !== undefined) return;
    setPicked(o);
    const alive = survivalContinues(q, o);
    setTimeout(() => {
      if (!alive || i + 1 >= deck.length) { const n = alive ? i + 1 : i; setOver(true); game.finish(n); }
      else { setI(i + 1); setPicked(undefined); }
    }, alive ? 1100 : 2200);
  };
  useKeys(q.options, (o) => document.querySelectorAll<HTMLButtonElement>("[data-trivia] button")[q.options.indexOf(o)]?.click(), picked === undefined && !over);
  if (over) {
    const n = survivalContinues(q, picked ?? null) ? i + 1 : i;
    const pb = Math.max(game.progress.best, n);
    const share = `I survived ${n} question${n === 1 ? "" : "s"} on Niched Survival 🏈\nniched.site/survival`;
    return (
      <section className="animate-rise arcade-panel rounded-lg p-6" role="status">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">You survived</p>
        <p className="mt-1 font-display text-6xl font-black text-primary led-glow tabular-nums">{n}</p>
        <p className="mt-2 font-sans text-sm text-muted-foreground">{n >= pb && n > 0 ? "New personal best!" : `Personal best ${pb}`}</p>
        <button onClick={() => navigator.clipboard?.writeText(share).then(() => setCopied(true)).catch(() => {})}
          className="mt-4 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm">{copied ? "Copied!" : "Copy & share"}</button>
        <button autoFocus onClick={() => window.dispatchEvent(new Event("niched:replay"))}
          className="ml-3 mt-4 rounded-lg border-2 border-border px-5 py-3 font-display text-sm font-bold uppercase hover:border-primary">Play again ▸</button>
      </section>
    );
  }
  return (
    <div data-trivia>
      <Bar left={`Best ${game.progress.best} · ${["", "Rookie", "Pro", "Hall of Fame"][q.level]}`} right={`${i} survived`} />
      <QuestionCard key={q.id} q={q} seconds={survivalSeconds(i)} picked={picked} onPick={onPick} />
    </div>
  );
}
