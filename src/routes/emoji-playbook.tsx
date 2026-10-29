import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { EmojiGame } from "@/components/game/FreshModes";
import { rebusesForDay } from "@/game/emoji";

export const Route = createFileRoute("/emoji-playbook")({
  head: () => ({
    meta: [
      { title: "Emoji Playbook — Niched sports trivia" },
      { name: "description", content: "Decode emoji into sports teams and athletes." },
      { property: "og:title", content: "Niched Emoji Playbook" },
      { property: "og:description", content: "Decode emoji into sports teams and athletes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmojiPage,
});

function EmojiPage() {
  const game = useDailyGame("emoji");
  const frame = { note: "fresh game", title: "Emoji Playbook", subtitle: "Read the emoji play call. Name the team or athlete — five plays, one skip." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  return <GameFrame {...frame}><EmojiGame key={game.day} game={game} rebuses={rebusesForDay(game.day)} /></GameFrame>;
}
