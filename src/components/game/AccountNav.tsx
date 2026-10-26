import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { avatarOf } from "@/game/avatars";

const pill = "rounded-lg border-2 border-border bg-card px-4 py-2 font-display text-xs font-bold uppercase transition hover:-translate-y-0.5 hover:border-primary";

/** Top-right: sign-in/profile. */
export function AccountNav() {
  const { user, profile } = useAuth();
  return (
    <nav className="mb-6 flex flex-wrap justify-end gap-2">
      {user ? (
        <Link to="/account" className={pill}>{avatarOf(profile?.avatar_url)} {profile?.display_name ?? "Account"}</Link>
      ) : (
        <Link to="/auth" className={pill}>Sign in</Link>
      )}
    </nav>
  );
}
