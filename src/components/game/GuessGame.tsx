import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { resolvePlayerName } from "@/game/players.functions";
import { ResultCard, type useDailyGame } from "./SportsGame";

/** Guess-the-player loop: each wrong guess reveals the next hint; fewer guesses = more points. */
export function GuessGame({ game, puzzle, hints, points, isAnswer, answer, shareLabel, emoji }: {
  game: ReturnType<typeof useDailyGame>; puzzle: ReactNode; hints: string[]; points: readonly number[];
  isAnswer: (typed: string) => boolean; answer: string; shareLabel: string; emoji: string;
}) {
  const { day, progress, doneToday, finish } = game;
  const [n, setN] = useState(1); // current guess number
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const resolve = useServerFn(resolvePlayerName);
  const max = points.length;
  const over = doneToday || result !== null;
  const score = result ?? progress.score ?? 0;
  const end = (pts: number) => { setResult(pts); finish(pts); };
  const miss = (label?: string) => {
    if (label) setWrong((w) => [...w, label]);
    setTyped("");
    if (n >= max) end(0); else setN(n + 1);
  };
  const guess = async () => {
    if (!typed.trim() || checking) return;
    if (isAnswer(typed)) return end(points[n - 1]!);
    setChecking(true);
    const real = await resolve({ data: { typed } }).catch(() => null);
    setChecking(false);
    if (real && isAnswer(real.name)) return end(points[n - 1]!);
    miss(typed);
  };
  const revealed = over ? hints.length : n - 1;

  return (
    <>
      <div className="rounded-lg border-2 border-border bg-card p-5 shadow-pop-sm">{puzzle}</div>
      <ol className="mt-4 grid gap-2">
        {hints.map((h, i) => (
          <li key={i} className={`rounded-lg border-2 px-4 py-3 font-sans ${i < revealed ? "animate-rise border-border bg-card" : "border-dashed border-border/50 text-muted-foreground"}`}>
            <span className="mr-3 font-display text-xs text-primary">Hint {i + 1}</span>{i < revealed ? h : "???"}
          </li>
        ))}
      </ol>
      {!over && (
        <>
          <p className="mt-4 font-display text-xs uppercase text-muted-foreground">Guess {n} of {max} · worth {points[n - 1]} pts</p>
          <form onSubmit={(e) => { e.preventDefault(); void guess(); }} className="mt-2 flex flex-wrap gap-2">
            <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Name the player…" aria-label="Player name" disabled={checking}
              className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
            <button disabled={checking} className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground">{checking ? "Checking…" : "Guess"}</button>
            <button type="button" onClick={() => miss()} className="rounded-lg border-2 border-border px-4 py-3 font-display text-xs uppercase">{n >= max ? "Give up" : "Skip"}</button>
          </form>
        </>
      )}
      {wrong.length > 0 && !over && <p className="mt-3 font-sans text-sm text-muted-foreground">Not: {wrong.join(", ")}</p>}
      {over && (
        <>
          <p className="mt-6 font-display text-2xl font-bold uppercase">It was {answer}</p>
          <ResultCard score={score} max={points[0]!} progress={progress} share={`Niched ${shareLabel} ${day}: ${score}/${points[0]} ${emoji}`} />
        </>
      )}
    </>
  );
}
