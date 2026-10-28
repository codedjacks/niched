import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { Top10Board } from "@/components/game/MoreModes";
import { TOP10_MAX, TOP10_SECONDS, top10ForDay, top10Points, top10Slot } from "@/game/top10";

export const Route = createFileRoute("/top-10")({
  head: () => ({
    meta: [
      { title: "Top 10 Countdown — Niched sports trivia" },
      { name: "description", content: "A hidden all-time top-10 list a day. 90 seconds to fill it in." },
      { property: "og:title", content: "Niched Top 10 Countdown" },
      { property: "og:description", content: "Can you fill the list?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TopTenPage,
});

function TopTenPage() {
  const game = useDailyGame("top10");
  const frame = { note: "countdown", title: "Top 10", subtitle: "Ninety seconds to fill a hidden all-time list. The deeper the cut, the more it pays." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = top10ForDay(game.day);
  body = <Top10Board game={game} title={p.title} names={p.names} seconds={TOP10_SECONDS} pointsFor={top10Points} max={TOP10_MAX} slotFor={(t, f) => top10Slot(p, t, f)} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
