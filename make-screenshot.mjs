// Generates assets/screenshot.png: a real capture of the portal page
// (index.html) rendered by headless Google Chrome. Requires google-chrome
// on PATH and Python 3 with Pillow (only used to trim the capture).
// Run via `npm run screenshot`.
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CHROME = process.env.CHROME || "google-chrome";
const WIDTH = 1280, HEIGHT = 1000;
const out = resolve("assets/screenshot.png");
const profile = mkdtempSync(join(tmpdir(), "boxy-shot-"));

try {
  mkdirSync("assets", { recursive: true });
  execFileSync(CHROME, [
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${profile}`,   // fresh profile: no stored theme/best
    `--window-size=${WIDTH},${HEIGHT}`,
    "--virtual-time-budget=4000",   // let the game boot + a few frames draw
    `--screenshot=${out}`,
    pathToFileURL(resolve("index.html")).href,
  ], { stdio: "inherit" });

  // trim the uniform backdrop below the portal footer, keep a small margin
  execFileSync("python3", ["-c", `
from PIL import Image
im = Image.open(${JSON.stringify(out)}).convert("RGB")
w, h = im.size
bg = im.getpixel((4, h - 4))
px = im.load()
def uniform(y):
    return all(px[x, y] == bg for x in range(0, w, 16))
bottom = h
while bottom > 1 and uniform(bottom - 1):
    bottom -= 1
im.crop((0, 0, w, min(h, bottom + 40))).save(${JSON.stringify(out)})
`], { stdio: "inherit" });

  console.log("✅ assets/screenshot.png captured");
} finally {
  rmSync(profile, { recursive: true, force: true });
}
