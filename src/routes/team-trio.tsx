import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { PennantPick } from "@/components/game/NewModes";
import { TRIOS, TRIO_POINTS, trioForDay, isTrioAnswer } from "@/game/trio";

export const Route = createFileRoute("/team-trio")({
  head: () => ({
    meta: [
      { title: "Team Trio — Niched sports trivia" },
      { name: "description", content: "Three famous teammates. Name the team they won with. New trio daily." },
      { property: "og:title", content: "Niched Team Trio" },
      { property: "og:description", content: "Which team did these three share?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrioPage,
});

function TrioPage() {
  const game = useDailyGame("trio");
  const frame = { note: "same locker room", title: "Team Trio", subtitle: "Name the team these three shared. The teams are never listed — each wrong guess walks in another teammate." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = trioForDay(game.day);
  return (
    <GameFrame {...frame}>
      <PennantPick game={game} players={p.players} answer={p.team} clue={`${p.league} · ${p.decade}`} points={TRIO_POINTS} isAnswer={(t) => isTrioAnswer(p, t)} />
    </GameFrame>
  );
}
