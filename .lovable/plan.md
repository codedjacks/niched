# Two new games: Quick Trivia and Survival

## Quick Trivia (/trivia)
- 10 multiple-choice sports questions, 4 options each, 15 seconds per question.
- Points: 100 for a correct answer, plus a speed bonus (up to +50) and a streak bonus for back-to-back correct answers.
- After each pick, show right/wrong with the correct answer and a one-line fact.
- Results screen: score, correct count, best streak, share card, Play again.
- Unlimited and different per player (per-player random seed, like other mini-games).

## Survival (/survival)
- Same question style, but no fixed length: keep answering until the first wrong answer or timeout.
- Timer gets shorter as the run grows (15s down to 8s), and questions get harder by tier.
- Score = questions survived; personal best saved on the device and shown on the start screen and results.
- Share card: "I survived 23 questions on Niched".

## Questions
- New hand-written bank of about 300 multiple-choice sports questions (roughly 5/7 NBA/NFL/MLB, the rest other sports), tagged easy/medium/hard, with believable wrong options.
- Built from well-known, stable facts (champions, records, awards, draft picks). Where possible, wrong options and some questions are generated from the sports facts already on the site (e.g. "Who had more career points?").
- No repeats within a run; the deck reshuffles per player.

## Site placement
- Add both games to the home game list and to the sidebar (new games near the top of the "Today" section).
- 8-bit styling to match the rest of the site; reuse the ball-throw reveal for the final Trivia score.
- Each page gets its own title and description and appears in the sitemap.

## Technical details
- Logic in `src/game/trivia.ts` (question bank, deck from seed, scoring, survival timer curve) with tests; UI in `src/components/game/TriviaModes.tsx`; routes `src/routes/trivia.tsx`, `src/routes/survival.tsx` using `GameFrame` / `useDailyGame`, with `staticData.sitemap: true`.
- Local-only scoring (not ranked), so no backend changes.
- Tests: scoring values, streak bonus, survival ends on first wrong/timeout, timer curve bounds, no duplicate questions per run, every question has exactly one correct option among 4 unique options.
