import { createFileRoute } from "@tanstack/react-router";
import { TopicChallenge } from "@/components/game/TopicChallenge";

export const Route = createFileRoute("/sports")({
  head: () => ({ meta: [
    { title: "Sports Challenge — Niched" },
    { name: "description", content: "Play the Niched Sports Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:title", content: "Sports Challenge — Niched" },
    { property: "og:description", content: "Play the Niched Sports Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SportsChallenge,
});

function SportsChallenge() { return <TopicChallenge topic="sports" />; }
