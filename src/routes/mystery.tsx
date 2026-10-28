import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { resolvePlayerName } from "@/game/players.functions";
import { GameFrame, ResultCard, useDailyGame } from "@/components/game/SportsGame";
import { MYSTERY_POINTS, isMysteryAnswer, mysteryForDay, mysteryScore } from "@/game/mystery";

export const Route = createFileRoute("/mystery")({
  head: () => ({
    meta: [
      { title: "Mystery Athlete — Niched sports trivia" },
      { name: "description", content: "Guess today's mystery athlete from six clues. The fewer clues you need, the more you score." },
      { property: "og:title", content: "Niched Mystery Athlete" },
      { property: "og:description", content: "Six clues, one athlete. How fast can you name them?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MysteryPage,
});

function MysteryPage() {
  const { day, progress, doneToday, finish } = useDailyGame("mystery");
  const [shown, setShown] = useState(1);
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const resolve = useServerFn(resolvePlayerName);
  if (!day) return <GameFrame note="scouting report" title="Mystery Athlete" subtitle="Loading your athlete…">{null}</GameFrame>;
  const m = mysteryForDay(day);
  const over = doneToday || result !== null;
  const score = result ?? progress.score ?? 0;

  const end = (pts: number) => { setResult(pts); finish(pts); };
  const guess = async () => {
    if (!typed.trim() || checking) return;
    if (isMysteryAnswer(m, typed)) return end(mysteryScore(shown));
    // Typos/nicknames: ask the shared player database who they meant before counting it wrong.
    setChecking(true);
    const real = await resolve({ data: { typed } }).catch(() => null);
    setChecking(false);
    if (real && isMysteryAnswer(m, real.name)) return end(mysteryScore(shown));
    setWrong((w) => [...w, typed]); setTyped("");
    if (shown >= 6) end(0); else setShown(shown + 1);
  };

  return (
    <GameFrame note="scouting report" title="Mystery Athlete" subtitle="Clues start hard and get easier. A wrong guess reveals the next clue. Fewer clues = more points.">
      <ol className="grid gap-2">
        {m.clues.map((c, i) => (
          <li key={i} className={`rounded-lg border-2 px-4 py-3 font-sans ${i < (over ? 6 : shown) ? "animate-rise border-border bg-card" : "border-dashed border-border/50 text-muted-foreground"}`}>
            <span className="mr-3 font-display text-xs text-primary">{MYSTERY_POINTS[i]} pts</span>
            {i < (over ? 6 : shown) ? c : "???"}
          </li>
        ))}
      </ol>
      {!over && (
        <form onSubmit={(e) => { e.preventDefault(); void guess(); }} className="mt-4 flex flex-wrap gap-2">
          <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Name the athlete…" aria-label="Athlete name"
            className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
          <button className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground">Guess</button>
          <button type="button" onClick={() => (shown >= 6 ? end(0) : setShown(shown + 1))} className="rounded-lg border-2 border-border px-4 py-3 font-display text-xs uppercase">
            {shown >= 6 ? "Give up" : "Next clue"}
          </button>
        </form>
      )}
      {wrong.length > 0 && !over && <p className="mt-3 font-sans text-sm text-muted-foreground">Not: {wrong.join(", ")}</p>}
      {over && (
        <>
          <p className="mt-6 font-display text-2xl font-bold uppercase">It was {m.name}</p>
          <ResultCard score={score} max={100} progress={progress} share={`Niched Mystery Athlete: ${score}/100 🕵️`} />
        </>
      )}
    </GameFrame>
  );
}
