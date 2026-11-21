# 📦 Boxy Bird

A Flappy Bird clone where the bird is a cardboard box with an Amazon smile.

Built with plain HTML5 Canvas and the Web Audio API — no frameworks, no dependencies, no asset files. All graphics are drawn procedurally and all sounds are generated in code.

## 🎮 How to Play

- **Flap:** click, tap, or press `Space` / `↑` / `W`
- **Game over → replay:** click or press `Space` after a short delay
- **Back to splash:** press `Escape`
- **Toggle sound:** use the SOUND button on the splash screen (persisted in `localStorage`)
- **Switch theme:** use the THEME button on the splash screen — toggles between DEFAULT and HALLOWEEN (persisted in `localStorage`)

The game starts in **easy mode**: forgiving hitbox, generous pipe gap, and a low gravity constant make it approachable while still rewarding timing. At score **25**, **PRO MODE** kicks in and the pipes scroll faster.

## 🕹️ Game States

| State    | What happens                                                        |
|----------|---------------------------------------------------------------------|
| `splash` | Title screen with a large bobbing box, NEW GAME, THEME and SOUND buttons |
| `start`  | "Deliver the box through the pipes!" prompt; first flap starts play |
| `play`   | Core gameplay: pipes scroll left, score increments on each pass     |
| `dead`   | Box tips over and falls; game-over card shows score + best; share button appears |

## 🎉 Milestones & PRO MODE

Easy mode doesn't stay easy forever — the game celebrates progress and then raises the stakes:

- **Milestones at 10, 25 and 50 points** (`MILESTONES` in `src/constants.js`): a screen flash, an ascending three-note fanfare, and a colourful confetti burst around the box.
- **PRO MODE at 25 points** (`PRO_AT`): pipes scroll `PRO_SPEED_BONUS` (1.2 px/frame) faster, a red-and-gold confetti burst fires, a power-up fanfare plays, and a PRO MODE badge appears under the score (also noted on the game-over card).
- **Confetti** is a pooled particle system (`spawnParticles` / `updateParticles` in `src/world.js`) — no per-frame allocation. It also fires a dusty grey puff when the box crashes.

## 🎨 Themes

Two full colour palettes live in `THEMES` (`src/render.js`); every drawn element — sky, clouds, pipes, ground, cards, buttons, title, score, PRO badge — is themed:

| Theme       | Look                                                          |
|-------------|---------------------------------------------------------------|
| `default`   | Classic teal sky, green pipes, sandy ground                   |
| `halloween` | Deep purple night sky, orange pipes, dark violet ground       |

The THEME button on the splash screen toggles between them (`toggleTheme()` in `src/world.js`); the choice persists across sessions.

## 💾 Persistence

All preferences go through `SafeStorage` (`src/storage.js`): a `localStorage` wrapper that probes availability once and falls back to an in-memory `Map`, so the game still boots in sandboxed iframes, restrictive webviews, or browsers with site data blocked.

| Key         | What it stores                            |
|-------------|-------------------------------------------|
| `boxyBest`  | Best score                                |
| `boxySound` | Sound on/off (`on` / `off`)               |
| `boxyTheme` | Selected theme (`default` / `halloween`)  |

## 🔊 Sound

Five procedural sounds, all synthesized with the Web Audio API (no audio files):

| Event     | Sound                                                              |
|-----------|--------------------------------------------------------------------|
| Flap      | Sine sweep 350 → 800 Hz                                            |
| Score     | Two-note chime (880 Hz + 1318 Hz)                                  |
| Crash     | Sawtooth + square drop (220 → 45 Hz / 110 → 40 Hz)                 |
| Milestone | Ascending three-note arpeggio (660 → 880 → 1320 Hz), at 10/25/50   |
| Pro mode  | Square + sawtooth rising fanfare (220→440 / 330→660 / 440→880 Hz)  |

The sound on/off preference is stored under `boxySound` (see Persistence above).

## 📁 Project Files

