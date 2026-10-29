import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
in

export const Route = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [
      { title: "Scoreboard — Niched sports trivia" },
      { name: "description", content: "last" },
      { property: "og:title", content: "Niched Scoreboard" },
      { property: "og:description", content: "last" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScoreboardPage,
});

function ScoreboardPage() {
  const game = useDailyGame("scoreboard");
  const frame = { note: "fresh game", title: "Scoreboard", subtitle: "Light up an athlete'"s" };
name
}
