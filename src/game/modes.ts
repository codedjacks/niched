/** Pure rules for the per-game mechanics (choices, eliminations, letter reveals, locker costs). */
function hash(s: string) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const a = [...items]; let h = hash(seed);
  for (let i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

/** Answer plus `count - 1` decoys from the same league, shuffled the same way for everyone. */
export function choicesFor<T extends { league: string }>(answer: T, all: readonly T[], label: (x: T) => string, count: number, seed: string): string[] {
  const right = label(answer);
  const pool = [...new Set(all.filter((x) => x.league === answer.league).map(label))].filter((n) => n !== right);
  const extra = [...new Set(all.map(label))].filter((n) => n !== right && !pool.includes(n));
  const decoys = [...seededShuffle(pool, seed), ...seededShuffle(extra, seed)].slice(0, count - 1);
  return seededShuffle([right, ...decoys], seed + ":order");
}

export const DRAFT_CLOCK = 20;
/** Draft Day: one pick. Right with 10+ seconds left = 100, right later = 60, wrong or time out = 0. */
export const draftPickScore = (correct: boolean, secondsLeft: number) => (!correct || secondsLeft <= 0 ? 0 : secondsLeft >= 10 ? 100 : 60);

/** Team Trio: each wrong pennant costs 20, floor 20. */
export const trioPickScore = (wrongGuesses: number) => [100, 80, 60, 40, 20][wrongGuesses] ?? 0;

/** Locker Number: each opened locker costs 20, each miss 15, floor 10. */
export const lockerScore = (opened: number, misses: number) => Math.max(10, 100 - 20 * opened - 15 * misses);
export const LOCKER_GUESSES = 4;

/** Nicknames: level 0 shows only word lengths; each level reveals more letters (first letters first). Level >= max shows all. */
export function letterMask(name: string, level: number, maxLevel: number): string {
  const idx = [...name].map((c, i) => ({ c, i })).filter(({ c }) => /[a-z]/i.test(c));
  const firsts = idx.filter(({ i }) => i === 0 || !/[a-z]/i.test(name[i - 1]!)).map(({ i }) => i);
  const rest = seededShuffle(idx.map(({ i }) => i).filter((i) => !firsts.includes(i)), name);
  const order = [...firsts, ...rest];
  const shown = level <= 0 ? 0 : level >= maxLevel ? order.length : firsts.length + Math.round((rest.length * (level - 1)) / Math.max(1, maxLevel - 1) * 0.6);
  const open = new Set(order.slice(0, shown));
  return [...name].map((c, i) => (/[a-z]/i.test(c) && !open.has(i) ? "_" : c)).join("");
}
