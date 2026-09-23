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
  ["text", "canvas", AA, "anything painted straight onto the page, the four headline numbers included"],
  ["sub-text", "surface", AA, "lead paragraphs, explanation bodies, mode-card descriptions"],
  ["muted", "surface", AA, "the nav legend, the quiz readouts' labels"],
  ["muted", "surface2", AA, "the dimmed options after an answer, hint rows"],
  ["sub-text", "surface2", AA, "the glyph in a why mark's plate"],
  ["faint", "surface", AA, "the /310 denominator in light, where a practise tile IS --surface"],
  // The practise band's panel is a step DOWN from the canvas, so it is a ground the
  // surface pairs above do not cover. The cards ON it are ordinary --surface tiles.
  ["text", "band", AA, "the CTA band's heading, and a why-band claim's title since the two landing bands swapped panels on 2026-09-22"],
  ["muted", "band", AA, "a why-band claim's body copy and the CTA band's note"],
  // The footer is a --band panel too, and its small print is --sub-text rather than
  // --muted: the source note, the disclaimer and the licence are things a reader may
  // actually need. This ground was unasserted for that tier since the footer shipped.
  ["sub-text", "band", AA, "the footer's source note and disclaimer"],
  ["faint", "canvas", AA, "the same two, where a tile is not behind them"],
  // A PRACTISE TILE is --tile since 2026-09-23 (the practise-mode mockup): the overview
  // card, the mode cards, the topic chips and the history/glossary lists. In light it is
  // white, which the surface pairs already cover; in dark it is a rung below --surface.
  ["text", "tile", AA, "a mode card's title, the overview card's verdict and figures"],
  ["sub-text", "tile", AA, "a mode card's description and its facts"],
  ["muted", "tile", AA, "the overview card's readout names and advice line"],
  ["faint", "tile", AA, "the /310 denominator on the overview card"],
  // The why band stopped being a panel on 2026-09-21, so its body copy sits on the
  // page. In light --surface IS --canvas so the surface pairs already covered it; in
  // dark they do not, because --surface is a rung above the canvas there.
  ["muted", "canvas", AA, "the four headline numbers' labels, straight on the page"],
  ["sub-text", "canvas", AA, "any secondary line with no tile behind it"],

  ["accent-text", "surface", AA, "Starten links, FRAGE n"],
  // The header sits on --canvas, which in dark is a rung below --surface. Its EN pill
  // and the chosen scheme icon have no fill of their own since 2026-09-23.
  ["accent-text", "canvas", AA, "any accent word straight on the page (the header's EN code and chosen scheme icon were until 2026-09-23; both toggles are grey now)"],
  ["accent-text", "accent-soft", AA, "the current question in the navigator grid"],
  ["teal-deep", "teal-tint", AA, "the Bundesland tile label and the Bestanden pill"],
  ["gold", "gold-dim", AA, "the DUE chip on the Smart Review card"],
  ["gold", "surface", AA, "the due-for-review counter in the overview card"],
  ["green", "green-dim", AA, "the correct answer and its review row"],
  ["red-text", "red-dim", AA, "the wrong answer, its explanation and review row"],
  ["blue", "blue-dim", AA, "the elapsed-time subscore"],
  ["green", "surface", AA, "the RICHTIG counter in the quiz stats bar"],
  ["gold", "tile", AA, "the due-for-review counter on the overview card"],
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

  // The mode cards' two discs carry a --text glyph: --surface / --surface2 in dark,
  // --surface2 in light. text/surface and text/surface2 above already cover both.
  // `on-hue / sub-text` went on 2026-09-23 with the solid start disc it described,
  // and --on-hue with it: a pair with no consumer is the stale-ground fault.

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
  // --band is the numbers band, the CTA band and the footer. The DIRECTION is the
  // theme's: a recess in light (the mockup's, 1.065 below its white page), a raised
  // panel in dark (1.15 above the page, per theme-dark.md §3 — nothing goes below the
  // page there). The practise band's panel was the fourth and is GONE (2026-09-21, on
  // request), and the three pairs that asserted a mode card ON it went with it: no
  // --surface tile sits on --band any more, resting or hovered or pressed.
  ["canvas", "band", NEST, "the page either side of a panel"],
  ["border", "canvas", HAIRLINE, "the panel's own edge, drawn on the page"],
  // --band is a panel ground (the why band, the CTA band, the footer) and the state
  // picker's fill. Practise TILES left it for --tile on 2026-09-23.
  ["border", "band", HAIRLINE, "the why band's and the footer's own hairline"],
  ["tile-edge", "band", HAIRLINE, "the state picker's rim on its own fill"],
  // `tile / canvas` is NOT asserted, for the same reason `surface / canvas` is not: in
  // light a tile IS the page and its edge separates it. Dark's step is 1.068.
  ["tile-edge", "canvas", HAIRLINE, "a practise tile's hairline, drawn on the page"],
  ["tile-edge", "tile", HAIRLINE, "the same hairline against the tile's own fill"],
  ["tile-hover", "tile", STATE, "a practise tile under the pointer"],
  ["hover", "tile", STATE, "a glossary / history summary row under the pointer: no edge change, so the fill is the whole state"],
  ["surface3", "tile", STATE, "a practise tile pressed"],
  ["surface2", "tile", NEST, "a mode card's arrow disc, and its icon disc in light"],
  // surface/band is GONE AGAIN (2026-09-22): the overview card's tiles were dissolved
  // on request, so nothing in the app puts a --surface fill on a --band ground any
  // more. It was last added on 2026-09-21 for those readout tiles, and deleted before
  // that when the practise band's panel went. A pair with no consumer is the
  // stale-ground bug this file keeps catching, so it goes rather than being kept warm.
  ["surface", "accent-soft", NEST, "the book plate on the resume banner"],
  ["surface2", "band", NEST, "a why-band icon disc on the panel"],
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
  ],
  dark: [
    ['#04231A', '#10C185', AA, 'the letter on the correct answer chip, on --green'],
    ['#3A0A0A', '#F98989', AA, 'the letter on the wrong answer chip, on --red'],
    // Same veil, same worst case: it sits on the image, not on the theme's canvas.
    ['#fff', '#6B6C6E', AA, 'the zoom veil label (.opt-img-hover) over a white image'],
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
