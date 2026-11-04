import { describe, expect, it } from "vitest";
import { BALLOTS } from "./ballot";
import { TOP10 } from "./top10";
import { TRIVIA_QUESTIONS } from "./trivia";
import { QUESTIONS, SPORTS_PRACTICE_QUESTIONS } from "./questions";

describe("AP NFL MVP content", () => {
  it("adds four real NFL MVP ballots with the true winner on top", () => {
    const nfl = BALLOTS.filter((b) => b.award === "NFL MVP");
    expect(nfl.map((b) => b.season)).toEqual(["2025", "2024", "2023", "2022"]);
    expect(nfl.map((b) => b.order[0])).toEqual(["Matthew Stafford", "Josh Allen", "Lamar Jackson", "Patrick Mahomes"]);
    expect(nfl.every((b) => b.order.length === 5 && new Set(b.order).size === 5)).toBe(true);
  });

  it("adds two ten-name MVP top-10 lists", () => {
    for (const title of ["NFL teams by most recent AP MVP", "AP NFL MVP winners by most recent win"]) {
      expect(TOP10.find((t) => t.title === title)!.names).toHaveLength(10);
    }
    expect(TOP10.find((t) => t.title === "NFL teams by most recent AP MVP")!.names[0]![0]).toBe("Los Angeles Rams");
    expect(TOP10.find((t) => t.title === "AP NFL MVP winners by most recent win")!.names[0]![0]).toBe("Matthew Stafford");
  });

  it("scores the obscure MVP answer above the famous one", () => {
    const q = SPORTS_PRACTICE_QUESTIONS.find((x) => x.id === "sp-mvp-rb")!;
    expect(q.answers.get("shaun alexander")?.tier).toBe("goldstar");
    expect(q.answers.get("adrian peterson")?.tier).toBe("paperclip");
  });

  it("keeps MVP practice questions out of the historical daily bank", () => {
    expect(QUESTIONS.some((q) => q.id.startsWith("sp-mvp"))).toBe(false);
  });

  it("adds the ball-knowledge questions to Quick Trivia with their answer among the options", () => {
    const pairs: [string, string][] = [
      ["Who is the only player to win the European Cup / Champions League with three different clubs?", "Clarence Seedorf"],
      ["Which country lost the World Cup final in 1974, 1978 and 2010?", "Netherlands"],
      ["Which pitcher gave up two grand slams in one inning to Fernando Tatis Jr.?", "Chan Ho Park"],
      ["Who is the only player named NBA Finals MVP while his team lost the series?", "Jerry West"],
      ["Who holds the NBA single-game assists record with 30?", "Scott Skiles"],
      ["How many quarterbacks were taken in the first round of the 1983 NFL Draft?", "Six"],
      ["Who was the first defensive player voted AP NFL MVP?", "Alan Page"],
      ["Who won the 2025 AP NFL MVP award?", "Matthew Stafford"],
    ];
    for (const [prompt, answer] of pairs) {
      const q = TRIVIA_QUESTIONS.find((x) => x.prompt === prompt)!;
      expect(q.answer).toBe(answer);
      expect(q.options).toContain(answer);
    }
    expect(TRIVIA_QUESTIONS.length).toBeGreaterThanOrEqual(315);
  });
});
