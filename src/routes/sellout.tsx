import { createFileRoute } from "@tanstack/react-router";
import { GameFrame, useDailyGame } from "@/components/game/SportsGame";
import { SelloutGame } from "@/components/game/FreshModes";
import { selloutForDay, venuesFrom } from "@/game/sellout";
import { STADIUMS } from "@/game/stadiums";
import { stadiumDeck, useTeamFacts } from "@/game/team-facts";

export const Route = createFileRoute("/sellout")({
  head: () => ({
    meta: [
      { title: "Sellout — Niched sports trivia" },
      { name: "description", content: "Guess the real seat count of three sports venues." },
      { property: "og:title", content: "Niched Sellout" },
      { property: "og:description", content: "How many fans fit in this building?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SelloutPage,
});

function SelloutPage() {
  const game = useDailyGame("sellout");
  const teams = useTeamFacts();
  const frame = { note: "fresh game", title: "Sellout", subtitle: "Pack the house. Slide to guess each venue's real seat count — within 1% is a perfect 100." };
  if (!game.day || teams.isPending) return <GameFrame {...frame}>{null}</GameFrame>;
  const deck = teams.data?.length ? stadiumDeck(STADIUMS, teams.data).filter((s) => s.verified) : STADIUMS;
  const venues = selloutForDay(game.day, venuesFrom(deck));
  return <GameFrame {...frame}><SelloutGame key={game.day} game={game} venues={venues} /></GameFrame>;
}
