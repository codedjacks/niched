import { useState, type FormEvent } from "react";
import { ResultCard, type useDailyGame } from "./SportsGame";
import { HUDDLE_MISTAKES, checkHuddle, huddleScore, type HuddleGroup, type HuddlePuzzle } from "@/game/huddle";
import { correctOrder, standingsScore } from "@/game/standings";
import { recordText, seasonLabel, type TeamInfo } from "@/game/team-facts";
import { SELLOUT_MAX, SELLOUT_MIN, selloutPoints, type Venue } from "@/game/sellout";
import { RADIO_ROUNDS, isCallAnswer, radioPoints, type RadioCall } from "@/game/radiocall";
import { EMOJI_POINTS, isRebus, type Rebus } from "@/game/emoji";

type Game = ReturnType<typeof useDailyGame>;
const btn = "rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm disabled:opacity-40";
const ghost = "rounded-lg border-2 border-border px-4 py-2 font-display text-xs font-bold uppercase hover:border-primary disabled:opacity-40";
const input = "w-full rounded-lg border-2 border-border bg-card px-4 py-3 font-display text-lg text-foreground focus:border-primary focus:outline-none";
const LEVEL = ["bg-primary text-primary-foreground", "bg-secondary text-secondary-foreground", "bg-marker text-background", "bg-destructive text-destructive-foreground"];

function Scorebar({ label, score }: { label: string; score: number }) {
  return <p className="mb-4 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">{label} · <span className="text-primary tabular-nums">{score} pts</span></p>;
}

