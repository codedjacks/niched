import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { ClueGuess, PixelAthlete } from "@/components/game/MoreModes";
import { CLUE_POINTS, isSilhouette, silhouetteClues, silhouetteForDay } from "@/game/silhouette";

export const Route = createFileRoute("/silhouette")({
  head: () => ({
    meta: [
      { title: "Who Am I? Silhouette — Niched sports trivia" },
      { name: "description", content: "A pixel athlete sharpens with every clue. Name them early for more points." },
      { property: "og:title", content: "Niched Silhouette" },
      { property: "og:description", content: "Who is behind the pixels?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SilhouettePage,
});

function SilhouettePage() {
  const game = useDailyGame("silhouette");
  const frame = { note: "who am i", title: "Silhouette", subtitle: "A pixel athlete comes into focus clue by clue. Name them early for more points." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = silhouetteForDay(game.day);
  body = <ClueGuess game={game} name="Silhouette" clues={silhouetteClues(p)} points={CLUE_POINTS} answer={p.name[0]!} isAnswer={(t) => isSilhouette(p, t)} visual={(n) => <PixelAthlete kit={p.kit} number={p.number} pose={p.pose} shown={n} />} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
