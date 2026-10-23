const ID_KEY = "niched:player:id";
const NAME_KEY = "niched:player:name";

/** Anonymous per-browser player identity for the leaderboard. */
export function playerId(): string {
  let id = localStorage.getItem(ID_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(ID_KEY, id); }
  return id;
}
export function playerName(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(NAME_KEY);
}
export function setPlayerName(n: string) {
  localStorage.setItem(NAME_KEY, n.trim().slice(0, 20));
}
