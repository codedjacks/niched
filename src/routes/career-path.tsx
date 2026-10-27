import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { RoadTrip } from "@/components/game/NewModes";
import { CAREER_POINTS, careerForDay, isCareerAnswer } from "@/game/career";

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
  const frame = { note: "the team trail", title: "Career Path", subtitle: "Name the player from the teams they played for, in order. Every miss drives one stop further. Five guesses." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = careerForDay(game.day);
  return (
    <GameFrame {...frame}>
      <RoadTrip game={game} teams={p.teams} points={CAREER_POINTS} isAnswer={(t) => isCareerAnswer(p, t)} answer={p.name} />
    </GameFrame>
  );
}
