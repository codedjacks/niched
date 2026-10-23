import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { QUESTIONS } from "./questions";
import { TIERS, TIER_ORDER } from "./scoring";
import type { TierId } from "./types";

export type JudgeResult =
  | { ok: true; display: string; tier: TierId; points: number; matchedCurated: boolean }
  | { ok: false; reason: "invalid" | "unavailable"; message: string };

const schema = z.object({
  valid: z.boolean(),
  matched_curated: z.string().nullable(),
  display: z.string(),
  tier: z.enum(TIER_ORDER as [TierId, ...TierId[]]),
});

/** AI referee: checks a free-text answer against a question's curated answers and assigns a tier. */
export const judgeAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: { questionId: string; answer: string }) => ({
    questionId: String(d.questionId),
    answer: String(d.answer).slice(0, 120),
  }))
  .handler(async ({ data }): Promise<JudgeResult> => {
    const q = QUESTIONS.find((x) => x.id === data.questionId);
    if (!q || !data.answer.trim()) return { ok: false, reason: "invalid", message: "Not a valid answer" };
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, reason: "unavailable", message: "Answer checker is offline" };

    const curated = [...new Map([...q.answers.values()].map((a) => [a.display, a.tier])).entries()]
      .map(([d, t]) => `${d} = ${t}`).join("\n");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        output: Output.object({ schema }),
        system:
          "You referee a trivia game. Decide if the player's answer is a genuine, correct answer to the question (allow typos, nicknames, alternate spellings, other languages). " +
          "If it matches a curated answer, set matched_curated to that exact curated name and use its tier. " +
          "If it is correct but not curated, set matched_curated null and pick a tier by how obscure it is: pencil (very common) < paperclip < notebook < backpack < goldstar < valedictorian (extremely obscure). " +
          "Reject jokes, wrong-category answers, gibberish and vague answers. display = clean canonical name.",
        prompt: `Question: ${q.prompt}\nCategory: ${q.category}\nCurated answers (name = tier):\n${curated}\n\nPlayer answer: ${data.answer}`,
        providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low" } },
      });
      const out = await result.output;
      if (!out.valid) return { ok: false, reason: "invalid", message: `"${data.answer.trim()}" doesn't count — try another` };
      const cur = out.matched_curated
        ? [...q.answers.values()].find((a) => a.display.toLowerCase() === out.matched_curated!.toLowerCase())
        : undefined;
      const tier = cur?.tier ?? out.tier;
      return { ok: true, display: cur?.display ?? out.display, tier, points: TIERS[tier].points, matchedCurated: !!cur };
    } catch (e) {
      console.error("judgeAnswer failed", e);
      return { ok: false, reason: "unavailable", message: "Answer checker is busy — try another answer" };
    }
  });
