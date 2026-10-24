import { beforeEach, describe, expect, it, vi } from "vitest";
import { normalize } from "./scoring";
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
});