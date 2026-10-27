# Add Career Path and Draft Day

Two new daily games that work like Mystery Athlete: every player gets the same puzzle each day, and it changes at 12 AM Central.

## Career Path
- Shows the teams a player played for, in order (for example: "Cavaliers → Heat → Cavaliers → Lakers"), across the NBA, NFL and MLB.
- You get 5 guesses. Each wrong guess reveals a hint: league, position, debut decade, then a key award.
- Fewer guesses means more points (100 / 80 / 60 / 40 / 20). There's a share button.
- About 120 curated players with clear, multi-team careers, so the answers are well known.

## Draft Day
- Shows a league and draft year (for example: "2003 NBA Draft — #1 overall pick") and asks who went first.
- 3 guesses with hints: position, college, then the drafting team. Points go 100 / 60 / 30.
- Curated #1 picks for the NBA (1980 on), NFL (1970 on) and MLB (1980 on).

## Where they appear
- New buttons on the home screen next to Mystery Athlete and Higher / Lower, plus links in the side menu.
- Each game keeps its own best score and streak on the player's device.

## Technical details
- `src/game/career.ts` and `src/game/draft.ts` hold the curated data. Puzzles are picked with `dailyItem` and `dayNumber` from daily-games.ts using `dateKey()` (Central time). Progress is saved with `loadGame` / `recordGame`.
- Name matching uses `namesMatch` plus the existing shared player-name lookup (players.functions), so typos and nicknames are accepted.
- Routes `/career-path` and `/draft-day` reuse the SportsGame shell. Each gets its own head() metadata.
- Tests check that the daily pick is the same for everyone on a given day, the points per guess, and that every curated entry has at least 2 teams (Career Path) or a complete hint set (Draft Day).
