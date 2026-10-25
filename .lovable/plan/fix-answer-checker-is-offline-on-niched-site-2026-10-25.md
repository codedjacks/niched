# Fix "Answer checker is offline" on niched.site

## Why it happens
On niched.site (your own Cloudflare hosting), the game's private AI key isn't available, so every answer that isn't on the known-answer list (including every wrong guess) hits the "offline" message.

## What changes
1. **Use your own AI key when there's no Lovable key.** The answer checker will accept either the Lovable key or an `OPENAI_API_KEY` that you add in Cloudflare (Settings → Variables and Secrets). With it, niched.site grades creative and wrong answers just like the Lovable site does.
2. **No more "offline" dead end.** If no AI key is set at all, the game falls back to the known-answer list plus typo matching: listed answers score, everything else says "doesn't count — try another" instead of an error.
3. **Same rule for ranked scores**, so final scores verify the same way the live answers did.

## What you'll need to do
- Add `OPENAI_API_KEY` in your Cloudflare project if you want AI grading of unlisted answers on niched.site (costs go to your OpenAI account). Without it, the fallback in step 2 applies.
- Note: AI-written Daily questions and signed-in rankings also need backend keys on Cloudflare; I'll list exactly which ones in the reply.

## Technical details
- `src/game/judge.server.ts`: pick provider — `LOVABLE_API_KEY` → Lovable gateway (`openai/gpt-6-astra`); else `OPENAI_API_KEY` → `createOpenAI({ apiKey })` with `gpt-5-mini`; else return `{ ok:false, reason:"invalid", message:"\"x\" doesn't count — try another" }`.
- Keep `reason:"unavailable"` only for real transient model errors.
- Add tests in `answer-leniency.test.ts`: no keys → invalid (not unavailable); OPENAI key path used when Lovable key absent.
