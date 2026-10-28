import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { ChainBoard } from "@/components/game/MoreModes";
import { CHAIN_LINK_POINTS, CHAIN_MISSES, chainForDay, chainIndex } from "@/game/jerseychain";

export const Route = createFileRoute("/jersey-chain")({
  head: () => ({
    meta: [
      { title: "Jersey Chain — Niched sports trivia" },
      { name: "description", content: "Name famous players who wore one jersey number. Three misses ends the chain." },
      { property: "og:title", content: "Niched Jersey Chain" },
      { property: "og:description", content: "How long can your chain go?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JerseyChainPage,
});

function JerseyChainPage() {
  const game = useDailyGame("jerseychain");
  const frame = { note: "same number", title: "Jersey Chain", subtitle: "Name players who wore this number. Every name adds a link — three misses and the chain snaps." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = chainForDay(game.day);
  body = <ChainBoard game={game} title={`${p.league} · #${p.number}`} players={p.players} misses={CHAIN_MISSES} link={CHAIN_LINK_POINTS} indexFor={(t, f) => chainIndex(p, t, f)} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
