import { useSyncExternalStore } from "react";

export type RankStatus =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "guest" }
  | { status: "ranked"; score: number; already: boolean }
  | { status: "error"; error: string };

let state: RankStatus = { status: "idle" };
const subs = new Set<() => void>();

/** Tiny store for the latest daily-ranking submission result. */
export const rankState = {
  get: () => state,
  set: (s: RankStatus) => { state = s; subs.forEach((f) => f()); },
  subscribe: (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; },
};
export const useRankState = () => useSyncExternalStore(rankState.subscribe, rankState.get, rankState.get);
