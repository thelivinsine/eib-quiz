// The motion floor, as a test rather than as a paragraph.
//
// Motion is the one part of a design system a test genuinely cannot see: whether a 180ms rise
// reads as responsive or as sluggish is a browser question, and the test suite does not run
// one. What a test *can* hold is the thing that rots — the rule that every duration and every
// curve is a token in the stylesheet and nowhere else. Motion is usually the newest place in
// an app for a raw value to be typed by hand, which is why it needs the guard contrast already
// has.
//
// So this is deliberately not a test of how the app feels. It is four assertions about where
// motion is allowed to be declared, plus the two that catch the specific ways a CSS-only
// overlay animation silently does nothing.
//
// PORTED FROM ANOTHER PROJECT. Keep it only if this project also settles on a small fixed set
// of durations and one curve; the CONFIGURE block is where that set is named. The last two
// tests (overlay animation, reduced motion) apply to any app with a dialog and are worth
// keeping regardless.
//
// Named `*.test.mjs` so a `node --test scripts/*.test.mjs` glob picks it up.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ============================ CONFIGURE ====================================================

const STYLESHEET = "../src/app/globals.css";
const SOURCE_DIR = "../src";
const SOURCE_EXT = /\.(tsx?|jsx?)$/;

/** The motion tokens that must exist. */
const REQUIRED_TOKENS = ["--default-transition-duration", "--duration-enter", "--ease-out"];

/** Every `--duration-*` token the stylesheet is allowed to declare, sorted. A duration that is
 *  not on this list is a decision made without a reason. (`--default-transition-duration` is
 *  a framework name and is matched apart by the regex below.) */
const ALLOWED_DURATIONS = ["--duration-enter"];

/** The keyframes the stylesheet is allowed to declare, in order, and the token that uses the
 *  first of them. One entrance shape for the whole app: a second keyframe is the point at
 *  which "motion says a thing appeared" has become "motion decorates", so it should cost a
 *  decision entry rather than an edit. */
const ALLOWED_KEYFRAMES = ["rise"];
const ENTRANCE_TOKEN = /--animate-rise:\s*rise\s/;

// ===========================================================================================

const root = (p) => fileURLToPath(new URL(p, import.meta.url));

const RAW_CSS = readFileSync(root(STYLESHEET), "utf8");
// Comments describe durations in prose ("120ms is the state change…"), and prose is not a
// declaration. Stripped for the same reason contrast.test.mjs strips them for hex codes.
const CSS = RAW_CSS.replace(/\/\*[\s\S]*?\*\//g, "");

/** Every source file, which is every place a utility class can be written. */
function sources(dir = root(SOURCE_DIR)) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sources(p);
    return SOURCE_EXT.test(entry.name) ? [{ path: p, text: readFileSync(p, "utf8") }] : [];
  });
}

const base = (p) => p.split(/[/\\]/).pop();

// --- the tokens exist ---------------------------------------------------------------------

test("the motion tokens are declared", () => {
  for (const token of REQUIRED_TOKENS) {
    assert.match(CSS, new RegExp(`${token}:\\s*[^;]+;`), `${token} is not declared`);
  }
});

test("there is no duration outside the allowed set", () => {
  const durations = [...CSS.matchAll(/--duration-[\w-]+(?=:)/g)].map((m) => m[0]);
  assert.deepEqual([...new Set(durations)].sort(), [...ALLOWED_DURATIONS].sort());
});

// --- nothing declares motion outside the stylesheet ----------------------------------------

test("no component writes a raw duration, delay or easing curve", () => {
  // Utility frameworks take a bracketed arbitrary value when they are given a raw one —
  // `duration-[200ms]`, `ease-[cubic-bezier(...)]`, `delay-[80ms]` — and a bare step like
  // `duration-200` is the framework's own scale, which is the same bug as a bare `text-[15px]`:
  // a value chosen off a palette this app has replaced.
  const offences = [];
  for (const { path, text } of sources()) {
    for (const [match] of text.matchAll(/\b(?:duration|delay|ease)-(?:\[[^\]]*\]|\d+)/g)) {
      offences.push(`${base(path)}: ${match}`);
    }
    // A raw CSS duration in an inline style object reaches the same place by another road.
    for (const [match] of text.matchAll(/\b(?:transition|animation)(?:Duration|Delay)\s*:/g)) {
      offences.push(`${base(path)}: ${match}`);
    }
  }
  assert.deepEqual(offences, [], "motion is declared in the stylesheet and nowhere else");
});

test("no component defines its own keyframes", () => {
  const offences = sources()
    .filter(({ text }) => /@keyframes|\banimate-\[/.test(text))
    .map(({ path }) => base(path));
  assert.deepEqual(offences, [], "a keyframe is a token in the stylesheet, not a component's");
});

test("the stylesheet declares only the allowed keyframes, and a token uses the first", () => {
  const names = [...CSS.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.deepEqual(names, ALLOWED_KEYFRAMES);
  assert.match(CSS, ENTRANCE_TOKEN);
});

// --- the two ways a CSS-only overlay animation silently does nothing -----------------------
// Worth keeping in any app with a <dialog> or a popover, whatever its motion rules are.

test("the overlay transitions carry allow-discrete and a @starting-style", () => {
  // Without `transition-behavior: allow-discrete` the close is invisible: `display` flips on
  // frame zero and the fade plays on an element that is already gone. Without
  // `@starting-style` the open is instant, because a newly-displayed element has no previous
  // computed value to transition from. Both failures look like "the animation just doesn't
  // work", and neither shows up anywhere but a browser.
  assert.match(CSS, /transition-behavior:\s*allow-discrete/);
  assert.ok(
    (CSS.match(/@starting-style/g) ?? []).length >= 1,
    "each overlay — dialog, drawer, backdrop — needs its own entry state",
  );
  // `overlay` in the transition list is what keeps a closing dialog in the top layer for the
  // whole animation instead of dropping it behind its own backdrop half way out.
  assert.match(CSS, /transition-property:[^;]*\boverlay\b/);
});

test("dialogs are matched by [open], not by the much newer :open", () => {
  // `:open` on a <dialog> is far younger than the attribute. The attribute is what
  // `showModal()` sets and what every browser supporting <dialog> at all has always matched.
  const stripped = CSS.replace(/:popover-open/g, "");
  assert.ok(!/dialog[^{;]*:open\b/.test(stripped), "use dialog[open], not dialog:open");
});

// --- the accessibility floor ---------------------------------------------------------------

test("reduced motion is honoured, and not with a zero that never fires transitionend", () => {
  assert.match(CSS, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  const block = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  // 0s never fires `transitionend`, and the discrete `display` transition above needs that
  // event to hand the element back to `display: none`. A zero here leaves a reduced-motion
  // visitor with a dialog that will not close.
  assert.ok(
    /transition-duration:\s*0\.01ms\s*!important/.test(block),
    "reduced motion must use a near-zero duration, not 0",
  );
  assert.ok(
    /animation-duration:\s*0\.01ms\s*!important/.test(block),
    "reduced motion must flatten animations too, not only transitions",
  );
});
