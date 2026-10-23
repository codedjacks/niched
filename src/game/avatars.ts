/** Preset sticker avatars (stored as the avatar id on the profile). */
export const AVATARS = ["✏️", "📎", "📓", "🎒", "⭐", "🎓", "🍎", "🧪", "📐", "🔬", "🎨", "🏀", "🦉", "🐸", "🦊", "🐙"] as const;
export const avatarOf = (a: string | null | undefined) => (a && (AVATARS as readonly string[]).includes(a) ? a : "🍎");
