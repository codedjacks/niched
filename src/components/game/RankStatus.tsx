import { Link } from "@tanstack/react-router";
import { useRankState } from "@/game/rank-state";

/** Shows whether today's daily score made it onto the verified leaderboard. */
export function RankStatus() {
  const r = useRankState();
  if (r.status === "idle") return null;
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-dashed border-border bg-card p-4 font-sans text-sm" role="status">
      <span>
        {r.status === "pending" && "Checking your answers for the leaderboard…"}
        {r.status === "guest" && "Playing as a guest — sign in to put your daily scores on the leaderboard."}
        {r.status === "ranked" && (r.already
          ? <>You're already on today's leaderboard with <b className="font-display">{r.score}</b>.</>
          : <>Verified! <b className="font-display">{r.score}</b> points posted to today's leaderboard.</>)}
        {r.status === "error" && r.error}
      </span>
      {r.status === "guest" ? (
        <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 font-display text-xs font-bold uppercase text-primary-foreground">Sign in</Link>
      ) : (
        <Link to="/rankings" className="rounded-lg border-2 border-border px-4 py-2 font-display text-xs font-bold uppercase hover:border-primary">Rankings →</Link>
      )}
    </div>
  );
}
