// Renders the app's icon set in three styles as one contact sheet per style.
//
//   node tools/icon-packs.mjs <outdir>          # writes icon-pack-<style>.html
//   chrome --headless --disable-gpu --hide-scrollbars \
//     --force-device-scale-factor=2 --window-size=1120,980 \
//     --screenshot=docs/icon-pack-line.png <outdir>/icon-pack-line.html
//
// "solid" is the set that ships in index.html today (ICONS) — keep the two in step.
// "line" is the stroked set it replaced on 2026-09-20, kept for comparison; "duotone"
// is the same silhouettes with a 22% ground behind the figure.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] || '.';
mkdirSync(out, { recursive: true });

// ---- geometry helpers (arcs by hand are where fill-style icons go wrong) ----
const n = v => Number(v.toFixed(2));
const pt = (cx, cy, r, a) => [n(cx + r * Math.cos(a * Math.PI / 180)), n(cy + r * Math.sin(a * Math.PI / 180))];
// Annular segment: the fill-pack equivalent of a stroked arc.
function band(cx, cy, ro, ri, a0, a1) {
    const big = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const [x0, y0] = pt(cx, cy, ro, a0), [x1, y1] = pt(cx, cy, ro, a1);
    const [x2, y2] = pt(cx, cy, ri, a1), [x3, y3] = pt(cx, cy, ri, a0);
    return `M${x0} ${y0}A${ro} ${ro} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${ri} ${ri} 0 ${big} 0 ${x3} ${y3}Z`;
}
// Tangential arrowhead sitting on the end of a band.
function head(cx, cy, ro, ri, a, adv) {
    const [x0, y0] = pt(cx, cy, ro + 1.1, a), [x1, y1] = pt(cx, cy, ri - 1.1, a);
    const [x2, y2] = pt(cx, cy, (ro + ri) / 2, a + adv);
    return `M${x0} ${y0}L${x1} ${y1}L${x2} ${y2}Z`;
}
// Ring as one evenodd path (a hole, not two stacked circles — stacking breaks on tints).
const donut = (cx, cy, ro, ri) =>
    `M${cx} ${n(cy - ro)}a${ro} ${ro} 0 1 0 0 ${n(2 * ro)}a${ro} ${ro} 0 1 0 0 ${n(-2 * ro)}Z` +
    `M${cx} ${n(cy - ri)}a${ri} ${ri} 0 1 0 0 ${n(2 * ri)}a${ri} ${ri} 0 1 0 0 ${n(-2 * ri)}Z`;
const ev = d => `<path fill-rule="evenodd" d="${d}"/>`;
const r = (x, y, w, h, rad) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}"/>`;

// ---- shared silhouettes: duotone and solid differ only in what is tinted ----
const PIN = 'M12 22.2c0 0 7.1-6.6 7.1-11.7a7.1 7.1 0 1 0-14.2 0C4.9 15.6 12 22.2 12 22.2Z';
const PIN_HOLE = 'M12 13.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z';
const RIM = r(6.6, 3.3, 10.8, 2, 1);
const CUP = 'M7.4 5.3h9.2v3.1a4.6 4.6 0 0 1-9.2 0Z';
const CONE = 'M4 9.3a1 1 0 0 1 1-1h2.9l3.7-3.1a.9.9 0 0 1 1.5.7v12.2a.9.9 0 0 1-1.5.7L7.9 15.7H5a1 1 0 0 1-1-1Z';
const LENS = 'M12 2.9c2.7 2.6 4.1 5.7 4.1 9.1s-1.4 6.5-4.1 9.1c-2.7-2.6-4.1-5.7-4.1-9.1s1.4-6.5 4.1-9.1Z';
const LENS_HOLE = 'M12 6.2c-1.7 1.9-2.6 3.8-2.6 5.8s.9 3.9 2.6 5.8c1.7-1.9 2.6-3.8 2.6-5.8s-.9-3.9-2.6-5.8Z';
const A_GLYPH = 'M7.3 4.6h2.3l4 11.2h-2.4l-.83-2.5H6.6l-.83 2.5H3.3Z';
const A_HOLE = 'M8.45 7.4 7.25 11h2.4Z';
const CJK = r(13.4, 10.6, 7.8, 1.7, 0.85) + r(16.4, 7.6, 1.8, 3, 0.9) +
    '<path d="M14.6 13.4l1.6-.9 3.5 5.6-1.6.9Z"/><path d="M19.8 13.4l1.6.9-3.5 5.6-1.6-.9Z"/>';
