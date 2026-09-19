// The contrast floor, as a test rather than as a paragraph.
//
// If the rules file says every text-and-ground pair clears AA in both themes, that is a claim
// somebody re-measures by hand every time a token moves — which means it stops being true
// quietly. This reads the tokens **out of the stylesheet** — not out of a copy, because a
// second list of hex codes is exactly the bug it is meant to prevent — and asserts the floors.
//
// What it cannot do: it measures *declared tokens*, not painted pixels. A component that
// stacks a translucent thing over a surface still has to be looked at in a browser. This is
// the floor, not the ceiling.
//
// PORTED FROM ANOTHER PROJECT. The maths, the parser and the reporting are done. What is this
// project's to write is the CONFIGURE block and the three lists — PAIRS, FILLS, EXEMPT. Those
// lists are the actual deliverable; the rest is plumbing.
//
// Named `*.test.mjs` so a `node --test scripts/*.test.mjs` glob picks it up with no change to
// package.json.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ============================ CONFIGURE ====================================================

/** Where the colour tokens are declared. One file, or this test is measuring a copy. */
const STYLESHEET = "../src/app/globals.css";

/** The three blocks the tokens live in. Adjust the markers to this project's stylesheet:
 *  the light block, and the dark theme written twice — once under the media query and once
 *  under the attribute selector the theme toggle sets. */
const LIGHT_BLOCK = "@theme";
const DARK_MEDIA_BLOCK = "@media (prefers-color-scheme: dark)";
const DARK_ATTR_BLOCK = ':root[data-theme="dark"]';

/** Token naming. `colour("ink")` reads `--color-ink`; change the prefix if this project's
 *  tokens are spelled differently. */
const TOKEN_PREFIX = "--color-";

// ===========================================================================================

const CSS = readFileSync(
  fileURLToPath(new URL(STYLESHEET, import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, ""); // comments hold hex codes in prose; they are not tokens

// --- the maths -------------------------------------------------------------------------
// WCAG 2.1 relative luminance and contrast ratio. Four lines, as advertised.

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) =>
  0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);

/** The ratio between two opaque colours, always ≥ 1. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Alpha-composite `[r,g,b,a]` over an opaque ground. Simple source-over, per channel. */
const over = ([r, g, b, a = 1], ground) =>
  a === 1 ? [r, g, b] : [r, g, b].map((c, i) => c * a + ground[i] * (1 - a));

/** `#rgb`, `#rrggbb` and `rgb(r g b / a)`. Add a form here if the stylesheet uses another. */
export function parseColour(value) {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const rgb = /^rgb\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/i.exec(
    text,
  );
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  throw new Error(`not a colour this script can read: ${value}`);
}

// --- reading the stylesheet ------------------------------------------------------------

