import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { CAREER_POINTS, careerForDay, careerHints, isCareerAnswer } from "@/game/career";

export const Route = createFileRoute("/career-path")({
  head: () => ({
    meta: [
      { title: "Career Path — Niched sports trivia" },
      { name: "description", content: "See a player's teams in order and name them. NBA, NFL and MLB careers, a new one every day." },
      { property: "og:title", content: "Niched Career Path" },
      { property: "og:description", content: "Follow the team trail and name today's player." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CareerPage,
});

function CareerPage() {
  const game = useDailyGame("career");
  const frame = { note: "the team trail", title: "Career Path", subtitle: "Name the player from the teams they played for, in order. Each miss reveals a hint. Five guesses." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = careerForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={careerHints(p)} points={CAREER_POINTS} isAnswer={(t) => isCareerAnswer(p, t)} answer={p.name} shareLabel="Career Path" emoji="🧭"
        puzzle={
          <ol className="flex flex-wrap items-center gap-2 font-display text-sm font-bold uppercase">
            {p.teams.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-primary">→</span>}
                <span className="rounded-md border-2 border-border bg-background px-3 py-2">{t}</span>
              </li>
            ))}
          </ol>
        } />
    </GameFrame>
  );
}
