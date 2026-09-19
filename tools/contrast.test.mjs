// The contrast floor, as a test rather than as a paragraph.
//
// Adapted from claude-context-kit/scripts/contrast.test.mjs. The maths and the reporting are
// that file's; the structure is this project's, because the themes here are inverted from the
// kit's assumption — `:root` IS the dark theme and `html.light` overrides it, there is no
// `prefers-color-scheme` block, and the tokens live in the one `<style>` block in index.html.
//
// It reads the tokens **out of index.html**, not out of a copy, because a second list of hex
// codes is exactly the bug it is meant to prevent.
//
// What it cannot do: it measures *declared tokens*, not painted pixels. Anything stacked at an
// opacity still has to be looked at in a browser. This is the floor, not the ceiling.
//
// Run:  node --test tools/contrast.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ============================ CONFIGURE ====================================================

/** Where the colour tokens are declared. One file, or this test is measuring a copy. */
const STYLESHEET = "../index.html";

/** The two blocks the tokens live in. `:root` is the dark base; `html.light` overrides it. */
const DARK_BLOCK = "        :root {";
const LIGHT_BLOCK = "        html.light {";

// ===========================================================================================

const CSS = readFileSync(
  fileURLToPath(new URL(STYLESHEET, import.meta.url)),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, ""); // comments hold hex codes in prose; they are not tokens

// --- the maths -------------------------------------------------------------------------

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) =>
  0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);

/** The ratio between two opaque colours, always >= 1. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `#rgb`, `#rrggbb` and `rgba(r,g,b,a)`. Add a form here if the stylesheet uses another. */
export function parseColour(value) {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i.exec(text);
  if (rgb) return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
  throw new Error(`not a colour this script can read: ${value}`);
}

/** Alpha-composite `[r,g,b,a]` over an opaque ground. Simple source-over, per channel. */
const over = ([r, g, b, a = 1], ground) =>
  a === 1 ? [r, g, b] : [r, g, b].map((c, i) => c * a + ground[i] * (1 - a));

// --- reading the stylesheet ------------------------------------------------------------

