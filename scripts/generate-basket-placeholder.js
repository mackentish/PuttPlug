/*
    Draws the PLACEHOLDER basket art used by src/components/MissMap.tsx.

    This exists so the repo has no binary asset nobody can regenerate. Replace
    assets/images/basket.png with real artwork whenever you like -- the only
    contract MissMap relies on is the 3:4 aspect ratio and the vertical bands
    it lines its six tap zones up with:

        high   ~ 18% - 42% of the height   (chains)
        center ~ 42% - 62% of the height   (rim / upper cage)
        low    ~ 62% - 88% of the height   (lower cage / pole)

    Run: node scripts/generate-basket-placeholder.js
*/
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 600;
const H = 800;

// A single mid-grey that stays legible on both the light and dark surfaces,
// so the placeholder doesn't need a per-theme variant.
const INK = [138, 147, 143];

const px = Buffer.alloc(W * H * 4, 0);

function plot(x, y, a) {
    if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
    const i = (y * W + x) * 4;
    const prev = px[i + 3] / 255;
    const next = Math.min(1, prev + a);
    px[i] = INK[0];
    px[i + 1] = INK[1];
    px[i + 2] = INK[2];
    px[i + 3] = Math.round(next * 255);
}

/** Axis-aligned filled rect with soft vertical edges. */
function rect(x0, y0, x1, y1, a = 1) {
    for (let y = Math.round(y0); y < Math.round(y1); y++) {
        for (let x = Math.round(x0); x < Math.round(x1); x++) plot(x, y, a);
    }
}

/** Filled ellipse outline of the given thickness. */
function ellipseRing(cx, cy, rx, ry, thickness, a = 1) {
    for (
        let y = Math.round(cy - ry - thickness);
        y <= cy + ry + thickness;
        y++
    ) {
        for (
            let x = Math.round(cx - rx - thickness);
            x <= cx + rx + thickness;
            x++
        ) {
            const outer =
                ((x - cx) / (rx + thickness)) ** 2 +
                ((y - cy) / (ry + thickness)) ** 2;
            const inner = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
            if (outer <= 1 && inner >= 1) plot(x, y, a);
        }
    }
}

/** Line from (x0,y0) to (x1,y1), `w` px wide. */
function line(x0, y0, x1, y1, w = 2, a = 1) {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) * 2;
    for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        for (let dx = -w / 2; dx <= w / 2; dx++) {
            for (let dy = -w / 2; dy <= w / 2; dy++)
                plot(Math.round(x + dx), Math.round(y + dy), a);
        }
    }
}

const cx = W / 2;

// --- pole (behind everything) -------------------------------------------
rect(cx - 7, 90, cx + 7, 760, 0.55);

// --- top plate -----------------------------------------------------------
ellipseRing(cx, 150, 190, 34, 7, 0.9);
rect(cx - 190, 150, cx + 190, 158, 0.5);

// --- chains: two nested rings of hanging links ---------------------------
const chainTop = 165;
const chainBottom = 470;
for (let i = 0; i < 18; i++) {
    const t = (i / 18) * Math.PI * 2;
    const spread = Math.cos(t);
    const outer = cx + spread * 175;
    const inner = cx + spread * 95;
    // Depth cue: links on the far side of the ring read fainter.
    const alpha = 0.3 + 0.35 * ((Math.sin(t) + 1) / 2);
    line(outer, chainTop + 12, inner, chainBottom, 3, alpha);
}
// Inner chain ring, slightly shorter.
for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    const spread = Math.cos(t);
    line(
        cx + spread * 105,
        chainTop + 26,
        cx + spread * 50,
        chainBottom - 20,
        3,
        0.45
    );
}

// --- cage ----------------------------------------------------------------
const rimY = 480;
const baseY = 690;
ellipseRing(cx, rimY, 205, 40, 8, 1);
ellipseRing(cx, baseY, 150, 30, 7, 0.85);
// Slats, tapering inward from rim to base.
for (let i = 0; i <= 26; i++) {
    const t = (i / 26) * Math.PI * 2;
    const alpha = 0.28 + 0.34 * ((Math.sin(t) + 1) / 2);
    line(
        cx + Math.cos(t) * 205,
        rimY + Math.sin(t) * 40,
        cx + Math.cos(t) * 150,
        baseY + Math.sin(t) * 30,
        3,
        alpha
    );
}
// Base disc.
ellipseRing(cx, baseY, 150, 30, 3, 0.5);

// --- PNG encode ----------------------------------------------------------
function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
}

let table = null;
function crc32(buf) {
    if (!table) {
        table = new Int32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++)
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            table[n] = c;
        }
    }
    let c = -1;
    for (let i = 0; i < buf.length; i++)
        c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return c ^ -1;
}

const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0; // filter: none
    px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // colour type: RGBA
const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'images', 'basket.png');
fs.writeFileSync(out, png);
console.log(`wrote ${out} (${W}x${H}, ${(png.length / 1024).toFixed(1)} KB)`);
