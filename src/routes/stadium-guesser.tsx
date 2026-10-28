import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { ClueGuess, Skyline } from "@/components/game/MoreModes";
import { CLUE_POINTS } from "@/game/silhouette";
import { isStadium, skyline, stadiumClues, stadiumForDay } from "@/game/stadiums";

export const Route = createFileRoute("/stadium-guesser")({
  head: () => ({
    meta: [
      { title: "Stadium Guesser — Niched sports trivia" },
      { name: "description", content: "Name the stadium from its pixel skyline and clues." },
      { property: "og:title", content: "Niched Stadium Guesser" },
      { property: "og:description", content: "Where is this game?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StadiumGuesserPage,
});

function StadiumGuesserPage() {
  const game = useDailyGame("stadium");
  const frame = { note: "road game", title: "Stadium Guesser", subtitle: "A pixel skyline and a scouting report. Name the venue in as few clues as you can." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = stadiumForDay(game.day);
  body = <ClueGuess game={game} name="Stadium Guesser" clues={stadiumClues(p)} points={CLUE_POINTS} answer={p.name[0]!} isAnswer={(t) => isStadium(p, t)} visual={(n) => <Skyline heights={skyline(p)} shown={n} />} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
