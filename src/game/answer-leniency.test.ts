import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalize, frequencyRarity } from "./scoring";
import type { Question } from "./types";

const model = vi.hoisted(() => ({ output: vi.fn() }));
vi.mock("ai", () => ({
  Output: { object: () => ({}) },
  streamText: (request: unknown) => ({ output: model.output(request) }),
}));
vi.mock("@ai-sdk/openai", () => ({ createOpenAI: () => ({ responses: () => "test-model" }) }));
import { aiJudge, verifyAnswer } from "./judge.server";

const question: Question = { id: "vegetable", category: "Food", prompt: "Name a vegetable", answers: new Map([["carrot", { display: "Carrot", tier: "pencil" }]]) };

describe("generous answer grading", () => {
  beforeEach(() => { vi.stubEnv("LOVABLE_API_KEY", "test-only-key"); model.output.mockReset(); });
  it("preserves non-Latin answers instead of treating them as empty", () => {
    expect(normalize("  日本  ")).toBe("日本");
    expect(normalize("مصر")).toBe("مصر");
  });
  it("scores defensible unlisted answers using the model decision", async () => {
    model.output.mockResolvedValue({ valid: true, matched_curated: null, display: "Tomato", tier: "notebook" });
    expect(await verifyAnswer(question, "tomato")).toEqual({ display: "Tomato", tier: "notebook", points: 30 });
  });
  it("sends translated answers to the judge and canonicalizes curated matches", async () => {
    model.output.mockResolvedValue({ valid: true, matched_curated: "Carrot", display: "Carrot", tier: "goldstar" });
    expect(await verifyAnswer(question, "胡萝卜")).toEqual({ display: "Carrot", tier: "pencil", points: 10 });
    expect(model.output).toHaveBeenCalledOnce();
  });
  it("still rejects unrelated answers instead of awarding free points", async () => {
    model.output.mockResolvedValue({ valid: false, matched_curated: null, display: "", tier: "pencil" });
    expect(await aiJudge(question, "a spaceship")).toMatchObject({ ok: false, reason: "invalid" });
  });
  it("says a wrong answer doesn't count (not offline) when no AI key is set", async () => {
    vi.stubEnv("LOVABLE_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(await aiJudge(question, "a spaceship")).toMatchObject({ ok: false, reason: "invalid" });
    expect(model.output).not.toHaveBeenCalled();
  });
  it("uses an OpenAI key when the Lovable key is missing", async () => {
    vi.stubEnv("LOVABLE_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "test-openai");
    model.output.mockResolvedValue({ valid: true, matched_curated: null, display: "Tomato", tier: "notebook" });
    expect(await aiJudge(question, "tomato")).toMatchObject({ ok: true, display: "Tomato" });
  });
  it("awards older lesser-known sports answers the same calibrated tier during play and verification", async () => {
    const sports: Question = { id: "ai-2026-10-26-0", category: "Sports", prompt: "Name an NFL quarterback", answers: new Map() };
    model.output.mockResolvedValue({ valid: true, matched_curated: null, display: "Mark Rypien", tier: "notebook", recognition: "specialist", last_relevant_year: 2002 });
    expect(await aiJudge(sports, "Mark Rypien")).toMatchObject({ ok: true, tier: "goldstar", points: 85 });
    expect(await verifyAnswer(sports, "Mark Rypien")).toEqual({ display: "Mark Rypien", tier: "goldstar", points: 85 });
  });
  it("uses real frequencies instead of estimated recognition once enough answers exist", async () => {
    const sports: Question = { id: "sports-qb", category: "Sports", prompt: "Name an NFL quarterback", answers: new Map() };
    model.output.mockResolvedValue({ valid: true, matched_curated: null, display: "Mark Rypien", tier: "notebook", recognition: "specialist", last_relevant_year: 2002 });
    const rarity = frequencyRarity({ "sports-qb": { total: 100, counts: { "mark rypien": 30 } } });
    expect(await verifyAnswer(sports, "Mark Rypien", rarity)).toEqual({ display: "Mark Rypien", tier: "pencil", points: 10 });
  });
  it("prevents translations or missed curated matches from inflating a famous answer", async () => {
    model.output.mockResolvedValue({ valid: true, matched_curated: null, display: "Carrot", tier: "valedictorian", recognition: null, last_relevant_year: null });
    expect(await verifyAnswer(question, "胡萝卜")).toEqual({ display: "Carrot", tier: "pencil", points: 10 });
  });
});