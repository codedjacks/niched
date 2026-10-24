import { createFileRoute } from "@tanstack/react-router";
import { TopicChallenge } from "@/components/game/TopicChallenge";

export const Route = createFileRoute("/entertainment")({
  head: () => ({ meta: [
    { title: "Entertainment Challenge — Niched" },
    { name: "description", content: "Play the Niched Entertainment Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:title", content: "Entertainment Challenge — Niched" },
    { property: "og:description", content: "Play the Niched Entertainment Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EntertainmentChallenge,
});

function EntertainmentChallenge() { return <TopicChallenge topic="entertainment" />; }
