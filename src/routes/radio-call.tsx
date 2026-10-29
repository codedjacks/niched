import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { RadioGame } from "@/components/game/FreshModes";
import { callsForDay } from "@/game/radiocall";

export const Route = createFileRoute("/radio-call")({
  head: () => ({
    meta: [
      { title: "Radio Call — Niched sports trivia" },
      { name: "description", content: "Finish the most famous calls in sports broadcasting." },
      { property: "og:title", content: "Niched Radio Call" },
      { property: "og:description", content: "Finish the most famous calls in sports broadcasting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RadioPage,
});

function RadioPage() {
  const game = useDailyGame("radio");
  const frame = { note: "fresh game", title: "Radio Call", subtitle: "Legendary broadcast calls with the key word bleeped. Fill the blank — two tries, two hints." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  return <GameFrame {...frame}><RadioGame key={game.day} game={game} calls={callsForDay(game.day)} /></GameFrame>;
}
