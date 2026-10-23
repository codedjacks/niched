import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GeoBackground } from "@/components/game/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Niched" },
      { name: "description", content: "Choose a new password for your Niched account." },
      { property: "og:title", content: "Reset your Niched password" },
      { property: "og:description", content: "Choose a new password for your Niched account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setMsg(error.message);
    navigate({ to: "/" });
  };
  return (
    <>
      <GeoBackground />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <h1 className="font-display text-3xl font-bold uppercase">New password</h1>
        <form onSubmit={save} className="mt-6 grid gap-3 rounded-lg border-2 border-border bg-card p-6">
          <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
            aria-label="New password" className="rounded-lg border-2 border-border bg-background px-4 py-3 font-sans font-bold outline-none focus:border-primary" />
          {msg && <p className="font-sans text-sm text-destructive">{msg}</p>}
          <button className="rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground">Save password</button>
        </form>
      </main>
    </>
  );
}
