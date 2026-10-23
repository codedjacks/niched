import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { QUESTIONS } from "./questions";
import { practiceQuestions } from "./selection";

const CODE = /^[A-Z0-9]{6}$/;
const START_DELAY_MS = 5000;

function newCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => chars[b % chars.length]).join("");
}

/** Host opens a live head-to-head room with 7 random questions. */
export const createMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let i = 0; i < 4; i++) {
      const code = newCode();
      const { error } = await supabaseAdmin.from("matches").insert({
        code, host_id: context.userId, question_ids: practiceQuestions().map((q) => q.id),
      });
      if (!error) return { code };
      if (error.code !== "23505") { console.error(error); break; }
    }
    throw new Error("Couldn't open a room — try again");
  });

/** Second player joins by code; the round starts for both a few seconds later. */
export const joinMatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => {
    const code = String(d.code).toUpperCase();
    if (!CODE.test(code)) throw new Error("Bad code");
    return { code };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m } = await supabaseAdmin.from("matches").select("*").eq("code", data.code).maybeSingle();
    if (!m) return { ok: false as const, error: "Room not found" };
    if (m.host_id === context.userId || m.guest_id === context.userId) return { ok: true as const };
    if (m.guest_id) return { ok: false as const, error: "This room is already full" };
    const { data: upd } = await supabaseAdmin.from("matches")
      .update({ guest_id: context.userId, status: "playing", starts_at: new Date(Date.now() + START_DELAY_MS).toISOString() })
      .eq("id", m.id).is("guest_id", null).select("id");
    if (!upd?.length) return { ok: false as const, error: "This room is already full" };
    return { ok: true as const };
  });

/** Record one answer in a duel; the server scores it so neither player can fake points. */
export const duelAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { matchId: string; qIndex: number; typed: string | null }) => {
    const qIndex = Math.floor(Number(d.qIndex));
    if (!/^[0-9a-f-]{36}$/i.test(d.matchId) || !(qIndex >= 0 && qIndex <= 6)) throw new Error("Bad request");
    return { matchId: d.matchId, qIndex, typed: d.typed ? String(d.typed).slice(0, 60) : null };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: m } = await supabaseAdmin.from("matches").select("*").eq("id", data.matchId).maybeSingle();
    if (!m || (m.host_id !== context.userId && m.guest_id !== context.userId)) throw new Error("Not your match");
    if (m.status !== "playing" || !m.starts_at || Date.now() < new Date(m.starts_at).getTime()) throw new Error("Match not running");
    const q = QUESTIONS.find((x) => x.id === m.question_ids[data.qIndex]);
    if (!q) throw new Error("Bad question");
    const { verifyAnswer, loadCounts } = await import("./judge.server");
    const { frequencyRarity } = await import("./scoring");
    const v = await verifyAnswer(q, data.typed, frequencyRarity(await loadCounts([q.id])));
    const { error } = await supabaseAdmin.from("match_answers").insert({
      match_id: m.id, user_id: context.userId, q_index: data.qIndex,
      display: v?.display ?? null, tier: v?.tier ?? null, points: v?.points ?? 0,
    });
    if (error && error.code !== "23505") console.error(error);
    // Close the match once both players have answered all 7.
    const { count } = await supabaseAdmin.from("match_answers").select("id", { count: "exact", head: true }).eq("match_id", m.id);
    if ((count ?? 0) >= 14) await supabaseAdmin.from("matches").update({ status: "done" }).eq("id", m.id);
    return { points: v?.points ?? 0 };
  });
