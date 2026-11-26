// Builds a single self-contained dist/index.html (inline CSS + JS),
// matching the root index.html version of the game.
// Scripts are inlined in dependency order: constants/store/sound first,
// then world (sim), collision, render, input, and the entry point last.
import { readFileSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";

const css = readFileSync("src/style.css", "utf8");
// load order matters: each module uses globals defined by the ones above it
const scripts = [
  "src/storage.js",
  "src/sound.js",
  "src/constants.js",
  "src/rules.js",
  "src/themes.js",
  "src/store.js",
  "src/world.js",
  "src/collision.js",
  "src/render.js",
  "src/input.js",
  "src/main.js",
  "src/portal.js",
].map(f => readFileSync(f, "utf8"));
const js = scripts.join("\n");

// Public URL of the deployed game (GitHub Pages) + its share image.
const SITE_URL = "https://mehfuzh.github.io/boxy-bird/";
const OG_IMAGE = SITE_URL + "og-image.png";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Boxy Bird</title>
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="keywords" content="boxy-bird, flappy-bird, flappy-bird-clone, ios, game, arcade-game, mobile-game, canvas, html5-canvas, javascript, web-audio, capacitor">
<meta name="theme-color" content="#14202a">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<!-- share preview image (X / Twitter / Open Graph) -->
<meta property="og:title" content="Boxy Bird">
<meta property="og:description" content="A Flappy Bird clone where the bird is a cardboard box with an Amazon smile.">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Boxy Bird — a cardboard box bird flapping through pipes">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Boxy Bird">
<meta name="twitter:description" content="A Flappy Bird clone where the bird is a cardboard box with an Amazon smile.">
<meta name="twitter:image" content="${OG_IMAGE}">
<meta name="twitter:image:alt" content="Boxy Bird — a cardboard box bird flapping through pipes">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext y=%22.9em%22 font-size=%2290%22%3E📦%3C/text%3E%3C/svg%3E">
<style>
${css}
</style>
</head>
<body>
<div class="portal">
  <header class="portal-header">
    <h1>📦 BOXY BIRD</h1>
    <p>A Flappy Bird clone where the bird is a cardboard box with an Amazon smile</p>
  </header>
  <div class="layout">
    <aside class="panel-col">
      <section class="panel" aria-label="Player stats">
        <h2>Player Stats</h2>
        <div class="stats">
          <div class="stat"><span class="label">Score</span><span class="value" id="statScore">0</span></div>
          <div class="stat"><span class="label">Best</span><span class="value" id="statBest">0</span></div>
          <div class="stat"><span class="label">Mode</span><span class="value" id="statMode">EASY</span></div>
          <div class="stat"><span class="label">Pro</span><span class="value" id="statPro">★</span></div>
        </div>
        <div class="status-row"><span>STATUS</span><span id="statusLabel">READY</span></div>
        <button type="button" id="playBtn" class="portal-btn">PLAY NOW</button>
      </section>
      <section class="panel" aria-label="Settings">
        <h2>Theme</h2>
        <div id="themeList"></div>
        <button type="button" id="soundToggle" class="portal-btn secondary">SOUND: ON</button>
      </section>
    </aside>
    <main class="stage-col">
      <canvas id="game" width="480" height="640"></canvas>
      <div class="stage-hint">Click / tap or press Space to flap · Escape returns to the menu</div>
    </main>
    <aside class="panel-col">
      <section class="panel" aria-label="How to play">
        <h2>How to Play</h2>
        <ul class="howto">
          <li><b>Flap</b> — click, tap, or press <kbd>Space</kbd> / <kbd>↑</kbd> / <kbd>W</kbd></li>
          <li><b>Score</b> — deliver the box through each pipe gap: +1 point</li>
          <li><b>Crash</b> — touching a pipe or the ground ends the run</li>
          <li><b>Replay</b> — after game over, click or press <kbd>Space</kbd></li>
          <li><b>Menu</b> — press <kbd>Esc</kbd> to return to the splash screen</li>
          <li><b>Auto-pause</b> — switching tabs pauses the run; click to resume</li>
        </ul>
      </section>
      <section class="panel" aria-label="Milestones and pro mode">
        <h2>Milestones &amp; PRO</h2>
        <ul class="milestones">
          <li><span class="pts">10</span> Confetti burst + fanfare</li>
          <li class="pro"><span class="pts">25</span> <b>PRO MODE</b> — pipes speed up!</li>
          <li><span class="pts">50</span> Legend status 🏆 — keep the run alive</li>
        </ul>
      </section>
      <section class="panel" aria-label="About the game">
        <h2>About</h2>
        <p>Boxy Bird starts in <b>easy mode</b>: a forgiving hitbox, a generous pipe gap and low gravity make it approachable while still rewarding timing.</p>
        <p>Plain HTML5 Canvas + Web Audio — no frameworks, no asset files. Every graphic is drawn and every sound synthesized in code.</p>
      </section>
    </aside>
  </div>
  <footer class="portal-footer">Built with HTML5 Canvas &amp; Web Audio · <a href="https://github.com/mehfuzh/boxy-bird" rel="noopener">source on GitHub</a> · Apache-2.0</footer>
</div>
<div id="hint"></div>
<script>
${js}
</script>
</body>
</html>
`;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
if (existsSync("og-image.png")) copyFileSync("og-image.png", "dist/og-image.png");
console.log("✅ dist/index.html built (" + html.length + " bytes)");
