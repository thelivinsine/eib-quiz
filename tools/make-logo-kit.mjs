// Builds docs/brand/: every logo lockup, the app icon and the favicon, as
// SVG (text outlined, so no font is needed to open them) and as PNG - and the
// app's served copies: /favicon.svg and img/icons/*.png.
//
//   node tools/make-logo-kit.mjs
//
// Drawn from docs/Mockups/ui/logo-kit.png. The mark's geometry was measured
// off that mockup's pixels; the wordmark layout off the approved render.
// Never hand-edit a file in docs/brand/: change a constant here and re-run.
//
// Needs Chrome, and Chrome needs the network (Google Fonts + cdnjs): it fetches
// the fonts, turns the two strings into outlines, and rasterises the PNGs.
// The Bash tool has no egress, but a Chrome it launches does.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'brand');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// ---- the mark: 60 x 63 units, three 21-unit bars --------------------------
// Right ends are r=10 on a 21 bar (a near half-circle), the two outer left
// corners r=8, the red bar stops at 45 (74% of the width) - all as measured.
const BLACK = 'M8 0H50A10 10 0 0 1 60 10V11A10 10 0 0 1 50 21H0V8A8 8 0 0 1 8 0Z';
// Each lower bar carries a 1-unit strip hidden under the bar above it, so the
// seam is never anti-aliased against the background (a hairline on dark).
const RED = 'M0 21H35A10 10 0 0 1 45 31V32A10 10 0 0 1 35 42H0Z M0 20H35V21H0Z';
const YELLOW = 'M0 42H50A10 10 0 0 1 60 52V53A10 10 0 0 1 50 63H8A8 8 0 0 1 0 55Z M0 41H35V42H0Z';
// The mockup's dark variant rims the navy bar so it does not vanish into a
// navy ground. The rim is INSIDE the mark's outline - the bar is drawn full
// size in the rim colour, then 0.75 smaller in navy on top - so every variant
// has the same bounds. Red covers the rim where the two bars meet.
const BLACK_IN = 'M8 0.75H50A9.25 9.25 0 0 1 59.25 10V11A9.25 9.25 0 0 1 50 20.25H0.75V8A7.25 7.25 0 0 1 8 0.75Z';
const MARK_W = 60, MARK_H = 63;

const VARIANTS = {
  '':            { bars: ['#0F172A', '#E10600', '#FFCC00'], name: '#0F172A', tag: '#64748B' },
  '-dark':       { bars: ['#0F172A', '#E10600', '#FFCC00'], name: '#FFFFFF', tag: '#CBD5E1', rim: '#64748B' },
  '-mono-dark':  { bars: ['#0F172A', '#64748B', '#334155'], name: '#0F172A', tag: '#334155' },
  '-mono-light': { bars: ['#7C8BA1', '#CBD2DC', '#DFE4EB'], name: '#7C8BA1', tag: '#94A3B8' },
};

const markPaths = (v, dx = 0, dy = 0, k = 1) => {
  const g = (d, fill) => `<path fill="${fill}" d="${d}"/>`;
  const body = v.rim
    ? g(BLACK, v.rim) + g(YELLOW, v.bars[2]) + g(RED, v.bars[1]) + g(BLACK_IN, v.bars[0])
    : g(YELLOW, v.bars[2]) + g(RED, v.bars[1]) + g(BLACK, v.bars[0]);
  return dx || dy || k !== 1 ? `<g transform="translate(${r(dx)} ${r(dy)}) scale(${r(k, 4)})">${body}</g>` : body;
};

// ---- the wordmark: sizes and positions in mark units ----------------------
// Horizontal, measured off the approved 2400px render: name 41.58 (132px on a
// 200px mark), cap top 8.05 / baseline 35.5, ink starting 74.4; tagline 13.86,
// baseline 60.3, ink starting 73.9.
const NAME = { text: 'EIB Quiz', tracking: -0.02 };
const TAG = { text: 'Learn · Practise · Pass', tracking: 0 };
const H_LAYOUT = { name: { size: 41.58, base: 35.5, left: 74.4 }, tag: { size: 13.86, base: 60.3, left: 73.9 } };
// Stacked, measured off the mockup's stacked tile: name cap top 0.345 H below
// the mark, cap height 0.455 H, tagline baseline 0.545 H below the name's,
// tagline 1.30x the name's width.
const S_LAYOUT = { gap: 0.345 * MARK_H, cap: 0.455 * MARK_H, lead: 0.545 * MARK_H, tagRatio: 1.30 };

const r = (n, p = 2) => +n.toFixed(p);