// Swap arrows: 'repeat', and not a second circular arrow next to reset.
const SWAP_TOP = 'M3 7.1h12.6V4.2L21.2 8.2l-5.6 4v-2.9H3Z';
const SWAP_BOTTOM = 'M21 16.9H8.4v2.9L2.8 15.8l5.6-4v2.9H21Z';
const BARS = r(3.6, 13.4, 3.8, 7, 1.2) + r(10.1, 10, 3.8, 10.4, 1.2) + r(16.6, 6.2, 3.8, 14.2, 1.2);
const TREND = 'M13.6 3.2h7.2v7.2l-2.5-2.5-4.6 4.6-3.6-3.6-6.3 6.3-1.8-1.8 8.1-8.1 3.6 3.6 3-3Z';
const CLOSE = 'M6.9 5.2 12 10.3l5.1-5.1 1.7 1.7L13.7 12l5.1 5.1-1.7 1.7L12 13.7l-5.1 5.1-1.7-1.7L10.3 12 5.2 6.9Z';
const CHEV = 'M12 16.1 4.8 8.9l1.8-1.8L12 12.5l5.4-5.4 1.8 1.8Z';
const ARROW = 'M13.2 5.1 20.1 12l-6.9 6.9-1.8-1.8 3.8-3.8H4.4v-2.6h10.8l-3.8-3.8Z';
const SCALE_PAN = (x) => `M${x} 7.8 ${n(x - 3.6)} 14.6a3.6 3.6 0 0 0 7.2 0Z`;
const SCALE_BODY = r(11.1, 3.2, 1.8, 17.2, 0.9) + r(7.4, 20, 9.2, 1.9, 0.95) + r(4.2, 6.1, 15.6, 1.8, 0.9);
const COLUMNS = [4.2, 8.9, 13.6, 18.3].map(x => r(x, 10.6, 2.1, 7.6, 0.9)).join('');
const PEDIMENT = 'M12 2.6 21.6 8.2H2.4Z';
const BASE = r(2.6, 19.4, 18.8, 2, 1);
const PERSON_A = '<circle cx="9.2" cy="7.8" r="3.4"/><path d="M3 20.6a6.2 6.2 0 0 1 12.4 0 .9.9 0 0 1-.9.9H3.9a.9.9 0 0 1-.9-.9Z"/>';
const PERSON_B = '<circle cx="17.6" cy="8.6" r="2.7"/><path d="M15.7 13.6h2.2a4.5 4.5 0 0 1 4.5 4.5v1.5a.9.9 0 0 1-.9.9h-3.9a8 8 0 0 0-3.4-6.6 5 5 0 0 1 1.5-.3Z"/>';
const LIST_DOTS = '<circle cx="4.7" cy="6" r="1.5"/><circle cx="4.7" cy="12" r="1.5"/><circle cx="4.7" cy="18" r="1.5"/>';
const LIST_BARS = r(8.8, 4.9, 11.4, 2.2, 1.1) + r(8.8, 10.9, 11.4, 2.2, 1.1) + r(8.8, 16.9, 7.4, 2.2, 1.1);
const CLOCK_HANDS = r(11.1, 6.2, 1.8, 6.6, 0.9) + r(11.1, 11.1, 5.4, 1.8, 0.9);

