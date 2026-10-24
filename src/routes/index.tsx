import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Home } from "@/components/game/Home";
import { Play } from "@/components/game/Play";
import { Results } from "@/components/game/Results";
import { GeoBackground } from "@/components/game/ui";
import { dailyQuestions, dateKey, practiceQuestions } from "@/game/selection";
import { loadSeen, markSeen, emptyStats, liveStreak, loadStats, recordDaily, recordPractice, saveStats, type Stats } from "@/game/storage";
import type { Mode, Question, RoundAnswer } from "@/game/types";
import { useServerFn } from "@tanstack/react-start";
import { getAnswerCounts, submitRanked } from "@/game/leaderboard.functions";
import { rankState } from "@/game/rank-state";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONS } from "@/game/questions";
import { frequencyRarity, type QuestionCounts } from "@/game/scoring";

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
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => { setStats(loadStats()); setToday(dateKey()); }, []);

  const doneToday = stats.lastDailyDate === today;
  const todayScore = doneToday && stats.todayAnswers ? stats.todayAnswers.reduce((s, a) => s + a.outcome.points, 0) : null;

  const [counts, setCounts] = useState<Record<string, QuestionCounts>>({});
  const fetchCounts = useServerFn(getAnswerCounts);
  const submit = useServerFn(submitRanked);

  const start = (mode: Mode) => {
    const d = dateKey();
    setToday(d);
    // Practice avoids anything already played in practice and today's daily.
    const questions = mode === "daily" ? dailyQuestions(d) : practiceQuestions([...loadSeen(), ...dailyQuestions(d).map((q) => q.id)]);
    if (questions.length !== 7) return;
    if (mode === "practice") markSeen(questions.map((q) => q.id), QUESTIONS.length);
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
      if (cur.mode === "daily") {
        const day = dateKey();
        const typed = answers.map((a) => (a.outcome.kind === "correct" ? a.outcome.typed ?? a.outcome.display : null));
        rankState.set({ status: "pending" });
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) return rankState.set({ status: "guest" });
          submit({ data: { day, typed } })
            .then((r) => rankState.set(r.ok ? { status: "ranked", score: r.score, already: r.already } : { status: "error", error: r.error }))
            .catch(() => rankState.set({ status: "error", error: "Couldn't reach the leaderboard" }));
        });
      }
      return { s: "results", mode: cur.mode, answers, newBest: score > prevBest && score > 0 };
    });
  }, [submit]);

  return (
    <>
      <GeoBackground />
      {screen.s === "home" && (
        <Home stats={stats} streak={liveStreak(stats, today)} doneToday={doneToday} todayScore={todayScore}
          dailyAvailable={today === null || dailyQuestions(today).length === 7}
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
