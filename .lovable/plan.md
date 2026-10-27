# Give each new game its own way to play

Right now Career Path, Draft Day, Nicknames, Locker Number, Stat Line and Team Trio all share one screen: a clue card, a list of "Hint 1/2/3", and a name box. Each game gets its own mechanic so it feels different.

## New mechanics

- **Career Path — "Road Trip":** team logos/jersey tiles appear one stop at a time on a travel-style map line. Guess early for more points. Each wrong guess drives to the next stop instead of showing a text hint.
- **Draft Day — "On the Clock":** a draft-board scoreboard with a ticking clock. Pick from 4 player cards (one right, three real players from the same draft era). One shot, with a bonus for speed.
- **Nicknames — "Fill the Blank":** the nickname is shown with letters of the player's name revealed as blanks (Wordle-style tiles). Wrong guesses flip in more letters. Guessed letters that are in the name light up green.
- **Locker Number — "Locker Room":** a row of pixel lockers. The number is on the jersey hanging inside. Wrong guesses "open" neighboring lockers that show teammates who also wore that number.
- **Stat Line — "Box Score":** the stat line appears as a blurred scoreboard. Each wrong guess unblurs one column (year, team, games…). Includes a higher/lower arrow showing whether your guess's debut year is earlier or later.
- **Team Trio — "Pick the Team":** a grid of team pennants. Players tap teams to eliminate them. Each wrong tap costs points, and the three teammates' faces/tiles drop in one by one.

## Shared polish
- Retro 8-bit look kept: scoreboard digits, pixel tiles, small flip/shake animations on right/wrong.
- Same daily puzzle for everyone, same midnight Central reset, same result sharing. Points stay out of 100.

## Technical details
- Replace the shared `GuessGame` usage per route with dedicated components in `src/components/game/` (RoadTrip, DraftBoard, LetterTiles, LockerRoom, BoxScore, PennantPick). Keep `GuessGame` only if still used.
- Data modules get small additions: draft decoys (`draft.ts`), number-sharers (`jersey.ts`), debut years (`statline.ts`), team list for pennants (`trio.ts`). Append-only so today's puzzles don't change.
- Update `more-games.test.ts`/`career-draft.test.ts` for the new scoring rules (speed bonus, elimination cost, letter reveal).
- Browser-check each page on desktop and mobile.
