/** Preset sticker avatars (stored as the avatar id on the profile). Append only — saved ids must stay valid. */
export const AVATARS = [
  "✏️", "📎", "📓", "🎒", "⭐", "🎓", "🍎", "🧪", "📐", "🔬", "🎨", "🏀", "🦉", "🐸", "🦊", "🐙",
  "🏈", "⚾", "⚽", "🏒", "🎾", "⛳", "🥊", "🏎️", "🏆", "🥇", "🧢", "👟", "🐐", "🔥", "🦅", "🐻",
] as const;
export const avatarOf = (a: string | null | undefined) => (a && (AVATARS as readonly string[]).includes(a) ? a : "🍎");

export const FAVORITE_SPORTS = ["NBA", "NFL", "MLB", "NHL", "Soccer", "College", "Golf", "Tennis", "Combat", "Racing"] as const;

/** Player-card frame colors (values match the database check constraint). */
export const CARD_COLORS = {
  amber: { label: "Scoreboard", ring: "border-primary", fill: "bg-primary/15" },
  red: { label: "Jersey", ring: "border-destructive", fill: "bg-destructive/15" },
  green: { label: "Turf", ring: "border-secondary", fill: "bg-secondary/15" },
  navy: { label: "Stadium", ring: "border-accent", fill: "bg-accent/30" },
  silver: { label: "Trophy", ring: "border-muted-foreground", fill: "bg-muted" },
} as const;
export type CardColor = keyof typeof CARD_COLORS;
export const cardColorOf = (c: string | null | undefined): CardColor => (c && c in CARD_COLORS ? (c as CardColor) : "amber");

/** Jersey numbers are 0–99, digits only; anything else clears the field. */
export const cleanJersey = (v: string) => (/^\d{1,2}$/.test(v.trim()) ? v.trim() : null);
