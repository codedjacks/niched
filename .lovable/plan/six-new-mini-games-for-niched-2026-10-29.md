# Six new mini-games for Niched

None of these work like the existing games (clue reveals, typing a name, pick-one cards, number comparisons). Each one uses a different kind of play.

## 1. Huddle — sort 16 into 4
16 athlete tiles. Find the four hidden groups of four, like "played for the Knicks", "#23", "went to Duke" or "Hall of Famers born in Texas". You get 4 mistakes. Groups are colour-coded from easy to devious. Score: 25 per group, minus 5 per mistake.

## 2. Standings Shuffle — put them in order
Five real teams from one league. Drag them into the order they finished last season. Each team then flips over to show its real record (from the new team records). Score: 20 for each team in the right spot, plus a bonus if every spot is right.

## 3. Sellout — guess the crowd
An arena silhouette fills up with pixel fans while you drag a slider to guess the venue's real seat count. You get 3 rounds per game. Score depends on how close you are: within 1% is 100 points, and it drops off from there. Uses the new stadium capacities.

## 4. Radio Call — finish the famous call
A famous broadcast call scrolls by in pixel ticker text with the key name or word bleeped out ("...and ____ for the win!"). Type the missing word or pick the moment. You get two tries; a hint gives the year and a second hint gives the team.

## 5. Emoji Playbook — read the rebus
A row of emoji spells out a player, team or famous moment (for example a crown plus a king for LeBron "King" James). Solve 5 per game, with a timer bonus. You can skip one per game.

## 6. Scoreboard — guess the last name in 6 tries
A Wordle-style game for an athlete's last name, shown as a stadium scoreboard. Letters light up green (right spot), amber (in the name, wrong spot) or red (not in the name). After guess 3 the board shows the athlete's league.

## Everywhere
- All six are unlimited and different for each player, like the other mini-games, with "Play again", best scores and streaks.
- They get the same 8-bit stadium look and their own icon. They go into the sidebar and home list: Huddle and Scoreboard under Read the player, Standings Shuffle and Sellout under Teams & places, Radio Call and Emoji Playbook in a new "Fun & Games" section.
- Each game gets its own web page and share text.

## Technical details
- Logic modules under `src/game`: huddle.ts, standings.ts, sellout.ts, radiocall.ts, emoji.ts, scoreboard.ts. Each has append-only curated data, a pick-by-seed function, a scoring function and tests.
- Standings Shuffle and Sellout read `sports_team_facts` via `useTeamFacts`. Each waits for the data to load before choosing a puzzle and falls back to a small curated set. Sellout only uses venues that have a recorded capacity.
- The Huddle groups and the emoji puzzles are hand-written, using facts the game already stores. Radio Calls quote only short, well-known calls.
- Each game gets a route under `src/routes/` with its own head() metadata. The UI goes in a new `src/components/game/FreshModes.tsx`, reusing GameFrame, useDailyGame and Done.
- Tests: one scoring rule per game (for example: a perfect Standings order gives 100 points, and in Sellout a guess within 1% gives 100).
