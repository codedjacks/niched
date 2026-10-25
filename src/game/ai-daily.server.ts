import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { ALL_QUESTIONS } from "./questions";
import { normalize, TIER_ORDER } from "./scoring";
import type { TierId } from "./types";
import { toQuestion, type WireQuestion } from "./ai-daily";

const CATEGORIES = [...new Set(ALL_QUESTIONS.map((q) => q.category))];

/** Few-shot samples from the hand-curated bank so generated rounds match its style and answer quality. */
function examples(count = 8): string {
  const step = Math.max(1, Math.floor(ALL_QUESTIONS.length / count));
  const out: string[] = [];
  for (let i = 0; i < ALL_QUESTIONS.length && out.length < count; i += step) {
    const q = ALL_QUESTIONS[i];
    const byTier = new Map<TierId, string[]>();
    const seen = new Set<string>();
    for (const { display, tier } of q.answers.values()) {
      if (seen.has(display)) continue;
      seen.add(display);
      const list = byTier.get(tier) ?? [];
      if (list.length < 3) list.push(display);
      byTier.set(tier, list);
    }
    const tiers = TIER_ORDER.filter((t) => byTier.has(t)).map((t) => `${t}: ${byTier.get(t)!.join(", ")}`).join(" | ");
    out.push(`- [${q.category}] ${q.prompt} → ${tiers}`);
  }
  return out.join("\n");
}

const schema = z.object({
  questions: z.array(z.object({
    category: z.string(),
    prompt: z.string(),
    answers: z.array(z.object({
      name: z.string(),
      aliases: z.array(z.string()),
      tier: z.enum(TIER_ORDER as [TierId, ...TierId[]]),
    })),
  })),
});

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

export type DailyStatus = { status: "ready"; questions: WireQuestion[] } | { status: "generating" } | { status: "failed"; error: string };

async function loadReady(day: string): Promise<WireQuestion[] | null> {
  const db = await admin();
  const { data } = await db.from("ai_questions").select("id, category, prompt, answers").eq("day", day).order("position");
  if (!data || data.length !== 7) return null;
  return data.map((r) => ({ id: r.id, category: r.category, prompt: r.prompt, answers: r.answers as unknown as WireQuestion["answers"] }));
}

export async function loadAiQuestion(id: string) {
  const db = await admin();
  const { data } = await db.from("ai_questions").select("id, category, prompt, answers").eq("id", id).maybeSingle();
  return data ? toQuestion({ ...data, answers: data.answers as unknown as WireQuestion["answers"] }) : null;
}

export async function aiDailyQuestions(day: string) {
  const w = await loadReady(day);
  return w ? w.map(toQuestion) : [];
}

/** Returns the day's AI round, generating it once (DB lease prevents parallel generation). */
export async function getOrCreateAiDaily(day: string): Promise<DailyStatus> {
  const ready = await loadReady(day);
  if (ready) return { status: "ready", questions: ready };
  const db = await admin();
  const now = new Date().toISOString();
  const lease = new Date(Date.now() + 3 * 60_000).toISOString();

  const { data: row } = await db.from("ai_daily_rounds").select("status, locked_until, error").eq("day", day).maybeSingle();
  if (row && row.locked_until > now) {
    return row.status === "failed" ? { status: "failed", error: row.error ?? "Couldn't write today's questions" } : { status: "generating" };
  }
  // Acquire lease: insert, or take over an expired one.
  if (!row) {
    const { error } = await db.from("ai_daily_rounds").insert({ day, status: "generating", locked_until: lease });
    if (error) return { status: "generating" };
  } else {
    const { data: took } = await db.from("ai_daily_rounds").update({ status: "generating", locked_until: lease, error: null })
      .eq("day", day).lt("locked_until", now).select("day");
    if (!took?.length) return { status: "generating" };
  }

  try {
    const questions = await generate(day);
    const { error } = await db.from("ai_questions").insert(questions.map((q, i) => ({
      id: q.id, day, position: i, category: q.category, prompt: q.prompt, prompt_key: normalize(q.prompt), answers: q.answers as never,
    })));
    if (error) throw new Error(error.message);
    await db.from("ai_daily_rounds").update({ status: "ready", error: null }).eq("day", day);
    return { status: "ready", questions };
  } catch (e) {
    console.error("AI daily generation failed", e);
    const msg = e instanceof Error && /402|credit/i.test(e.message) ? "Out of AI credits — today's questions couldn't be written" : "Couldn't write today's questions — try again in a minute";
    // Short cooldown before another attempt so failures never loop.
    await db.from("ai_daily_rounds").update({ status: "failed", error: msg, locked_until: new Date(Date.now() + 60_000).toISOString() }).eq("day", day);
    return { status: "failed", error: msg };
  }
}

async function generate(day: string): Promise<WireQuestion[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const db = await admin();
  const { data: past } = await db.from("ai_questions").select("prompt_key").limit(5000);
  const used = new Set([...ALL_QUESTIONS.map((q) => normalize(q.prompt)), ...(past ?? []).map((r) => r.prompt_key)]);
  const recent = [...used].slice(-400).join("\n");

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    maxRetries: 0,
    output: Output.object({ schema }),
    system:
      "You write questions for Niched, a trivia game where players name ONE thing in a category and score more for valid answers that are less common. " +
      "Write exactly 9 open-ended 'Name a…' prompts in the same style as the hand-written EXAMPLES you are given: short, everyday-friendly categories a typical player instantly understands (e.g. 'Name a pizza topping', 'Name an NBA team', 'Name a Pixar movie'). " +
      "Mix categories across food, science, geography, history, music, movies/TV, sports, gaming, brands, nature, literature. " +
      "QUALITY RULES: Prefer broad, popular categories over narrow or academic ones. Avoid trick wording, compound conditions, date ranges, 'that starts with…', or anything needing research. " +
      "Every answer must be a REAL, well-known, verifiable thing a reasonable person could recognise — no invented items, no Wikipedia-deep trivia, no borderline or debatable members. If unsure an answer is correct, leave it out. " +
      "Each prompt must be unambiguous, factual and clearly different from every prompt in the 'already used' list (not a rewording). " +
      "For each prompt give 30-45 answers using the most common name, with aliases (alternate spellings, abbreviations, short names). Tier by how often typical players would say it: " +
      "pencil = the obvious top few, paperclip = very common, notebook = common, backpack = less common, goldstar = rare but still recognisable, valedictorian = obscure yet clearly correct and famous within its field. Include several of each tier.",
    prompt: `Date: ${day}\nKnown categories: ${CATEGORIES.join(", ")}\n\nEXAMPLES of the quality and style to match:\n${examples()}\n\nAlready used prompts (normalized):\n${recent}`,
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low" } },
  });
  const out = await result.output;
  const seen = new Set(used);
  const picked: WireQuestion[] = [];
  for (const q of out.questions) {
    const key = normalize(q.prompt);
    if (!key || seen.has(key) || q.answers.length < 15) continue;
    seen.add(key);
    picked.push({
      id: `ai-${day}-${picked.length}`,
      category: q.category.trim().slice(0, 40),
      prompt: q.prompt.trim().slice(0, 160),
      answers: q.answers.slice(0, 60).map((a) => ({ name: a.name.trim(), tier: a.tier, aliases: a.aliases.slice(0, 6) })),
    });
    if (picked.length === 7) break;
  }
  if (picked.length !== 7) throw new Error(`Only ${picked.length} usable questions`);
  return picked;
}
