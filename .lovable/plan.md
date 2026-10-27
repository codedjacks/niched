# More daily games

Finish the two half-built games and add two new ones, all using the shared daily puzzle system (same puzzle for everyone, resets midnight Central, local progress, share button).

## Games
1. **Nicknames** (finish) — see a famous nickname ("The Mailman"), name the player. Hints: league, position, decade, team.
2. **Locker Number** (finish) — see a jersey number + team, name the famous player who wore it. Hints: league, position, era, award.
3. **Stat Line** (new) — see one famous season stat line (e.g. 50.4 PPG), name the player. Hints: season, team, league, position.
4. **Who Am I? Trio** (new) — three teammates are shown; name the team (and season decade). Hints reveal more teammates.

All four use the existing guess-the-player screen: 5 guesses, 100 down to 20 points, typo-tolerant name matching via the shared player lookup.

## Placement
- Home screen buttons and side-menu links for each, matching existing game buttons.
- Each gets its own page with unique title/description.

## Technical
- Data modules in src/game (nickname.ts, jersey.ts exist; add statline.ts, trio.ts) with curated, date-seeded picks via daily-games.ts.
- Routes: /nicknames, /locker-number, /stat-line, /team-trio rendering GuessGame.
- Tests: same puzzle per date, rotation at Central midnight, points per guess.
