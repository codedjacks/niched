import { describe, it, expect } from "vitest";
import { dateKey, dayIsCurrent, msUntilNextDaily } from "./selection";

describe("daily rolls over at midnight Central time", () => {
  it("11:59pm CDT is still the same day; 12:00am is the next", () => {
    expect(dateKey(new Date("2026-10-28T04:59:00Z"))).toBe("2026-10-27");
    expect(dateKey(new Date("2026-10-28T05:00:00Z"))).toBe("2026-10-28");
  });
  it("uses CST (UTC-6) in winter", () => {
    expect(dateKey(new Date("2026-12-02T05:30:00Z"))).toBe("2026-12-01");
    expect(dateKey(new Date("2026-12-02T06:00:00Z"))).toBe("2026-12-02");
  });
  it("countdown hits Central midnight", () => {
    expect(msUntilNextDaily(new Date("2026-10-28T04:00:00Z"))).toBe(3600_000);
  });
  it("accepts today, rejects tomorrow and two days ago", () => {
    const now = new Date("2026-10-27T15:00:00Z");
    expect(dayIsCurrent("2026-10-27", now)).toBe(true);
    expect(dayIsCurrent("2026-10-28", now)).toBe(false);
    expect(dayIsCurrent("2026-10-25", now)).toBe(false);
  });
});
