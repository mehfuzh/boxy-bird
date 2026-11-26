// ---- pure game rules (hitbox, scoring triggers, pipe bounds) ----
// Loaded after constants.js; no DOM, no mutable state. Shared by
// src/collision.js + src/world.js and mirrored in the standalone
// index.html, so the Node tests (test/rules.test.mjs) exercise the
// exact same logic the browser runs.
function hitsFloor(boxY, height){
  // floor death uses the FULL box — deliberately unforgiving
  return boxY + BOX_SIZE / 2 >= height - GROUND_H;
}
function hitsPipe(boxY, pipe){
  // forgiving hitbox: inset HIT_INSET px on every side
  const bx = BOX_X - BOX_SIZE/2 + HIT_INSET;
  const by = boxY - BOX_SIZE/2 + HIT_INSET;
  const bs = BOX_SIZE - HIT_INSET*2;
  if (!(bx + bs > pipe.x && bx < pipe.x + PIPE_W)) return false;
  return by < pipe.gapTop || by + bs > pipe.gapTop + PIPE_GAP;
}
// what reaching `score` triggers (milestone fanfare/confetti, PRO MODE)
function nextScoreState(score){
  return { milestone: MILESTONES.includes(score), pro: score === PRO_AT };
}
// vertical bounds for a pipe's gap top — always fully on-screen,
// below the notch / Dynamic Island (safeTop)
function pipeGapBounds(height, safeTop){
  const minTop = 70 + safeTop;
  return { minTop, maxTop: height - GROUND_H - PIPE_GAP - 70 };
}
// ---- themes (issue #32) ----
// Pure helpers over an ordered list of theme names (Object.keys(THEMES)),
// so adding a palette to THEMES automatically joins the button cycle.
function isThemeName(name, names){
  return names.includes(name);
}
// next theme in the cycle; unknown current names wrap back to the first
function nextThemeName(current, names){
  return names[(names.indexOf(current) + 1) % names.length];
}
// season → theme for a first visit (no stored choice). Uses the date's
// LOCAL month, i.e. the player's own timezone via `new Date()`:
// Nov–Feb winter · Mar–May default (spring) · Jun–Aug summer · Sep–Oct fall.
// Halloween stays a manual pick in the cycle.
function seasonalThemeName(date){
  const m = date.getMonth(); // 0 = January, local time
  if (m >= 10 || m <= 1) return 'winter';
  if (m <= 4) return 'default';
  if (m <= 7) return 'summer';
  return 'fall';
}
