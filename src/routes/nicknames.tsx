import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { GuessGame } from "@/components/game/GuessGame";
import { NICKNAME_POINTS, isNicknameAnswer, nicknameForDay, nicknameHints } from "@/game/nickname";

export const Route = createFileRoute("/nicknames")({
  head: () => ({
    meta: [
      { title: "Nicknames — Niched sports trivia" },
      { name: "description", content: "One famous sports nickname a day. Name the player behind it." },
      { property: "og:title", content: "Niched Nicknames" },
      { property: "og:description", content: "Who goes by today's nickname?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NicknamePage,
});

function NicknamePage() {
  const game = useDailyGame("nickname");
  const frame = { note: "who's that?", title: "Nicknames", subtitle: "Name the player behind the nickname. Each miss reveals a hint." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = nicknameForDay(game.day);
  return (
    <GameFrame {...frame}>
      <GuessGame game={game} hints={nicknameHints(p)} points={NICKNAME_POINTS} isAnswer={(t) => isNicknameAnswer(p, t)} answer={p.name} shareLabel="Nicknames" emoji="🏷️"
        puzzle={<p className="text-center font-display text-2xl font-bold uppercase md:text-3xl">“{p.nickname}”</p>} />
    </GameFrame>
  );
}
