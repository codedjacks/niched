import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { LetterTiles } from "@/components/game/NewModes";
import { NICKNAME_POINTS, isNicknameAnswer, nicknameForDay } from "@/game/nickname";

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
  const frame = { note: "who's that?", title: "Nicknames", subtitle: "Name the player. Every miss flips more letters." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = nicknameForDay(game.day);
  return (
    <GameFrame {...frame}>
      <LetterTiles game={game} nickname={p.nickname} name={p.name} points={NICKNAME_POINTS} isAnswer={(t) => isNicknameAnswer(p, t)} />
    </GameFrame>
  );
}
