# Niched

Build a complete, polished, browser-based trivia game called **Niched**, inspired by the gameplay mechanics of krillion.io. The full specification is in the attached file "Build a complete, polished, browser-based trivia (pasted).md" — follow it exactly. Key points:

The core concept: players answer seven open-ended trivia questions, earning more points for correct answers that are less common. The goal is to think creatively, find niche answers, and achieve the highest score possible.

## 1. Core Gameplay
- Each game consists of seven open-ended trivia questions.
- Questions ask players to name something within a category, such as a country, fruit, movie, celebrity, brand, or fictional character.
- Give players 25 seconds to answer each question.
- Players type one answer into a text field and submit it.
- Award more points for valid, less common answers.
- Show the points earned after each question.
- Include a skip option worth zero points.
- After seven questions, display a results screen with the final score and answer breakdown.

## 2. Rarity-Based Scoring
Implement six rarity tiers:
- Plankton: 10 points
- Too Clever: 15 points
- Schooler: 30 points
- Rare: 60 points
- Deep Cut: 85 points
- One in a Million: 100 points

The maximum possible score is 700 points.

Initially, use a curated database of answers and rarity tiers. Normalize answers by ignoring capitalization, extra spaces, and basic punctuation. Prevent duplicate submissions and handle invalid answers appropriately.

Do not pretend rarity is based on real player statistics unless those statistics exist. Structure the scoring system so real answer-frequency data can be integrated later.

## 3. Game Modes

**Daily Challenge**
- Every player receives the same seven questions each day.
- Select questions deterministically based on the date.
- Track daily completion, streaks, personal bests, and previous scores.
- Show when the next daily challenge becomes available.

**Practice Mode**
- Allow unlimited games with randomly selected questions.
- Use a large question bank.
- Do not affect daily streaks.

**Challenge a Friend**
- Let players copy and share their results.
- Prepare the architecture for future multiplayer functionality without pretending real-time multiplayer already works.

## 4. Visual Theme and Design

Create a **modern, minimalist arcade aesthetic**. Do not use underwater imagery, ocean colors, bubbles, fish, water animations, or ocean-related interface elements.

The visual identity should feel like a polished internet game that would look at home on a popular gaming website.

**Color palette:**
- Background: warm off-white or near-black, depending on the chosen theme.
- Primary accent: electric lime or vivid chartreuse.
- Secondary accents: muted lavender and light gray.
- Text: high-contrast black or white, depending on the background.

**Visual elements:**
- Clean typography with bold, oversized headings.
- Rounded rectangular cards and buttons.
- Subtle grid patterns, geometric shapes, or abstract animated elements.
- Small motion effects when answers are submitted.
- Distinct visual treatments for each rarity tier.
- Smooth transitions between questions and results.
- A clean progress indicator showing question seven as the end of the round.
- A score counter that animates when points are earned.

Use restrained animations and plenty of whitespace. Avoid excessive gradients, generic AI-generated illustrations, and unnecessary decorative elements.

The interface should feel fast, clever, competitive, and slightly playful.

## 5. Home Screen
- The game name, Niched.
- A short subtitle explaining the objective.
- A prominent Start Daily Challenge button.
- A secondary Practice Mode button.
- Today's challenge status.
- The player's streak and personal best.
- A short explanation of how rarity-based scoring works.
- A subtle animated geometric background.
Make the start button the most visually prominent element.

## 6. Gameplay Screen
- The current question number out of seven.
- The question in a large, readable card.
- A countdown timer.
- A text field for the answer.
- A submit button and skip option.
- Current score.
- A progress indicator.
After submitting an answer, show the accepted answer, rarity tier, points earned, and updated score. Use a short, satisfying animation before advancing to the next question. Make the answer input the main focus of the screen. Support Enter to submit and ensure keyboard navigation works correctly.

## 7. Results Screen
- Final score out of 700.
- A breakdown of all seven answers and their points.
- A summary of rarity tiers achieved.
- Personal best and streak updates.
- A button to copy and share results.
- Options to play again or return home.
Make the results screen visually rewarding, with animated score counting and a clear highlight for the rarest answer.

## 8. Technical Requirements
- Use React, TypeScript, and Tailwind CSS.
- Use a lightweight animation library if needed.
- Organize questions in a structured database.
- Separate question selection, answer validation, scoring, timers, and persistence into reusable modules.
- Save progress and statistics using local storage.
- Ensure the game works on desktop and mobile.
- Support keyboard controls and accessible input fields.
- Clean up timers properly and prevent multiple submissions.

## 9. Quality Requirements
Build an actual playable game, not a static mockup. Implement the complete Daily Challenge experience first, including a sufficiently large question bank and working scoring logic. Then add Practice Mode and the remaining features. Test the entire gameplay loop, including timeouts, skipped questions, invalid answers, scoring, final results, and saved statistics. Keep the experience lightweight, responsive, visually cohesive, and immediately playable. Make reasonable design decisions independently and prioritize gameplay quality over unnecessary features. The final product should feel like a finished, modern indie web game with a distinctive visual identity that is entirely separate from an underwater theme.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://niched.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be863a80-bd08-432c-bf07-f1cb60e97ffb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
