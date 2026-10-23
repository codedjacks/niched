<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Game logic lives in src/game (questions, scoring, selection, storage, hooks) separate from UI in src/components/game; rarity goes through the RaritySource interface; frequencyRarity uses real answer counts from the backend once a question has MIN_SAMPLES answers, else the curated tier, so new questions still score sensibly.
- Ranked daily scores, duel answers and answer counts are written only by server functions that re-score typed answers server-side (judge.server.ts verifyAnswer), so clients can't fake points; guests can play but only signed-in accounts rank.
- Live duels sync via realtime on matches/match_answers; question order is fixed on the match row so both players get the same 7.
- Avatars are preset sticker emoji ids stored on the profile, because public storage buckets are blocked for this workspace.
