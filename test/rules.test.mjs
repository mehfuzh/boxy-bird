// Tests for the pure game rules (src/rules.js) and the sim that uses them
// (src/world.js + src/collision.js). Loads the REAL source files in a vm
// context — the same code the browser runs — with only the DOM and sound
// stubbed out. No new dependencies: node --test only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = f => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');

// constants.js needs a canvas element and a window; non-native path only.
function domStubs() {
  return {
    document: {
      getElementById: () => ({ width: 0, height: 0 }),
      documentElement: { classList: { add() {} } },
    },
    window: {},
  };
}

// rules-only context: real constants + rules
function loadRules() {
  const ctx = vm.createContext(domStubs());
  vm.runInContext(read('constants.js') + '\n' + read('rules.js'), ctx);
  return expr => vm.runInContext(expr, ctx);
}

// full sim context: storage → sound spy → constants → rules → store →
// world → collision (same order as build.mjs, minus render/input/main).
function loadSim() {
  const ctx = vm.createContext({
    ...domStubs(),
    console,
    events: [], // records which sounds fired, in order
  });
  ctx.window.localStorage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
    removeItem() { throw new Error('blocked'); },
  };
  ctx.window.BoxySound = {
    flap() { ctx.events.push('flap'); },
    score() { ctx.events.push('score'); },
    crash() { ctx.events.push('crash'); },
    milestone() { ctx.events.push('milestone'); },
    pro() { ctx.events.push('pro'); },
  };
  const files = ['storage.js', 'constants.js', 'rules.js', 'themes.js', 'store.js', 'world.js', 'collision.js'];
  vm.runInContext(files.map(read).join('\n'), ctx);
  const run = expr => vm.runInContext(expr, ctx);
  run('reset()');
  return { run, events: ctx.events };
}

// place the sim mid-play with the box parked safely inside a pipe's gap.
// freeze() pins the box against gravity each update so only pipe logic runs.
function play(sim, { score = 0, pro = false, pipes = '[]', y = 300 } = {}) {
  sim.run(`state='play'; score=${score}; proMode=${pro}; pipes=${pipes}; particles=[]; flash=0;`);
  sim.run(`box.y=${y}; box.vy=0;`);
  sim.run(`const _realUpdate = update; update = function(){ _realUpdate(); box.y=${y}; box.vy=0; };`);
}

const pipeAt = (x, gapTop = 200, scored = false) =>
  `[{x:${x}, gapTop:${gapTop}, scored:${scored}}]`;

// ---------- floor death ----------

test('floor: full box touching the ground kills (no inset forgiveness)', () => {
  const q = loadRules();
  const floor = q('H - GROUND_H');       // 550
  const half = q('BOX_SIZE / 2');        // 23
  assert.equal(q(`hitsFloor(${floor - half}, H)`), true);      // exactly touching
  assert.equal(q(`hitsFloor(${floor - half - 0.01}, H)`), false);
});

test('floor death in the sim: state becomes dead, crash sound, best saved', () => {
  const sim = loadSim();
  const floor = sim.run('H - GROUND_H');
  sim.run(`state='play'; score=5; pipes=[]; box.y=${floor}; box.vy=0;`);
  sim.run('checkCollisions()');
  assert.equal(sim.run('state'), 'dead');
  assert.ok(sim.events.includes('crash'));
  assert.equal(sim.run('best'), 5);
  assert.equal(sim.run("Store.best"), 5); // persisted (memory fallback)
});

// ---------- forgiving hitbox (HIT_INSET) ----------

test('pipe edges graze the drawn box but miss the inset hitbox', () => {
  const q = loadRules();
  // gap 200..420; box center 190 → drawn top 167 overlaps gapTop,
  // inset top 190+7-23=174? no: by = 190-23+7 = 174 < 200 → still hits.
  // Use a center whose DRAWN box overlaps but inset box fits:
  // by = c-16 must be >= 200 → c >= 216; drawn top c-23 < 200 → c < 223.
  const gapTop = 200;
  for (const c of [216, 219, 222]) {
    assert.equal(q(`hitsPipe(${c}, {x: BOX_X, gapTop: ${gapTop}})`), false,
      `center ${c}: drawn box overlaps gap top but inset hitbox survives`);
  }
  assert.equal(q(`hitsPipe(215, {x: BOX_X, gapTop: ${gapTop}})`), true); // 1px past inset
});

