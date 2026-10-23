import { TIERS } from "@/game/scoring";
import type { TierId } from "@/game/types";
import { cn } from "@/lib/utils";

const tierCls: Record<TierId, string> = {
  pencil: "bg-tier-pencil text-background",
  paperclip: "bg-tier-paperclip text-background",
  notebook: "bg-tier-notebook text-background",
  backpack: "bg-tier-backpack text-background",
  goldstar: "bg-tier-goldstar text-background",
  valedictorian: "bg-tier-valedictorian text-background shadow-[0_0_24px_-4px_var(--tier-valedictorian)]",
};

export function TierBadge({ tier, className }: { tier: TierId; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wider", tierCls[tier], className)}>
      {TIERS[tier].label}
    </span>
  );
}

export function GeoBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grid-bg">
      <div className="absolute left-[8%] top-[18%] h-24 w-24 animate-drift rounded-2xl border-2 border-primary/30" />
      <div className="absolute right-[10%] top-[30%] h-16 w-16 animate-drift rounded-full border-2 border-secondary/40 [animation-delay:-6s]" />
      <div className="absolute bottom-[12%] left-[20%] h-10 w-10 animate-drift rotate-45 bg-accent/10 [animation-delay:-12s]" />
      <div className="absolute bottom-[20%] right-[22%] h-20 w-20 animate-drift rounded-3xl bg-primary/5 [animation-delay:-3s]" />
    </div>
  );
}

export function Progress({ current, results }: { current: number; results: (TierId | null | undefined)[] }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Question ${current + 1} of 7`}>
      {Array.from({ length: 7 }).map((_, i) => {
        const r = results[i];
        return (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              i === 6 && "h-3",
              r ? tierCls[r] : r === null ? "bg-muted-foreground/40" : i === current ? "bg-foreground" : "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}
