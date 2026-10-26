import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Home } from "@/components/game/Home";
import { Play } from "@/components/game/Play";
import { Results } from "@/components/game/Results";
import { GeoBackground } from "@/components/game/ui";
import { dailyQuestions, dateKey, practiceQuestions } from "@/game/selection";
import { loadSeen, markSeen, emptyStats, liveStreak, loadStats, recordDaily, recordPractice, saveStats, type Stats } from "@/game/storage";
import type { Mode, Question, RoundAnswer } from "@/game/types";
import { useServerFn } from "@tanstack/react-start";
import { getAnswerCounts } from "@/game/leaderboard.functions";
import { challengePool } from "@/game/challenges";

const SPORTS_POOL = challengePool("sports");
import { frequencyRarity, type QuestionCounts } from "@/game/scoring";
import { toQuestion, usesAiDaily } from "@/game/ai-daily";
import { getAiDaily } from "@/game/ai-daily.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Niched — the sports rarity trivia game" },
      { name: "description", content: "Seven open-ended sports trivia questions. The less common your correct answer, the more points you score. Play the daily challenge." },
      { property: "og:title", content: "Niched — the sports rarity trivia game" },
      { property: "og:description", content: "Find the niche sports answers. Daily challenge, grid, mystery athlete and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen =
  | { s: "home" }
  | { s: "play"; mode: Mode; questions: Question[]; key: number }
  | { s: "results"; mode: Mode; answers: RoundAnswer[]; newBest: boolean };

function Index() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [screen, setScreen] = useState<Screen>({ s: "home" });
  const [today, setToday] = useState("");
  useEffect(() => { setStats(loadStats()); setToday(dateKey()); }, []);

  const doneToday = stats.lastDailyDate === today;
  const todayScore = doneToday && stats.todayAnswers ? stats.todayAnswers.reduce((s, a) => s + a.outcome.points, 0) : null;

  const [counts, setCounts] = useState<Record<string, QuestionCounts>>({});
  const fetchCounts = useServerFn(getAnswerCounts);

  const fetchAiDaily = useServerFn(getAiDaily);
  const [dailyMsg, setDailyMsg] = useState<string | null>(null);
  const loadingDaily = useRef(false);

  const launch = (mode: Mode, questions: Question[]) => {
    if (questions.length !== 7) return;
    if (mode === "practice") markSeen(questions.map((q) => q.id), SPORTS_POOL.length);
    setCounts({});
    fetchCounts({ data: { questionIds: questions.map((q) => q.id) } }).then(setCounts).catch(() => {});
    setScreen({ s: "play", mode, questions, key: Date.now() });
  };

  const startAiDaily = async (d: string) => {
    if (loadingDaily.current) return;
    loadingDaily.current = true;
    setDailyMsg("Writing today's questions… (first player of the day waits a little)");
    try {
      // Bounded wait: poll while another request is generating the round.
      for (let i = 0; i < 40; i++) {
        const r = await fetchAiDaily({ data: { day: d } });
        if (r.status === "ready") { setDailyMsg(null); return launch("daily", r.questions.map(toQuestion)); }
        if (r.status === "failed") return setDailyMsg(r.error);
        await new Promise((res) => setTimeout(res, 4000));
      }
      setDailyMsg("Today's questions are taking a while — try again in a minute");
    } catch {
      setDailyMsg("Couldn't load today's questions — try again");
    } finally {
      loadingDaily.current = false;
    }
  };

  const start = (mode: Mode) => {
    const d = dateKey();
    setToday(d);
    if (mode === "daily" && usesAiDaily(d)) return void startAiDaily(d);
    // Practice avoids anything already played in practice and today's daily.
    const questions = mode === "daily" ? dailyQuestions(d) : practiceQuestions([...loadSeen(), ...dailyQuestions(d).map((q) => q.id)], SPORTS_POOL);
    launch(mode, questions);
  };

  const onDone = useCallback((answers: RoundAnswer[]) => {
    setScreen((cur) => {
      if (cur.s !== "play") return cur;
      const score = answers.reduce((s, a) => s + a.outcome.points, 0);
      const prev = loadStats();
      const next = cur.mode === "daily" ? recordDaily(prev, dateKey(), score, answers) : recordPractice(prev, score);
      const prevBest = cur.mode === "daily" ? prev.bestDaily : prev.bestPractice;
      saveStats(next);
      setStats(next);
      return { s: "results", mode: cur.mode, answers, newBest: score > prevBest && score > 0 };
    });
  }, []);

  return (
    <>
      <GeoBackground />
      {screen.s === "home" && (
        <Home stats={stats} streak={liveStreak(stats, today)} doneToday={doneToday} todayScore={todayScore}
          dailyAvailable={!today || usesAiDaily(today) || dailyQuestions(today).length === 7}
          onDaily={() => start("daily")} onPractice={() => start("practice")}
          onViewToday={() => stats.todayAnswers && setScreen({ s: "results", mode: "daily", answers: stats.todayAnswers, newBest: false })} />
      )}
      {screen.s === "home" && dailyMsg && (
        <div role="status" aria-live="polite" className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-lg border-2 border-border bg-card p-4 text-center font-sans text-sm shadow-pop-sm">
          {dailyMsg}
          {!loadingDaily.current && <button onClick={() => setDailyMsg(null)} className="ml-3 underline">OK</button>}
        </div>
      )}
      {screen.s === "play" && (
        <Play key={screen.key} questions={screen.questions} mode={screen.mode} rarity={frequencyRarity(counts)} onDone={onDone} onQuit={() => setScreen({ s: "home" })} />
      )}
      {screen.s === "results" && (
        <Results answers={screen.answers} mode={screen.mode} date={today} streak={liveStreak(stats, today)}
          isNewBest={screen.newBest} best={screen.mode === "daily" ? stats.bestDaily : stats.bestPractice}
          onAgain={() => start("practice")} onHome={() => setScreen({ s: "home" })} />
      )}
    </>
  );
}
