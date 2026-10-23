import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Home } from "@/components/game/Home";
import { Play } from "@/components/game/Play";
import { Results } from "@/components/game/Results";
import { GeoBackground } from "@/components/game/ui";
import { dailyQuestions, dateKey, practiceQuestions } from "@/game/selection";
import { emptyStats, liveStreak, loadStats, recordDaily, recordPractice, saveStats, type Stats } from "@/game/storage";
import type { Mode, Question, RoundAnswer } from "@/game/types";
import { useServerFn } from "@tanstack/react-start";
import { getAnswerCounts, submitRound } from "@/game/leaderboard.functions";
import { frequencyRarity, normalize, type QuestionCounts } from "@/game/scoring";
import { playerId, playerName } from "@/game/player";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Niched — the rarity trivia game" },
      { name: "description", content: "Seven open-ended trivia questions. The less common your correct answer, the more points you score. Play the daily challenge." },
      { property: "og:title", content: "Niched — the rarity trivia game" },
      { property: "og:description", content: "Find the niche answers. Daily challenge, streaks and practice mode." },
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
  const [today, setToday] = useState(dateKey());
  useEffect(() => { setStats(loadStats()); setToday(dateKey()); }, []);

  const doneToday = stats.lastDailyDate === today;
  const todayScore = doneToday && stats.todayAnswers ? stats.todayAnswers.reduce((s, a) => s + a.outcome.points, 0) : null;

  const [counts, setCounts] = useState<Record<string, QuestionCounts>>({});
  const fetchCounts = useServerFn(getAnswerCounts);
  const submit = useServerFn(submitRound);

  const start = (mode: Mode) => {
    const d = dateKey();
    setToday(d);
    const questions = mode === "daily" ? dailyQuestions(d) : practiceQuestions();
    setCounts({});
    fetchCounts({ data: { questionIds: questions.map((q) => q.id) } }).then(setCounts).catch(() => {});
    setScreen({ s: "play", mode, questions, key: Date.now() });
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
      const day = dateKey();
      if (cur.mode === "practice" || prev.lastDailyDate !== day) {
        submit({ data: {
          playerId: playerId(), name: playerName(), mode: cur.mode, day, score,
          tiers: answers.map((a) => (a.outcome.kind === "correct" ? a.outcome.tier : "none")),
          answers: answers.flatMap((a) => (a.outcome.kind === "correct" ? [{ questionId: a.questionId, key: normalize(a.outcome.display) }] : [])),
        } }).catch(() => {});
      }
      return { s: "results", mode: cur.mode, answers, newBest: score > prevBest && score > 0 };
    });
  }, [submit]);

  return (
    <>
      <GeoBackground />
      {screen.s === "home" && (
        <Home stats={stats} streak={liveStreak(stats, today)} doneToday={doneToday} todayScore={todayScore}
          onDaily={() => start("daily")} onPractice={() => start("practice")}
          onViewToday={() => stats.todayAnswers && setScreen({ s: "results", mode: "daily", answers: stats.todayAnswers, newBest: false })} />
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