function chrome(args) {
  return execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...args],
    { maxBuffer: 256 << 20, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function runPage(html, extra = []) {
  const dir = join(tmpdir(), 'eib-logo-kit');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'page.html');
  writeFileSync(file, html);
  const dom = chrome([...extra, '--virtual-time-budget=30000', '--dump-dom', pathToFileURL(file).href]);
  const m = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
  const txt = m && m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  if (!txt || txt.startsWith('ERR') || txt === 'wait') throw new Error('page failed: ' + (txt || dom.slice(0, 400)));
  return JSON.parse(txt);
}

// ---- step 1: outlines ------------------------------------------------------
// A non-browser user agent makes the Google Fonts CSS API hand out TTF, which
// opentype.js parses (it cannot read the WOFF2 a browser UA gets). opsz 96 is
// the optical size the approved render used at display size.
function outlines() {
  const jobs = [
    { font: 'b', ...NAME },
    { font: 'i', ...TAG },
  ];
  return runPage(`<!doctype html><pre id="out">wait</pre>
<script src="https://cdnjs.cloudflare.com/ajax/libs/opentype.js/1.3.4/opentype.min.js"></script>
<script>(async () => { const o = document.getElementById('out'); try {
  const css = await (await fetch('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@96,700&family=Inter:wght@400')).text();
  const urls = [...css.matchAll(/url\\((https:[^)]+\\.ttf)\\)/g)].map(m => m[1]);
  if (urls.length !== 2) throw new Error('fonts: ' + css.slice(0, 200));
  const [b, i] = await Promise.all(urls.map(async u => opentype.parse(await (await fetch(u)).arrayBuffer())));
  const fonts = { b, i }, SIZE = 1000;
  const res = ${JSON.stringify(jobs)}.map(j => {
    const f = fonts[j.font], k = SIZE / f.unitsPerEm, glyphs = f.stringToGlyphs(j.text);
    const path = new opentype.Path(); let x = 0;
    glyphs.forEach((g, n) => {
      path.extend(g.getPath(x, 0, SIZE));
      x += g.advanceWidth * k + j.tracking * SIZE;
      if (glyphs[n + 1]) x += f.getKerningValue(g, glyphs[n + 1]) * k;
    });
    return { commands: path.commands, bbox: path.getBoundingBox(), cap: f.tables.os2.sCapHeight * k };
  });
  o.textContent = JSON.stringify(res);
} catch (e) { o.textContent = 'ERR ' + e; } })();</script>`, ['--user-agent=curl/8.0']);
}

// Place a string drawn at size 1000 on baseline 0: scale to `size`, move it so
// its INK starts at `left` and its baseline sits at `base`.
function place(o, size, left, base) {
  const k = size / 1000, dx = left - o.bbox.x1 * k;
  const X = x => r(dx + x * k), Y = y => r(base + y * k);
  const d = o.commands.map(c =>
    c.type === 'Z' ? 'Z'
    : c.type === 'C' ? `C${X(c.x1)} ${Y(c.y1)} ${X(c.x2)} ${Y(c.y2)} ${X(c.x)} ${Y(c.y)}`
    : c.type === 'Q' ? `Q${X(c.x1)} ${Y(c.y1)} ${X(c.x)} ${Y(c.y)}`
    : `${c.type}${X(c.x)} ${Y(c.y)}`).join('');
  return { d, x1: left, x2: left + (o.bbox.x2 - o.bbox.x1) * k, y1: base + o.bbox.y1 * k, y2: base + o.bbox.y2 * k };
}

const svg = (w, h, body, x = 0, y = 0) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(w)} ${r(h)}" width="${Math.round(w * 4)}" height="${Math.round(h * 4)}" role="img" aria-label="EIB Quiz"><title>EIB Quiz</title>${body}</svg>\n`;

