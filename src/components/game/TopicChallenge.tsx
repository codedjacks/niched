import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CHALLENGES, loadChallenge, saveChallenge, startChallenge, type ChallengeId } from "@/game/challenges";
import { dateKey } from "@/game/selection";
import { frequencyRarity, type QuestionCounts } from "@/game/scoring";
import { getAnswerCounts } from "@/game/leaderboard.functions";
import type { Question, RoundAnswer } from "@/game/types";
import { GeoBackground } from "./ui";
import { Play } from "./Play";
import { Results } from "./Results";
import { AccountNav } from "./AccountNav";

type Screen = { kind: "ready" } | { kind: "play"; questions: Question[]; key: number } | { kind: "results"; answers: RoundAnswer[]; newBest: boolean };

export function TopicChallenge({ topic }: { topic: ChallengeId }) {
  const info = CHALLENGES[topic];
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>({ kind: "ready" });
  const [best, setBest] = useState(0);
  const [today, setToday] = useState<number | null>(null);
  const [counts, setCounts] = useState<Record<string, QuestionCounts>>({});
  const request = useRef(0);
  const fetchCounts = useServerFn(getAnswerCounts);
  useEffect(() => { const p = loadChallenge(topic); setBest(p.best); setToday(p.day === dateKey() ? p.score ?? 0 : null); }, [topic]);
  const start = () => {
    const questions = startChallenge(topic);
    const id = ++request.current;
    setCounts({});
    setScreen({ kind: "play", questions, key: id });
    fetchCounts({ data: { questionIds: questions.map((q) => q.id) } }).then((value) => { if (request.current === id) setCounts(value); }).catch(() => {});
  };
  const done = (answers: RoundAnswer[]) => {
    const score = answers.reduce((sum, a) => sum + a.outcome.points, 0);
    const previous = loadChallenge(topic);
    const nextBest = Math.max(previous.best, score);
    saveChallenge(topic, { ...previous, best: nextBest, day: dateKey(), score });
    setToday(score);
    setBest(nextBest);
    setScreen({ kind: "results", answers, newBest: score > previous.best });
  };
  return <>
    <GeoBackground />
    {screen.kind === "ready" && <main className="mx-auto min-h-screen max-w-4xl px-5 pb-16 pt-10 sm:px-10 sm:pt-16">
      <AccountNav />
      <p className="font-hand text-2xl text-secondary">{info.note} · extra credit</p>
      <div aria-hidden className="my-7 text-7xl">{info.emoji}</div>
      <h1 className="break-words font-display text-3xl font-bold uppercase leading-tight sm:text-4xl lg:text-5xl">{info.name}<span className="text-primary">.</span></h1>
      <p className="mt-5 font-hand text-2xl text-muted-foreground">{info.subtitle}</p>
      <div className="mt-10 flex flex-wrap gap-6 border-y-2 border-border py-5 font-sans text-sm">
        <span><b className="text-primary">7</b> daily questions · same for everyone</span><span><b className="text-primary">25s</b> each</span><span>Best: <b className="text-primary">{best || "—"}</b></span>
      </div>
      {today !== null ? <p className="mt-8 font-hand text-2xl text-primary">Done for today — you scored {today}. New {info.name} questions tomorrow!</p> :
      <Button onClick={start} className="mt-8 h-auto w-full justify-between whitespace-normal px-6 py-6 text-left font-display text-lg font-bold uppercase shadow-pop-marker sm:max-w-lg"><span>Start {info.name} Challenge</span><ArrowRight /></Button>}
    </main>}
    {screen.kind === "play" && <Play key={screen.key} mode="practice" challengeName={info.name} questions={screen.questions} rarity={frequencyRarity(counts)} onDone={done} onQuit={() => { request.current++; setScreen({ kind: "ready" }); }} />}
    {screen.kind === "results" && <Results mode="practice" challengeName={info.name} answers={screen.answers} date={dateKey()} streak={0} best={best} isNewBest={screen.newBest} onAgain={() => setScreen({ kind: "ready" })} onHome={() => navigate({ to: "/" })} />}
  </>;
}