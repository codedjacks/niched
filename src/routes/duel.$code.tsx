import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { duelAnswer, joinMatch } from "@/game/duel.functions";
import { QUESTIONS } from "@/game/questions";
import { avatarOf } from "@/game/avatars";
import { MAX_SCORE, TIERS } from "@/game/scoring";
import type { Question, TierId } from "@/game/types";
import { Play } from "@/components/game/Play";
import { GeoBackground } from "@/components/game/ui";
import { cn } from "@/lib/utils";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Ans = Database["public"]["Tables"]["match_answers"]["Row"];
type Prof = { id: string; display_name: string; avatar_url: string | null };

export const Route = createFileRoute("/duel/$code")({
  head: () => ({
    meta: [
      { title: "Head-to-head — Niched" },
      { name: "description", content: "You've been challenged to a live Niched trivia duel. Same 7 questions, rarest answers win." },
      { property: "og:title", content: "You've been challenged on Niched" },
      { property: "og:description", content: "A live head-to-head trivia race: same 7 questions, rarest answers win." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Duel,
});

function Duel() {
  const { code } = Route.useParams();
  const { user, ready } = useAuth();
  const join = useServerFn(joinMatch);
  const answerFn = useServerFn(duelAnswer);
  const [match, setMatch] = useState<Match | null>(null);
  const [answers, setAnswers] = useState<Ans[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Prof>>({});
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const joined = useRef(false);

  // Load + join
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data: m } = await supabase.from("matches").select("*").eq("code", code.toUpperCase()).maybeSingle();
      if (!alive) return;
      if (!m) return setError("Room not found");
      setMatch(m);
      if (!joined.current && m.host_id !== user.id && m.guest_id !== user.id) {
        joined.current = true;
        const r = await join({ data: { code: m.code } });
        if (!r.ok) return setError(r.error);
        const { data: m2 } = await supabase.from("matches").select("*").eq("id", m.id).single();
        if (alive && m2) setMatch(m2);
      }
      const { data: a } = await supabase.from("match_answers").select("*").eq("match_id", m.id);
      if (alive) setAnswers(a ?? []);
    })();
    return () => { alive = false; };
  }, [user, code, join]);

  // Realtime updates
  const matchId = match?.id;
  useEffect(() => {
    if (!matchId) return;
    const ch = supabase
      .channel(`duel-${matchId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${matchId}` },
        (p) => setMatch(p.new as Match))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "match_answers", filter: `match_id=eq.${matchId}` },
        (p) => setAnswers((prev) => (prev.some((x) => x.id === (p.new as Ans).id) ? prev : [...prev, p.new as Ans])))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [matchId]);

  // Player profiles
  const playerIds = [match?.host_id, match?.guest_id].filter(Boolean).join(",");
  useEffect(() => {
    if (!playerIds) return;
    supabase.from("profiles").select("id, display_name, avatar_url").in("id", playerIds.split(","))
      .then(({ data }) => setProfiles(Object.fromEntries((data ?? []).map((p) => [p.id, p]))));
  }, [playerIds]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);

  const questions = useMemo<Question[]>(
    () => (match?.question_ids ?? []).map((id) => QUESTIONS.find((q) => q.id === id)).filter((q): q is Question => !!q),
    [match?.question_ids],
  );
  const opponentId = match && user ? (match.host_id === user.id ? match.guest_id : match.host_id) : null;
  const scoreOf = (uid: string | null) => answers.filter((a) => a.user_id === uid).reduce((s, a) => s + a.points, 0);
  const countOf = (uid: string | null) => answers.filter((a) => a.user_id === uid).length;

  const onAnswered = useCallback((i: number, typed: string | null) => {
    if (match) answerFn({ data: { matchId: match.id, qIndex: i, typed } }).catch(() => {});
  }, [match, answerFn]);
  const onDone = useCallback(() => setFinished(true), []);

  const shell = (body: React.ReactNode) => (
    <>
      <GeoBackground />
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-10">{body}</main>
    </>
  );

  if (!ready) return shell(<p className="font-sans text-muted-foreground">Loading…</p>);
  if (!user) return shell(
    <div className="text-center">
      <h1 className="font-display text-3xl font-bold uppercase">You've been challenged!</h1>
      <p className="mt-2 font-sans text-muted-foreground">Sign in to join this live head-to-head round.</p>
      <Link to="/auth" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-display text-sm font-bold uppercase text-primary-foreground">Sign in to play</Link>
    </div>,
  );
  if (error) return shell(
    <div className="text-center">
      <p className="font-display text-2xl font-bold">{error}</p>
      <Link to="/" className="mt-4 inline-block font-sans text-sm text-muted-foreground hover:text-foreground">← Home</Link>
    </div>,
  );
  if (!match) return shell(<p className="font-sans text-muted-foreground">Finding room…</p>);

  const opp = opponentId ? profiles[opponentId] : undefined;

  if (match.status === "waiting") {
    const link = typeof window !== "undefined" ? `${window.location.origin}/duel/${match.code}` : "";
    return shell(<Waiting code={match.code} link={link} />);
  }

  const startsIn = match.starts_at ? Math.ceil((new Date(match.starts_at).getTime() - now) / 1000) : 0;
  if (startsIn > 0) return shell(
    <div className="text-center">
      <p className="font-sans text-muted-foreground">vs <b>{avatarOf(opp?.avatar_url)} {opp?.display_name ?? "Opponent"}</b></p>
      <div key={startsIn} className="mt-4 animate-pop font-display text-9xl font-bold text-primary">{startsIn}</div>
      <p className="mt-2 font-hand text-2xl text-secondary">same 7 questions — rarest answers win</p>
    </div>,
  );

  if (!finished && countOf(user.id) < 7 && questions.length === 7) {
    return (
      <>
        <GeoBackground />
        <Play questions={questions} mode="practice" onDone={onDone} onQuit={() => setFinished(true)} onAnswered={onAnswered}
          opponent={{ name: opp?.display_name ?? "Opponent", avatar: avatarOf(opp?.avatar_url), score: scoreOf(opponentId), answered: countOf(opponentId) }} />
      </>
    );
  }

  return shell(
    <Scoreboard me={profiles[user.id]} opp={opp} myId={user.id} oppId={opponentId} answers={answers} questions={questions} />,
  );
}

