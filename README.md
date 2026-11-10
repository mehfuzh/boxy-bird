# 📦 Boxy Bird

A Flappy Bird clone where the bird is a cardboard box with an Amazon smile.

Built with plain HTML5 Canvas and the Web Audio API — no frameworks, no dependencies, no asset files. All graphics are drawn procedurally and all sounds are generated in code.

## 🎮 How to Play

- **Flap:** click, tap, or press `Space` / `↑` / `W`
- **Game over → replay:** click or press `Space` after a short delay
- **Back to splash:** press `Escape`
- **Toggle sound:** use the SOUND button on the splash screen (persisted in `localStorage`)

The game runs in **easy mode**: forgiving hitbox, generous pipe gap, and a low gravity constant make it approachable while still rewarding timing.

## 🕹️ Game States

| State    | What happens                                                        |
|----------|---------------------------------------------------------------------|
| `splash` | Title screen with a large bobbing box, NEW GAME and SOUND buttons   |
| `start`  | "Deliver the box through the pipes!" prompt; first flap starts play |
| `play`   | Core gameplay: pipes scroll left, score increments on each pass     |
| `dead`   | Box tips over and falls; game-over card shows score + best; share button appears |

Best score is persisted in `localStorage` under the key `boxyBest`.

## 🔊 Sound

Three procedural sounds, all synthesized with the Web Audio API (no audio files):

| Event   | Sound                                                              |
|---------|--------------------------------------------------------------------|
| Flap    | Sine sweep 350 → 800 Hz                                            |
| Score   | Two-note chime (880 Hz + 1318 Hz)                                  |
| Crash   | Sawtooth + square drop (220 → 45 Hz / 110 → 40 Hz)                |

The sound on/off preference is stored in `localStorage` under `boxySound`.

## 📁 Project Files

```
├── index.html            # Standalone, self-contained version (inlined CSS + JS)
├── src/
│   ├── main.js           # Core game loop, rendering, input, collision (uses window.BoxySound)
│   ├── sound.js          # Web Audio module — exposes window.BoxySound
│   └── style.css         # Page layout styles (centred canvas, dark background)
├── build.mjs             # Builds dist/index.html (inlines CSS + JS, adds OG meta tags)
├── make-og-image.mjs     # Pure-Node PNG encoder; generates og-image.png (1200×630)
├── og-image.png          # Generated Open Graph / Twitter share card
├── package.json          # npm scripts: start (open index.html), build (node build.mjs)
└── LICENSE               # Apache-2.0
```

### `index.html` vs `src/` + `build.mjs`

The repo ships two equivalent code paths:

1. **`index.html`** — a single file with all JS and CSS inlined. Open it directly in a browser to play. This is what `npm start` opens.
2. **`src/` modules + `build.mjs`** — the same game split into `main.js`, `sound.js`, and `style.css`. Running `npm run build` inlines those files into `dist/index.html` (plus OG meta tags) for deployment.

Both paths produce identical gameplay; the split `src/` version is the canonical source for development.

### `make-og-image.mjs`

A dependency-free Node script that hand-encodes a 1200×630 PNG (sky gradient, ground, the Amazon-orange box, tape strip, smile arrow, and eye) using a minimal zlib-based PNG writer. The resulting `og-image.png` is used as the Open Graph / Twitter share card when someone shares the deployed game link on X.

## 🚀 Build & Deploy

```sh
npm run build   # → dist/index.html + dist/og-image.png
```

The `dist/` folder is what gets deployed to GitHub Pages (`https://mehfuzh.github.io/boxy-bird/`).

## 🤖 Built with [Docent](https://docent.ai)

This project was designed and written with the help of **Docent**, an AI coding assistant. The splash screen carries a small "powered by ドーセント" credit as a nod to that collaboration.

---

## 📜 License

[Apache License 2.0](./LICENSE)
