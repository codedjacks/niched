import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { BallotBoard } from "@/components/game/MoreModes";
import { BALLOT_MAX, ballotForDay, ballotStart, scoreBallot } from "@/game/ballot";

export const Route = createFileRoute("/award-ballot")({
  head: () => ({
    meta: [
      { title: "Award Ballot — Niched sports trivia" },
      { name: "description", content: "Put five MVP finalists in the order they actually finished." },
      { property: "og:title", content: "Niched Award Ballot" },
      { property: "og:description", content: "Rank the finalists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AwardBallotPage,
});

function AwardBallotPage() {
  const game = useDailyGame("ballot");
  const frame = { note: "voting booth", title: "Award Ballot", subtitle: "Five finalists, one real ballot. Put them in the order they actually finished." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  let body: ReactNode = null;
  const p = ballotForDay(game.day);
  body = <BallotBoard game={game} title={`${p.award} · ${p.season}`} start={ballotStart(game.day, p)} order={p.order} score={(g) => scoreBallot(p, g)} max={BALLOT_MAX} />;
  return <GameFrame {...frame}>{body}</GameFrame>;
}
