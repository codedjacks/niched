import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameFrame, ResultCard, useDailyGame } from "@/components/game/SportsGame";
import { TierBadge } from "@/components/game/ui";
import { GRID_GUESSES, GRID_MAX, TAGS, cellAnswers, gridForDay, guessCell, tierForPlayer, type Player } from "@/game/grid";

export const Route = createFileRoute("/grid")({
  head: () => ({
    meta: [
      { title: "Daily Grid — Niched sports trivia" },
      { name: "description", content: "A 3x3 NBA grid: name a player who fits each team and achievement. Rarer picks score more." },
      { property: "og:title", content: "Niched Daily Grid" },
      { property: "og:description", content: "Nine squares, nine guesses. Find the deep-cut players." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GridPage,
});

function GridPage() {
  const { day, progress, doneToday, finish } = useDailyGame("grid");
  const [cells, setCells] = useState<Record<string, Player>>({});
  const [guesses, setGuesses] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  if (!day) return <GameFrame note="gym class" title="Daily Grid" subtitle="Loading today's grid…">{null}</GameFrame>;
  const g = gridForDay(day);
  const score = Object.values(cells).reduce((s, p) => s + (TIER_POINTS[tierForPlayer(p)] ?? 0), 0);
  const over = doneToday || guesses >= GRID_GUESSES || Object.keys(cells).length === 9;

  const submit = () => {
    if (!active || !typed.trim()) return;
    const [r, c] = active.split(":").map(Number) as [number, number];
    const res = guessCell(typed, g.teams[r]!, g.tags[c]!, Object.values(cells).map((p) => p.name));
    if (!res.ok && res.reason === "unknown") return setMsg("Not in our player list — check the spelling (no guess used).");
    const n = guesses + 1;
    setGuesses(n);
    const next = res.ok ? { ...cells, [active]: res.player } : cells;
    if (res.ok) setCells(next);
    setMsg(res.ok ? `${res.player.name} ✓` : res.reason === "used" ? "Already used that player." : "Doesn't fit that square.");
    setTyped(""); setActive(null);
    if (n >= GRID_GUESSES || Object.keys(next).length === 9)
      finish(Object.values(next).reduce((s, p) => s + (TIER_POINTS[tierForPlayer(p)] ?? 0), 0));
  };

  return (
    <GameFrame note="gym class" title="Daily Grid" subtitle="Name an NBA player who fits each team + achievement. Nine guesses, each player once. Deep cuts score more.">
      <p className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">Guesses left {Math.max(0, GRID_GUESSES - guesses)} · Score {doneToday ? progress.score : score}</p>
      <div className="grid grid-cols-[5rem_repeat(3,minmax(0,1fr))] gap-2 sm:grid-cols-[7rem_repeat(3,minmax(0,1fr))]">
        <div />
        {g.tags.map((t) => <div key={t} className="flex items-end p-1 font-display text-[10px] font-bold uppercase leading-tight sm:text-xs">{TAGS[t]}</div>)}
        {g.teams.map((team, r) => (
          <Row key={team} team={team}>
            {g.tags.map((tag, c) => {
              const k = `${r}:${c}`;
              const p = cells[k];
              return (
                <button key={k} disabled={over || !!p} onClick={() => { setActive(k); setMsg(null); }} aria-label={`${team} and ${TAGS[tag]}`}
                  className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 p-1 text-center font-sans text-xs transition ${active === k ? "border-primary bg-sidebar-accent" : "border-border bg-card hover:border-primary"}`}>
                  {p ? <><span className="font-bold">{p.name}</span><TierBadge tier={tierForPlayer(p)} /></>
                    : over ? <span className="text-[10px] text-muted-foreground">{cellAnswers(team, tag).slice(0, 2).map((x) => x.name).join(", ")}</span> : "+"}
                </button>
              );
            })}
          </Row>
        ))}
      </div>
      {active && !over && (
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-4 flex gap-2">
          <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type a player…" aria-label="Player name"
            className="min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
          <button className="rounded-lg bg-primary px-5 font-display text-sm font-bold uppercase text-primary-foreground">Guess</button>
        </form>
      )}
      {msg && <p className="mt-3 font-sans text-sm" role="status">{msg}</p>}
      {over && <ResultCard score={doneToday ? progress.score ?? score : score} max={GRID_MAX} progress={progress}
        share={`Niched Daily Grid ${day}: ${doneToday ? progress.score : score}/${GRID_MAX} 🏀`} />}
    </GameFrame>
  );
}

import { TIERS } from "@/game/scoring";
const TIER_POINTS = Object.fromEntries(Object.entries(TIERS).map(([k, v]) => [k, v.points])) as Record<string, number>;

function Row({ team, children }: { team: string; children: React.ReactNode }) {
  return <><div className="flex items-center font-display text-xs font-bold uppercase sm:text-sm">{team}</div>{children}</>;
}
