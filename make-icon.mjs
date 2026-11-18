// Generates App Store / Capacitor assets, pure Node (zlib PNG encoder),
// same approach as make-og-image.mjs — no image libraries needed.
//   assets/icon-only.png   1024x1024, fully opaque (App Store requirement)
//   assets/splash.png      2732x2732 launch screen (light)
//   assets/splash-dark.png 2732x2732 launch screen (dark, same art)
// Run: npm run assets   (then: npx @capacitor/assets generate --ios)
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function createImage(W, H) {
  const px = new Uint8Array(W * H * 3);
  function blend(x, y, r, g, b, a = 1) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = ((y | 0) * W + (x | 0)) * 3;
    px[i] = Math.round(r * a + px[i] * (1 - a));
    px[i + 1] = Math.round(g * a + px[i + 1] * (1 - a));
    px[i + 2] = Math.round(b * a + px[i + 2] * (1 - a));
  }
  function fill(r, g, b) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) blend(x, y, r, g, b);
  }
  function sky() { // same gradient as the game / og image (#8ecae6 -> #dff3f7)
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = 142 + (223 - 142) * t, g = 202 + (243 - 202) * t, b = 230 + (247 - 230) * t;
      for (let x = 0; x < W; x++) blend(x, y, r, g, b);
    }
  }
  function ground(h) {
    for (let y = H - h; y < H; y++) for (let x = 0; x < W; x++) blend(x, y, 55, 71, 90);
    const lip = Math.max(4, Math.round(h * 0.11));
    for (let y = H - h; y < H - h + lip; y++) for (let x = 0; x < W; x++) blend(x, y, 35, 47, 62);
  }
  // the box, same proportions as make-og-image.mjs / drawAmazonBox()
  function box(cx, cy, s) {
    const half = s / 2;
    for (let y = cy - half; y < cy + half; y++)
      for (let x = cx - half; x < cx + half; x++)
        blend(x, y, 255, 153, 0); // #FF9900
    const edge = Math.max(3, Math.round(s * 0.017));
    for (let x = cx - half; x < cx + half; x++)
      for (let k = 0; k < edge; k++) {
        blend(x, cy - half + k, 200, 120, 0, 0.55);
        blend(x, cy + half - 1 - k, 200, 120, 0, 0.55);
      }
    // tape strip
    for (let y = cy - half; y < cy + half; y++)
      for (let x = cx - s * 0.09; x < cx + s * 0.09; x++)
        blend(x, y, 255, 255, 255, 0.75);
    // smile arrow (white thick curve)
    const y0 = cy + s * 0.08 - s * 0.02, yc = cy + s * 0.08 + s * 0.18, rad = s * 0.05;
    for (let i = 0; i <= 240; i++) {
      const t = i / 240;
      const x = cx - s * 0.28 + t * s * 0.56;
      const y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * yc + t * t * y0;
      for (let dy = -rad; dy <= rad; dy++)
        for (let dx = -rad; dx <= rad; dx++)
          if (dx * dx + dy * dy <= rad * rad) blend(x + dx, y + dy, 255, 255, 255);
    }
    // arrowhead tip
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = cx + s * 0.28 + ((cx + s * 0.22) - (cx + s * 0.28)) * t;
      const y = y0 + ((cy + s * 0.08 - s * 0.1) - y0) * t;
      for (let dy = -rad * 0.7; dy <= rad * 0.7; dy++)
        for (let dx = -rad * 0.7; dx <= rad * 0.7; dx++)
          if (dx * dx + dy * dy <= rad * 0.7 * rad * 0.7) blend(x + dx, y + dy, 255, 255, 255);
    }
    // eye
    const ex = cx + s * 0.14, ey = cy - s * 0.22, er = s * 0.06;
    for (let dy = -er; dy <= er; dy++)
      for (let dx = -er; dx <= er; dx++)
        if (dx * dx + dy * dy <= er * er) blend(ex + dx, ey + dy, 19, 25, 33);
  }
  // ---- minimal PNG encoder (8-bit RGB, no alpha: App Store icons must be opaque) ----
  function crc32(buf) {
    if (!crc32.table) {
      crc32.table = new Int32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crc32.table[n] = c;
      }
    }
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = crc32.table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const t = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
  }
  function encode() {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0);
    ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // truecolor RGB
    const stride = W * 3 + 1;
    const raw = Buffer.alloc(H * stride);
    for (let y = 0; y < H; y++) {
      raw[y * stride] = 0; // filter: none
      Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * stride + 1);
    }
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", ihdr),
      chunk("IDAT", deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]);
  }
  return { blend, fill, sky, ground, box, encode };
}

mkdirSync("assets", { recursive: true });

// App icon: 1024x1024, sky + ground + big box (Apple rounds the corners itself)
{
  const img = createImage(1024, 1024);
  img.sky();
  img.ground(114);
  img.box(512, 470, 560);
  const png = img.encode();
  writeFileSync("assets/icon-only.png", png);
  console.log("✅ assets/icon-only.png (" + png.length + " bytes)");
}

// Launch screen: 2732x2732, page background (#14202a) + centered box
{
  const img = createImage(2732, 2732);
  img.fill(20, 32, 42);
  img.box(1366, 1366, 900);
  const png = img.encode();
  writeFileSync("assets/splash.png", png);
  writeFileSync("assets/splash-dark.png", png);
  console.log("✅ assets/splash.png + splash-dark.png (" + png.length + " bytes each)");
}
