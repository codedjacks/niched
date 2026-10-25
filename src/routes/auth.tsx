import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GeoBackground } from "@/components/game/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Niched" },
      { name: "description", content: "Sign in to Niched to rank your daily scores and play friends head-to-head." },
      { property: "og:title", content: "Sign in to Niched" },
      { property: "og:description", content: "Rank your daily scores and challenge friends live." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

const input = "w-full rounded-lg border-2 border-border bg-background px-4 py-3 font-sans font-bold outline-none focus:border-primary";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name.trim().slice(0, 20) } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/" });
        else setMsg({ ok: true, text: "Check your email to confirm your account, then sign in." });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setMsg({ ok: true, text: "If that email has an account, a reset link is on its way." });
      }
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <GeoBackground />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <Link to="/" className="font-sans text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase">
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Enroll" : "Reset password"}
        </h1>
        <p className="mt-1 font-hand text-2xl text-secondary">
          {mode === "forgot" ? "we'll email you a link" : "rank your dailies & climb the class"}
        </p>
        <form onSubmit={submit} className="relative mt-6 grid gap-3 rounded-lg border-2 border-border bg-card p-6">
          <span aria-hidden className="tape" />
          {mode === "signup" && (
            <label className="grid gap-1 font-sans text-sm">Display name
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={20} required />
            </label>
          )}
          <label className="grid gap-1 font-sans text-sm">Email
            <input className={input} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {mode !== "forgot" && (
            <label className="grid gap-1 font-sans text-sm">Password
              <input className={input} type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
          )}
          {msg && <p className={msg.ok ? "font-sans text-sm text-primary" : "font-sans text-sm text-destructive"} role="status">{msg.text}</p>}
          <button disabled={busy} className="mt-2 rounded-lg bg-primary px-5 py-3 font-display text-sm font-bold uppercase text-primary-foreground shadow-pop-sm disabled:opacity-60">
            {busy ? "…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap justify-between gap-2 font-sans text-sm text-muted-foreground">
          {mode !== "signin" && <button onClick={() => setMode("signin")} className="hover:text-foreground">Have an account? Sign in</button>}
          {mode !== "signup" && <button onClick={() => setMode("signup")} className="hover:text-foreground">New here? Create an account</button>}
          {mode === "signin" && <button onClick={() => setMode("forgot")} className="hover:text-foreground">Forgot password?</button>}
        </div>
      </main>
    </>
  );
}