// tint a fragment (duotone's soft ground)
const soft = s => s.replace(/<(path|rect|circle|polygon)\b/g, '<$1 opacity="0.22"');

// ---- the three packs -------------------------------------------------------
// line: verbatim from index.html's ICONS.
const line = {
    allQuestions: '<circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>',
    bundesland: '<path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z"/><circle cx="12" cy="11" r="2.2"/>',
    exam: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3.6"/><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none"/>',
    review: '<polyline points="17 2 21 6 17 10"/><path d="M3 12V10a4 4 0 0 1 4-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 12v2a4 4 0 0 1-4 4H3"/>',
    rights: '<path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 7h14"/><path d="M7 7l-3 6a3 3 0 0 0 6 0Z"/><path d="M17 7l-3 6a3 3 0 0 0 6 0Z"/>',
    politics: '<polygon points="12 3 21 8 3 8 12 3"/><line x1="3" y1="21" x2="21" y2="21"/><line x1="5" y1="11" x2="5" y2="18"/><line x1="10" y1="11" x2="10" y2="18"/><line x1="14" y1="11" x2="14" y2="18"/><line x1="19" y1="11" x2="19" y2="18"/>',
    history: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    society: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.4a3 3 0 0 1 0 5.2"/><path d="M17.5 14a6 6 0 0 1 3.5 6"/>',
    symbols: '<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
    pin: '<path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10Z"/><circle cx="12" cy="11" r="2.2"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0Z"/><path d="M8 6H5a2 2 0 0 0 0 4h3"/><path d="M16 6h3a2 2 0 0 1 0 4h-3"/><path d="M10 14h4"/><path d="M9 20h6"/><path d="M12 14v6"/>',
    translate: '<path d="M4 5h11"/><path d="M9 3v2"/><path d="M12.5 5c-.6 4.6-3.7 8.6-8 10.4"/><path d="M6.5 8.5c.9 2.6 2.9 4.7 5.5 5.8"/><path d="M13 21l4.2-10 4.2 10"/><path d="M14.6 17.3h5.2"/>',
    speaker: '<path d="M4 9.5v5a1 1 0 0 0 1 1h2.6l3.6 3a.8.8 0 0 0 1.3-.6V6.1a.8.8 0 0 0-1.3-.6l-3.6 3H5a1 1 0 0 0-1 1Z"/><path d="M16.2 9.2a4 4 0 0 1 0 5.6"/><path d="M18.8 6.6a7.6 7.6 0 0 1 0 10.8"/>',
    arrowRight: '<line x1="5" y1="12" x2="18" y2="12"/><polyline points="13 7 18 12 13 17"/>',
    chevron: '<polyline points="6 9.5 12 15.5 18 9.5"/>',
    close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    reset: '<path d="M3.5 12a8.5 8.5 0 1 1 2.8 6.3"/><polyline points="3 6.5 3.5 12 9 11.5"/>',
    trendUp: '<polyline points="4 16 10 10 14 14 20 7"/><polyline points="15 7 20 7 20 12"/>',
};

const RING = ev(donut(12, 12, 9.2, 6.6));
const RESET_ARC = band(12, 12, 9.4, 6.8, -70, 210) + head(12, 12, 9.4, 6.8, 210, 34);
const WAVES = `<path d="${band(12, 12, 8.6, 7.1, -44, 44)}"/><path d="${band(12, 12, 11.4, 9.9, -46, 46)}"/>`;
const HANDLES = `<path d="${band(7.4, 7.8, 3.3, 1.9, 90, 270)}"/><path d="${band(16.6, 7.8, 3.3, 1.9, -90, 90)}"/>`;
const STEM = r(11.1, 12.4, 1.8, 5.4, 0.9) + r(8.6, 17.6, 6.8, 1.9, 0.95) + r(6.8, 19.6, 10.4, 2, 1);
const EQUATOR = r(2.9, 11.1, 18.2, 1.8, 0.9);

