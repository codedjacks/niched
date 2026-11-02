import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { Survival } from "@/components/game/TriviaModes";

export const Route = createFileRoute("/survival")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Survival — Niched sports trivia" },
      { name: "description", content: "Answer sports questions until you miss one. The clock gets faster and the questions get harder." },
      { property: "og:title", content: "Niched Survival" },
      { property: "og:description", content: "One wrong answer and you're out. How long can you last?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurvivalPage,
});

function SurvivalPage() {
  const game = useDailyGame("survival");
  const frame = { note: "sudden death", title: "Survival", subtitle: "One wrong answer or timeout and you're out. The clock shrinks and the questions get harder the longer you last." };
  return <GameFrame {...frame}>{game.day ? <Survival key={game.day} game={game} /> : null}</GameFrame>;
}
