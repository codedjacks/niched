import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { TRIO_POINTS, isTrioAnswer, trioForDay, trioHints } from "@/game/trio";

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
  const frame = { note: "same locker room", title: "Team Trio", subtitle: "Name the team these three played for together." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = trioForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={trioHints(p)} points={TRIO_POINTS} isAnswer={(t) => isTrioAnswer(p, t)} answer={p.team} shareLabel="Team Trio" emoji="🤝"
        puzzle={
          <ul className="flex flex-wrap justify-center gap-2 font-display text-sm font-bold uppercase">
            {p.players.map((name) => <li key={name} className="rounded-md border-2 border-border bg-background px-3 py-2">{name}</li>)}
          </ul>
        } />
    </GameFrame>
  );
}
