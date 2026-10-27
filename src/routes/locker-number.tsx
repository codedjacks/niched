import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { JERSEY_POINTS, isJerseyAnswer, jerseyForDay, jerseyHints } from "@/game/jersey";

export const Route = createFileRoute("/locker-number")({
  head: () => ({
    meta: [
      { title: "Locker Number — Niched sports trivia" },
      { name: "description", content: "A jersey number and a team. Name the legend who wore it. New one daily." },
      { property: "og:title", content: "Niched Locker Number" },
      { property: "og:description", content: "Who wore today's number?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JerseyPage,
});

function JerseyPage() {
  const game = useDailyGame("locker");
  const frame = { note: "retire the number", title: "Locker Number", subtitle: "Name the famous player who wore this number for this team." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = jerseyForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={jerseyHints(p)} points={JERSEY_POINTS} isAnswer={(t) => isJerseyAnswer(p, t)} answer={p.name} shareLabel="Locker Number" emoji="👕"
        puzzle={
          <div className="flex flex-col items-center gap-2">
            <span className="font-jersey text-7xl text-primary">#{p.number}</span>
            <span className="font-display text-lg font-bold uppercase">{p.team}</span>
          </div>
        } />
    </GameFrame>
  );
}
