import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { TIERS, TIER_ORDER, normalize, validateAnswer, type RaritySource, curatedRarity, type QuestionCounts } from "./scoring";
import type { Question, TierId } from "./types";

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
export async function aiJudge(q: Question, answer: string): Promise<JudgeResult> {
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
      prompt: `Question: ${q.prompt}\nCategory: ${q.category}\nCurated answers (name = tier):\n${curated}\n\nPlayer answer: ${answer}`,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low" } },
    });
    const out = await result.output;
    if (!out.valid) return { ok: false, reason: "invalid", message: `"${answer.trim()}" doesn't count — try another` };
    const cur = out.matched_curated
      ? [...q.answers.values()].find((a) => a.display.toLowerCase() === out.matched_curated!.toLowerCase())
      : undefined;
    const tier = cur?.tier ?? out.tier;
    return { ok: true, display: cur?.display ?? out.display, tier, points: TIERS[tier].points, matchedCurated: !!cur };
  } catch (e) {
    console.error("aiJudge failed", e);
    return { ok: false, reason: "unavailable", message: "Answer checker is busy — try another answer" };
  }
}

export type Verified = { display: string; tier: TierId; points: number } | null;

/** Authoritative server-side scoring of one typed answer. */
export async function verifyAnswer(q: Question, typed: string | null, rarity: RaritySource = curatedRarity): Promise<Verified> {
  if (!typed || !normalize(typed)) return null;
  const v = validateAnswer(q, typed.slice(0, 60), new Set(), rarity);
  if (v.ok) return { display: v.display, tier: v.tier, points: v.points };
  const r = await aiJudge(q, typed.slice(0, 60));
  if (!r.ok) return null;
  const tier = rarity.tierFor(q, normalize(r.display), r.tier);
  return { display: r.display, tier, points: TIERS[tier].points };
}

/** Real answer counts for questions, read with the service client (server-only). */
export async function loadCounts(questionIds: string[]): Promise<Record<string, QuestionCounts>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: Record<string, QuestionCounts> = {};
  const { data } = await supabaseAdmin.from("answer_counts").select("question_id, answer_key, count").in("question_id", questionIds);
  for (const r of data ?? []) {
    const d = (out[r.question_id] ??= { total: 0, counts: {} });
    d.counts[r.answer_key] = r.count;
    d.total += r.count;
  }
  return out;
}
