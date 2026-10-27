import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { DRAFT_POINTS, draftForDay, draftHints, isDraftAnswer } from "@/game/draft";

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
  const frame = { note: "on the clock", title: "Draft Day", subtitle: "Who went #1 overall? Each miss reveals a hint. Three guesses." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = draftForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={draftHints(p)} points={DRAFT_POINTS} isAnswer={(t) => isDraftAnswer(p, t)} answer={p.name} shareLabel="Draft Day" emoji="🎤"
        puzzle={<p className="font-display text-2xl font-black uppercase sm:text-3xl">{p.year} {p.league} Draft<span className="block text-base text-primary">#1 overall pick</span></p>} />
    </GameFrame>
  );
}
