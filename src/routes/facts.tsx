import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { getSportsFacts } from "@/game/facts.functions";
import { factLabel } from "@/game/facts";
import { GameFrame } from "@/components/game/SportsGame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const factsQuery = queryOptions({ queryKey: ["sports-facts"], queryFn: () => getSportsFacts(), staleTime: 300_000 });
export const Route = createFileRoute("/facts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(factsQuery),
  head: () => ({ meta: [
    { title: "Sports Facts & Sources — Niched" },
    { name: "description", content: "Browse Niched's source-backed NBA, NFL, MLB and NHL career statistics with original evidence." },
    { property: "og:title", content: "Sports Facts & Sources — Niched" },
    { property: "og:description", content: "Real athlete records, career totals and traceable sports sources." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: FactsPage,
});
function FactsPage() {
  const { data: facts } = useSuspenseQuery(factsQuery);
  const [search, setSearch] = useState(""); const [league, setLeague] = useState("all");
  const matches = facts.filter(f => (league === "all" || f.league === league) && `${f.player_name} ${factLabel(f.league, f.metric, f.scope)}`.toLowerCase().includes(search.toLowerCase()));
  return <GameFrame note="the record book" title="Sports Facts" subtitle={`${facts.length} sourced records · NBA / NFL / MLB / NHL`}>
    <div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input aria-label="Search sports facts" placeholder="Search athlete or statistic" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
    <div className="my-4 flex flex-wrap gap-2" role="group" aria-label="League filter">{["all", "nba", "nfl", "mlb", "nhl"].map(l => <Button key={l} variant={league === l ? "default" : "outline"} aria-pressed={league === l} onClick={() => setLeague(l)}>{l.toUpperCase()}</Button>)}</div>
    <p className="mb-3 text-sm text-muted-foreground">{matches.length} records · Career regular season · ESPN</p>
    <div className="divide-y divide-border border-y border-border">{matches.slice(0, 100).map(f => <article key={f.id} className="grid grid-cols-[1fr_auto] gap-3 py-4">
      <div className="min-w-0"><h2 className="font-display text-sm text-foreground">{f.player_name}</h2><p className="mt-1 text-xs text-muted-foreground">{factLabel(f.league, f.metric, f.scope)}</p><p className="mt-1 text-xs text-muted-foreground">Checked {f.verified_at.slice(0, 10)}</p></div>
      <div className="text-right"><p className="font-hand text-3xl text-primary">{f.value.toLocaleString()}</p><Button asChild variant="link" size="sm"><a href={f.source_url} target="_blank" rel="noreferrer">Source <ExternalLink /></a></Button></div>
    </article>)}</div>
    {!matches.length && <p className="py-8 text-muted-foreground">No matching records.</p>}
    {matches.length > 100 && <p className="mt-4 text-sm text-muted-foreground">Showing the first 100 records.</p>}
  </GameFrame>;
}