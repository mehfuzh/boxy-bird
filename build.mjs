// Builds a single self-contained dist/index.html (inline CSS + JS),
// matching the root index.html version of the game.
// Scripts are inlined in dependency order: constants/store/sound first,
// then world (sim), collision, render, input, and the entry point last.
import { readFileSync, mkdirSync, writeFileSync, copyFileSync, existsSync } from "node:fs";

const css = readFileSync("src/style.css", "utf8");
// load order matters: each module uses globals defined by the ones above it
const scripts = [
  "src/sound.js",
  "src/constants.js",
  "src/store.js",
  "src/world.js",
  "src/collision.js",
  "src/render.js",
  "src/input.js",
  "src/main.js",
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
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
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
<canvas id="game" width="480" height="640"></canvas>
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
