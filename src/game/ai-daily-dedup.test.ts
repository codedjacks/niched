import { describe, expect, it } from "vitest";
import { isRepeatPrompt, promptTokens } from "./ai-daily";
import { normalize } from "./scoring";

const used = (...prompts: string[]) => prompts.map(normalize);

describe("isRepeatPrompt", () => {
  it("rejects an exact repeat of a used prompt", () => {
    expect(isRepeatPrompt("Name an NFL coach who has won a Super Bowl", used("Name an NFL coach who has won a Super Bowl"))).toBe(true);
  });

  it("rejects a repeat with different casing and punctuation", () => {
    expect(isRepeatPrompt("Name an NFL Coach who has won a Super-Bowl!", used("Name an NFL coach who has won a Super Bowl"))).toBe(true);
  });

  it("rejects a lightly reworded repeat", () => {
    expect(
      isRepeatPrompt("Name an NBA player famous for his nickname", used("Name an NBA player widely known by a nickname")),
    ).toBe(true);
  });

  it("rejects a repeat with words dropped or added", () => {
    expect(
      isRepeatPrompt("Name an athlete who has won an Olympic gold medal", used("Name an athlete who has won multiple Olympic gold medals")),
    ).toBe(true);
  });

  it("allows a genuinely different question in the same sport", () => {
    expect(
      isRepeatPrompt("Name an NFL coach who has won a Super Bowl", used("Name an NBA player widely known by a nickname")),
    ).toBe(false);
  });

  it("allows questions that share only generic words", () => {
    expect(
      isRepeatPrompt("Name a tennis player who has been ranked world No. 1", used("Name a soccer player who has captained their national team")),
    ).toBe(false);
  });

  it("allows a new question against a large used list", () => {
    const many = used(
      "Name an athlete who has won multiple Olympic gold medals",
      "Name a soccer player who has captained their national team",
      "Name an NBA player widely known by a nickname",
      "Name an NFL coach who has won a Super Bowl",
      "Name an MLB player involved in a famous trade",
      "Name a college program that has won the men's NCAA basketball title",
      "Name a tennis player who has been ranked world No. 1",
    );
    expect(isRepeatPrompt("Name an NHL team that has moved cities", many)).toBe(false);
  });

  it("treats an empty prompt as a repeat so it is never picked", () => {
    expect(isRepeatPrompt("   ", used("Name an NBA team"))).toBe(true);
  });

  it("keeps different achievements in the same league as separate questions", () => {
    expect(
      isRepeatPrompt("Name an NBA player who has won a championship", used("Name an NBA player who has won MVP")),
    ).toBe(false);
  });

  it("rejects a shorter reask of a past question", () => {
    expect(
      isRepeatPrompt("Name a famous sports trade", used("Name an MLB player involved in a famous trade")),
    ).toBe(true);
  });
});

describe("promptTokens", () => {
  it("drops stopwords and single letters", () => {
    expect(promptTokens("Name a player who has won a title")).toEqual(new Set(["player", "won", "title"]));
  });
});
