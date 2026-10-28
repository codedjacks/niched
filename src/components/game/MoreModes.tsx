import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ResultCard, type useDailyGame } from "./SportsGame";

type Game = ReturnType<typeof useDailyGame>;

/** Shared typed-guess field. */
export function GuessForm({ onGuess, label, disabled, flash }: { onGuess: (t: string) => void; label: string; disabled?: boolean; flash?: string }) {
  const [v, setV] = useState("");
  return (
    <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onGuess(v.trim()); setV(""); } }}>
      <input aria-label={label} placeholder={label} value={v} disabled={disabled} autoFocus onChange={(e) => setV(e.target.value)}
        className={cn("min-w-0 flex-1 rounded-lg border-2 border-border bg-background px-4 py-3 font-sans font-bold outline-none focus:border-primary", flash && "animate-shake border-destructive")} />
      <Button type="submit" disabled={disabled} className="h-auto px-5 font-display text-xs uppercase">Guess</Button>
    </form>
  );
}

const share = (name: string, score: number, max: number) => `Niched ${name} — ${score}/${max}\nniched.lovable.app`;

function Done({ game, name, max, score }: { game: Game; name: string; max: number; score?: number }) {
  const s = score ?? game.progress.score ?? 0;
  return <ResultCard score={s} max={max} progress={game.progress} share={share(name, s, max)} />;
}

/** Clue-by-clue guessing: each miss reveals the next clue; points drop per clue shown. */
export function ClueGuess({ game, name, clues, points, answer, isAnswer, visual }: {
  game: Game; name: string; clues: string[]; points: readonly number[]; answer: string; isAnswer: (t: string) => boolean; visual?: (shown: number) => ReactNode;
}) {
  const [shown, setShown] = useState(1);
  const [result, setResult] = useState<number | null>(null);
  const [miss, setMiss] = useState("");
  if (game.doneToday && result === null) return <Done game={game} name={name} max={points[0]!} />;
  const over = result !== null;
  const guess = (t: string) => {
    if (over) return;
    if (isAnswer(t)) { const p = points[shown - 1] ?? 0; setResult(p); game.finish(p); return; }
    setMiss(t); setTimeout(() => setMiss(""), 400);
    if (shown >= clues.length) { setResult(0); game.finish(0); } else setShown(shown + 1);
  };
  return (
    <div>
      {visual?.(shown)}
      <div className="arcade-panel mt-4 rounded-xl p-5">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Clue {shown}/{clues.length} · worth <span className="text-primary led-glow">{over ? result : points[shown - 1]}</span></p>
        <ol className="mt-3 space-y-2">
          {clues.slice(0, over ? clues.length : shown).map((c, i) => (
            <li key={i} className="animate-rise rounded-md border-2 border-border bg-card px-4 py-2 font-sans">{c}</li>
          ))}
        </ol>
        {over
          ? <p className="mt-4 font-display text-lg uppercase">{result ? "Got it!" : "Out of clues."} It was <span className="text-primary">{answer}</span></p>
          : <GuessForm onGuess={guess} label="Type your guess" flash={miss} />}
      </div>
      {over && <ResultCard score={result!} max={points[0]!} progress={game.progress} share={share(name, result!, points[0]!)} />}
    </div>
  );
}

/** Blocky pixel athlete that sharpens as clues are revealed. */
export function PixelAthlete({ kit, number, pose, shown }: { kit: string; number: string; pose: string; shown: number }) {
  const fill = { primary: "bg-primary", destructive: "bg-destructive", secondary: "bg-secondary", accent: "bg-accent" }[kit] ?? "bg-primary";
  const arm = pose === "shoot" || pose === "throw" ? "-translate-y-6 -rotate-45" : pose === "swing" ? "rotate-90" : "rotate-12";
  return (
    <div className="arcade-panel flex h-56 items-end justify-center overflow-hidden rounded-xl pb-4" aria-label="Mystery athlete silhouette">
      <div className="relative transition-[filter] duration-500" style={{ filter: `blur(${Math.max(0, 8 - shown * 2)}px)`, imageRendering: "pixelated" }}>
        <div className="mx-auto h-10 w-10 bg-foreground" />
        <div className={cn("relative mx-auto mt-1 flex h-20 w-16 items-center justify-center", fill)}>
          <span className="font-jersey text-3xl text-background">{shown >= 3 ? number : "?"}</span>
          <span className={cn("absolute -right-6 top-1 h-4 w-8 origin-left bg-foreground", arm)} />
          <span className="absolute -left-6 top-1 h-4 w-8 bg-foreground" />
        </div>
        <div className="mx-auto mt-1 flex w-16 justify-between"><span className="h-14 w-6 bg-foreground" /><span className={cn("h-14 w-6 bg-foreground", pose === "kick" && "-rotate-45")} /></div>
      </div>
    </div>
  );
}

