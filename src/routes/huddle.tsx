import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { HuddleGame } from "@/components/game/FreshModes";
import { huddleForDay } from "@/game/huddle";

export const Route = createFileRoute("/huddle")({
  head: () => ({
    meta: [
      { title: "Huddle — Niched sports trivia" },
      { name: "description", content: "Sort sixteen athletes into four hidden groups." },
      { property: "og:title", content: "Niched Huddle" },
      { property: "og:description", content: "Sort sixteen athletes into four hidden groups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HuddlePage,
});

function HuddlePage() {
  const game = useDailyGame("huddle");
  const frame = { note: "fresh game", title: "Huddle", subtitle: "Sixteen athletes, four hidden groups. Pick four that belong together — four mistakes and you're out." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const h = huddleForDay(game.day);
  return <GameFrame {...frame}><HuddleGame key={game.day} game={game} puzzle={h.puzzle} tiles={h.tiles} /></GameFrame>;
}
