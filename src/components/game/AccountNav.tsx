import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createMatch } from "@/game/duel.functions";
import { avatarOf } from "@/game/avatars";

const pill = "rounded-lg border-2 border-border bg-card px-4 py-2 font-display text-xs font-bold uppercase transition hover:-translate-y-0.5 hover:border-primary";

/** Top-right: rankings, head-to-head, and sign-in/profile. */
export function AccountNav() {
  const { user, profile } = useAuth();
  return (
    <nav className="mb-6 flex flex-wrap justify-end gap-2">
      <Link to="/rankings" className={pill}>🏆 Rankings</Link>
      {user ? (
        <Link to="/account" className={pill}>{avatarOf(profile?.avatar_url)} {profile?.display_name ?? "Account"}</Link>
      ) : (
        <Link to="/auth" className={pill}>Sign in</Link>
      )}
    </nav>
  );
}

/** Opens a live head-to-head room (sign-in required). */
export function ChallengeButton({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useServerFn(createMatch);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    if (!user) return navigate({ to: "/auth" });
    setBusy(true);
    setErr(null);
    try {
      const { code } = await create();
      navigate({ to: "/duel/$code", params: { code } });
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className={className}>
      <button onClick={go} disabled={busy}
        className="w-full rounded-lg border-2 border-secondary bg-card px-5 py-4 text-left font-display text-base font-bold uppercase transition hover:-translate-y-0.5 hover:text-secondary disabled:opacity-60 sm:text-lg">
        ⚔️ {busy ? "Opening room…" : "Challenge a friend — live"}
        <span className="mt-1 block font-sans text-xs font-normal normal-case text-muted-foreground">
          {user ? "Race the same 7 questions head-to-head in real time." : "Sign in to duel a friend in real time."}
        </span>
      </button>
      {err && <p className="mt-2 font-sans text-sm text-destructive">{err}</p>}
    </div>
  );
}
