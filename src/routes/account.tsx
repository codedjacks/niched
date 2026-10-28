import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AVATARS, CARD_COLORS, FAVORITE_SPORTS, avatarOf, cardColorOf, cleanJersey, type CardColor } from "@/game/avatars";
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

const field = "rounded-lg border-2 border-border bg-background px-4 py-2 font-sans font-bold outline-none focus:border-primary";

function Account() {
  const { user, ready, profile, refetchProfile } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>("🍎");
  const [sport, setSport] = useState("");
  const [team, setTeam] = useState("");
  const [jersey, setJersey] = useState("");
  const [tagline, setTagline] = useState("");
  const [color, setColor] = useState<CardColor>("amber");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name); setAvatar(avatarOf(profile.avatar_url));
    setSport(profile.favorite_sport ?? ""); setTeam(profile.favorite_team ?? "");
    setJersey(profile.jersey_number ?? ""); setTagline(profile.tagline ?? "");
    setColor(cardColorOf(profile.card_color));
  }, [profile]);
  const edit = <T,>(set: (v: T) => void) => (v: T) => { set(v); setSaved(false); };

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
    setError("");
    const { error } = await supabase.from("profiles").update({
      display_name: name.trim().slice(0, 20), avatar_url: avatar,
      favorite_sport: sport || null, favorite_team: team.trim().slice(0, 40) || null,
      jersey_number: cleanJersey(jersey), tagline: tagline.trim().slice(0, 60) || null, card_color: color,
    }).eq("id", user.id);
    if (error) setError("Couldn't save — check your entries and try again.");
    else { setSaved(true); refetchProfile(); }
  };
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };
  const c = CARD_COLORS[color];

  return (
    <>
      <GeoBackground />
      <main className="mx-auto min-h-screen max-w-md px-5 py-10">
        <Link to="/" className="font-sans text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase">Player Card</h1>
        <p className="mt-1 font-sans text-sm text-muted-foreground">{user?.email}</p>

        <div className={cn("arcade-panel mt-6 flex items-center gap-4 rounded-xl border-4 p-5", c.ring, c.fill)} aria-label="Player card preview">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-background text-5xl" aria-hidden>{avatar}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-jersey text-3xl uppercase leading-none">{name || "Player"}</p>
            {tagline && <p className="mt-1 font-hand text-lg text-secondary">"{tagline}"</p>}
            <p className="mt-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">
              {[sport, team].filter(Boolean).join(" · ") || "Free agent"}
            </p>
          </div>
          {cleanJersey(jersey) && <span className="font-jersey text-5xl text-primary text-glow">#{cleanJersey(jersey)}</span>}
        </div>

        <form onSubmit={save} className="relative mt-6 grid gap-4 rounded-lg border-2 border-border bg-card p-6">
          <span aria-hidden className="tape" />
          <label className="grid gap-1 font-sans text-sm">Display name
            <input value={name} maxLength={20} required onChange={(e) => edit(setName)(e.target.value)} className={field} />
          </label>
          <label className="grid gap-1 font-sans text-sm">Tagline
            <input value={tagline} maxLength={60} placeholder="Ball knower since '98" onChange={(e) => edit(setTagline)(e.target.value)} className={field} />
          </label>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <label className="grid gap-1 font-sans text-sm">Favorite team
              <input value={team} maxLength={40} placeholder="Chicago Cubs" onChange={(e) => edit(setTeam)(e.target.value)} className={field} />
            </label>
            <label className="grid gap-1 font-sans text-sm">Jersey #
              <input value={jersey} inputMode="numeric" maxLength={2} placeholder="23" onChange={(e) => edit(setJersey)(e.target.value.replace(/\D/g, ""))} className={field} />
            </label>
          </div>
          <fieldset>
            <legend className="font-sans text-sm">Favorite sport</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FAVORITE_SPORTS.map((s) => (
                <button type="button" key={s} aria-pressed={sport === s} onClick={() => edit(setSport)(sport === s ? "" : s)}
                  className={cn("rounded-md border-2 px-3 py-1 font-display text-[10px] uppercase transition", sport === s ? "border-primary bg-primary/20" : "border-border hover:border-primary")}>{s}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-sans text-sm">Card color</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(Object.keys(CARD_COLORS) as CardColor[]).map((k) => (
                <button type="button" key={k} aria-pressed={color === k} onClick={() => edit(setColor)(k)}
                  className={cn("rounded-md border-2 px-3 py-1 font-display text-[10px] uppercase", CARD_COLORS[k].ring, CARD_COLORS[k].fill, color === k && "ring-2 ring-ring")}>{CARD_COLORS[k].label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-sans text-sm">Avatar</legend>
            <div className="mt-2 grid grid-cols-8 gap-1.5">
              {AVATARS.map((a) => (
                <button type="button" key={a} onClick={() => edit(setAvatar)(a)} aria-label={`Avatar ${a}`} aria-pressed={avatar === a}
                  className={cn("flex aspect-square items-center justify-center rounded-md border-2 text-xl transition", avatar === a ? "border-primary bg-primary/20" : "border-border hover:border-primary")}>
                  {a}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="font-sans text-sm text-destructive">{error}</p>}
          <button className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm">{saved ? "Saved!" : "Save"}</button>
        </form>
        <button onClick={signOut} className="mt-4 font-sans text-sm text-muted-foreground hover:text-foreground">Sign out</button>
      </main>
    </>
  );
}
