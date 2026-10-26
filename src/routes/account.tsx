import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AVATARS, avatarOf } from "@/game/avatars";
import { GeoBackground } from "@/components/game/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Your account — Niched" },
      { name: "description", content: "Pick your Niched display name and sticker avatar." },
      { property: "og:title", content: "Your Niched account" },
      { property: "og:description", content: "Pick your display name and avatar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Account,
});

function Account() {
  const { user, ready, profile, refetchProfile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("🍎");
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (profile) { setName(profile.display_name); setAvatar(avatarOf(profile.avatar_url)); } }, [profile]);

  if (ready && !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 text-center">
        <GeoBackground />
        <p className="font-sans">Sign in to set up your profile.</p>
        <Link to="/auth" className="mx-auto mt-4 rounded-lg bg-primary px-5 py-3 font-display text-xs font-bold uppercase text-primary-foreground">Sign in</Link>
      </main>
    );
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("profiles").update({ display_name: name.trim().slice(0, 20), avatar_url: avatar }).eq("id", user.id);
    if (!error) { setSaved(true); refetchProfile(); }
  };
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <>
      <GeoBackground />
      <main className="mx-auto min-h-screen max-w-md px-5 py-10">
        <Link to="/" className="font-sans text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase">Student ID</h1>
        <p className="mt-1 font-sans text-sm text-muted-foreground">{user?.email}</p>
        <form onSubmit={save} className="relative mt-6 grid gap-4 rounded-lg border-2 border-border bg-card p-6">
          <span aria-hidden className="tape" />
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-primary bg-muted text-4xl" aria-hidden>{avatar}</span>
            <label className="grid flex-1 gap-1 font-sans text-sm">Display name
              <input value={name} maxLength={20} required onChange={(e) => { setName(e.target.value); setSaved(false); }}
                className="rounded-lg border-2 border-border bg-background px-4 py-2 font-sans font-bold outline-none focus:border-primary" />
            </label>
          </div>
          <fieldset>
            <legend className="font-sans text-sm">Avatar</legend>
            <div className="mt-2 grid grid-cols-8 gap-1.5">
              {AVATARS.map((a) => (
                <button type="button" key={a} onClick={() => { setAvatar(a); setSaved(false); }} aria-label={`Avatar ${a}`} aria-pressed={avatar === a}
                  className={cn("flex aspect-square items-center justify-center rounded-md border-2 text-xl transition", avatar === a ? "border-primary bg-primary/20" : "border-border hover:border-primary")}>
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm">{saved ? "Saved!" : "Save"}</button>
        </form>
        <button onClick={signOut} className="mt-4 font-sans text-sm text-muted-foreground hover:text-foreground">Sign out</button>
      </main>
    </>
  );
}