// ---- step 2: compose -------------------------------------------------------
function compose([name, tag]) {
  const files = {}; // relative path -> { svg, png: [w, h] }
  const S = 8;       // PNG pixels per mark unit: the mark renders 504px tall

  // horizontal
  const hn = place(name, H_LAYOUT.name.size, H_LAYOUT.name.left, H_LAYOUT.name.base);
  const ht = place(tag, H_LAYOUT.tag.size, H_LAYOUT.tag.left, H_LAYOUT.tag.base);
  const hW = Math.max(hn.x2, ht.x2), hY1 = Math.min(0, hn.y1), hY2 = Math.max(MARK_H, hn.y2, ht.y2);

  // stacked: everything centred on the widest line
  const sSize = S_LAYOUT.cap / (name.cap / 1000);
  const sCapTop = MARK_H + S_LAYOUT.gap, sBase = sCapTop + S_LAYOUT.cap;
  const nW = (name.bbox.x2 - name.bbox.x1) * sSize / 1000;
  const tSize = 1000 * nW * S_LAYOUT.tagRatio / (tag.bbox.x2 - tag.bbox.x1);
  const tW = nW * S_LAYOUT.tagRatio, sW = Math.max(nW, tW, MARK_W);
  const sn = place(name, sSize, (sW - nW) / 2, sBase);
  const st = place(tag, tSize, (sW - tW) / 2, sBase + S_LAYOUT.lead);
  const sH = Math.max(sn.y2, st.y2);

  for (const [suf, v] of Object.entries(VARIANTS)) {
    const text = (p, fill) => `<path fill="${fill}" d="${p.d}"/>`;
    const add = (file, w, h, body, x, y) => (files[`svg/${file}${suf}.svg`] = { svg: svg(w, h, body, x, y), png: [w * S, h * S] });
    add('eib-quiz-mark', MARK_W, MARK_H, markPaths(v));
    add('eib-quiz-logo-horizontal', hW, hY2 - hY1, markPaths(v) + text(hn, v.name) + text(ht, v.tag), 0, hY1);
    add('eib-quiz-logo-stacked', sW, sH, markPaths(v, (sW - MARK_W) / 2) + text(sn, v.name) + text(st, v.tag));
  }

  // App icon: the mark at half the tile's height, centred - the mockup's
  // proportion. The square one is full-bleed (stores and iOS mask it
  // themselves) and keeps the mark inside the 80% maskable safe circle.
  const icon = (rx, markH) => {
    const T = 100, k = markH / MARK_H;
    return svg(T, T, `<rect width="${T}" height="${T}"${rx ? ` rx="${rx}"` : ''} fill="#FFFFFF"/>` +
      markPaths(VARIANTS[''], (T - MARK_W * k) / 2, (T - MARK_H * k) / 2, k));
  };
  const rounded = icon(22.5, 50), square = icon(0, 50);
  // The favicon's mark is BIGGER than the mockup's (0.62 of the tile, not
  // 0.47): at 16px the mockup's proportion leaves each bar under 3px tall.
  const fav = icon(20, 62);
  files['svg/app-icon.svg'] = { svg: rounded };
  files['svg/app-icon-square.svg'] = { svg: square };
  files['svg/favicon.svg'] = { svg: fav };

  const png = {};
  for (const [p, f] of Object.entries(files)) if (f.png) png[p.replace('svg/', 'png/').replace('.svg', '.png')] = { svg: f.svg, w: f.png[0], h: f.png[1] };
  for (const n of [512, 192]) png[`png/app-icon-${n}.png`] = { svg: rounded, w: n, h: n };
  for (const n of [1024, 512]) png[`png/app-icon-square-${n}.png`] = { svg: square, w: n, h: n };
  png['png/apple-touch-icon-180.png'] = { svg: square, w: 180, h: 180 };
  for (const n of [16, 32, 48]) png[`png/favicon-${n}.png`] = { svg: fav, w: n, h: n };
  return { files, png };
}

// ---- step 3: rasterise -----------------------------------------------------
// Each SVG is drawn straight onto a canvas at its target size, so a 16px
// favicon is rasterised at 16px rather than downscaled from a big bitmap.
function rasterise(png) {
  const jobs = Object.entries(png).map(([out, j]) => ({ out, w: Math.round(j.w), h: Math.round(j.h), src: 'data:image/svg+xml;base64,' + Buffer.from(j.svg).toString('base64') }));
  return runPage(`<!doctype html><pre id="out">wait</pre><script>(async () => { const o = document.getElementById('out'); try {
  const res = {};
  for (const j of ${JSON.stringify(jobs)}) {
    const img = new Image(); img.src = j.src; await img.decode();
    const c = document.createElement('canvas'); c.width = j.w; c.height = j.h;
    c.getContext('2d').drawImage(img, 0, 0, j.w, j.h);
    res[j.out] = c.toDataURL('image/png').split(',')[1];
  }
  o.textContent = JSON.stringify(res);
} catch (e) { o.textContent = 'ERR ' + e; } })();</script>`);
}

// An .ico is a directory of PNGs: 6-byte header, a 16-byte entry per image.
function ico(pngs) {
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4);
  let off = head.length;
  pngs.forEach(([n, buf], i) => {
    const e = 6 + 16 * i;
    head[e] = n; head[e + 1] = n; head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8); head.writeUInt32LE(off, e + 12); off += buf.length;
  });
  return Buffer.concat([head, ...pngs.map(p => p[1])]);
}

