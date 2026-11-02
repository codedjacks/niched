import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { QuickTrivia } from "@/components/game/TriviaModes";

export const Route = createFileRoute("/trivia")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Quick Trivia — Niched sports trivia" },
      { name: "description", content: "Ten multiple-choice sports questions, 15 seconds each. Speed and streaks pay." },
      { property: "og:title", content: "Niched Quick Trivia" },
      { property: "og:description", content: "Ten fast sports questions. How many can you get?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TriviaPage,
});

function TriviaPage() {
  const game = useDailyGame("trivia");
  const frame = { note: "quick play", title: "Quick Trivia", subtitle: "Ten sports questions, 15 seconds each. Answer fast for a speed bonus and chain right answers for a streak bonus. Keys 1–4 work too." };
  return <GameFrame {...frame}>{game.day ? <QuickTrivia key={game.day} game={game} /> : null}</GameFrame>;
}
