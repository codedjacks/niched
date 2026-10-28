import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GameFrame } from "@/components/game/SportsGame";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TIERS, TIER_ORDER, MIN_VOTES, consensusTier } from "@/game/scoring";
import { pickItem, voteItems, type VoteItem } from "@/game/rarity-vote";
import type { TierId } from "@/game/types";

export const Route = createFileRoute("/rate-rarity")({
  head: () => ({
    meta: [
      { title: "Rate the Rarity — Niched" },
      { name: "description", content: "How rare is this answer? Vote on rarity tiers to help tune Niched scoring." },
      { property: "og:title", content: "Rate the Rarity — Niched" },
      { property: "og:description", content: "Airball or Ball Knower? Help the game decide." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RatePage,
});

type Counts = Partial<Record<TierId, number>>;

function RatePage() {
  const items = useMemo(() => voteItems(), []);
  const { user } = useAuth();
  const [item, setItem] = useState<VoteItem | null>(null);
  const [pick, setPick] = useState<TierId | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rated, setRated] = useState(0);

  useEffect(() => { setItem(pickItem(items)); }, [items]);

  const loadCounts = async (it: VoteItem) => {
    const { data } = await supabase.rpc("rarity_vote_counts", { _question_id: it.questionId, _answer_key: it.answerKey });
    const c: Counts = {};
    for (const r of data ?? []) c[r.tier as TierId] = Number(r.count);
    setCounts(c);
  };

  const vote = async (tier: TierId) => {
    if (!item || pick || saving) return;
    setSaving(true); setError("");
    if (user) {
      const { error } = await supabase.from("rarity_votes").upsert(
        { user_id: user.id, question_id: item.questionId, answer_key: item.answerKey, tier },
        { onConflict: "user_id,question_id,answer_key" },
      );
      if (error) setError("Couldn't save your vote — try again.");
    }
    await loadCounts(item);
    setPick(tier); setSaving(false); setRated((n) => n + 1);
  };

  const next = () => { setPick(null); setCounts({}); setError(""); setItem((p) => pickItem(items, p ?? undefined)); };

  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const frame = { note: "scouting report", title: "Rate the Rarity", subtitle: "How rare is this answer? Once enough players vote, the crowd's pick becomes the answer's rarity in Practice." };

  if (!item) return <GameFrame {...frame}>{null}</GameFrame>;
  return (
    <GameFrame {...frame}>
      <div className="arcade-panel rounded-xl p-6">
        <p className="font-display text-xs uppercase tracking-widest text-secondary">{item.prompt}</p>
        <p className="mt-3 font-jersey text-4xl uppercase text-foreground text-glow sm:text-5xl">{item.display}</p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TIER_ORDER.map((id) => {
            const t = TIERS[id];
            const n = counts[id] ?? 0;
            const pct = total ? Math.round((n / total) * 100) : 0;
            const mine = pick === id;
            return (
              <Button key={id} variant={mine ? "default" : "outline"} disabled={!!pick || saving} onClick={() => vote(id)}
                className="relative h-auto flex-col items-start gap-0 overflow-hidden py-3 text-left disabled:opacity-100">
                {pick && <span aria-hidden className="absolute inset-y-0 left-0 bg-primary/20" style={{ width: `${pct}%` }} />}
                <span className="relative font-display text-xs">{t.emoji} {t.label}</span>
                <span className="relative text-xs text-muted-foreground">{pick ? `${pct}% · ${n} vote${n === 1 ? "" : "s"}` : `${t.points} pts`}</span>
              </Button>
            );
          })}
        </div>
        {pick && (
          <div className="mt-5 space-y-2 text-sm">
            {(() => { const live = consensusTier(counts) ?? item.tier; return (
              <p>Practice now scores this as: <strong>{TIERS[live].emoji} {TIERS[live].label}</strong> ({TIERS[live].points} pts)
                {consensusTier(counts) ? " — set by player votes" : ` — player votes take over after ${MIN_VOTES} votes`}</p>
            ); })()}
            {!user && <p className="text-muted-foreground"><Link to="/auth" className="underline">Sign in</Link> so your votes count toward the game.</p>}
            {error && <p className="text-destructive">{error}</p>}
            <Button onClick={next} autoFocus>Next answer →</Button>
          </div>
        )}
        {rated > 0 && <p className="mt-4 text-xs text-muted-foreground">Rated this visit: {rated}</p>}
      </div>
    </GameFrame>
  );
}
