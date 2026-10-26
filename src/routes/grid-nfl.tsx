import { createFileRoute } from "@tanstack/react-router";
import { ProGrid } from "@/components/game/ProGrid";

export const Route = createFileRoute("/grid-nfl")({
  head: () => ({
    meta: [
      { title: "NFL Daily Grid — Niched sports trivia" },
      { name: "description", content: "A 3x3 NFL grid: name a player who fits each team and feat. Rarer picks score more." },
      { property: "og:title", content: "Niched NFL Daily Grid" },
      { property: "og:description", content: "Nine squares, nine guesses. Find the deep-cut football players." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProGrid league="nfl" />,
});
