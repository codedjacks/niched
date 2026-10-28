import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSourcedMatchups } from "@/game/facts.functions";
import type { SourcedPair } from "@/game/facts";
import { Button } from "@/components/ui/button";
import { GameFrame, ResultCard, useDailyGame } from "@/components/game/SportsGame";
import { HL_ROUNDS, isHigher } from "@/game/higherlower";

export const Route = createFileRoute("/higher-lower")({
  head: () => ({
    meta: [
      { title: "Higher or Lower — Niched sports trivia" },
      { name: "description", content: "Ten head-to-head sports stats. Pick which number is bigger and keep your streak alive." },
      { property: "og:title", content: "Niched Higher or Lower" },
      { property: "og:description", content: "Career points, home runs, majors: who has more?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HigherLowerPage,
});

function HigherLowerPage() {
  const { day, progress, doneToday, finish } = useDailyGame("higher-lower");
  const [round, setRound] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [reveal, setReveal] = useState(false);
  const [pairs, setPairs] = useState<SourcedPair[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const fetchPairs = useServerFn(getSourcedMatchups);
  useEffect(() => {
    if (!day) return;
    let cancelled = false;
    setError(false);
    fetchPairs({ data: { day } }).then(rows => {
      if (cancelled) return;
      if (rows.length !== HL_ROUNDS) setError(true); else setPairs(rows);
    }).catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [day, fetchPairs, attempt]);
  if (!day) return <GameFrame note="stat sheet" title="Higher or Lower" subtitle="Loading new matchups…">{null}</GameFrame>;
  const over = doneToday || results.length === HL_ROUNDS && !reveal;
  const score = doneToday && results.length === 0 ? progress.score ?? 0 : results.filter(Boolean).length;
  const p = pairs[round];
  if (!over && !p) return <GameFrame note="stat sheet" title="Higher or Lower" subtitle={error ? "The sourced matchups are unavailable right now." : "Loading new sourced matchups…"}>{error && <Button onClick={() => setAttempt(a => a + 1)}>Retry</Button>}</GameFrame>;

  const choose = (c: "a" | "b") => { if (!reveal && p) { setResults((r) => [...r, isHigher(p, c)]); setReveal(true); } };
  const next = () => {
    setReveal(false);
    if (round + 1 >= HL_ROUNDS) finish(results.filter(Boolean).length); else setRound(round + 1);
  };

  return (
    <GameFrame note="stat sheet" title="Higher or Lower" subtitle="Ten matchups. Pick who has the bigger number.">
      {!over && p && (
        <>
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Round {round + 1}/{HL_ROUNDS} · {p.group} · Score {results.filter(Boolean).length}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["a", "b"] as const).map((k) => {
              const s = p[k];
              const win = s.value > p[k === "a" ? "b" : "a"].value;
              return (
                <div key={k}>
                <Button variant="outline" onClick={() => choose(k)} disabled={reveal}
                  className={`h-auto w-full flex-col items-start whitespace-normal rounded-lg border-2 p-6 text-left transition ${reveal ? (win ? "border-primary bg-sidebar-accent" : "border-border bg-card opacity-70") : "border-border bg-card hover:-translate-y-0.5 hover:border-primary"}`}>
                  <span className="block font-display text-xl font-bold uppercase">{s.name}</span>
                  <span className="mt-2 block font-display text-3xl text-primary">{reveal ? s.value.toLocaleString() : "?"}</span>
                </Button>
                {reveal && <a className="mt-2 inline-block text-xs text-primary underline" href={s.source} target="_blank" rel="noreferrer">ESPN source · regular season</a>}
                </div>
              );
            })}
          </div>
          {reveal && (
            <div className="mt-4 flex items-center gap-4" role="status">
              <span className="font-display text-lg uppercase">{results.at(-1) ? "Correct!" : "Nope"}</span>
              <Button autoFocus onClick={next} className="h-auto rounded-lg px-5 py-3 font-display text-sm font-bold uppercase">
                {round + 1 >= HL_ROUNDS ? "See score" : "Next ▸"}
              </Button>
            </div>
          )}
        </>
      )}
      {over && <ResultCard score={score} max={HL_ROUNDS} progress={progress}
        share={`Niched Higher or Lower: ${score}/${HL_ROUNDS} ${results.map((r) => (r ? "🟩" : "🟥")).join("")}`} />}
    </GameFrame>
  );
}