/** The text between the first `{` after `marker` and its matching `}`. */
function block(css, marker) {
  const at = css.indexOf(marker);
  assert.notEqual(at, -1, `the stylesheet no longer contains ${marker}`);
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unclosed block after ${marker}`);
}

/** Every `--name: value;` in a block, as a plain object. Nested blocks come along too,
 *  which is what we want for the media query: its one child holds the tokens. */
const declarations = (text) =>
  Object.fromEntries(
    [...text.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(([, k, v]) => [k, v.trim()]),
  );

const LIGHT = declarations(block(CSS, LIGHT_BLOCK));
const DARK_MEDIA = declarations(block(CSS, DARK_MEDIA_BLOCK));
const DARK_ATTR = declarations(block(CSS, DARK_ATTR_BLOCK));

/** Dark tokens fall back to the light block, because the dark blocks only override. */
const themes = { light: LIGHT, dark: { ...LIGHT, ...DARK_ATTR } };

const colour = (theme, name) => {
  const raw = themes[theme][`${TOKEN_PREFIX}${name}`];
  assert.ok(raw, `${TOKEN_PREFIX}${name} is not defined in the ${theme} theme`);
  return parseColour(raw);
};

/** A token over a ground, flattened to something opaque we can measure.
 *
 *  A ground is a token name, or `[token, alpha, under]` for the ones a component paints at
 *  an opacity — measuring text against a full-strength surface when the component paints it
 *  at 50% is measuring a colour that is never on screen. */
function flat(theme, name, ground) {
  const under = ground === undefined ? [255, 255, 255] : resolve(theme, ground);
  return over(colour(theme, name), under);
}

const resolve = (theme, ground) =>
  Array.isArray(ground)
    ? over([...colour(theme, ground[0]).slice(0, 3), ground[1]], resolve(theme, ground[2]))
    : flat(theme, ground);

// --- the pair list, which is the actual deliverable --------------------------------------
//
// Written by hand, because only a person knows which ground a given piece of text actually
// lands on. `on` is that ground; where a token is translucent it is composited over the
// ground before it is measured.
//
// Floors: 4.5 for body text, 3.0 for large text (≥ 24px, or ≥ 19px bold) and for non-text
// UI — a glyph, an icon, a control's outline.

const AA = 4.5;
const AA_LARGE = 3;

// CONFIGURE: [foreground token, ground, floor, what it is on screen].
// The fourth field is not decoration — it is what a failure message reads as, and it is the
// only record of why a pair is in the list at all.
const PAIRS = [
  // ["ink",    "canvas",  AA,       "headings and labels on the page"],
  // ["body",   "surface", AA,       "prose in a card"],
  // ["muted",  "raised",  AA,       "the table head's column names"],
  // ["faint",  ["raised", 0.5, "surface"], AA_LARGE, "placeholder in a tinted column"],
];

// Two fills that sit against each other. Three different edge treatments, and they do not
// share a number — see `docs/reference/theme-light.md` §3 and §5, which is where these floors
// come from:
//
//   nesting step   a card on the page, a raised step inside it   1.07 light / 1.15 dark
//   interaction    a hover, a selected row, a recessed track     1.10 – 1.25, both themes
//   hairline       the line drawn between two planes             1.14 – 1.24 on the lighter
//
// A nesting step is allowed to be quiet because it always has its hairline; an interaction
// state usually has nothing but the fill, so it is the loud one. Light mode has room for
// about two fill levels before it hits white and hands the rest to edges, which is why these
// are three floors and not one round number.

const NEST = 1.05;
const STATE = 1.1;
const HAIRLINE = 1.12;

// CONFIGURE: same shape as PAIRS.
const FILLS = [
  // ["surface",  "canvas",  NEST,     "a card, held off the page by this step and its hairline"],
  // ["raised",   "surface", STATE,    "the table head and a row hover, inside a card"],
  // ["line",     "surface", HAIRLINE, "a card's edge, and the rule between two table rows"],
];

// The pairs the app knowingly fails, each on an explicit decision — a brand colour a floor
// would overrule, a logotype, a gradient stop. **Measured, not deleted.** The floor here is
// not AA, it is "no worse than the decision that was taken", so drifting further down breaks
// the suite and has to be a decision too.
//
// CONFIGURE: empty is the right starting state. An entry here needs a line in
// `docs/decisions/` naming the trade, or it is just a disabled test.
const EXEMPT = [];

// --- the tests ---------------------------------------------------------------------------
//
// Every shortfall in a list is reported at once. A floor that moves usually moves several
// pairs, and finding them one failed run at a time is how a token gets nudged four times.

const name = (ground) =>
  Array.isArray(ground) ? `${ground[0]}/${ground[1] * 100} over ${name(ground[2])}` : ground;

const shortfalls = (theme, list) =>
  list
    .map(([fg, bg, floor, why]) => ({
      ratio: contrast(flat(theme, fg, bg), resolve(theme, bg)),
      line: (r) => `${fg} on ${name(bg)}: ${r} < ${floor} — ${why}`,
      floor,
    }))
    .filter(({ ratio, floor }) => ratio < floor)
    .map(({ ratio, line }) => line(ratio.toFixed(2)));

for (const theme of ["light", "dark"]) {
  test(`${theme}: every text pair clears its floor`, () => {
    assert.deepEqual(shortfalls(theme, PAIRS), [], "text pairs under their floor");
  });

  test(`${theme}: adjacent fills are far enough apart to be two things`, () => {
    assert.deepEqual(shortfalls(theme, FILLS), [], "fills too close to read as two");
  });

  test(`${theme}: the knowing AA failures are no worse than they were decided to be`, () => {
    assert.deepEqual(shortfalls(theme, EXEMPT), [], "an exempt pair has drifted further down");
  });
}

// The dark theme is written twice — once under `prefers-color-scheme` and once under the
// attribute selector — because CSS has no way to say "these two selectors, same body" without
// a preprocessor. Two copies drift, so this is the check that they have not.
test("the two dark blocks are the same block", () => {
  assert.deepEqual(
    DARK_MEDIA,
    DARK_ATTR,
    "the @media dark block and the [data-theme=dark] block have diverged",
  );
});

// A token that nothing reads is a decision nobody made. This catches the reverse of the pair
// list: a colour defined in dark that light has never heard of, which is how a theme ends up
// with a value the other one silently falls back to white for.
test("the dark theme overrides only tokens the light theme defines", () => {
  for (const token of Object.keys(DARK_ATTR)) {
    assert.ok(
      token in LIGHT,
      `${token} exists only in the dark theme — the light theme has no value for it`,
    );
  }
});

// --- two checks worth keeping if this project has a scrim and a popover --------------------
//
// Both are commented out because they name tokens this project may not have. The reasoning is
// the transferable part: a scrim's job differs by theme, and a floating surface needs a rim.

// test("the scrim removes the page from consideration, in both themes", () => {
//   // Light: a bright page has to be darkened a long way, and there is room to.
//   const ratio = contrast(flat("light", "scrim", "canvas"), flat("light", "canvas"));
//   assert.ok(ratio >= 2.5, `light: the scrim is ${ratio.toFixed(2)} over the page, under 2.5`);
//   // Dark: there is nothing to darken. Even a fully opaque black scrim barely moves a near-black
//   // page, so a contrast floor here would be measuring the page rather than the scrim. The
//   // question that means something is whether it is near-opaque.
//   const alpha = parseColour(themes.dark[`${TOKEN_PREFIX}scrim`])[3];
//   assert.ok(alpha >= 0.6, `dark: the scrim is ${alpha} opaque — it is a wash, not a scrim`);
// });

// test("the popover floats by a rim, in both themes", () => {
//   // A darker rim in light and a lighter one in dark — the one edge treatment that flips.
//   // What must not happen is a light popover carried by a blur alone.
//   for (const theme of ["light", "dark"]) {
//     assert.match(themes[theme]["--shadow-pop"], /0 0 0 1px/, `${theme}: rim missing`);
//   }
// });
