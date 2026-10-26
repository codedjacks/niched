import { TIERS } from "@/game/scoring";
import type { TierId } from "@/game/types";
import { cn } from "@/lib/utils";

const tierCls: Record<TierId, string> = {
  pencil: "bg-tier-pencil text-ink",
  paperclip: "bg-tier-paperclip text-ink",
  notebook: "bg-tier-notebook text-ink",
  backpack: "bg-tier-backpack text-ink",
  goldstar: "bg-tier-goldstar text-ink",
  valedictorian: "bg-tier-valedictorian text-ink shadow-[0_0_20px_-4px_var(--tier-valedictorian)]",
};

/** Sticker-style badge: chunky border, hard offset shadow, slight tilt. */
export function TierBadge({ tier, className }: { tier: TierId; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex -rotate-1 items-center rounded-md border-2 border-ink/40 px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider shadow-pop-sm",
        tierCls[tier],
        className,
      )}
    >
      {TIERS[tier].label}
    </span>
  );
}


/** 8-bit night game: stadium lights over a pixel turf field, drifting pixel balls. */
export function GeoBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background led">
      {/* stadium light glow */}
      <div className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      {/* pixel field along the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-28 turf-bg opacity-60 [image-rendering:pixelated]" />
      <div className="absolute inset-x-0 bottom-28 h-1 bg-foreground/30" />
      <Pixel className="absolute right-[9%] top-[18%] h-20 w-20 animate-drift text-secondary/50" art={BALL} />
      <Pixel className="absolute bottom-[26%] left-[8%] h-16 w-16 animate-drift text-primary/40 [animation-delay:-6s]" art={FOOTBALL} />
      <Pixel className="absolute left-[30%] top-[10%] h-12 w-12 animate-drift text-foreground/20 [animation-delay:-11s]" art={STAR} />
      <Pixel className="absolute bottom-[34%] right-[18%] h-14 w-14 animate-drift text-foreground/20 [animation-delay:-3s]" art={BALL} />
    </div>
  );
}

const BALL = ["..xxxx..", ".xx..xx.", "x.x..x.x", "x..xx..x", "x..xx..x", "x.x..x.x", ".xx..xx.", "..xxxx.."];
const FOOTBALL = ["........", "..xxxx..", ".xxxxxx.", "xx.x.x.x", "x.x.x.xx", ".xxxxxx.", "..xxxx..", "........"];
const STAR = ["...xx...", "...xx...", "xxxxxxxx", ".xxxxxx.", "..xxxx..", ".xx..xx.", "xx....xx", "........"];
function Pixel({ className, art }: { className: string; art: string[] }) {
  return (
    <svg viewBox="0 0 8 8" className={className} shapeRendering="crispEdges" fill="currentColor">
      {art.flatMap((row, y) => [...row].map((c, x) => (c === "x" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null)))}
    </svg>
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
              r ? tierCls[r] : r === null ? "bg-muted-foreground/40" : i === current ? "bg-primary" : "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}