export function Skyline({ heights, shown }: { heights: number[]; shown: number }) {
  return (
    <div className="arcade-panel flex h-40 items-end gap-1 overflow-hidden rounded-xl px-4" aria-label="Pixel skyline">
      {heights.map((h, i) => (
        <span key={i} className={cn("flex-1 transition-all duration-500", i % 3 === 0 ? "bg-primary/70" : "bg-muted-foreground/50")} style={{ height: `${Math.min(100, h * (6 + shown * 2))}%` }} />
      ))}
    </div>
  );
}

/** Top 10 Countdown: timed list fill. */
export function Top10Board({ game, title, names, seconds, pointsFor, max, slotFor }: {
  game: Game; title: string; names: string[][]; seconds: number; pointsFor: (rank: number) => number; max: number; slotFor: (t: string, found: number[]) => number;
}) {
  const [found, setFound] = useState<number[]>([]);
  const [left, setLeft] = useState(seconds);
  const [started, setStarted] = useState(false);
  const [miss, setMiss] = useState("");
  const done = useRef(false);
  const score = found.reduce((s, i) => s + pointsFor(i + 1), 0);
  const over = started && (left <= 0 || found.length === names.length);
  useEffect(() => {
    if (!started || over) return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [started, over]);
  useEffect(() => { if (over && !done.current) { done.current = true; game.finish(score); } }, [over, score, game]);
  if (game.doneToday && !started) return <Done game={game} name="Top 10" max={max} />;
  const guess = (t: string) => {
    const i = slotFor(t, found);
    if (i >= 0) setFound((f) => [...f, i]); else { setMiss(t); setTimeout(() => setMiss(""), 400); }
  };
  return (
    <div>
      <div className="arcade-panel flex items-center justify-between rounded-xl px-5 py-3 font-display text-xs uppercase">
        <span>{title}</span>
        <span className="text-primary led-glow tabular-nums">{left}s · {score} pts</span>
      </div>
      {!started ? <Button className="mt-4 shimmer font-display uppercase" onClick={() => setStarted(true)}>Start the clock</Button>
        : !over && <GuessForm onGuess={guess} label="Name someone on the list" flash={miss} />}
      <ol className="mt-4 grid gap-1.5">
        {names.map((n, i) => {
          const hit = found.includes(i);
          return (
            <li key={i} className={cn("flex items-center gap-3 rounded-md border-2 px-4 py-2 font-sans transition", hit ? "animate-rise border-primary bg-primary/15" : "border-border bg-card")}>
              <span className="w-6 font-display text-xs text-muted-foreground">{i + 1}</span>
              <span className={cn("flex-1 font-bold", !hit && !over && "text-muted-foreground")}>{hit || over ? n[0] : "• • •"}</span>
              <span className="font-display text-[10px] text-secondary">{pointsFor(i + 1)} pts</span>
            </li>
          );
        })}
      </ol>
      {over && <ResultCard score={score} max={max} progress={game.progress} share={share("Top 10", score, max)} />}
    </div>
  );
}

/** Jersey Chain: name as many wearers as you can before three misses. */
export function ChainBoard({ game, title, players, misses: maxMiss, link, indexFor }: {
  game: Game; title: string; players: string[][]; misses: number; link: number; indexFor: (t: string, found: number[]) => number;
}) {
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [miss, setMiss] = useState("");
  const [finished, setFinished] = useState(false);
  const max = players.length * link;
  if (game.doneToday && !finished) return <Done game={game} name="Jersey Chain" max={max} />;
  const over = finished;
  const score = found.length * link;
  const end = (f: number[], m: number) => { if (m >= maxMiss || f.length >= players.length) { setFinished(true); game.finish(f.length * link); } };
  const guess = (t: string) => {
    const i = indexFor(t, found);
    if (i >= 0) { const f = [...found, i]; setFound(f); end(f, misses); }
    else { const m = misses + 1; setMisses(m); setMiss(t); setTimeout(() => setMiss(""), 400); end(found, m); }
  };
  return (
    <div>
      <div className="arcade-panel flex items-center justify-between rounded-xl px-5 py-3 font-display text-xs uppercase">
        <span>{title}</span>
        <span className="tabular-nums"><span className="text-primary led-glow">{score} pts</span> · {"✕".repeat(misses)}{"○".repeat(maxMiss - misses)}</span>
      </div>
      {!over && <GuessForm onGuess={guess} label="Name a player who wore it" flash={miss} />}
      <div className="mt-4 flex flex-wrap items-center gap-1">
        {found.map((i, k) => (
          <span key={i} className="flex items-center gap-1">
            {k > 0 && <span aria-hidden className="h-1 w-4 bg-primary" />}
            <span className="animate-rise rounded-md border-2 border-primary bg-primary/15 px-3 py-1 font-sans text-sm font-bold">{players[i]![0]}</span>
          </span>
        ))}
      </div>
      {over && (
        <>
          <p className="mt-4 font-sans text-sm text-muted-foreground">Others on our list: {players.filter((_, i) => !found.includes(i)).map((p) => p[0]).join(", ") || "none — you got them all!"}</p>
          <ResultCard score={score} max={max} progress={game.progress} share={share("Jersey Chain", score, max)} />
        </>
      )}
    </div>
  );
}

/** Award Ballot: reorder five finalists. */
export function BallotBoard({ game, title, start, order, score: scoreFn, max }: {
  game: Game; title: string; start: string[]; order: string[]; score: (g: string[]) => number; max: number;
}) {
  const [list, setList] = useState(start);
  const [result, setResult] = useState<number | null>(null);
  if (game.doneToday && result === null) return <Done game={game} name="Award Ballot" max={max} />;
  const move = (i: number, d: number) => setList((l) => { const n = [...l]; [n[i], n[i + d]] = [n[i + d]!, n[i]!]; return n; });
  const submit = () => { const s = scoreFn(list); setResult(s); game.finish(s); };
  return (
    <div>
      <p className="arcade-panel rounded-xl px-5 py-3 font-display text-xs uppercase">{title}</p>
      <ol className="mt-4 grid gap-2">
        {list.map((n, i) => {
          const right = result !== null && order[i] === n;
          return (
            <li key={n} className={cn("flex items-center gap-3 rounded-md border-2 bg-card px-4 py-2", result === null ? "border-border" : right ? "border-primary bg-primary/15" : "border-destructive")}>
              <span className="w-8 font-jersey text-2xl text-primary">{i + 1}</span>
              <span className="flex-1 font-sans font-bold">{n}{result !== null && !right && <span className="ml-2 text-xs font-normal text-muted-foreground">(actually #{order.indexOf(n) + 1})</span>}</span>
              {result === null && (
                <span className="flex gap-1">
                  <Button size="sm" variant="outline" aria-label={`Move ${n} up`} disabled={i === 0} onClick={() => move(i, -1)}>▲</Button>
                  <Button size="sm" variant="outline" aria-label={`Move ${n} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>▼</Button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {result === null ? <Button className="mt-4 shimmer font-display uppercase" onClick={submit}>Cast ballot</Button>
        : <ResultCard score={result} max={max} progress={game.progress} share={share("Award Ballot", result, max)} />}
    </div>
  );
}

/** Head to Head: pick the winner of each sourced stat category. */
export function H2HBoard({ game, a, b, stats, point }: {
  game: Game; a: string; b: string; stats: { label: string; a: number; b: number; source: string }[]; point: number;
}) {
  const [picks, setPicks] = useState<("a" | "b")[]>([]);
  const max = stats.length * point;
  const [finished, setFinished] = useState(false);
  if (game.doneToday && !finished) return <Done game={game} name="Head to Head" max={max} />;
  const right = (i: number) => { const s = stats[i]!; return picks[i] === (s.a > s.b ? "a" : "b"); };
  const score = picks.filter((_, i) => right(i)).length * point;
  const pick = (k: "a" | "b") => {
    const p = [...picks, k]; setPicks(p);
    if (p.length === stats.length) { setFinished(true); game.finish(p.filter((x, i) => x === (stats[i]!.a > stats[i]!.b ? "a" : "b")).length * point); }
  };
  const cur = picks.length;
  return (
    <div>
      <div className="arcade-panel grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl px-5 py-4 text-center">
        <span className="font-jersey text-2xl uppercase">{a}</span><span className="font-display text-xs text-secondary">VS</span><span className="font-jersey text-2xl uppercase">{b}</span>
      </div>
      <ol className="mt-4 grid gap-2">
        {stats.map((s, i) => (
          <li key={s.label} className={cn("rounded-md border-2 bg-card p-3", i < cur ? (right(i) ? "border-primary" : "border-destructive") : i === cur ? "border-secondary" : "border-border opacity-60")}>
            <p className="text-center font-display text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
            {i < cur ? (
              <p className="mt-1 grid grid-cols-2 text-center font-display text-xl tabular-nums text-primary led-glow"><span>{s.a.toLocaleString()}</span><span>{s.b.toLocaleString()}</span></p>
            ) : i === cur && !finished ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => pick("a")}>{a}</Button>
                <Button variant="outline" onClick={() => pick("b")}>{b}</Button>
              </div>
            ) : <p className="mt-1 text-center font-display text-xl text-muted-foreground">? · ?</p>}
            {i < cur && <a href={s.source} target="_blank" rel="noreferrer" className="mt-1 block text-center text-[10px] text-muted-foreground underline">source: ESPN</a>}
          </li>
        ))}
      </ol>
      {finished && <ResultCard score={score} max={max} progress={game.progress} share={share("Head to Head", score, max)} />}
    </div>
  );
}