test('pipe bottom edge: inset forgiveness on the lower lip too', () => {
  const q = loadRules();
  const gapBot = 200 + q('PIPE_GAP'); // 420
  // by+bs = c+16 must be <= 420 → c <= 404; drawn bottom c+23 > 420 → c > 397
  for (const c of [398, 401, 404]) {
    assert.equal(q(`hitsPipe(${c}, {x: BOX_X, gapTop: 200})`), false);
  }
  assert.equal(q(`hitsPipe(405, {x: BOX_X, gapTop: 200})`), true);
});

// ---------- pipe top / bottom collision ----------

test('pipe top collision: box above the gap dies when horizontally overlapping', () => {
  const q = loadRules();
  assert.equal(q('hitsPipe(100, {x: BOX_X, gapTop: 200})'), true);
});

test('pipe bottom collision: box below the gap dies when horizontally overlapping', () => {
  const q = loadRules();
  assert.equal(q('hitsPipe(500, {x: BOX_X, gapTop: 200})'), true);
});

test('no horizontal overlap → no collision even far outside the gap', () => {
  const q = loadRules();
  const bxRight = q('BOX_X + BOX_SIZE/2 - HIT_INSET'); // inset right edge
  const bxLeft = q('BOX_X - BOX_SIZE/2 + HIT_INSET');
  assert.equal(q(`hitsPipe(100, {x: ${bxRight}, gapTop: 200})`), false);      // pipe starts at right edge
  assert.equal(q(`hitsPipe(100, {x: ${bxLeft - 72}, gapTop: 200})`), false);  // pipe ends at left edge
  assert.equal(q(`hitsPipe(100, {x: ${bxRight - 1}, gapTop: 200})`), true);   // 1px overlap
});

test('box centered in the gap passes through', () => {
  const q = loadRules();
  assert.equal(q('hitsPipe(310, {x: BOX_X, gapTop: 200})'), false);
});

// ---------- score-on-pass exactly once ----------

test('pipe scores exactly once, when its trailing edge passes the box', () => {
  const sim = loadSim();
  // trailing edge p.x+72 < BOX_X(130) → scores when p.x < 58; start at 59.5
  play(sim, { pipes: pipeAt(59.5), y: 310 });
  sim.run('update()'); // p.x = 57.5 → passes
  assert.equal(sim.run('score'), 1);
  assert.equal(sim.run('pipes[0].scored'), true);
  const scores = () => sim.events.filter(e => e === 'score').length;
  assert.equal(scores(), 1);
  sim.run('update()'); sim.run('update()');
  assert.equal(sim.run('score'), 1); // no double-count
  assert.equal(scores(), 1);
});

test('a pipe that already scored never scores again', () => {
  const sim = loadSim();
  play(sim, { score: 3, pipes: pipeAt(0, 200, true), y: 310 });
  sim.run('update()'); sim.run('update()');
  assert.equal(sim.run('score'), 3);
  assert.equal(sim.events.filter(e => e === 'score').length, 0);
});

// ---------- milestones at 10 / 25 / 50 ----------

test('nextScoreState flags exactly 10, 25, 50 as milestones', () => {
  const q = loadRules();
  for (const s of [10, 25, 50]) {
    assert.equal(q(`nextScoreState(${s}).milestone`), true, `milestone at ${s}`);
  }
  for (const s of [1, 9, 11, 24, 26, 49, 51, 100]) {
    assert.equal(q(`nextScoreState(${s}).milestone`), false, `no milestone at ${s}`);
  }
});

