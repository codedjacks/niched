import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { renameEntry } from "@/game/leaderboard.functions";
import { playerId, playerName, setPlayerName } from "@/game/player";

/** Leaderboard nickname entry shown after a daily round. */
export function NameField() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const rename = useServerFn(renameEntry);
  useEffect(() => { const n = playerName(); if (n) { setName(n); setSaved(true); } }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setPlayerName(name);
    try { await rename({ data: { playerId: playerId(), name } }); } catch { /* ignore */ }
    setSaved(true);
  };

  return (
    <form onSubmit={save} className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border-2 border-dashed border-border bg-card p-4">
      <label htmlFor="lb-name" className="w-full font-sans text-sm text-muted-foreground">
        {saved ? "You're on today's leaderboard as:" : "Add your name to today's leaderboard:"}
      </label>
      <input id="lb-name" value={name} maxLength={20} onChange={(e) => { setName(e.target.value); setSaved(false); }}
        placeholder="Your nickname" className="min-w-0 flex-1 rounded-lg border-2 border-border bg-background px-4 py-2 font-sans font-bold outline-none focus:border-primary" />
      <button type="submit" disabled={saved} className="rounded-lg bg-primary px-4 py-2 font-display text-xs font-bold uppercase text-primary-foreground disabled:opacity-50">
        {saved ? "Saved" : "Save"}
      </button>
      <Link to="/rankings" className="rounded-lg border-2 border-border px-4 py-2 font-display text-xs font-bold uppercase hover:border-primary">Rankings →</Link>
    </form>
  );
}
