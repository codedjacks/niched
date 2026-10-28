import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { H2HBoard } from "@/components/game/MoreModes";
import { Button } from "@/components/ui/button";
import { getHeadToHead } from "@/game/facts.functions";
import { H2H_POINT, type H2H } from "@/game/headtohead";

export const Route = createFileRoute("/head-to-head")({
  head: () => ({
    meta: [
      { title: "Head to Head — Niched sports trivia" },
      { name: "description", content: "Two athletes, sourced career stats. Pick who wins each category." },
      { property: "og:title", content: "Niched Head to Head" },
      { property: "og:description", content: "Who wins each stat?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HeadToHeadPage,
});

function HeadToHeadPage() {
  const game = useDailyGame("h2h");
  const [m, setM] = useState<H2H | null | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const fetchH2H = useServerFn(getHeadToHead);
  useEffect(() => {
    if (!game.day) return;
    let off = false;
    fetchH2H({ data: { day: game.day } }).then((r) => { if (!off) setM(r); }).catch(() => { if (!off) setM(null); });
    return () => { off = true; };
  }, [game.day, fetchH2H, attempt]);
  const frame = { note: "tale of the tape", title: "Head to Head", subtitle: "Two athletes, real career numbers from ESPN. Pick who wins each category." };
  if (!game.day || m === undefined) return <GameFrame {...frame}><p className="text-muted-foreground">Loading today's matchup…</p></GameFrame>;
  if (!m) return <GameFrame {...frame}><p className="text-muted-foreground">Today's sourced matchup is unavailable.</p><Button className="mt-3" onClick={() => { setM(undefined); setAttempt((a) => a + 1); }}>Retry</Button></GameFrame>;
  return <GameFrame {...frame}><H2HBoard game={game} a={m.a} b={m.b} stats={m.stats} point={H2H_POINT} /></GameFrame>;
}
