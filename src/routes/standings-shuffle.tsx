import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { StandingsGame } from "@/components/game/FreshModes";
import { STANDINGS_FALLBACK, standingsForDay } from "@/game/standings";
import { useTeamFacts } from "@/game/team-facts";

export const Route = createFileRoute("/standings-shuffle")({
  head: () => ({
    meta: [
      { title: "Standings Shuffle — Niched sports trivia" },
      { name: "description", content: "Order five teams by last season's real record." },
      { property: "og:title", content: "Niched Standings Shuffle" },
      { property: "og:description", content: "Order five teams by last season's real record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StandingsPage,
});

function StandingsPage() {
  const game = useDailyGame("standings");
  const teams = useTeamFacts();
  const frame = { note: "fresh game", title: "Standings Shuffle", subtitle: "Five real teams. Put them in the order they finished last season, then flip the records." };
  if (!game.day || teams.isPending) return <GameFrame {...frame}>{null}</GameFrame>;
  const five = standingsForDay(game.day, teams.data?.length ? teams.data : STANDINGS_FALLBACK);
  return <GameFrame {...frame}><StandingsGame key={game.day} game={game} teams={five} /></GameFrame>;
}
