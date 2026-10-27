import { describe, it, expect } from "vitest";
import { CAREERS, careerForDay, careerScore, isCareerAnswer } from "./career";
import { DRAFTS, draftForDay, draftScore, isDraftAnswer } from "./draft";

describe("Career Path", () => {
  it("same player for everyone on a day", () => expect(careerForDay("2026-10-27")).toBe(careerForDay("2026-10-27")));
  it("points per guess 100/80/60/40/20", () => expect([1, 2, 3, 4, 5].map(careerScore)).toEqual([100, 80, 60, 40, 20]));
  it("every career has at least 2 teams and unique name", () => {
    for (const c of CAREERS) expect(c.teams.length).toBeGreaterThanOrEqual(2);
    expect(new Set(CAREERS.map((c) => c.name)).size).toBe(CAREERS.length);
  });
  it("accepts aliases", () => expect(isCareerAnswer(CAREERS.find((c) => c.name === "Shaquille O'Neal")!, "shaq")).toBe(true));
});

describe("Draft Day", () => {
  it("same pick for everyone on a day", () => expect(draftForDay("2026-10-27")).toBe(draftForDay("2026-10-27")));
  it("points per guess 100/60/30", () => expect([1, 2, 3].map(draftScore)).toEqual([100, 60, 30]));
  it("each league-year appears once with full hints", () => {
    expect(new Set(DRAFTS.map((d) => `${d.league}${d.year}`)).size).toBe(DRAFTS.length);
    for (const d of DRAFTS) expect(d.position && d.school && d.team).toBeTruthy();
  });
  it("matches the answer", () => expect(isDraftAnswer(DRAFTS.find((d) => d.year === 2003 && d.league === "NBA")!, "LeBron James")).toBe(true));
});
