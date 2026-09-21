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
  ["sub-text", "surface", AA, "lead paragraphs, explanation bodies, mode-card descriptions"],
  ["muted", "surface", AA, "eyebrows, the nav legend, a mode card's meta and time"],
  ["muted", "surface2", AA, "the dimmed options after an answer, hint rows"],
  ["sub-text", "surface2", AA, "the glyph in a mode card's icon and arrow chips"],
  ["faint", "surface", AA, "the /310 denominator and the mode time estimate"],
  // The practise band's panel is a step DOWN from the canvas, so it is a ground the
  // surface pairs above do not cover. The cards ON it are ordinary --surface tiles.
  ["text", "band", AA, "the practise band's heading, centred on the panel"],
  ["muted", "band", AA, "its eyebrow and one-line description"],
  ["faint", "canvas", AA, "the same two, where a tile is not behind them"],
  // The why band stopped being a panel on 2026-09-21, so its body copy sits on the
  // page. In light --surface IS --canvas so the surface pairs already covered it; in
  // dark they do not, because --surface is a rung above the canvas there.
  ["muted", "canvas", AA, "a why-band item's body copy, straight on the page"],
  ["sub-text", "canvas", AA, "any secondary line with no tile behind it"],

  ["accent-text", "surface", AA, "Starten links, FRAGE n, the active EN toggle"],
  ["accent-text", "accent-soft", AA, "the current question in the navigator grid"],
  ["teal-deep", "teal-tint", AA, "the Bundesland tile label and the Bestanden pill"],
  ["gold", "gold-dim", AA, "the DUE chip on the Smart Review card"],
  ["gold", "surface", AA, "the due-for-review counter in the overview card"],
  ["green", "green-dim", AA, "the correct answer and its review row"],
  ["red-text", "red-dim", AA, "the wrong answer, its explanation and review row"],
  ["blue", "blue-dim", AA, "the elapsed-time subscore"],
  ["green", "surface", AA, "the RICHTIG counter in the quiz stats bar"],
  ["red-text", "surface", AA, "the FALSCH counter in the quiz stats bar"],

  // The answer states repaint a whole option, so every tier that can land on one
  // is listed. Asserting the accent alone is what left these unmeasured: the
  // option label, the explanation body and its English line all sit on the tint.
  ["text", "green-dim", AA, "the label of the correct option, and its explanation header"],
  ["text", "red-dim", AA, "the label of the option you picked wrongly"],
  ["sub-text", "green-dim", AA, "the explanation body under a correct answer"],
  ["sub-text", "red-dim", AA, "the explanation body under a wrong answer"],
  ["muted", "green-dim", AA, "the italic English line of a correct explanation"],
  ["muted", "red-dim", AA, "the same line under a wrong one"],

  // An option is a well inside the card and its letter chip is a well inside the
  // option, so the two bottom rungs carry text of their own.
  ["text", "surface2", AA, "an answer option's label"],
  ["text", "surface3", AA, "the same label with the option hovered"],
  ["muted", "surface3", AA, "the letter chip on an option, and a dimmed option after answering"],

  ["on-accent", "accent-fill", AA, "the label on a primary button and the mastery tile"],
  ["on-btn", "btn-fill", AA, "the label on a CTA — navy in light, accent blue in dark"],

  // The five hue plates (see the HUE DISCS block in index.html). Each is a
  // --*-dim / --* pair the palette already carried, which is why adding colour to
  // the hero facts, the why marks and the mode cards minted no new token. The
  // GLYPH on a plate is non-text UI, so AA_LARGE; the four already-listed pairs
  // above cover the same values where they carry text instead.
  ["violet", "violet-dim", AA, "the glyph on the violet plate (By topic, Flexible learning)"],
  ["violet", "surface", AA, "the same glyph where no plate is behind it"],
  // ...and the arrow on the SOLID disc under each mode card's action. One --on-hue
  // per theme: every light hue is a dark colour and every dark hue a light one.
  ["on-hue", "accent-text", AA_LARGE, "the arrow on the blue card's start disc"],
  ["on-hue", "green", AA_LARGE, "the arrow on the green card's start disc"],
  ["on-hue", "gold", AA_LARGE, "the arrow on the amber card's start disc"],
  ["on-hue", "red-text", AA_LARGE, "the arrow on the rose card's start disc"],
  ["on-hue", "violet", AA_LARGE, "the arrow on the violet card's start disc"],

  // --accent-soft is a tinted ground rather than a tile, and three tiers land on
  // it: the resume banner's text, a picked option in the exam, and a navigator
  // cell. The featured exam card was the fourth until 2026-09-21; --accent-hover
  // was ITS hover fill alone and went with it, along with the two pairs that
  // asserted the hovered tiers.
  ["text", "accent-soft", AA, "a picked option in the exam, and the resume banner's heading"],
  ["sub-text", "accent-soft", AA, "the resume banner's body copy"],
  ["muted", "accent-soft", AA, "the resume banner's mode-and-count line"],
  ["accent-text", "accent-soft", AA, "the current/answered cell in the navigator"],
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
  // `surface / canvas` is NOT asserted, and that is the one deliberate hole in this
  // list. The mockup's page is white, so light's --surface and --canvas are the same
  // value and a tile cannot step up out of the page at all — the argument
  // theme-dark.md §5 makes for dark being out of fill room at the BOTTOM, applied to
  // light being out of room at the top. What separates a tile here is its EDGE, which
  // `border / canvas` below asserts at 1.245 against a 1.10 floor. Dark still has the
  // step (1.15) and gets it from `surface / band` and the nesting pairs.
  ["surface2", "surface", NEST, "an answer option or a stat well, inset in a tile"],
  ["surface3", "surface2", NEST, "an option's letter chip, and the option under the pointer"],
  ["hover", "surface", STATE, "a tile or option under the pointer"],
  ["surface2", "canvas", NEST, "an answer option, which is a well on the white page"],
  ["surface3", "surface", STATE, "a progress track and the :active fill"],
  ["border", "surface", HAIRLINE, "a tile's edge and the rule between two rows"],
  // The recess the practise band sits in, and the tiles raised out of it. The FILL is
  // what separates them here (1.20 both themes), which is why the hairline is not
  // asserted against this ground — in light it is 1.04 on the panel by design.
  ["surface", "band", NEST, "a mode card or topic chip, raised out of the practise band"],
  ["canvas", "band", NEST, "the page either side of the panel"],
  // The two fills a card takes as a STATE on that recess. In light a white card can only
  // step down and the panel is 1.20 beneath it, so --surface3 lands 1.039 from --band and
  // --hover 1.067; the band scopes hover to --surface2 and press to --hover, and both have
  // to clear the nesting floor on this ground. Dark keeps --hover/--surface3 (1.43 / 1.57)
  // because its states step UP — which is why --surface3 is not asserted here.
  ["surface2", "band", NEST, "a mode card or topic chip hovered on the practise band"],
  // --surface3, not --hover. On the white canvas --hover lands 1.047 off the panel,
  // under the nesting floor, so the press fill moved a rung — a pressed card had all
  // but merged into the band with no hairline able to save it (--border is 1.17 there).
  ["surface3", "band", NEST, "the same pressed"],
  ["border", "canvas", HAIRLINE, "the panel's own edge, drawn on the page"],
  // A tinted ground is not a step in lightness against paper-grey, so the edge is
  // the whole separation and has to clear the floor alone.
  ["accent", "canvas", HAIRLINE, "a picked option's accent edge against the page"],
];

