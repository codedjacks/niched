import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./hooks";

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts each new question with a fresh 25 seconds", () => {
    const { result, rerender } = renderHook(
      ({ running, k }) => useCountdown(25, running, k, () => {}),
      { initialProps: { running: true, k: 0 } },
    );
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current).toBeCloseTo(15, 0);
    // answer reveal pauses the timer
    rerender({ running: false, k: 0 });
    act(() => vi.advanceTimersByTime(2_000));
    // next question
    rerender({ running: true, k: 1 });
    expect(result.current).toBe(25);
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current).toBeCloseTo(24, 0);
  });

  it("expires once after 25 seconds", () => {
    const onExpire = vi.fn();
    renderHook(() => useCountdown(25, true, 0, onExpire));
    act(() => vi.advanceTimersByTime(24_000));
    expect(onExpire).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2_000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
