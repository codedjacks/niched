import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { H2HBoard } from "@/components/game/MoreModes";
import { Button } from "@/components/ui/button";
import { getHeadToHead } from "@/game/facts.functions";
import { H2H_POINT, headToHead, type H2H } from "@/game/headtohead";
import { supabase } from "@/integrations/supabase/client";

/** Backup path: public sourced facts straight from the database, matched in the browser. */
async function loadDirect(day: string): Promise<H2H | null> {
  const stored = await supabase.from("daily_puzzles").select("puzzle").eq("game", "h2h").eq("day", day).maybeSingle();
  if (stored.data?.puzzle) return stored.data.puzzle as unknown as H2H;
  const { data, error } = await supabase.from("sports_facts").select("*, sports_fact_sources(url)").order("id").limit(5000);
  if (error) throw error;
  return headToHead(day, (data ?? []).map((r) => ({ ...r, value: Number(r.value), source_url: r.sports_fact_sources?.url ?? "" })));
}

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
    fetchH2H({ data: { day: game.day } })
      .then((r) => r ?? loadDirect(game.day))
      .catch(() => loadDirect(game.day))
      .then((r) => { if (!off) setM(r); })
      .catch((e) => { console.error("Head to Head load failed", e); if (!off) setM(null); });
    return () => { off = true; };
  }, [game.day, fetchH2H, attempt]);
  const frame = { note: "tale of the tape", title: "Head to Head", subtitle: "Two athletes, real career numbers from ESPN. Pick who wins each category." };
  if (!game.day || m === undefined) return <GameFrame {...frame}><p className="text-muted-foreground">Loading today's matchup…</p></GameFrame>;
  if (!m) return <GameFrame {...frame}><p className="text-muted-foreground">Today's sourced matchup is unavailable.</p><Button className="mt-3" onClick={() => { setM(undefined); setAttempt((a) => a + 1); }}>Retry</Button></GameFrame>;
  return <GameFrame {...frame}><H2HBoard game={game} a={m.a} b={m.b} stats={m.stats} point={H2H_POINT} /></GameFrame>;
}
