import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { STAT_POINTS, isStatAnswer, statForDay, statHints } from "@/game/statline";

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
  const frame = { note: "box score", title: "Stat Line", subtitle: "Name the player behind this famous season. Each miss reveals a hint." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = statForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={statHints(p)} points={STAT_POINTS} isAnswer={(t) => isStatAnswer(p, t)} answer={p.name} shareLabel="Stat Line" emoji="📊"
        puzzle={<p className="text-center font-display text-xl font-bold uppercase md:text-2xl">{p.line}</p>} />
    </GameFrame>
  );
}