const duotone = {
    allQuestions: soft(r(3, 4, 18, 16, 3.2)) + LIST_BARS,
    bundesland: soft(`<path d="${PIN}"/>`) + '<circle cx="12" cy="10.5" r="3.1"/>',
    exam: soft('<circle cx="12" cy="12" r="9.2"/>') + '<circle cx="12" cy="12" r="4.6"/>',
    review: soft(`<path d="${SWAP_TOP}"/>`) + `<path d="${SWAP_BOTTOM}"/>`,
    rights: soft(`<path d="${SCALE_PAN(7)}"/><path d="${SCALE_PAN(17)}"/>`) + SCALE_BODY,
    politics: soft(`<path d="${PEDIMENT}"/>`) + COLUMNS + BASE,
    history: soft('<circle cx="12" cy="12" r="9.2"/>') + CLOCK_HANDS,
    society: soft(PERSON_B) + PERSON_A,
    symbols: soft('<circle cx="12" cy="12" r="9.2"/>') + ev(donut(12, 12, 9.2, 7.7)) + EQUATOR + ev(LENS + LENS_HOLE),
    pin: soft(`<path d="${PIN}"/>`) + '<circle cx="12" cy="10.5" r="3.1"/>',
    trophy: soft(`<path d="${CUP}"/>` + HANDLES) + RIM + STEM,
    translate: soft(CJK) + ev(A_GLYPH + A_HOLE),
    speaker: soft(WAVES) + `<path d="${CONE}"/>`,
    arrowRight: soft('<circle cx="12" cy="12" r="9.2"/>') + '<path d="M12.8 6.9 17.9 12l-5.1 5.1-1.7-1.7 2.2-2.2H6.4v-2.4h6.9l-2.2-2.2Z"/>',
    chevron: soft('<circle cx="12" cy="12" r="9.2"/>') + '<path d="M12 15.4 7.4 10.8l1.6-1.6 3 3 3-3 1.6 1.6Z"/>',
    close: soft('<circle cx="12" cy="12" r="9.2"/>') + '<path d="M8.5 7.1 12 10.6l3.5-3.5 1.4 1.4L13.4 12l3.5 3.5-1.4 1.4L12 13.4l-3.5 3.5-1.4-1.4L10.6 12 7.1 8.5Z"/>',
    reset: soft('<circle cx="12" cy="12" r="9.2"/>') + `<path d="${band(12, 12, 7.2, 5.2, -70, 210)}${head(12, 12, 7.2, 5.2, 210, 40)}"/>`,
    trendUp: soft(BARS) + `<path d="${TREND}"/>`,
};

const solid = {
    allQuestions: LIST_DOTS + LIST_BARS,
    bundesland: ev(PIN + PIN_HOLE),
    exam: RING + '<circle cx="12" cy="12" r="3.4"/>',
    review: `<path d="${SWAP_TOP}"/><path d="${SWAP_BOTTOM}"/>`,
    rights: `<path d="${SCALE_PAN(7)}"/><path d="${SCALE_PAN(17)}"/>` + SCALE_BODY,
    politics: `<path d="${PEDIMENT}"/>` + COLUMNS + BASE,
    history: ev(donut(12, 12, 9.2, 7.1)) + CLOCK_HANDS,
    society: PERSON_B + PERSON_A,
    symbols: ev(donut(12, 12, 9.2, 7.6)) + EQUATOR + ev(LENS + LENS_HOLE),
    pin: ev(PIN + PIN_HOLE),
    trophy: RIM + `<path d="${CUP}"/>` + HANDLES + STEM,
    translate: ev(A_GLYPH + A_HOLE) + CJK,
    speaker: `<path d="${CONE}"/>` + WAVES,
    arrowRight: `<path d="${ARROW}"/>`,
    chevron: `<path d="${CHEV}"/>`,
    close: `<path d="${CLOSE}"/>`,
    reset: `<path d="${RESET_ARC}"/>`,
    trendUp: BARS + `<path d="${TREND}"/>`,
};

