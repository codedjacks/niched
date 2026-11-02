# Ball-throw rarity reveal

Replace the row of tier icons that lights up after a correct answer with a short pixel-art "throw" scene. The rarer the answer, the farther the ball flies.

## What the player sees
- A small 8-bit field strip: a pixel thrower on the left, a row of yard markers along it, one per rarity tier (Airball, Base Hit, Touchdown, Home Run, Grand Slam, Ball Knower).
- The ball arcs from the thrower toward the right and lands at the marker for the earned tier. A higher tier means a longer, higher arc.
- Each marker lights up as the ball passes over it, and the tier name and emoji on top switch to match.
- When it lands: a small dust puff and a bounce. Then the tier name and points pop in. Ball Knower also gets a brief stadium-light flash and "OUT OF THE PARK!" text, with the ball flying past the last marker.
- Airball: the ball wobbles and drops short, close to the thrower, with an "Airball" thud.
- Skips and timeouts look the same as they do now.
- Takes about 1–2 seconds, a little longer for rarer tiers. The Next button appears after the ball lands, as it does now.
- If the player's device is set to reduce motion, the ball jumps straight to its landing spot.

## Technical details
- Change only the `Reveal` component in `src/components/game/Play.tsx`, and add keyframes and tokens to `src/styles.css`. Use theme colors only.
- Drive it with CSS: a wrapper moves along X with linear easing and the ball moves along Y with ease-out then ease-in, giving the arc. Set the landing distance with `--land` = (tier index + 0.5) / 6 × width. Set the duration with a CSS variable.
- Keep the existing `step` timer, synced to the ball's flight, so marker highlights and `done` focus behave as they do now. Scoring is unchanged.
