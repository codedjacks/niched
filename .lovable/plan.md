# Seven new daily sports games

Each game gets its own page and a link in the sidebar. Every game uses the same arcade look as the current ones (stadium glow, scanlines, scoreboard score). Everyone gets the same puzzle each day, it resets at midnight Central, and each game keeps its own streak and best score with a shareable result.

## The games

1. **Top 10 Countdown**: a hidden top-10 list, such as career home run leaders. You have 90 seconds to type names. Each name you find flips its slot, and the bottom of the list is worth more than the top.
2. **Who Am I? Silhouette**: a blocky pixel figure (jersey color, number, position pose) with clues revealed one at a time: league, era, team, then a stat. Five reveals score 100/80/60/40/20.
3. **Same Jersey Chain**: you start with a team and a number, such as Bulls #23. Name players who wore that number for that team, and each correct name adds a link. Three misses ends the chain.
4. **Trade Machine**: a real trade with the main player hidden ("Team A sends ??? + a 1st-round pick to Team B for..."). Type the player, and each miss reveals another piece of the deal.
5. **Award Ballot**: five MVP (or Cy Young, etc.) finalists from one season. Drag them into the order they actually finished. You score points for each one in the right spot, plus a bonus for a perfect ballot.
6. **Head to Head**: two athletes and five stat categories. Pick who wins each one, and the numbers are revealed scoreboard-style. Uses the sourced stats already in the database where possible.
7. **Stadium Guesser**: a pixel skyline card plus clues (city, year opened, capacity, nickname). Guess the stadium, with points dropping for each clue revealed.

## Data and accuracy

- Head to Head uses only stats from the existing sourced sports facts, so nothing is guessed.
- The other six use hand-picked lists (top-10 lists, jersey numbers, trades, award votes, stadiums), sized so each game has a few months of daily puzzles. Hand-picked facts can contain errors and should be reviewed. Where a sourced stat exists, it is used instead.
- Typed answers use the same forgiving name matching as Mystery Athlete: typos, nicknames and last names alone all count.

## Technical details

- Data and logic modules in src/game: top10.ts, silhouette.ts, jerseychain.ts, trades.ts, ballot.ts, headtohead.ts, stadiums.ts. Each one picks its daily puzzle by date seed through daily-games.ts and has pure scoring functions.
- One route per game: /top-10, /silhouette, /jersey-chain, /trade-machine, /award-ballot, /head-to-head, /stadium-guesser. Each uses GameFrame, useDailyGame and ResultCard, and has its own head() metadata.
- New interactive pieces go in a new component file, src/components/game/MoreModes.tsx, so NewModes.tsx stays manageable.
- Head to Head reads sourced facts through the existing public facts server function and only builds matchups where both athletes have a complete set of categories.
- Add the seven sidebar entries in ChallengeSidebar.tsx and the seven Home tiles in Home.tsx.
- Tests (more-games.test.ts or a new file):
  - daily pick is the same for every player and changes each day
  - Silhouette scores 100/80/60/40/20
  - Jersey Chain ends after three misses
  - Award Ballot gives points per correct spot plus the perfect bonus
  - Top 10 rewards the bottom slots more
  - the data checks find no duplicate or empty puzzles
- Browser-check one game end to end, and confirm the other six pages load.
