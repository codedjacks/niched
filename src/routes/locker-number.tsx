import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { LockerRoom } from "@/components/game/NewModes";
import { isJerseyAnswer, jerseyForDay } from "@/game/jersey";
import { findTeam, recordText, seasonLabel, useTeamFacts } from "@/game/team-facts";

export const Route = createFileRoute("/locker-number")({
  head: () => ({
    meta: [
      { title: "Locker Number — Niched sports trivia" },
      { name: "description", content: "A jersey number and a team. Name the legend who wore it. New one daily." },
      { property: "og:title", content: "Niched Locker Number" },
      { property: "og:description", content: "Who wore this number?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JerseyPage,
});

function JerseyPage() {
  const game = useDailyGame("locker");
  const teams = useTeamFacts();
  const frame = { note: "retire the number", title: "Locker Number", subtitle: "Pick which lockers to open, then name who wore the number." };
  if (!game.day) return <GameFrame {...frame}>{null}</GameFrame>;
  const p = jerseyForDay(game.day);
  const t = teams.data && findTeam(teams.data, p.league, p.team);
  const scouting = t ? `${t.name} · ${recordText(t)} in ${seasonLabel(t.league)}${t.venue ? ` · ${t.venue}` : ""}` : undefined;
  return (
    <GameFrame {...frame}>
      <LockerRoom game={game} number={p.number} team={p.team} scouting={scouting} clues={[["League", p.league], ["Position", p.position], ["Debut", `${p.era}`], ["Trophy case", p.award]]} isAnswer={(t) => isJerseyAnswer(p, t)} answer={p.name} />
    </GameFrame>
  );
}