// ---- step 4: the overview sheet -------------------------------------------
function overview() {
  const cell = (file, label, ground = '#FFFFFF', h = 64) =>
    `<figure><div class="tile" style="background:${ground}"><img src="${file}" style="height:${h}px"></div><figcaption>${label}</figcaption></figure>`;
  const swatches = [['Primary', '#0F172A'], ['Accent Red', '#E10600'], ['Accent Yellow', '#FFCC00'], ['Slate', '#64748B'], ['Slate Dark', '#334155'], ['Slate Light', '#CBD2DC']]
    .map(([n, c]) => `<figure><div class="sw" style="background:${c}"></div><figcaption><b>${n}</b>${c}</figcaption></figure>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=block">
<style>
body{margin:0;background:#F8FAFC;font:400 14px Inter,sans-serif;color:#64748B}
.page{width:1200px;padding:48px;box-sizing:border-box}
h2{font:600 12px Inter;letter-spacing:.08em;text-transform:uppercase;margin:0 0 16px;color:#475569}
section{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px;margin-bottom:24px}
.row{display:flex;gap:16px;flex-wrap:wrap} figure{margin:0;flex:1}
.tile{border:1px solid #E2E8F0;border-radius:12px;height:170px;display:flex;align-items:center;justify-content:center}
figcaption{margin-top:10px;text-align:center}
.sw{height:64px;border-radius:10px;border:1px solid #E2E8F0} .sw+figcaption{text-align:left} figcaption b{display:block;color:#0F172A;font-weight:600}
</style></head><body><div class="page">
<section><h2>Lockups</h2><div class="row">
${cell('svg/eib-quiz-logo-horizontal.svg', 'Horizontal (primary)', '#FFFFFF', 80)}
${cell('svg/eib-quiz-logo-stacked.svg', 'Stacked', '#FFFFFF', 130)}
${cell('svg/eib-quiz-mark.svg', 'Mark', '#FFFFFF', 90)}</div></section>
<section><h2>Variations</h2><div class="row">
${cell('svg/eib-quiz-logo-horizontal.svg', 'Full colour (light)', '#FFFFFF', 46)}
${cell('svg/eib-quiz-logo-horizontal-dark.svg', 'Dark background', '#0F172A', 46)}
${cell('svg/eib-quiz-logo-horizontal-mono-dark.svg', 'Monochrome (dark)', '#FFFFFF', 46)}
${cell('svg/eib-quiz-logo-horizontal-mono-light.svg', 'Monochrome (light)', '#FFFFFF', 46)}</div></section>
<section><h2>App icon &amp; favicon</h2><div class="row">
${cell('svg/app-icon.svg', 'App icon', '#F1F5F9', 120)}
${cell('svg/app-icon-square.svg', 'App icon, full-bleed', '#F1F5F9', 120)}
${cell('png/favicon-48.png', 'Favicon 48', '#F1F5F9', 48)}
${cell('png/favicon-32.png', 'Favicon 32', '#F1F5F9', 32)}
${cell('png/favicon-16.png', 'Favicon 16', '#F1F5F9', 16)}</div></section>
<section style="margin:0"><h2>Colour</h2><div class="row">${swatches}</div></section>
</div></body></html>`;
  const file = join(OUT, '_overview.html');
  writeFileSync(file, html);
  chrome(['--force-device-scale-factor=2', '--window-size=1200,1236', '--virtual-time-budget=10000', `--screenshot=${join(OUT, 'overview.png')}`, pathToFileURL(file).href]);
  rmSync(file);
}

// ---- run -------------------------------------------------------------------
// Both network-bound steps run BEFORE anything is deleted: a failed fetch or a
// changed Fonts API throws here and leaves the committed kit untouched.
const { files, png } = compose(outlines());
const bitmaps = rasterise(png);

rmSync(join(OUT, 'svg'), { recursive: true, force: true });
rmSync(join(OUT, 'png'), { recursive: true, force: true });
mkdirSync(join(OUT, 'svg'), { recursive: true });
mkdirSync(join(OUT, 'png'), { recursive: true });
for (const [p, f] of Object.entries(files)) writeFileSync(join(OUT, p), f.svg);
for (const [p, b64] of Object.entries(bitmaps)) writeFileSync(join(OUT, p), Buffer.from(b64, 'base64'));
writeFileSync(join(OUT, 'png', 'favicon.ico'), ico([16, 32, 48].map(n => [n, readFileSync(join(OUT, 'png', `favicon-${n}.png`))])));
overview();

// The app serves its icons from fixed paths (sw.js precaches favicon.svg and
// both icon-*.png by name), so the kit writes those copies itself: a hand copy
// is how the old tick favicon outlived the brand it belonged to.
// The "any" icons are the rounded tile; the maskable and Apple ones are the
// full-bleed square, because those platforms cut their own shape.
writeFileSync(join(ROOT, 'favicon.svg'), files['svg/favicon.svg'].svg);
for (const [from, to] of [['app-icon-192', 'icon-192'], ['app-icon-512', 'icon-512'],
  ['app-icon-square-512', 'icon-maskable-512'], ['apple-touch-icon-180', 'apple-touch-icon']])
  writeFileSync(join(ROOT, 'img', 'icons', `${to}.png`), Buffer.from(bitmaps[`png/${from}.png`], 'base64'));
console.log(`${Object.keys(files).length} SVG, ${Object.keys(bitmaps).length} PNG, favicon.ico, overview.png -> docs/brand/`);
