import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getVerifiedStats, VERIFIED_GROUPS } from "@/game/players.functions";
import { GameFrame, ResultCard, useDailyGame } from "@/components/game/SportsGame";
import { HL_ROUNDS, isHigher, pairsForDay } from "@/game/higherlower";

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
  const [verified, setVerified] = useState<Record<string, Record<string, number>>>({});
  const verify = useServerFn(getVerifiedStats);
  const basePairs = useMemo(() => (day ? pairsForDay(day) : []), [day]);
  // Swap bundled numbers for real career totals from the shared player database when available.
  useEffect(() => {
    const groups = new Map<string, Set<string>>();
    for (const q of basePairs) if (VERIFIED_GROUPS[q.group]) {
      const s = groups.get(q.group) ?? new Set<string>(); s.add(q.a.name); s.add(q.b.name); groups.set(q.group, s);
    }
    groups.forEach((names, group) => {
      verify({ data: { group, names: [...names] } }).then((v) => setVerified((o) => ({ ...o, [group]: v }))).catch(() => {});
    });
  }, [basePairs, verify]);
  if (!day) return <GameFrame note="stat sheet" title="Higher or Lower" subtitle="Loading today's matchups…">{null}</GameFrame>;
  const val = (g: string, s: { name: string; value: number }) => ({ ...s, value: verified[g]?.[s.name] ?? s.value });
  const pairs = basePairs.map((q) => ({ ...q, a: val(q.group, q.a), b: val(q.group, q.b) }));
  const over = doneToday || results.length === HL_ROUNDS && !reveal;
  const score = doneToday && results.length === 0 ? progress.score ?? 0 : results.filter(Boolean).length;
  const p = pairs[round]!;

  const choose = (c: "a" | "b") => { if (!reveal) { setResults((r) => [...r, isHigher(p, c)]); setReveal(true); } };
  const next = () => {
    setReveal(false);
    if (round + 1 >= HL_ROUNDS) finish(results.filter(Boolean).length); else setRound(round + 1);
  };

  return (
    <GameFrame note="stat sheet" title="Higher or Lower" subtitle="Ten matchups. Pick who has the bigger number.">
      {!over && (
        <>
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Round {round + 1}/{HL_ROUNDS} · {p.group} · Score {results.filter(Boolean).length}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["a", "b"] as const).map((k) => {
              const s = p[k];
              const win = s.value > p[k === "a" ? "b" : "a"].value;
              return (
                <button key={k} onClick={() => choose(k)} disabled={reveal}
                  className={`rounded-lg border-2 p-6 text-left transition ${reveal ? (win ? "border-primary bg-sidebar-accent" : "border-border bg-card opacity-70") : "border-border bg-card hover:-translate-y-0.5 hover:border-primary"}`}>
                  <span className="block font-display text-xl font-bold uppercase">{s.name}</span>
                  <span className="mt-2 block font-display text-3xl text-primary">{reveal ? s.value.toLocaleString() : "?"}</span>
                </button>
              );
            })}
          </div>
          {reveal && (
            <div className="mt-4 flex items-center gap-4" role="status">
              <span className="font-display text-lg uppercase">{results.at(-1) ? "Correct!" : "Nope"}</span>
              <button autoFocus onClick={next} className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground">
                {round + 1 >= HL_ROUNDS ? "See score" : "Next ▸"}
              </button>
            </div>
          )}
        </>
      )}
      {over && <ResultCard score={score} max={HL_ROUNDS} progress={progress}
        share={`Niched Higher or Lower ${day}: ${score}/${HL_ROUNDS} ${results.map((r) => (r ? "🟩" : "🟥")).join("")}`} />}
    </GameFrame>
  );
}
