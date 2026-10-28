import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { ClueGuess } from "@/components/game/MoreModes";
import { CLUE_POINTS } from "@/game/silhouette";
import { isTradePlayer, tradeClues, tradeForDay } from "@/game/trades";

export const Route = createFileRoute("/trade-machine")({
  head: () => ({
    meta: [
      { title: "Trade Machine — Niched sports trivia" },
      { name: "description", content: "A blockbuster trade with the star hidden. Name who was moved." },
      { property: "og:title", content: "Niched Trade Machine" },
      { property: "og:description", content: "Who was traded?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradeMachinePage,
});

function TradeMachinePage() {
  const game = useDailyGame("trade");
  const frame = { note: "trade deadline", title: "Trade Machine", subtitle: "A blockbuster deal with the headliner blacked out. Every miss leaks another piece of the trade." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = tradeForDay(game.day);
  body = <ClueGuess game={game} name="Trade Machine" clues={tradeClues(p)} points={CLUE_POINTS} answer={p.player[0]!} isAnswer={(t) => isTradePlayer(p, t)} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