```
├── index.html            # Standalone, self-contained version (inlined CSS + JS)
├── src/
│   ├── storage.js        # SafeStorage — localStorage with in-memory fallback
│   ├── sound.js          # Web Audio module — exposes window.BoxySound (5 sounds)
│   ├── constants.js      # Tuning + geometry, button rects, milestones, PRO mode, confetti palettes
│   ├── store.js          # Store — persisted best score + theme via SafeStorage
│   ├── world.js          # World state, physics, pipes, confetti particles, theme toggle
│   ├── collision.js      # Hit detection + death (forgiving hitbox)
│   ├── render.js         # Theme palettes (default / halloween) + all procedural drawing
│   ├── input.js          # Input: flap, splash buttons, share, keyboard
│   ├── main.js           # Entry point: canvas setup + fixed-timestep loop / boot
│   └── style.css         # Page layout styles (centred canvas, dark background)
├── test/
│   └── safe-storage.test.mjs  # Node test-runner tests for SafeStorage
├── build.mjs             # Builds dist/index.html (inlines CSS + JS in dependency order, adds OG meta tags)
├── make-icon.mjs         # Generates assets/icon-only.png + splash images (npm run assets)
├── make-og-image.mjs     # Pure-Node PNG encoder; generates og-image.png (1200×630)
├── og-image.png          # Generated Open Graph / Twitter share card
├── capacitor.config.json # Capacitor config (app id com.mehfuzh.boxybird)
├── ios/                  # Capacitor iOS Xcode project
├── package.json          # npm scripts: start, build, assets, ios:sync, ios:open, test
└── LICENSE               # Apache-2.0
```

### `index.html` vs `src/` + `build.mjs`

The repo ships two equivalent code paths:

1. **`index.html`** — a single file with all JS and CSS inlined. Open it directly in a browser to play. This is what `npm start` opens.
2. **`src/` modules + `build.mjs`** — the same game split into the modules listed above. Running `npm run build` inlines them into `dist/index.html` in dependency order (`storage` → `sound` → `constants` → `store` → `world` → `collision` → `render` → `input` → `main`), plus OG meta tags, for deployment.

Both paths produce identical gameplay; the split `src/` version is the canonical source for development, and `index.html` must be kept in sync with it.

### `make-og-image.mjs`

A dependency-free Node script that hand-encodes a 1200×630 PNG (sky gradient, ground, the Amazon-orange box, tape strip, smile arrow, and eye) using a minimal zlib-based PNG writer. The resulting `og-image.png` is used as the Open Graph / Twitter share card when someone shares the deployed game link on X.

## 🚀 Build & Deploy

```sh
npm run build   # → dist/index.html + dist/og-image.png
npm test        # node --test (test/*.test.mjs)
```

The `dist/` folder is what gets deployed to GitHub Pages (`https://mehfuzh.github.io/boxy-bird/`). Tests run with Node's built-in test runner — currently `test/safe-storage.test.mjs` covers the storage fallback behaviour.

## 📱 iOS App (Capacitor)

The game ships as a native iOS app via [Capacitor](https://capacitorjs.com) — the built `dist/index.html` runs in a WKWebView shell (`ios/` Xcode project, app id `com.mehfuzh.boxybird`).

```sh
npm install                 # Capacitor CLI + iOS platform (dev deps)
npm run assets              # generate assets/icon-only.png + splash images
npx cap add ios             # one-time: create the ios/ Xcode project
npx @capacitor/assets generate --ios   # one-time: app icon + launch screens
npm run ios:open            # build dist/, sync into ios/, open Xcode
```

In Xcode: select your signing team, then **Product → Archive → Distribute App → App Store Connect**. Requires a paid Apple Developer account. After any game change, `npm run ios:sync` copies the new build into the native project.

## 🤖 Built with [Docent](https://docent.ai)

This project was designed and written with the help of **Docent**, an AI coding assistant. The splash screen carries a small "powered by ドーセント" credit as a nod to that collaboration.

---

## 📜 License

[Apache License 2.0](./LICENSE)