test('milestone crossing fires fanfare + confetti + flash', () => {
  for (const target of [10, 25, 50]) {
    const sim = loadSim();
    play(sim, { score: target - 1, pro: target > 25, pipes: pipeAt(59.5), y: 310 });
    sim.run('update()');
    assert.equal(sim.run('score'), target);
    assert.ok(sim.events.includes('milestone'), `fanfare at ${target}`);
    assert.equal(sim.run('particles.length'), target === 25 ? 80 : 30); // 25 also fires PRO burst
    assert.ok(sim.run('flash') > 0);
  }
});

test('non-milestone scores stay quiet: no fanfare, no confetti', () => {
  const sim = loadSim();
  play(sim, { score: 6, pipes: pipeAt(59.5), y: 310 });
  sim.run('update()');
  assert.equal(sim.run('score'), 7);
  assert.equal(sim.events.includes('milestone'), false);
  assert.equal(sim.run('particles.length'), 0);
});

// ---------- PRO MODE at 25 ----------

test('nextScoreState flags PRO at exactly 25', () => {
  const q = loadRules();
  assert.equal(q('nextScoreState(25).pro'), true);
  assert.equal(q('nextScoreState(24).pro'), false);
  assert.equal(q('nextScoreState(26).pro'), false);
});

test('reaching 25 turns on PRO MODE with fanfare + big burst', () => {
  const sim = loadSim();
  play(sim, { score: 24, pipes: pipeAt(59.5), y: 310 });
  sim.run('update()');
  assert.equal(sim.run('proMode'), true);
  assert.ok(sim.events.includes('pro'));
  assert.ok(sim.events.includes('milestone')); // 25 is both
});

test('PRO MODE scrolls pipes PIPE_SPEED + PRO_SPEED_BONUS per frame', () => {
  const sim = loadSim();
  play(sim, { score: 30, pro: true, pipes: pipeAt(400), y: 310 });
  sim.run('update()');
  const expected = 400 - sim.run('PIPE_SPEED + PRO_SPEED_BONUS'); // 396.8
  assert.equal(sim.run('pipes[0].x'), expected);
});

test('easy mode scrolls pipes at PIPE_SPEED only', () => {
  const sim = loadSim();
  play(sim, { pipes: pipeAt(400), y: 310 });
  sim.run('update()');
  assert.equal(sim.run('pipes[0].x'), 400 - sim.run('PIPE_SPEED')); // 398
});

test('reset() clears PRO MODE and score', () => {
  const sim = loadSim();
  play(sim, { score: 40, pro: true, y: 310 });
  sim.run('reset()');
  assert.equal(sim.run('proMode'), false);
  assert.equal(sim.run('score'), 0);
  assert.equal(sim.run('state'), 'start');
});

// ---------- pipe spawn bounds ----------

test('pipe gap bounds keep the whole gap on-screen, below the safe area', () => {
  const q = loadRules();
  const { minTop, maxTop } = q('pipeGapBounds(H, SAFE_TOP)');
  const gap = q('PIPE_GAP'), floor = q('H - GROUND_H');
  assert.ok(minTop >= 70);
  assert.ok(maxTop + gap <= floor - 70);
  assert.ok(minTop < maxTop);
});

test('safe-area inset pushes the minimum gap top down by exactly safeTop', () => {
  const q = loadRules();
  assert.equal(q('pipeGapBounds(H, 0).minTop'), 70);
  assert.equal(q('pipeGapBounds(H, 62).minTop'), 132);
  assert.equal(q('pipeGapBounds(H, 62).maxTop'), q('pipeGapBounds(H, 0).maxTop'));
});

test('spawnPipe always lands inside the bounds', () => {
  const sim = loadSim();
  const { minTop, maxTop } = sim.run('pipeGapBounds(H, SAFE_TOP)');
  for (let i = 0; i < 200; i++) {
    sim.run('pipes=[]; spawnPipe()');
    const top = sim.run('pipes[0].gapTop');
    assert.ok(top >= minTop && top <= maxTop, `gapTop ${top} within [${minTop}, ${maxTop}]`);
    assert.equal(sim.run('pipes[0].scored'), false);
  }
});

