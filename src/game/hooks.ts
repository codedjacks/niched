import { useEffect, useRef, useState } from "react";

/** Countdown that calls onExpire once; cleans up its interval. */
export function useCountdown(seconds: number, running: boolean, resetKey: unknown, onExpire: () => void) {
  const [left, setLeft] = useState(seconds);
  const remaining = useRef(seconds);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  // Reset runs before the ticking effect, so a new question always starts from the full duration.
  useEffect(() => {
    remaining.current = seconds;
    setLeft(seconds);
  }, [resetKey, seconds]);
  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + remaining.current * 1000;
    let fired = false;
    const id = setInterval(() => {
      const rem = Math.max(0, (deadline - Date.now()) / 1000);
      remaining.current = rem;
      setLeft(rem);
      if (rem <= 0 && !fired) {
        fired = true;
        clearInterval(id);
        cb.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, resetKey, seconds]);
  return left;
}

/** Animated number tween. */
export function useCountUp(target: number, ms = 600) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(a + (target - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
