import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { DraftBoard } from "@/components/game/NewModes";
import { choicesFor } from "@/game/modes";
import { DRAFTS, draftForDay } from "@/game/draft";

export const Route = createFileRoute("/draft-day")({
  head: () => ({
    meta: [
      { title: "Draft Day — Niched sports trivia" },
      { name: "description", content: "Name the #1 overall pick from a past NBA, NFL or MLB draft. A new draft year every day." },
      { property: "og:title", content: "Niched Draft Day" },
      { property: "og:description", content: "Who went #1 overall? Three guesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DraftPage,
});

function DraftPage() {
  const game = useDailyGame("draft");
  const frame = { note: "on the clock", title: "Draft Day", subtitle: "Who went #1 overall? One pick, clock is running." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = draftForDay(game.day);
  return (
    <GameFrame {...frame}>
      <DraftBoard game={game} answer={p.name} choices={choicesFor(p, DRAFTS, (d) => d.name, 4, game.day)}
        header={<><p className="font-display text-xs uppercase opacity-70">{p.year} {p.league} Draft · #1 overall · {p.team}</p><p className="mt-1 font-display text-lg font-bold uppercase">{p.position} · {p.school}</p></>} />
    </GameFrame>
  );
}
