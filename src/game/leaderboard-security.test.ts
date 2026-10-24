import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, from } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const builder = {
      middleware: () => builder,
      inputValidator: () => builder,
      handler: (handler: (input: unknown) => unknown) => handler,
    };
    return builder;
  },
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ rpc, from }) }));
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));

import { getAnswerCounts, getLeaderboard } from "./leaderboard.functions";

describe("public game data projections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rpc.mockResolvedValue({ data: [], error: null });
  });

  it("reads frequency counts only through the question-scoped projection", async () => {
    rpc.mockResolvedValue({ data: [
      { question_id: "fruit", answer_key: "apple", count: 3 },
      { question_id: "fruit", answer_key: "pear", count: 2 },
    ], error: null });
    const result = await getAnswerCounts({ data: { questionIds: ["fruit"] } });
    expect(rpc).toHaveBeenCalledWith("question_answer_counts", { _question_ids: ["fruit"] });
    expect(result).toEqual({ fruit: { total: 5, counts: { apple: 3, pear: 2 } } });
    expect(from).not.toHaveBeenCalled();
  });

  it("keeps both leaderboards working without exposing raw score or profile tables", async () => {
    const row = { id: "score", user_id: "player", score: 60, tiers: ["backpack"], display_name: "Student", avatar_url: "⭐" };
    rpc.mockImplementation(async (name: string) => ({
      data: name === "ranked_daily" ? [row] : [{ user_id: "player", total: "60", games: "1", best: 60 }], error: null,
    }));
    const result = await getLeaderboard({ data: { day: "2026-10-24" } });
    expect(rpc).toHaveBeenCalledWith("ranked_daily", { _day: "2026-10-24" });
    expect(rpc).toHaveBeenCalledWith("ranked_alltime", { _limit: 50 });
    expect(result.today).toEqual([row]);
    expect(result.allTime[0]).toMatchObject({ total: 60, games: 1 });
    expect(from).not.toHaveBeenCalled();
  });
});