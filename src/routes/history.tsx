import { createFileRoute } from "@tanstack/react-router";
import { TopicChallenge } from "@/components/game/TopicChallenge";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "History Challenge — Niched" },
    { name: "description", content: "Play the Niched History Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:title", content: "History Challenge — Niched" },
    { property: "og:description", content: "Play the Niched History Challenge: seven open-ended questions, 25 seconds each, and more points for rarer answers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HistoryChallenge,
});

function HistoryChallenge() { return <TopicChallenge topic="history" />; }
