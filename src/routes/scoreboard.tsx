import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { ScoreboardGame } from "@/components/game/FreshModes";
import { targetForDay } from "@/game/scoreboard";

export const Route = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [
      { title: "Scoreboard — Niched sports trivia" },
      { name: "description", content: "Guess an athlete's last name in six tries." },
      { property: "og:title", content: "Niched Scoreboard" },
      { property: "og:description", content: "Light up the athlete's last name in six guesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScoreboardPage,
});

function ScoreboardPage() {
  const game = useDailyGame("scoreboard");
  const frame = { note: "fresh game", title: "Scoreboard", subtitle: "Light up an athlete's last name in six guesses. Green is right, amber is close, red is out." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  return <GameFrame {...frame}><ScoreboardGame key={game.day} game={game} target={targetForDay(game.day)} /></GameFrame>;
}
