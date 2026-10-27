import { useEffect, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { resolvePlayerName } from "@/game/players.functions";
import { ResultCard, type useDailyGame } from "./SportsGame";
import { DRAFT_CLOCK, LOCKER_GUESSES, draftPickScore, letterMask, lockerScore, trioPickScore } from "@/game/modes";

type Game = ReturnType<typeof useDailyGame>;
const card = "rounded-lg border-2 border-border bg-card p-5 shadow-pop-sm";

function Done({ game, score, answer, label, emoji, max = 100 }: { game: Game; score: number; answer: string; label: string; emoji: string; max?: number }) {
  return (
    <>
      <p className="animate-stamp mt-6 font-display text-2xl font-bold uppercase">It was {answer}</p>
      <ResultCard score={score} max={max} progress={game.progress} share={`Niched ${label} ${game.day}: ${score}/${max} ${emoji}`} />
    </>
  );
}

/** Typed-guess loop where each miss changes the board itself (not a hint list). */
function useTypedGuess(game: Game, isAnswer: (t: string) => boolean, onMiss: () => boolean, scoreNow: () => number, opts: { resolveNames?: boolean; placeholder?: string } = {}) {
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(0);
  const resolve = useServerFn(resolvePlayerName);
  const over = game.doneToday || result !== null;
  const end = (pts: number) => { setResult(pts); game.finish(pts); };
  const miss = (label?: string) => {
    if (label) setWrong((w) => [...w, label]);
    setTyped(""); setShake((s) => s + 1);
    if (onMiss()) end(0);
  };
  const guess = async () => {
    if (!typed.trim() || checking || over) return;
    if (isAnswer(typed)) return end(scoreNow());
    if (opts.resolveNames === false) { miss(typed); return; }
    setChecking(true);
    const real = await resolve({ data: { typed } }).catch(() => null);
    setChecking(false);
    if (real && isAnswer(real.name)) return end(scoreNow());
    miss(typed);
  };
  const score = result ?? game.progress.score ?? 0;
  const form = (worth: string, skip = "Skip") => !over && (
    <>
      <p className="mt-4 font-display text-xs uppercase text-muted-foreground">{worth}</p>
      <form key={shake} onSubmit={(e) => { e.preventDefault(); void guess(); }} className={`mt-2 flex flex-wrap gap-2 ${shake ? "animate-shake" : ""}`}>
        <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Name the player…" aria-label="Player name" disabled={checking}
          className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
        <button disabled={checking} className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground">{checking ? "Checking…" : "Guess"}</button>
        <button type="button" onClick={() => miss()} className="rounded-lg border-2 border-border px-4 py-3 font-display text-xs uppercase">{skip}</button>
      </form>
      {wrong.length > 0 && <p className="mt-3 font-sans text-sm text-muted-foreground">Not: {wrong.join(", ")}</p>}
    </>
  );
  return { over, score, form };
}

/** Career Path: the bus drives one stop further down the trail on every miss. */
export function RoadTrip({ game, teams, points, isAnswer, answer }: { game: Game; teams: string[]; points: readonly number[]; isAnswer: (t: string) => boolean; answer: string }) {
  const [step, setStep] = useState(0);
  const max = points.length;
  const { over, score, form } = useTypedGuess(game, isAnswer, () => { if (step + 1 >= max) return true; setStep(step + 1); return false; }, () => points[step]!);
  const shown = over ? teams.length : Math.min(teams.length, Math.max(1, Math.ceil(((step + 1) * teams.length) / max)));
  return (
    <>
      <div className={card}>
        <p className="font-display text-xs uppercase text-muted-foreground">Stop {shown} of {teams.length}</p>
        <ol className="relative mt-4 grid gap-3 border-l-4 border-dashed border-primary/60 pl-6">
          {teams.map((t, i) => (
            <li key={i} className={`relative font-display text-sm font-bold uppercase ${i < shown ? "animate-pop" : ""}`}>
              <span aria-hidden className={`absolute -left-[2.15rem] top-1 grid h-5 w-5 place-items-center rounded-sm border-2 border-border text-[10px] ${i < shown ? "bg-primary text-primary-foreground" : "bg-background"}`}>{i + 1}</span>
              {i < shown ? <span className="rounded-md border-2 border-border bg-background px-3 py-1.5">{t}</span> : <span className="text-muted-foreground">??? road ahead</span>}
              {i === shown - 1 && !over && <span aria-hidden className="ml-2">🚌</span>}
            </li>
          ))}
        </ol>
      </div>
      {form(`Guess ${step + 1} of ${max} · worth ${points[step]} pts`, step + 1 >= max ? "Give up" : "Next stop")}
      {over && <Done game={game} score={score} answer={answer} label="Career Path" emoji="🚌" />}
    </>
  );
}

/** Nicknames: name tiles flip open as you miss. */
export function LetterTiles({ game, nickname, name, points, isAnswer }: { game: Game; nickname: string; name: string; points: readonly number[]; isAnswer: (t: string) => boolean }) {
  const [step, setStep] = useState(0);
  const max = points.length;
  const { over, score, form } = useTypedGuess(game, isAnswer, () => { if (step + 1 >= max) return true; setStep(step + 1); return false; }, () => points[step]!);
  const mask = letterMask(name, over ? max : step, max);
  return (
    <>
      <div className={`${card} text-center`}>
        <p className="font-display text-2xl font-bold uppercase md:text-3xl">“{nickname}”</p>
        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label={`Name pattern ${mask}`}>
          {mask.split(" ").map((word, w) => (
            <span key={w} className="flex gap-1">
              {[...word].map((c, i) => (
                <span key={`${i}-${c}`} className={`grid h-9 w-7 place-items-center rounded-sm border-2 font-display text-base font-bold uppercase md:h-11 md:w-9 ${c === "_" ? "border-dashed border-border/60 bg-background" : "animate-pop border-border bg-primary text-primary-foreground"}`}>{c === "_" ? "" : c}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
      {form(`Guess ${step + 1} of ${max} · worth ${points[step]} pts`, step + 1 >= max ? "Give up" : "Flip letters")}
      {over && <Done game={game} score={score} answer={name} label="Nicknames" emoji="🏷️" />}
    </>
  );
}

/** Stat Line: a blurred scoreboard; each miss clears one column. */
export function BoxScore({ game, line, columns, points, isAnswer, answer }: { game: Game; line: string; columns: [string, string][]; points: readonly number[]; isAnswer: (t: string) => boolean; answer: string }) {
  const [step, setStep] = useState(0);
  const max = points.length;
  const { over, score, form } = useTypedGuess(game, isAnswer, () => { if (step + 1 >= max) return true; setStep(step + 1); return false; }, () => points[step]!);
  return (
    <>
      <div className="rounded-lg border-4 border-border bg-background p-4 text-foreground shadow-pop-sm">
        <p className="text-center font-jersey text-2xl text-primary md:text-3xl">{line}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {columns.map(([k, v], i) => {
            const open = over || i < step;
            return (
              <div key={k} className="rounded-md border-2 border-border p-2 text-center">
                <p className="font-display text-[10px] uppercase opacity-70">{k}</p>
                <p className={`font-display text-sm font-bold uppercase transition ${open ? "animate-pop" : "select-none blur-sm"}`} aria-hidden={!open}>{open ? v : "██████"}</p>
              </div>
            );
          })}
        </div>
      </div>
      {form(`Guess ${step + 1} of ${max} · worth ${points[step]} pts`, step + 1 >= max ? "Give up" : "Clear a column")}
      {over && <Done game={game} score={score} answer={answer} label="Stat Line" emoji="📊" />}
    </>
  );
}

/** Locker Number: you choose which lockers to open (each costs points), then name the player. */
export function LockerRoom({ game, number, team, clues, isAnswer, answer }: { game: Game; number: number; team: string; clues: [string, string][]; isAnswer: (t: string) => boolean; answer: string }) {
  const [opened, setOpened] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const { over, score, form } = useTypedGuess(game, isAnswer, () => { const m = misses + 1; setMisses(m); return m >= LOCKER_GUESSES; }, () => lockerScore(opened.length, misses));
  return (
    <>
      <div className={card}>
        <div className="flex flex-col items-center gap-1">
          <span className="font-jersey text-7xl text-primary">#{number}</span>
          <span className="font-display text-lg font-bold uppercase">{team}</span>
        </div>
        <p className="mt-4 text-center font-display text-xs uppercase text-muted-foreground">Open a locker for a clue · −20 pts each</p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {clues.map(([k, v], i) => {
            const open = over || opened.includes(i);
            return (
              <button key={k} type="button" disabled={open} onClick={() => setOpened((o) => [...o, i])}
                className={`min-h-28 rounded-md border-2 border-border p-3 text-center font-display uppercase transition ${open ? "animate-pop bg-background" : "bg-secondary text-secondary-foreground hover:-translate-y-0.5"}`}>
                <span className={`block text-[10px] ${open ? "text-muted-foreground" : ""}`}>{k}</span>
                {open ? <span className="mt-2 block text-xs font-bold normal-case">{v}</span> : <span aria-hidden className="mt-3 block text-2xl">🔒</span>}
              </button>
            );
          })}
        </div>
      </div>
      {form(`Guess ${misses + 1} of ${LOCKER_GUESSES} · worth ${lockerScore(opened.length, misses)} pts now`, misses + 1 >= LOCKER_GUESSES ? "Give up" : "Pass")}
      {over && <Done game={game} score={score} answer={answer} label="Locker Number" emoji="👕" />}
    </>
  );
}

/** Draft Day: the clock is running; one pick from four cards. */
export function DraftBoard({ game, header, choices, answer }: { game: Game; header: ReactNode; choices: string[]; answer: string }) {
  const [left, setLeft] = useState(DRAFT_CLOCK);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const over = game.doneToday || result !== null;
  const done = useRef(false);
  const end = (choice: string | null, secs: number) => {
    if (done.current) return; done.current = true;
    const pts = draftPickScore(choice === answer, secs);
    setPicked(choice); setResult(pts); game.finish(pts);
  };
  useEffect(() => {
    if (over) return;
    const id = setInterval(() => setLeft((s) => { if (s <= 1) { clearInterval(id); end(null, 0); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps
  const score = result ?? game.progress.score ?? 0;
  return (
    <>
      <div className="rounded-lg border-4 border-border bg-background p-5 text-center text-foreground shadow-pop-sm">
        {header}
        {!over && <p className={`mt-3 font-jersey text-5xl ${left < 10 ? "animate-pulse text-destructive" : "text-primary"}`} role="timer" aria-live="off">0:{String(left).padStart(2, "0")}</p>}
        {!over && <p className="font-display text-[10px] uppercase opacity-70">{left >= 10 ? "Pick now for 100" : "Late pick · 60"}</p>}
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {choices.map((c) => {
          const state = !over ? "bg-card hover:-translate-y-0.5" : c === answer ? "animate-pop bg-primary text-primary-foreground" : c === picked ? "animate-shake bg-destructive text-destructive-foreground" : "bg-card opacity-50";
          return (
            <button key={c} type="button" disabled={over} onClick={() => end(c, left)}
              className={`rounded-lg border-2 border-border px-4 py-4 text-left font-display text-sm font-bold uppercase shadow-pop-sm transition ${state}`}>
              <span aria-hidden className="mr-2">🎤</span>{c}
            </button>
          );
        })}
      </div>
      {over && <Done game={game} score={score} answer={answer} label="Draft Day" emoji="🎤" />}
    </>
  );
}

/** Team Trio: tap pennants; wrong ones get struck out and the next teammate walks in. */
export function PennantPick({ game, players, teams, answer, clue }: { game: Game; players: string[]; teams: string[]; answer: string; clue: string }) {
  const [struck, setStruck] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const over = game.doneToday || result !== null;
  const shown = over ? players.length : Math.min(players.length, 1 + struck.length);
  const tap = (t: string) => {
    if (over) return;
    if (t === answer) { const pts = trioPickScore(struck.length); setResult(pts); game.finish(pts); }
    else setStruck((s) => [...s, t]);
  };
  const score = result ?? game.progress.score ?? 0;
  return (
    <>
      <div className={card}>
        <p className="text-center font-display text-xs uppercase text-muted-foreground">{clue}</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2 font-display text-sm font-bold uppercase">
          {players.map((n, i) => <li key={n} className={`rounded-md border-2 border-border px-3 py-2 ${i < shown ? "animate-rise bg-background" : "border-dashed text-muted-foreground"}`}>{i < shown ? n : "? ? ?"}</li>)}
        </ul>
      </div>
      {!over && <p className="mt-4 font-display text-xs uppercase text-muted-foreground">Tap their team · worth {trioPickScore(struck.length)} pts</p>}
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        {teams.map((t) => {
          const isStruck = struck.includes(t);
          const state = over && t === answer ? "animate-pop bg-primary text-primary-foreground" : isStruck ? "animate-shake bg-background text-muted-foreground line-through opacity-60" : "bg-card hover:-translate-y-0.5";
          return (
            <button key={t} type="button" disabled={over || isStruck} onClick={() => tap(t)}
              className={`relative rounded-md border-2 border-border py-4 pl-3 pr-6 text-left font-display text-xs font-bold uppercase transition [clip-path:polygon(0_0,100%_18%,100%_82%,0_100%)] ${state}`}>{t}</button>
          );
        })}
      </div>
      {over && <Done game={game} score={score} answer={answer} label="Team Trio" emoji="🚩" />}
    </>
  );
}
