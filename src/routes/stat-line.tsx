import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { BoxScore } from "@/components/game/NewModes";
import { STAT_POINTS, isStatAnswer, statForDay } from "@/game/statline";

export const Route = createFileRoute("/stat-line")({
  head: () => ({
    meta: [
      { title: "Stat Line — Niched sports trivia" },
      { name: "description", content: "One legendary single-season stat line a day. Name the player who put it up." },
      { property: "og:title", content: "Niched Stat Line" },
      { property: "og:description", content: "Whose season was this?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatPage,
});

function StatPage() {
  const game = useDailyGame("statline");
  const frame = { note: "box score", title: "Stat Line", subtitle: "Name the player. Every miss clears a column of the scoreboard." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = statForDay(game.day);
  return (
    <GameFrame {...frame}>
      <BoxScore game={game} line={p.line} columns={[["Season", p.season], ["League", p.league], ["Position", p.position], ["Team", p.team]]} points={STAT_POINTS} isAnswer={(t) => isStatAnswer(p, t)} answer={p.name} />
    </GameFrame>
  );
}
