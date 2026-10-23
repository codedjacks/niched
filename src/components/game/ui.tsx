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

/** A short chalk doodle stroke. */
function Doodle({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {children}
    </svg>
  );
}

/** Night-classroom world: chalk graph paper, red margin line, drifting chalk doodles. */
export function GeoBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grid-bg">
      {/* notebook margin */}
      <div className="absolute inset-y-0 left-8 w-px bg-secondary/25 sm:left-12" />
      <div className="absolute inset-y-0 left-10 w-px bg-secondary/10 sm:left-14" />
      {/* paper plane */}
      <Doodle className="absolute right-[9%] top-[16%] h-28 w-28 animate-drift text-foreground/20">
        <path d="M8 55 92 18 62 88 46 60Z" />
        <path d="M46 60 92 18" />
      </Doodle>
      {/* orbiting atom */}
      <Doodle className="absolute bottom-[14%] right-[16%] h-24 w-24 animate-drift text-foreground/15 [animation-delay:-6s]">
        <circle cx="50" cy="50" r="30" />
        <ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(-25 50 50)" />
        <circle cx="82" cy="34" r="4" fill="currentColor" stroke="none" />
      </Doodle>
      {/* star doodle */}
      <Doodle className="absolute left-[14%] top-[38%] h-16 w-16 animate-drift text-secondary/30 [animation-delay:-11s]">
        <path d="M50 10 60 40 92 40 66 58 76 90 50 70 24 90 34 58 8 40 40 40Z" />
      </Doodle>
      {/* circled A+ */}
      <Doodle className="absolute bottom-[24%] left-[8%] h-20 w-20 animate-drift text-foreground/15 [animation-delay:-3s]">
        <circle cx="50" cy="50" r="40" />
        <path d="M34 62 46 30 58 62M38 52h16" />
        <path d="M66 38v20M56 48h20" />
      </Doodle>
      {/* arrow doodle */}
      <Doodle className="absolute right-[28%] top-[8%] h-14 w-14 animate-drift text-marker/40 [animation-delay:-8s]">
        <path d="M12 80 C 40 60, 55 40, 80 22" />
        <path d="M80 22l-16 2M80 22l-2 16" />
      </Doodle>
      {/* scattered plus marks */}
      <Doodle className="absolute left-[30%] bottom-[8%] h-10 w-10 animate-drift text-foreground/15 [animation-delay:-14s]">
        <path d="M50 25v50M25 50h50" />
      </Doodle>
      <Doodle className="absolute right-[6%] top-[52%] h-8 w-8 animate-drift text-foreground/15 [animation-delay:-9s]">
        <path d="M50 25v50M25 50h50" />
      </Doodle>
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
              r ? tierCls[r] : r === null ? "bg-muted-foreground/40" : i === current ? "bg-primary" : "bg-muted",
            )}
          />
        );
      })}
    </div>
  );
}
