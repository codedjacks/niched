import { useEffect, useState } from "react";
import { TIERS, TIER_ORDER } from "@/game/scoring";
import { cn } from "@/lib/utils";

/** Map a points share (0..1) to a landing marker; -1 = dropped at the thrower. */
export function throwTarget(points: number, max: number): number {
  if (points <= 0 || max <= 0) return -1;
  return Math.min(TIER_ORDER.length - 1, Math.floor((points / max) * TIER_ORDER.length));
}

/** Pixel ball-throw: the farther it flies, the better the result. Shared by reveals. */
export function ThrowField({ target, caption, onLanded }: { target: number; caption?: string; onLanded?: () => void }) {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const flightMs = 800 + Math.max(target, 0) * 160;
  const knower = target === TIER_ORDER.length - 1;
  const land = target < 0 ? 0.02 : knower ? 1.08 : (target + 0.5) / TIER_ORDER.length;
  const peak = target < 0 ? 10 : 18 + target * 10;

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setStep(target); setDone(true); onLanded?.(); return; }
    const timers = TIER_ORDER.slice(0, target + 1).map((_, i) =>
      setTimeout(() => setStep(i), ((i + 0.5) / (target + 1)) * flightMs),
    );
    timers.push(setTimeout(() => { setDone(true); onLanded?.(); }, flightMs + 350));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn("throw-field relative h-28 overflow-hidden rounded-md border-2 border-border bg-background/60", done && knower && "animate-stadium-flash")}
      aria-hidden
      style={{ ["--land" as string]: land, ["--peak" as string]: `-${peak}px`, ["--dur" as string]: `${flightMs}ms` }}
    >
      <div className="absolute inset-x-0 bottom-0 h-6 bg-accent/40" />
      <div className="absolute bottom-6 left-1 text-2xl leading-none">🧍</div>
      <div className="absolute inset-x-0 bottom-0 flex h-6">
        {TIER_ORDER.map((t, i) => (
          <div key={t} className="flex flex-1 items-center justify-center border-l border-dashed border-border first:border-l-0">
            <span className={cn("text-sm transition-all duration-200", i <= step ? "scale-125 opacity-100" : "opacity-30 grayscale", done && i === target && "scale-150")}>
              {TIERS[t].emoji}
            </span>
          </div>
        ))}
      </div>
      <div className="throw-x absolute bottom-6 left-6">
        <div className={cn("throw-y text-xl leading-none", target <= 0 && "throw-wobble")}>⚾</div>
      </div>
      {done && !knower && (
        <div className="absolute bottom-5 animate-dust text-sm" style={{ left: `calc(${land * 100}% - 6px)` }}>💥</div>
      )}
      {done && (knower || caption) && (
        <div className="absolute inset-x-0 top-2 animate-stamp text-center font-display text-sm font-bold uppercase text-primary">
          {knower ? "Out of the park!" : caption}
        </div>
      )}
    </div>
  );
}
