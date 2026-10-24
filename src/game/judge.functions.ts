import { createServerFn } from "@tanstack/react-start";
import { ALL_QUESTIONS } from "./questions";
import type { JudgeResult } from "./judge.server";

export type { JudgeResult };

/** AI referee for answers not on the curated list (used live during play). */
export const judgeAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: { questionId: string; answer: string }) => ({
    questionId: String(d.questionId),
    answer: String(d.answer).slice(0, 120),
  }))
  .handler(async ({ data }): Promise<JudgeResult> => {
    const q = ALL_QUESTIONS.find((x) => x.id === data.questionId);
    if (!q || !data.answer.trim()) return { ok: false, reason: "invalid", message: "Not a valid answer" };
    const { aiJudge } = await import("./judge.server");
    return aiJudge(q, data.answer);
  });
