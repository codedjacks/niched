import { normalize } from "./scoring";
import { hash, mulberry32 } from "./selection";

export interface Rebus { emoji: string; answers: string[]; kind: string }

/** Emoji rebus puzzles. Append-only. */
export const REBUSES: Rebus[] = [
  { emoji: "🔥 🌴", answers: ["miami heat", "heat"], kind: "NBA team" },
  { emoji: "🟢 🌊 📦", answers: ["green bay packers", "packers"], kind: "NFL team" },
  { emoji: "🔴 🧦", answers: ["boston red sox", "red sox"], kind: "MLB team" },
  { emoji: "⚪ 🧦", answers: ["chicago white sox", "white sox"], kind: "MLB team" },
  { emoji: "⭐ 🤠", answers: ["dallas cowboys", "cowboys"], kind: "NFL team" },
  { emoji: "🎷 🏔️", answers: ["utah jazz", "jazz"], kind: "NBA team" },
  { emoji: "🦬 💵", answers: ["buffalo bills", "bills"], kind: "NFL team" },
  { emoji: "👑 ⚾", answers: ["kansas city royals", "royals"], kind: "MLB team" },
  { emoji: "🌉 ⚔️", answers: ["golden state warriors", "warriors"], kind: "NBA team" },
  { emoji: "🦈 🏒", answers: ["san jose sharks", "sharks"], kind: "NHL team" },
  { emoji: "🐧 🏒", answers: ["pittsburgh penguins", "penguins"], kind: "NHL team" },
  { emoji: "⚡ 🏒", answers: ["tampa bay lightning", "lightning"], kind: "NHL team" },
  { emoji: "🐅 🌲🌲", answers: ["tiger woods"], kind: "Golfer" },
  { emoji: "⚡ 🏃", answers: ["usain bolt", "bolt"], kind: "Sprinter" },
  { emoji: "🐦 3️⃣3️⃣", answers: ["larry bird", "bird"], kind: "NBA legend" },
  { emoji: "🏴‍☠️ ⚾", answers: ["pittsburgh pirates", "pirates"], kind: "MLB team" },
];

export const EMOJI_ROUNDS = 5;
export const EMOJI_POINTS = 20;

export function rebusesForDay(day: string): Rebus[] {
  const rand = mulberry32(hash(`emoji:${day}`));
  const pool = [...REBUSES];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j]!, pool[i]!]; }
  return pool.slice(0, EMOJI_ROUNDS);
}

export const isRebus = (r: Rebus, typed: string) => r.answers.includes(normalize(typed));