/* ---------- Huddle ---------- */
export function HuddleGame({ game, puzzle, tiles }: { game: Game; puzzle: HuddlePuzzle; tiles: string[] }) {
  const [found, setFound] = useState<HuddleGroup[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState("");
  const done = found.length === 4 || mistakes >= HUDDLE_MISTAKES;
  const score = huddleScore(found.length, mistakes);
  const left = tiles.filter((t) => !found.some((g) => g.members.includes(t)));
  const submit = () => {
    const g = checkHuddle(puzzle, picks);
    setPicks([]);
    if (g) { const f = [...found, g]; setFound(f); setFlash(`✓ ${g.label}`); if (f.length === 4) game.finish(huddleScore(4, mistakes)); }
    else {
      const m = mistakes + 1; setMistakes(m);
      const close = puzzle.groups.some((gr) => gr.members.filter((x) => picks.includes(x)).length === 3);
      setFlash(close ? "One away…" : "Flag on the play");
      if (m >= HUDDLE_MISTAKES) game.finish(huddleScore(found.length, m));
    }
  };
  const shown = done ? puzzle.groups : found;
  return (
    <div>
      <Scorebar label={`Mistakes ${mistakes}/${HUDDLE_MISTAKES}`} score={score} />
      <div className="space-y-2">
        {shown.map((g) => (
          <div key={g.label} className={`animate-rise rounded-lg p-3 text-center ${LEVEL[g.level]}`}>
            <p className="font-display text-sm font-black uppercase">{g.label}</p>
            <p className="font-sans text-xs">{g.members.join(" · ")}</p>
          </div>
        ))}
      </div>
      {!done && (
        <>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {left.map((t) => {
              const on = picks.includes(t);
              return (
                <button key={t} aria-pressed={on} onClick={() => setPicks(on ? picks.filter((p) => p !== t) : picks.length < 4 ? [...picks, t] : picks)}
                  className={`min-h-16 rounded-lg border-2 p-2 font-display text-xs font-bold uppercase transition ${on ? "border-primary bg-primary/20 text-primary" : "border-border bg-card hover:border-primary"}`}>{t}</button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button className={btn} disabled={picks.length !== 4} onClick={submit}>Submit four</button>
            <button className={ghost} onClick={() => setPicks([])}>Clear</button>
            <p aria-live="polite" className="font-display text-sm text-secondary">{flash}</p>
          </div>
        </>
      )}
      {done && <ResultCard score={score} max={100} progress={game.progress} share={`Niched Huddle: ${found.length}/4 groups, ${mistakes} mistakes — ${score}/100`} />}
    </div>
  );
}

/* ---------- Standings Shuffle ---------- */
export function StandingsGame({ game, teams }: { game: Game; teams: TeamInfo[] }) {
  const [order, setOrder] = useState(teams);
  const [locked, setLocked] = useState(false);
  const right = correctOrder(teams);
  const score = standingsScore(order);
  const move = (i: number, d: number) => {
    const j = i + d; if (j < 0 || j >= order.length) return;
    const n = [...order]; [n[i], n[j]] = [n[j]!, n[i]!]; setOrder(n);
  };
  const league = teams[0]?.league ?? "nba";
  return (
    <div>
      <Scorebar label={`${league.toUpperCase()} · ${seasonLabel(league)} regular season`} score={locked ? score : 0} />
      <p className="mb-3 font-sans text-sm text-muted-foreground">Best record at the top.</p>
      <ol className="space-y-2">
        {order.map((t, i) => {
          const ok = locked && right[i]?.name === t.name;
          return (
            <li key={t.name} className={`flex items-center gap-3 rounded-lg border-2 bg-card p-3 transition ${locked ? (ok ? "border-primary" : "border-destructive") : "border-border"}`}>
              <span className="w-6 font-display text-xl font-black text-muted-foreground">{i + 1}</span>
              <span className="flex-1 font-display font-bold uppercase">{t.name}</span>
              {locked ? <span className="animate-rise font-display tabular-nums text-secondary">{recordText(t)}</span> : (
                <span className="flex gap-1">
                  <button aria-label={`Move ${t.name} up`} className={ghost} disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                  <button aria-label={`Move ${t.name} down`} className={ghost} disabled={i === order.length - 1} onClick={() => move(i, 1)}>▼</button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!locked && <button className={`${btn} mt-4`} onClick={() => { setLocked(true); game.finish(score); }}>Lock standings</button>}
      {locked && <ResultCard score={score} max={100} progress={game.progress} share={`Niched Standings Shuffle: ${score / 20}/5 in the right spot — ${score}/100`} />}
    </div>
  );
}

/* ---------- Sellout ---------- */
function Crowd({ fill }: { fill: number }) {
  const seats = 60;
  const on = Math.round(fill * seats);
  return (
    <div aria-hidden className="grid grid-cols-12 gap-1 rounded-t-[3rem] border-2 border-border bg-card p-4">
      {Array.from({ length: seats }, (_, i) => <span key={i} className={`h-3 rounded-sm transition-colors ${seats - 1 - i < on ? "bg-marker" : "bg-muted"}`} />)}
    </div>
  );
}
export function SelloutGame({ game, venues }: { game: Game; venues: Venue[] }) {
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(40000);
  const [results, setResults] = useState<number[]>([]);
  const v = venues[round];
  const revealed = results.length > round;
  const total = results.reduce((a, b) => a + b, 0);
  const done = results.length === venues.length && round === venues.length - 1 && revealed;
  const max = venues.length * 100;
  if (!v) return null;
  return (
    <div>
      <Scorebar label={`Venue ${round + 1}/${venues.length}`} score={total} />
      <div className="arcade-panel rounded-lg p-5">
        <p className="font-jersey text-3xl uppercase text-foreground">{v.name}</p>
        <p className="font-sans text-sm text-muted-foreground">{v.league} · home of {v.tenant}</p>
        <div className="mt-4"><Crowd fill={(revealed ? v.capacity : guess) / SELLOUT_MAX} /></div>
        <label className="mt-4 block font-display text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="crowd">Your guess: <span className="text-primary tabular-nums">{guess.toLocaleString("en-US")}</span> seats</label>
        <input id="crowd" type="range" min={SELLOUT_MIN} max={SELLOUT_MAX} step={100} value={guess} disabled={revealed} onChange={(e) => setGuess(Number(e.target.value))} className="mt-2 w-full accent-primary" />
        {revealed && (
          <p role="status" className="animate-rise mt-3 font-display text-lg">Real capacity <span className="text-secondary tabular-nums">{v.capacity.toLocaleString("en-US")}</span> · <span className="text-primary">+{results[round]}</span></p>
        )}
      </div>
      {!revealed && <button className={`${btn} mt-4`} onClick={() => {
        const r = [...results, selloutPoints(guess, v.capacity)]; setResults(r);
        if (r.length === venues.length) game.finish(r.reduce((a, b) => a + b, 0));
      }}>Lock it in</button>}
      {revealed && !done && <button autoFocus className={`${btn} mt-4`} onClick={() => { setRound(round + 1); setGuess(40000); }}>Next venue ▸</button>}
      {done && <ResultCard score={total} max={max} progress={game.progress} share={`Niched Sellout: ${total}/${max} guessing the crowd`} />}
    </div>
  );
}

/* ---------- Radio Call ---------- */
export function RadioGame({ game, calls }: { game: Game; calls: RadioCall[] }) {
  const [i, setI] = useState(0);
  const [hints, setHints] = useState(0);
  const [tries, setTries] = useState(0);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ ok: boolean; pts: number } | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const c = calls[i]!;
  const total = scores.reduce((a, b) => a + b, 0);
  const end = (ok: boolean) => {
    const pts = radioPoints(ok, hints, tries > 0);
    setResult({ ok, pts });
    const s = [...scores, pts]; setScores(s);
    if (s.length === calls.length) game.finish(s.reduce((a, b) => a + b, 0));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault(); if (!text.trim() || result) return;
    if (isCallAnswer(c, text)) end(true);
    else if (tries === 0) { setTries(1); setText(""); }
    else end(false);
  };
  const next = () => { setI(i + 1); setHints(0); setTries(0); setText(""); setResult(null); };
  const shown = result ? c.text.replaceAll("____", c.answers[0]!.toUpperCase()) : c.text.replaceAll("____", "█████");
  const done = scores.length === calls.length;
  return (
    <div>
      <Scorebar label={`Call ${i + 1}/${RADIO_ROUNDS}`} score={total} />
      <div className="arcade-panel overflow-hidden rounded-lg p-5">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-secondary">📻 On the call: {c.caller}</p>
        <p className="mt-3 font-jersey text-3xl uppercase leading-tight text-marker led-glow sm:text-4xl">"{shown}"</p>
        {hints > 0 && <p className="mt-3 font-sans text-sm text-muted-foreground">Year: {c.year}</p>}
        {hints > 1 && <p className="font-sans text-sm text-muted-foreground">Game: {c.team}</p>}
      </div>
      {!result ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label htmlFor="call" className="sr-only">Missing word</label>
          <input id="call" autoFocus autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} placeholder={tries ? "Last try…" : "Fill the blank"} className={input} />
          <div className="flex flex-wrap gap-2">
            <button className={btn} type="submit">Call it</button>
            <button type="button" className={ghost} disabled={hints >= 2} onClick={() => setHints(hints + 1)}>Hint (−30)</button>
            <button type="button" className={ghost} onClick={() => end(false)}>Give up</button>
          </div>
          {tries > 0 && <p aria-live="polite" className="font-display text-sm text-destructive">Not it — one more try (−30).</p>}
        </form>
      ) : (
        <div className="mt-4">
          <p role="status" className="animate-rise font-display text-lg">{result.ok ? `Nailed it +${result.pts}` : `It was "${c.answers[0]}"`} <span className="text-muted-foreground">· {c.caller}, {c.year}</span></p>
          {!done && <button autoFocus className={`${btn} mt-3`} onClick={next}>Next call ▸</button>}
        </div>
      )}
      {done && <ResultCard score={total} max={calls.length * 100} progress={game.progress} share={`Niched Radio Call: ${total}/${calls.length * 100}`} />}
    </div>
  );
}

/* ---------- Emoji Playbook ---------- */
export function EmojiGame({ game, rebuses }: { game: Game; rebuses: Rebus[] }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [solved, setSolved] = useState<boolean[]>([]);
  const [skipUsed, setSkipUsed] = useState(false);
  const [wrong, setWrong] = useState(false);
  const r = rebuses[i];
  const score = solved.filter(Boolean).length * EMOJI_POINTS;
  const advance = (ok: boolean) => {
    const s = [...solved, ok]; setSolved(s); setText(""); setWrong(false);
    if (s.length === rebuses.length) game.finish(s.filter(Boolean).length * EMOJI_POINTS); else setI(i + 1);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault(); if (!r || !text.trim()) return;
    if (isRebus(r, text)) advance(true); else { setWrong(true); }
  };
  const done = solved.length === rebuses.length;
  return (
    <div>
      <Scorebar label={`Play ${Math.min(i + 1, rebuses.length)}/${rebuses.length}`} score={score} />
      {!done && r && (
        <>
          <div className="arcade-panel rounded-lg p-8 text-center">
            <p className="text-6xl sm:text-7xl" aria-label="Emoji clue">{r.emoji}</p>
            <p className="mt-4 font-display text-xs font-bold uppercase tracking-widest text-secondary">{r.kind}</p>
          </div>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <label htmlFor="rebus" className="sr-only">Your answer</label>
            <input id="rebus" autoFocus autoComplete="off" value={text} onChange={(e) => { setText(e.target.value); setWrong(false); }} placeholder="Read the playbook" className={input} />
            <div className="flex flex-wrap items-center gap-2">
              <button className={btn} type="submit">Run it</button>
              <button type="button" className={ghost} disabled={skipUsed} onClick={() => { setSkipUsed(true); advance(false); }}>Skip ({skipUsed ? "used" : "1 left"})</button>
              <button type="button" className={ghost} onClick={() => advance(false)}>Reveal</button>
              {wrong && <p aria-live="polite" className="font-display text-sm text-destructive">Incomplete pass — try again</p>}
            </div>
          </form>
        </>
      )}
      {solved.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {solved.map((ok, k) => <li key={k} className={`rounded-md px-2 py-1 font-display text-xs uppercase ${ok ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{rebuses[k]!.emoji} {rebuses[k]!.answers[0]}</li>)}
        </ul>
      )}
      {done && <ResultCard score={score} max={rebuses.length * EMOJI_POINTS} progress={game.progress} share={`Niched Emoji Playbook: ${solved.map((o) => (o ? "🟩" : "⬛")).join("")} ${score}/100`} />}
    </div>
  );
}