// ---------- themes: cycle + validation (issue #32) ----------

test('nextThemeName cycles through the list and wraps around', () => {
  const q = loadRules();
  const names = "['default','halloween','winter']";
  assert.equal(q(`nextThemeName('default', ${names})`), 'halloween');
  assert.equal(q(`nextThemeName('halloween', ${names})`), 'winter');
  assert.equal(q(`nextThemeName('winter', ${names})`), 'default');
});

test('nextThemeName falls back to the first theme for unknown names', () => {
  const q = loadRules();
  assert.equal(q(`nextThemeName('bogus', ['default','halloween','winter'])`), 'default');
});

test('isThemeName accepts known names and rejects everything else', () => {
  const q = loadRules();
  const names = "['default','halloween','winter']";
  for (const n of ['default', 'halloween', 'winter'])
    assert.equal(q(`isThemeName('${n}', ${names})`), true);
  for (const n of ['bogus', 'DEFAULT', ''])
    assert.equal(q(`isThemeName('${n}', ${names})`), false);
});

test('THEMES contains default, summer, fall, halloween and winter, all with the same keys', () => {
  const sim = loadSim();
  // JSON round-trip: vm-realm arrays fail deepStrictEqual against host arrays
  const names = JSON.parse(sim.run('JSON.stringify(Object.keys(THEMES))'));
  assert.deepEqual(names, ['default', 'summer', 'fall', 'halloween', 'winter']);
  const keys = JSON.parse(sim.run('JSON.stringify(Object.keys(THEMES.default).sort())'));
  for (const n of names.slice(1))
    assert.deepEqual(JSON.parse(sim.run(`JSON.stringify(Object.keys(THEMES['${n}']).sort())`)), keys,
      `${n} palette covers every themed element`);
});

test('cycleTheme walks every theme in order, wraps, and persists each choice', () => {
  const sim = loadSim();
  // fixed start, independent of today's season: seed BOTH the stored
  // value and the live variable (boot already picked the seasonal theme)
  sim.run(`Store.theme = 'default'; theme = 'default';`);
  assert.equal(sim.run('theme'), 'default');
  for (const expected of ['summer', 'fall', 'halloween', 'winter', 'default']) {
    sim.run('cycleTheme()');
    assert.equal(sim.run('theme'), expected);
    assert.equal(sim.run('Store.theme'), expected); // persisted (memory fallback)
  }
});

test('Store.theme falls back to the season for unknown or missing stored values', () => {
  const sim = loadSim();
  const seasonal = sim.run('seasonalThemeName(new Date())'); // player's local month
  assert.equal(sim.run('Store.theme'), seasonal); // nothing stored yet
  sim.run(`SafeStorage.set('boxyTheme', 'bogus')`);
  assert.equal(sim.run('Store.theme'), seasonal);
  sim.run(`SafeStorage.set('boxyTheme', 'winter')`);
  assert.equal(sim.run('Store.theme'), 'winter'); // manual choice always wins
});

test('seasonalThemeName maps the local month to a season palette', () => {
  const q = loadRules();
  // fixed dates → deterministic, regardless of when the suite runs.
  // month arg is 0-based, in the date's LOCAL timezone.
  const seasonAt = month => q(`seasonalThemeName(new Date(2026, ${month}, 15))`);
  for (const m of [10, 11, 0, 1]) assert.equal(seasonAt(m), 'winter');
  for (const m of [2, 3, 4]) assert.equal(seasonAt(m), 'default');
  for (const m of [5, 6, 7]) assert.equal(seasonAt(m), 'summer');
  for (const m of [8, 9]) assert.equal(seasonAt(m), 'fall');
  // late November boots winter, as requested for this time of year
  assert.equal(q(`seasonalThemeName(new Date(2026, 10, 25))`), 'winter');
});
