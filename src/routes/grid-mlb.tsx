import { createFileRoute } from "@tanstack/react-router";
import { ProGrid } from "@/components/game/ProGrid";

export const Route = createFileRoute("/grid-mlb")({
  head: () => ({
    meta: [
      { title: "MLB Daily Grid — Niched sports trivia" },
      { name: "description", content: "A 3x3 MLB grid: name a player who fits each team and feat. Rarer picks score more." },
      { property: "og:title", content: "Niched MLB Daily Grid" },
      { property: "og:description", content: "Nine squares, nine guesses. Find the deep-cut baseball players." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ProGrid league="mlb" />,
});