function Waiting({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg border-2 border-border bg-card p-8 text-center">
      <span aria-hidden className="tape" />
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-secondary">Head-to-head room</p>
      <div className="mt-3 font-display text-5xl font-bold tracking-widest text-primary">{code}</div>
      <p className="mt-4 font-sans text-sm text-muted-foreground">Send this link to a friend. The round starts the moment they join.</p>
      <button onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); }}
        className="mt-5 w-full rounded-lg bg-primary px-5 py-4 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm">
        {copied ? "Link copied!" : "Copy invite link"}
      </button>
      <p className="mt-4 animate-pulse font-hand text-xl text-secondary">waiting for your opponent…</p>
    </div>
  );
}

function Scoreboard({ me, opp, myId, oppId, answers, questions }: {
  me: Prof | undefined; opp: Prof | undefined; myId: string; oppId: string | null; answers: Ans[]; questions: Question[];
}) {
  const mine = (i: number) => answers.find((a) => a.user_id === myId && a.q_index === i);
  const theirs = (i: number) => answers.find((a) => a.user_id === oppId && a.q_index === i);
  const total = (uid: string | null) => answers.filter((a) => a.user_id === uid).reduce((s, a) => s + a.points, 0);
  const myDone = answers.filter((a) => a.user_id === myId).length >= 7;
  const oppDone = answers.filter((a) => a.user_id === oppId).length >= 7;
  const a = total(myId), b = total(oppId);
  const verdict = !myDone || !oppDone ? "Waiting for answers…" : a > b ? "You win!" : a < b ? "You lose" : "It's a tie";

  return (
    <div>
      <p className="text-center font-display text-xs font-bold uppercase tracking-[0.3em] text-secondary">Head-to-head</p>
      <h1 className={cn("mt-2 text-center font-display text-4xl font-bold uppercase", myDone && oppDone && a > b && "animate-stamp text-primary")}>{verdict}</h1>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[{ p: me, s: a, done: myDone, you: true }, { p: opp, s: b, done: oppDone, you: false }].map(({ p, s, done, you }) => (
          <div key={you ? "me" : "opp"} className={cn("rounded-lg border-2 bg-card p-4 text-center", you ? "border-primary" : "border-secondary")}>
            <div className="text-3xl" aria-hidden>{avatarOf(p?.avatar_url)}</div>
            <div className="truncate font-sans font-bold">{p?.display_name ?? (you ? "You" : "Opponent")}{you && " (you)"}</div>
            <div className="font-display text-3xl font-bold tabular-nums">{s}<span className="text-xs text-muted-foreground">/{MAX_SCORE}</span></div>
            {!done && <div className="animate-pulse font-sans text-xs text-muted-foreground">still playing…</div>}
          </div>
        ))}
      </div>
      <ol className="mt-6 grid gap-2">
        {questions.map((q, i) => {
          const x = mine(i), y = theirs(i);
          return (
            <li key={q.id} className="rounded-lg border-2 border-border bg-card p-3 font-sans text-sm">
              <div className="text-xs text-muted-foreground">{i + 1}. {q.prompt}</div>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Cell a={x} win={!!x && !!y && x.points > y.points} />
                <Cell a={y} win={!!x && !!y && y.points > x.points} />
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-6 flex gap-3">
        <Link to="/" className="flex-1 rounded-lg border-2 border-border px-5 py-3 text-center font-display text-xs font-bold uppercase hover:border-primary">Home</Link>
      </div>
    </div>
  );
}

function Cell({ a, win }: { a: Ans | undefined; win: boolean }) {
  if (!a) return <span className="text-muted-foreground">…</span>;
  return (
    <span className={cn("flex items-center justify-between gap-2 rounded-md px-2 py-1", win && "bg-primary/15")}>
      <span className="truncate font-bold">{a.tier ? `${TIERS[a.tier as TierId]?.emoji ?? ""} ${a.display}` : "—"}</span>
      <b className="font-display tabular-nums">{a.points}</b>
    </span>
  );
}
