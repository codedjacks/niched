import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { ALL_QUESTIONS } from "./questions";
import { normalize, TIER_ORDER } from "./scoring";
import type { TierId } from "./types";
import { SPORTS_DAILY_FROM, toQuestion, type WireQuestion } from "./ai-daily";
import { CHALLENGES, challengePool, type ChallengeId } from "./challenges";
import type { Question } from "./types";

/** "main" = Daily Challenge; otherwise a topic challenge with its own daily AI round. */
export type Track = "main" | ChallengeId;

const CATEGORIES = [...new Set(ALL_QUESTIONS.map((q) => q.category))];

/** Few-shot samples from the hand-curated bank so generated rounds match its style and answer quality. */
function examples(count = 8, bank: Question[] = ALL_QUESTIONS): string {
  const step = Math.max(1, Math.floor(bank.length / count));
  const out: string[] = [];
  for (let i = 0; i < bank.length && out.length < count; i += step) {
    const q = bank[i]!;
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

async function loadReady(day: string, track: Track = "main"): Promise<WireQuestion[] | null> {
  const db = await admin();
  const { data } = await db.from("ai_questions").select("id, category, prompt, answers").eq("day", day).eq("track", track).order("position");
  if (!data || data.length !== 7) return null;
  return data.map((r) => ({ id: r.id, category: r.category, prompt: r.prompt, answers: r.answers as unknown as WireQuestion["answers"] }));
}

/** Self-hosted copies (e.g. Cloudflare) lack the database admin key; they read rounds from the Lovable-hosted game instead. */
const UPSTREAM = () => process.env["NICHED_UPSTREAM_URL"] || "https://niched.lovable.app";
const selfHosted = () => !process.env["SUPABASE_SERVICE_ROLE_KEY"];
async function upstream(day: string, track: Track): Promise<DailyStatus> {
  try {
    const r = await fetch(`${UPSTREAM()}/api/public/daily-round?day=${encodeURIComponent(day)}&track=${encodeURIComponent(track)}`);
    if (!r.ok) return { status: "failed", error: "Couldn't load today's questions" };
    return (await r.json()) as DailyStatus;
  } catch { return { status: "failed", error: "Couldn't load today's questions" }; }
}

export async function loadAiQuestion(id: string) {
  if (selfHosted()) {
    const m = /^ai-(?:(sports|entertainment|history)-)?(\d{4}-\d{2}-\d{2})-\d+$/.exec(id);
    if (!m) return null;
    const r = await upstream(m[2]!, (m[1] as Track | undefined) ?? "main");
    const w = r.status === "ready" ? r.questions.find((q) => q.id === id) : undefined;
    return w ? toQuestion(w) : null;
  }
  const db = await admin();
  const { data } = await db.from("ai_questions").select("id, category, prompt, answers").eq("id", id).maybeSingle();
  return data ? toQuestion({ ...data, answers: data.answers as unknown as WireQuestion["answers"] }) : null;
}

export async function aiDailyQuestions(day: string) {
  if (selfHosted()) { const r = await upstream(day, "main"); return r.status === "ready" ? r.questions.map(toQuestion) : []; }
  const w = await loadReady(day, "main");
  return w ? w.map(toQuestion) : [];
}

type RoundRow = { status: string; locked_until: string; error: string | null };
async function rounds(track: Track, D: string) {
  const db = await admin();
  if (track === "main") return {
    get: async () => (await db.from("ai_daily_rounds").select("status, locked_until, error").eq("day", D).maybeSingle()).data as RoundRow | null,
    insert: async (v: Partial<RoundRow>) => (await db.from("ai_daily_rounds").insert({ day: D, ...v })).error,
    takeExpired: async (v: Partial<RoundRow>, now: string) => (await db.from("ai_daily_rounds").update(v).eq("day", D).lt("locked_until", now).select("day")).data?.length ?? 0,
    set: async (v: Partial<RoundRow>) => { await db.from("ai_daily_rounds").update(v).eq("day", D); },
  };
  return {
    get: async () => (await db.from("ai_topic_rounds").select("status, locked_until, error").eq("day", D).eq("topic", track).maybeSingle()).data as RoundRow | null,
    insert: async (v: Partial<RoundRow>) => (await db.from("ai_topic_rounds").insert({ day: D, topic: track, ...v })).error,
    takeExpired: async (v: Partial<RoundRow>, now: string) => (await db.from("ai_topic_rounds").update(v).eq("day", D).eq("topic", track).lt("locked_until", now).select("day")).data?.length ?? 0,
    set: async (v: Partial<RoundRow>) => { await db.from("ai_topic_rounds").update(v).eq("day", D).eq("topic", track); },
  };
}

/** Returns the day's AI round for a track, generating it once (DB lease prevents parallel generation). */
export async function getOrCreateAiDaily(day: string, track: Track = "main"): Promise<DailyStatus> {
  if (selfHosted()) return upstream(day, track);
  const ready = await loadReady(day, track);
  if (ready) return { status: "ready", questions: ready };
  const db = await admin();
  const r = await rounds(track, day);
  const now = new Date().toISOString();
  const lease = new Date(Date.now() + 3 * 60_000).toISOString();

  const row = await r.get();
  if (row && row.locked_until > now) {
    return row.status === "failed" ? { status: "failed", error: row.error ?? "Couldn't write today's questions" } : { status: "generating" };
  }
  if (!row) {
    if (await r.insert({ status: "generating", locked_until: lease })) return { status: "generating" };
  } else if (!(await r.takeExpired({ status: "generating", locked_until: lease, error: null }, now))) return { status: "generating" };

  try {
    const questions = await generate(day, track);
    const { error } = await db.from("ai_questions").insert(questions.map((q, i) => ({
      id: q.id, day, track, position: i, category: q.category, prompt: q.prompt, prompt_key: normalize(q.prompt), answers: q.answers as never,
    })));
    if (error) throw new Error(error.message);
    await r.set({ status: "ready", error: null });
    return { status: "ready", questions };
  } catch (e) {
    console.error("AI daily generation failed", track, e);
    const msg = e instanceof Error && /402|credit/i.test(e.message) ? "Out of AI credits — today's questions couldn't be written" : "Couldn't write today's questions — try again in a minute";
    await r.set({ status: "failed", error: msg, locked_until: new Date(Date.now() + 60_000).toISOString() });
    return { status: "failed", error: msg };
  }
}

async function generate(day: string, track: Track): Promise<WireQuestion[]> {
  // From SPORTS_DAILY_FROM the main Daily Challenge is sports-only too.
  const topicId: ChallengeId | null = track === "main" ? (day >= SPORTS_DAILY_FROM ? "sports" : null) : track;
  const topic = topicId ? CHALLENGES[topicId] : null;
  const apiKey = (process.env["OPENAI_API_KEY"] ? undefined : process.env["LOVABLE_API_KEY"]);
  const openaiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey && !openaiKey) throw new Error("No AI key (LOVABLE_API_KEY or OPENAI_API_KEY)");
  const db = await admin();
  const { data: past } = await db.from("ai_questions").select("prompt_key").limit(5000);
  const used = new Set([...ALL_QUESTIONS.map((q) => normalize(q.prompt)), ...(past ?? []).map((r) => r.prompt_key)]);
  const recent = [...used].slice(-400).join("\n");

  // Lovable gateway when hosted on Lovable; the user's own OpenAI key when self-hosted (e.g. Cloudflare).
  const provider = apiKey
    ? createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } })
    : createOpenAI({ apiKey: openaiKey ?? "" });
  const result = streamText({
    model: provider.responses(apiKey ? "openai/gpt-6-astra" : "gpt-5-mini"),
    maxRetries: 0,
    output: Output.object({ schema }),
    system:
      "You write questions for Niched, a trivia game where players name ONE thing in a category and score more for valid answers that are less common. " +
      "Write exactly 9 open-ended 'Name a…' prompts in the same style as the hand-written EXAMPLES you are given: short, everyday-friendly categories a typical player instantly understands (e.g. 'Name a pizza topping', 'Name an NBA team', 'Name a Pixar movie'). " +
      (topic ? `EVERY prompt must be about ${topic.name} (categories: ${topic.categories.join(", ")}); vary sub-topics so no two prompts feel alike. ` : "Mix categories across food, science, geography, history, music, movies/TV, sports, gaming, brands, nature, literature. ") +
      "QUALITY RULES: Prefer broad, popular categories over narrow or academic ones. Avoid trick wording, compound conditions, date ranges, 'that starts with…', or anything needing research. " +
      "Every answer must be a REAL, well-known, verifiable thing a reasonable person could recognise — no invented items, no Wikipedia-deep trivia, no borderline or debatable members. If unsure an answer is correct, leave it out. " +
      "Each prompt must be unambiguous, factual and clearly different from every prompt in the 'already used' list (not a rewording). " +
      "For each prompt give 30-45 answers using the most common name, with aliases (alternate spellings, abbreviations, short names). Tier by how often typical players would say it: " +
      "pencil = the obvious top few, paperclip = very common, notebook = common, backpack = less common, goldstar = rare but still recognisable, valedictorian = obscure yet clearly correct and famous within its field. Include several of each tier.",
    prompt: `Date: ${day}\nKnown categories: ${(topic ? topic.categories : CATEGORIES).join(", ")}\n\nEXAMPLES of the quality and style to match:\n${examples(8, topicId ? challengePool(topicId) : ALL_QUESTIONS)}\n\nAlready used prompts (normalized):\n${recent}`,
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
      id: track === "main" ? `ai-${day}-${picked.length}` : `ai-${track}-${day}-${picked.length}`,
      category: q.category.trim().slice(0, 40),
      prompt: q.prompt.trim().slice(0, 160),
      answers: q.answers.slice(0, 60).map((a) => ({ name: a.name.trim(), tier: a.tier, aliases: a.aliases.slice(0, 6) })),
    });
    if (picked.length === 7) break;
  }
  if (picked.length !== 7) throw new Error(`Only ${picked.length} usable questions`);
  return picked;
}
