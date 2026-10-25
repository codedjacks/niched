import { createServerFn } from "@tanstack/react-start";
import { dayIsCurrent } from "./selection";
import { usesAiDaily } from "./ai-daily";

/** Today's AI-written Daily Challenge (generated on first request of the day). */
export const getAiDaily = createServerFn({ method: "POST" })
  .inputValidator((d: { day: string }) => ({ day: String(d.day) }))
  .handler(async ({ data }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.day) || !usesAiDaily(data.day) || !dayIsCurrent(data.day)) {
      return { status: "failed" as const, error: "That daily isn't available" };
    }
    const { getOrCreateAiDaily } = await import("./ai-daily.server");
    return getOrCreateAiDaily(data.day);
  });