// Colours written as literals rather than tokens. The block parser above only sees the two
// token blocks, so anything hardcoded in a rule is invisible to PAIRS, and has to be asserted
// here by value instead. The grounds are token values, resolved by hand for the theme the rule
// applies in. A literal added to a rule belongs here the same day.
// [foreground, ground, floor, what it is].
const LITERAL_PAIRS = {
  light: [
    ['#fff', '#047857', AA, 'the letter on the correct answer chip, on --green'],
    ['#fff', '#CC2020', AA, 'the letter on the wrong answer chip, on --red'],
    // The zoom veil is rgba(9,10,13,0.60) over a PICTURE, so its effective backdrop
    // depends on the image. #6B6C6E is that veil composited over white — the lightest
    // an image can be, and therefore the worst case for the label on top of it.
    ['#fff', '#6B6C6E', AA, 'the zoom veil label (.opt-img-hover) over a white image'],
    // Same case as the veil: the hero's handwritten note sits on a PHOTOGRAPH, so its
    // ground is not a token. The note is placed over the one clean patch of sky in
    // img/hero-reichstag.webp, whose darkest pixel measures 210 of 255 — #D0D3D8 is
    // that worst case. The note reads the same in both themes because the photo does.
    ['#16233A', '#D0D3D8', AA, 'the hero margin note (.hero-note) on the photo sky'],
  ],
  dark: [
    ['#04231A', '#10B981', AA, 'the letter on the correct answer chip, on --green'],
    ['#3A0A0A', '#F87171', AA, 'the letter on the wrong answer chip, on --red'],
    // Same veil, same worst case: it sits on the image, not on the theme's canvas.
    ['#fff', '#6B6C6E', AA, 'the zoom veil label (.opt-img-hover) over a white image'],
    ['#16233A', '#D0D3D8', AA, 'the hero margin note (.hero-note) on the photo sky'],
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
