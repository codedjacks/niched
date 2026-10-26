# Niched becomes a sports-only trivia site

## What changes for players
- **Daily Challenge is all sports.** Starting tomorrow (2026-10-27), the main daily has seven AI-written sports questions, the same for everyone, with the same rarity scoring and report card. Earlier days stay as they were, so old results still check out.
- **Entertainment and History are gone.** Their pages, sidebar links and saved progress are removed. The separate Sports topic page goes too, because the main daily now covers it.
- **The sidebar becomes a "Sports games" menu** with the Daily Challenge plus three new daily games:
  1. **Daily Grid**: a 3x3 grid. Rows and columns are clues such as a team, a league or an award, e.g. "Lakers" x "MVP winner". Name a player who fits each square. You get 9 guesses, and rarer players score more, which keeps the Niched idea of finding niche answers.
  2. **Mystery Athlete**: guess today's athlete from up to 6 clues that get easier one at a time (sport, era, country, team, stats, nickname). The fewer clues you use, the more you score.
  3. **Higher or Lower**: two stats side by side (career points, titles, stadium size...). Pick which one is bigger, and keep a streak going for 10 rounds.
- All three are the same for everyone each day. Each saves your score and streak on your device, and has a share button.
- Practice Mode keeps working, but with sports questions only.
- The school look, the tier names and the letter grades all stay the same.

## Technical details
- Daily (`main` track) switches the AI writer's topic to sports from a new cutoff date. Prompts stay deduped against everything already used. Ranked verification code stays in place even though the rankings screen has been removed.
- Delete the `entertainment.tsx`, `history.tsx` and `sports.tsx` routes and their registries. Leave the old `ai_questions` rows alone, with no destructive DB change. The scheduled job stops generating topic rounds.
- The new games live in `src/game/grid.ts`, `mystery.ts` and `higherlower.ts`, plus `src/routes/grid.tsx`, `mystery.tsx` and `higher-lower.tsx`. Puzzles come from curated, reviewed data files chosen by a date seed, so everyone gets the same puzzle and the answers are right. Grid answers are checked against a curated player list per square, with the existing lenient/typo matching and the AI judge for players not on the list.
- Practice draws only from the sports categories in the bank.
- Fix the routing test that is failing after the rankings were removed, and add tests for: one puzzle per day, the same for every player; grid scoring; clue-based scoring; and the Higher/Lower streak.
- Update the memory/AGENTS rules about topic challenges, and give every new page its own title and description.
