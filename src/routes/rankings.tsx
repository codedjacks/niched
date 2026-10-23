import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getLeaderboard } from "@/game/leaderboard.functions";
import { dateKey } from "@/game/selection";
import { TIERS, MAX_SCORE } from "@/game/scoring";
import type { TierId } from "@/game/types";
import { GeoBackground } from "@/components/game/ui";
import { cn } from "@/lib/utils";
import { avatarOf } from "@/game/avatars";

const boardQuery = (day: string) =>
  queryOptions({ queryKey: ["leaderboard", day], queryFn: () => getLeaderboard({ data: { day } }), staleTime: 15_000 });

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Rankings — Niched daily leaderboard" },
      { name: "description", content: "See today's top Niched scores and the all-time class rankings." },
      { property: "og:title", content: "Niched rankings — who found the nichest answers?" },
      { property: "og:description", content: "Today's daily challenge leaderboard and all-time standings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(boardQuery(dateKey())),
  component: Rankings,
  errorComponent: ({ error }) => <p className="p-10 font-sans">Couldn't load rankings: {(error as Error).message}</p>,
});

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

function Rankings() {
  const day = dateKey();
  const { data } = useSuspenseQuery(boardQuery(day));
  const [tab, setTab] = useState<"today" | "all">("today");

  return (
    <>
      <GeoBackground />
      <main className="mx-auto min-h-screen max-w-2xl px-5 pb-16 pt-10">
        <Link to="/" className="font-sans text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase sm:text-5xl">Class rankings</h1>
        <p className="mt-1 font-hand text-2xl text-secondary">who found the nichest answers?</p>

        <div role="tablist" className="mt-6 flex gap-2">
          {([["today", `Today · ${day}`], ["all", "All-time"]] as const).map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={cn("rounded-lg border-2 px-4 py-2 font-display text-xs font-bold uppercase transition",
                tab === k ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary")}>
              {label}
            </button>
          ))}
        </div>

        <div className="relative mt-6 rounded-lg border-2 border-border bg-card p-4 sm:p-6">
          <span aria-hidden className="tape" />
          {tab === "today" ? (
            data.today.length === 0 ? (
              <Empty text="No one's handed in today's challenge yet. Be first!" />
            ) : (
              <ol className="grid gap-2">
                {data.today.map((r, i) => (
                  <li key={r.id} className={cn("flex items-center gap-3 rounded-md border-2 border-transparent px-3 py-2", i < 3 && "border-border bg-muted/40")}>
                    <span className="w-8 text-center font-display text-lg">{medal(i)}</span>
                    <span aria-hidden className="text-xl">{avatarOf(r.avatar_url)}</span>
                    <span className="min-w-0 flex-1 truncate font-sans font-bold">{r.display_name}</span>
                    <span className="hidden text-sm sm:inline" aria-hidden>
                      {r.tiers.map((t, j) => <span key={j}>{TIERS[t as TierId]?.emoji ?? "⬛"}</span>)}
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums text-primary">{r.score}<span className="text-xs text-muted-foreground">/{MAX_SCORE}</span></span>
                  </li>
                ))}
              </ol>
            )
          ) : data.allTime.length === 0 ? (
            <Empty text="No daily scores yet." />
          ) : (
            <ol className="grid gap-2">
              {data.allTime.map((r, i) => (
                <li key={r.user_id} className={cn("flex items-center gap-3 rounded-md border-2 border-transparent px-3 py-2", i < 3 && "border-border bg-muted/40")}>
                  <span className="w-8 text-center font-display text-lg">{medal(i)}</span>
                  <span aria-hidden className="text-xl">{avatarOf(r.avatar_url)}</span>
                  <span className="min-w-0 flex-1 truncate font-sans font-bold">{r.display_name}</span>
                  <span className="font-sans text-xs text-muted-foreground">{r.games} days · best {r.best}</span>
                  <span className="font-display text-lg font-bold tabular-nums text-primary">{r.total}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <p className="mt-4 font-sans text-xs text-muted-foreground">Only signed-in Daily Challenge scores count, and every answer is re-checked on our server before it ranks. All-time ranks by total points across every daily.</p>
      </main>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-10 text-center">
      <p className="font-sans text-muted-foreground">{text}</p>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-primary px-5 py-3 font-display text-xs font-bold uppercase text-primary-foreground shadow-pop-sm">Play today's challenge</Link>
    </div>
  );
}