/** The text between the first `{` after `marker` and its matching `}`. */
function block(css, marker) {
  const at = css.indexOf(marker);
  assert.notEqual(at, -1, `index.html no longer contains ${marker}`);
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unclosed block after ${marker}`);
}

const declarations = (text) =>
  Object.fromEntries(
    [...text.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(([, k, v]) => [k, v.trim()]),
  );

const DARK = declarations(block(CSS, DARK_BLOCK));
const LIGHT_OVERRIDES = declarations(block(CSS, LIGHT_BLOCK));

/** Light tokens fall back to the `:root` block, because `html.light` only overrides. */
const themes = { dark: DARK, light: { ...DARK, ...LIGHT_OVERRIDES } };

const colour = (theme, name) => {
  const raw = themes[theme][`--${name}`];
  assert.ok(raw, `--${name} is not defined in the ${theme} theme`);
  return parseColour(raw);
};

/** A token flattened over its ground, so we measure something that is actually on screen. */
const flat = (theme, name, ground) =>
  over(colour(theme, name), ground === undefined ? [255, 255, 255] : flat(theme, ground));

// --- the pair list, which is the actual deliverable --------------------------------------
//
// Written by hand, because only a person knows which ground a given piece of text lands on.
// Floors: 4.5 for body text, 3.0 for large text (>= 24px, or >= 19px bold) and non-text UI.

const AA = 4.5;
const AA_LARGE = 3;

// [foreground token, ground token, floor, what it is on screen].
// The fourth field is what a failure message reads as, and the only record of why the pair is
// in the list at all.
const PAIRS = [
  ["text", "surface", AA, "question text and headings in a tile"],
  ["text", "canvas", AA, "anything painted straight onto the page"],
  ["sub-text", "surface", AA, "lead paragraphs and explanation bodies"],
  ["muted", "surface", AA, "eyebrows, mode-card descriptions, the nav legend"],
  ["muted", "surface2", AA, "the dimmed options after an answer, hint rows"],
  ["faint", "surface", AA, "the /310 denominator and the mode time estimate"],
  ["faint", "canvas", AA, "the same two, where a tile is not behind them"],

  ["accent-text", "surface", AA, "Starten links, FRAGE n, the active EN toggle"],
  ["accent-text", "accent-soft", AA, "the current question in the navigator grid"],
  ["teal-deep", "teal-tint", AA, "the Bundesland tile label and the Bestanden pill"],
  ["gold", "gold-dim", AA, "the 300 FRAGEN badge on a mode card"],
  ["green", "green-dim", AA, "the correct answer and its review row"],
  ["red-text", "red-dim", AA, "the wrong answer, its explanation and review row"],
  ["blue", "blue-dim", AA, "the elapsed-time subscore"],
  ["green", "surface", AA, "the RICHTIG counter in the quiz stats bar"],
  ["red-text", "surface", AA, "the FALSCH counter in the quiz stats bar"],

  ["on-accent", "accent-fill", AA, "the label on a primary button and the mastery tile"],
  ["on-dark", "ink-tile", AA, "the CTA tile headline"],
];

// Two fills that sit against each other. Three edge treatments, three floors — see
// claude-context-kit/docs/reference/theme-light.md sections 3 and 5:
//
//   nesting step   a tile on the page, an inset well inside it   1.05 light / 1.09 dark
//   interaction    a hover, a selected row, a recessed track     1.08 - 1.25, both themes
//   hairline       the line drawn between two planes             1.10 - 1.35 on the lighter
//
// A nesting step is allowed to be quiet because it always has its hairline; an interaction
// state usually has nothing but the fill. Light mode has room for about two fill levels before
// it hits white and hands the rest to edges, which is why these are three floors and not one.
const NEST = 1.05;
const STATE = 1.08;
const HAIRLINE = 1.1;

const FILLS = [
  ["surface", "canvas", NEST, "a tile, held off the page by this step and its hairline"],
  ["surface2", "surface", NEST, "a stat well or a dimmed option, inset in a tile"],
  ["hover", "surface", STATE, "a tile or option under the pointer"],
  ["surface3", "surface", STATE, "a progress track and the :active fill"],
  ["border", "surface", HAIRLINE, "a tile's edge and the rule between two rows"],
  ["ink-tile", "canvas", STATE, "the CTA tile against the page"],
];

// Colours written as literals rather than tokens. The block parser above only sees the two
// token blocks, so anything hardcoded in a rule is invisible to PAIRS — and the featured exam
// card, the most prominent thing on the home screen, is painted entirely in literals. They are
// asserted here by value so a future nudge cannot drop one under the floor unnoticed.
// [foreground, ground, floor, what it is].
const LITERAL_PAIRS = {
  light: [
    ['#ffffff', '#17181C', AA, 'the featured exam card title'],
    ['#B4B7C0', '#17181C', AA, 'the featured card description'],
    ['#9397A1', '#17181C', AA, 'the featured card time estimate'],
    ['#17B5A4', '#17181C', AA, 'the 33 QUESTIONS badge on the featured card'],
    ['#06201D', '#17B5A4', AA, 'the label on the featured card Start button'],
  ],
  dark: [
    ['#ffffff', '#262A33', AA, 'the featured exam card title'],
    ['#B4B7C0', '#262A33', AA, 'the featured card description'],
    ['#9397A1', '#262A33', AA, 'the featured card time estimate'],
    ['#17B5A4', '#262A33', AA, 'the 33 QUESTIONS badge on the featured card'],
    ['#06201D', '#17B5A4', AA, 'the label on the featured card Start button'],
  ],
};

// The pairs the app knowingly fails, each on an explicit decision. Measured, not deleted.
// Empty is the right starting state.
const EXEMPT = [];

// --- the tests ---------------------------------------------------------------------------
//
// Every shortfall in a list is reported at once: a floor that moves usually moves several
// pairs, and finding them one failed run at a time is how a token gets nudged four times.

const shortfalls = (theme, list) =>
  list
    .map(([fg, bg, floor, why]) => ({
      ratio: contrast(flat(theme, fg, bg), flat(theme, bg)),
      floor,
      line: (r) => `${fg} on ${bg}: ${r} < ${floor} — ${why}`,
    }))
    .filter(({ ratio, floor }) => ratio < floor)
    .map(({ ratio, line }) => line(ratio.toFixed(2)));

const literalShortfalls = (theme) =>
  LITERAL_PAIRS[theme]
    .map(([fg, bg, floor, why]) => ({
      ratio: contrast(parseColour(fg), parseColour(bg)),
      floor,
      line: (r) => `${fg} on ${bg}: ${r} < ${floor} — ${why}`,
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

  test(`${theme}: hardcoded colours clear their floor too`, () => {
    assert.deepEqual(literalShortfalls(theme), [], 'literal colour pairs under their floor');
  });

  test(`${theme}: the knowing AA failures are no worse than they were decided to be`, () => {
    assert.deepEqual(shortfalls(theme, EXEMPT), [], "an exempt pair has drifted further down");
  });
}

// A token the light block defines and the dark block does not is a value dark silently falls
// back to — which is how a theme ends up painting the other theme's colour.
test("the light theme overrides only tokens the dark base defines", () => {
  for (const token of Object.keys(LIGHT_OVERRIDES)) {
    assert.ok(token in DARK, `${token} exists only in html.light — :root has no value for it`);
  }
});

// Both themes are solid values, never opacity — the one rule the light and dark references
// agree on without qualification. A translucent text token is a colour nobody measured.
test("no text tier is dimmed with opacity", () => {
  for (const theme of ["light", "dark"]) {
    for (const tier of ["text", "sub-text", "muted", "faint"]) {
      assert.equal(
        colour(theme, tier).length,
        3,
        `${theme}: --${tier} is translucent; every softer shade has to be a solid value`,
      );
    }
  }
});