// ---- sheets ----------------------------------------------------------------
const PACKS = [
    ['line', 'Line', 'Hairline strokes, 1.8px, round caps — the set index.html ships today.',
        s => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`, line],
    ['duotone', 'Duotone', 'A 22% ground plus a solid figure, both currentColor — extends ICONS_FILL to the whole set.',
        s => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">${s}</svg>`, duotone],
    ['solid', 'Solid', 'One-tone silhouettes with knocked-out detail — heaviest of the three.',
        s => `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">${s}</svg>`, solid],
];

const NOTE = { pin: 'alias of bundesland' };

for (const [key, name, blurb, wrap, pack] of PACKS) {
    const cells = Object.entries(pack).map(([k, v]) => `
      <figure class="cell">
        <div class="glyph">${wrap(v)}</div>
        <figcaption>${k}${NOTE[k] ? `<small>${NOTE[k]}</small>` : ''}</figcaption>
      </figure>`).join('');
    const swatch = ['exam', 'bundesland', 'trophy', 'speaker', 'trendUp', 'close']
        .map(k => `<span>${wrap(pack[k])}</span>`).join('');
    writeFileSync(join(out, `icon-pack-${key}.html`), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --canvas:#F2F3F5; --surface:#fff; --ink:#17181C; --sub:#4A4E58; --muted:#6B707C; --border:#DCDEE3; --accent:#0B7D72; --charcoal:#131418; }
  * { box-sizing: border-box; }
  body { margin:0; width:1120px; background:var(--canvas); color:var(--ink);
         font-family:Inter,system-ui,sans-serif; padding:40px; }
  header { display:flex; align-items:baseline; gap:14px; margin-bottom:6px; }
  h1 { font-family:'Bricolage Grotesque',Inter,sans-serif; font-size:30px; font-weight:700; margin:0; letter-spacing:-0.01em; }
  .tag { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--accent);
         border:1px solid var(--border); background:var(--surface); border-radius:999px; padding:4px 12px; }
  p.blurb { margin:0 0 26px; color:var(--sub); font-size:14px; max-width:720px; }
  .grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
  .cell { margin:0; background:var(--surface); border:1px solid var(--border); border-radius:16px;
          padding:20px 10px 12px; text-align:center; }
  .glyph { height:56px; display:flex; align-items:center; justify-content:center; color:var(--ink); }
  .glyph svg { width:44px; height:44px; }
  figcaption { margin-top:12px; font-size:11.5px; color:var(--muted); font-weight:500; }
  figcaption small { display:block; font-size:10px; color:#9AA0AC; margin-top:2px; }
  .strip { margin-top:24px; display:flex; align-items:center; gap:28px; background:var(--charcoal);
           border-radius:16px; padding:22px 26px; color:#EDEFF3; }
  .strip .label { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#8B909C; margin-right:auto; }
  .strip span { display:flex; }
  .strip svg { width:30px; height:30px; }
  .strip .sm svg { width:20px; height:20px; }
  .sizes { display:flex; align-items:center; gap:18px; }
  .sizes svg { color:#EDEFF3; }
  footer { margin-top:18px; font-size:11px; color:#9AA0AC; }
</style></head><body>
<header><h1>EIB icon pack</h1><span class="tag">${name}</span></header>
<p class="blurb">${blurb}</p>
<div class="grid">${cells}</div>
<div class="strip"><span class="label">on charcoal · 30px / 20px</span>
  <div class="sizes">${swatch}</div>
  <div class="sizes sm">${swatch}</div>
</div>
<footer>24×24 viewBox · currentColor · generated by tools/icon-packs.mjs</footer>
</body></html>`);
    console.log(`icon-pack-${key}.html`);
}
