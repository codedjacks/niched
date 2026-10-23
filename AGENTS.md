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
- Leaderboard and answer counts are written only by server functions (service role) keyed by an anonymous per-browser player id; the browser only reads public columns, so players need no account.
