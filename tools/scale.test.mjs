// The size system, as a test rather than as a paragraph.
//
// Sibling to tools/contrast.test.mjs, and written for the same reason: the colour axis has a
// measured reference (claude-context-kit/docs/reference/theme-{light,dark}.md) AND a test, and
// it stayed disciplined for a year. Type and space had neither, and drifted to ~40 font sizes
// and 118 off-scale spacing literals. The reference is now
// claude-context-kit/docs/reference/type-and-space.md; this is the other half.
//
// It reads index.html directly, never a copy, for the same reason the contrast test does.
//
// ---------------------------------------------------------------------------------------
// THIS IS A RATCHET, NOT A GATE.
//
// docs/plans/sizing-system.md lands the cleanup over several phases. A test that simply
// forbade every literal would be red from the day it was written, which is worth nothing.
// So each metric carries a BUDGET, and the test fails two ways:
//
//   actual > budget  ->  a regression. Fix the code.
//   actual < budget  ->  you improved it. LOWER THE BUDGET in the same commit.
//
// The second direction is what stops the ratchet rotting. Budgets only ever go down; the
// target for every one of them is in the trailing comment.
// ---------------------------------------------------------------------------------------
//
// What it cannot do: it reads *declared* CSS, not painted pixels. It cannot see what a rule
// actually wins on screen, and it does not evaluate calc() or var() indirection. Browser
// measurement is still the last word — see the plan's acceptance criteria.
//
// Run:  node --test tools/scale.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// ============================ CONFIGURE ====================================================

const STYLESHEET = "../index.html";

/** The type ramp, as px. Mirrors the --fs-* tokens; see the plan §3.1. Floor is 12. */
const TYPE_SCALE = [12, 13, 14, 15, 16, 18, 22, 28];

/** The space scale, as px. Mirrors --space-*; see the plan §3.3. */
const SPACE_SCALE = [0, 1, 2, 4, 6, 8, 12, 16, 20, 28, 40];

/** The control ladder, as px. Mirrors --ctl-*; see the plan §3.4. 44 is the touch floor. */
const CONTROL_SCALE = [28, 36, 44, 52];

/**
 * Budgets. Each is `[current ceiling, note]`. Lower the number whenever the work lets you —
 * the test tells you when.
 */
const BUDGETS = {
  literalFontSizes:   [103, "target 0 — every one becomes a --fs-* token in phase 2"],
  fontSizesBelowFloor: [20, "target 0 — every tier rises to 12px in phase 4"],
  offScaleSpacing:     [68, "target 0 — phase 3 snaps them to SPACE_SCALE"],
  distinctControlH:    [32, "target 4 — the CONTROL_SCALE, in phase 3"],
  distinctTracking:    [11, "target 3 — --ls-caps / --ls-normal / --ls-display, phase 3"],
  globalLineHeights:    [7, "target ~9 — one per --fs-* pair plus --lh-prose"],
};

// ===========================================================================================

const RAW = readFileSync(fileURLToPath(new URL(STYLESHEET, import.meta.url)), "utf8");

const styleOpen = RAW.indexOf("<style>");
const styleClose = RAW.indexOf("</style>", styleOpen);
assert.ok(styleOpen !== -1 && styleClose !== -1, "index.html no longer has a <style> block");

/** Comments carry example values in prose; they are not declarations. */
const CSS = RAW.slice(styleOpen + 7, styleClose).replace(/\/\*[\s\S]*?\*\//g, "");

// --- reading the stylesheet --------------------------------------------------------------

/**
 * Every rule in the sheet as `{ scope, selector, body }`.
 *
 * `scope` is the enclosing at-rule's prelude ("" at the top level), which is what makes the
 * duplicate check below meaningful: two `.stat { gap }` rules in the same @media are the bug,
 * the same selector in two different @media is ordinary responsive CSS.
 */
function rules(css) {
  const out = [];
  let i = 0;

  function parse(scope) {
    let start = i;
    while (i < css.length) {
      const ch = css[i];
      if (ch === "}") {
        i++;
        return;
      }
      if (ch === "{") {
        const prelude = css.slice(start, i).trim();
        i++;
        if (prelude.startsWith("@")) {
          // A nested at-rule: @media, @supports. Its children carry its prelude as scope.
          parse(scope ? `${scope} && ${prelude}` : prelude);
        } else {
          const bodyStart = i;
          let depth = 1;
          while (i < css.length && depth > 0) {
            if (css[i] === "{") depth++;
            else if (css[i] === "}") depth--;
            i++;
          }
          out.push({ scope, selector: prelude, body: css.slice(bodyStart, i - 1) });
        }
        start = i;
        continue;
      }
      i++;
    }
  }

  parse("");
  return out;
}

const RULES = rules(CSS);
assert.ok(RULES.length > 100, `only parsed ${RULES.length} rules — the parser is wrong`);

/** `[property, value]` for one rule body, in source order, duplicates kept. */
const decls = (body) =>
  [...body.matchAll(/(^|;)\s*([a-z-]+)\s*:\s*([^;]*)/gi)]
    .map(([, , prop, value]) => [prop.toLowerCase(), value.trim()])
    .filter(([prop]) => !prop.startsWith("--"));

/** Every `[rule, property, value]` in the sheet, token definitions excluded. */
const ALL_DECLS = RULES.flatMap((r) => decls(r.body).map(([p, v]) => [r, p, v]));

const valuesOf = (...props) =>
  ALL_DECLS.filter(([, p]) => props.includes(p)).map(([r, p, v]) => ({ rule: r, prop: p, value: v }));

// --- normalising -------------------------------------------------------------------------

const ROOT_PX = 16;

/** A single length in px, or null if it is not a plain literal (var/calc/clamp/auto/%). */
function px(text) {
  const t = text.trim();
  let m = /^(-?[\d.]+)px$/.exec(t);
  if (m) return +m[1];
  m = /^(-?[\d.]+)rem$/.exec(t);
  if (m) return +m[1] * ROOT_PX;
  if (t === "0") return 0;
  return null;
}

/** The individual lengths in a shorthand like `9px 11px`, skipping var()/calc() parts. */
const parts = (value) =>
  value.trim().split(/\s+/).filter((p) => !/var\(|calc\(|clamp\(|min\(|max\(/.test(p));

const SPACING_PROPS = [
  "gap", "row-gap", "column-gap",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "padding-block", "padding-inline",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "margin-block", "margin-inline",
];

// --- the metrics ---------------------------------------------------------------------------

const fontSizeValues = valuesOf("font-size")
  .map((d) => px(d.value))
  .filter((n) => n !== null);

/**
 * font-size declarations still written as a literal rather than a --fs-* token. This is the
 * number phase 2 drives to zero; a var() reference is the goal, so it must not be counted.
 */
const literalFontSizes = valuesOf("font-size").filter(
  (d) => !/var\(/.test(d.value) && d.value !== "inherit",
).length;

const fontSizesBelowFloor = fontSizeValues.filter((n) => n < Math.min(...TYPE_SCALE)).length;

const offScaleSpacing = valuesOf(...SPACING_PROPS).flatMap((d) =>
  parts(d.value)
    .map(px)
    .filter((n) => n !== null && !SPACE_SCALE.includes(Math.abs(n)))
    .map((n) => `${d.rule.selector} { ${d.prop}: ${d.value} }  <- ${n}px`),
);

const distinctControlH = new Set(
  valuesOf("min-height", "height")
    .map((d) => px(d.value))
    .filter((n) => n !== null && n > 0),
).size;

const distinctTracking = new Set(
  valuesOf("letter-spacing").map((d) => d.value).filter((v) => v !== "normal"),
).size;

const globalLineHeights = new Set(valuesOf("line-height").map((d) => d.value)).size;

const MEASURED = {
  literalFontSizes,
  fontSizesBelowFloor,
  offScaleSpacing: offScaleSpacing.length,
  distinctControlH,
  distinctTracking,
  globalLineHeights,
};

// --- the ratchet ---------------------------------------------------------------------------

for (const [metric, [budget, note]] of Object.entries(BUDGETS)) {
  test(`${metric} is within budget`, () => {
    const actual = MEASURED[metric];
    assert.ok(
      actual <= budget,
      `${metric} rose to ${actual}, budget is ${budget}. ${note}`,
    );
    assert.equal(
      actual,
      budget,
      `${metric} is down to ${actual} from a budget of ${budget} — lower BUDGETS.${metric} ` +
        `to ${actual} in this commit, or the ratchet stops ratcheting. ${note}`,
    );
  });
}

// --- the hard checks, which pass today and must keep passing ---------------------------------

// The .stat { gap } bug, generalised: three consecutive PRs each added a `.stat { gap: … }`
// inside the same @media, 6px then 4px then 5px, the last silently winning, under a comment
// claiming a behaviour the rules below it contradicted. No human review caught it three times.
//
// The one legitimate repeat is the documented `vh`-then-`svh` fallback: a browser that does
// not know `svh` keeps the `vh` line instead of dropping the declaration. CLAUDE.md requires
// it on every viewport-height rule, so the check has to know about it rather than be
// switched off.
// `\b` does not fire between a digit and `v`, so these match the digit before the unit.
// `100vh` -> `10@` and `100svh` -> `10@`; anything else about the two values must be identical.
const isViewportFallback = (values) =>
  values.length === 2 &&
  /\dvh\b/.test(values[0]) &&
  /\d[sdl]vh\b/.test(values[1]) &&
  values[0].replace(/(\d)vh\b/g, "$1@") === values[1].replace(/(\d)[sdl]vh\b/g, "$1@");

test("no property is declared twice for the same selector in the same scope", () => {
  const seen = new Map(); // `${scope}|${selector}|${prop}` -> count
  for (const rule of RULES) {
    const byProp = new Map();
    for (const [prop, value] of decls(rule.body)) {
      byProp.set(prop, [...(byProp.get(prop) ?? []), value]);
    }
    const props = new Set(byProp.keys());
    for (const [prop, values] of byProp) {
      // Within ONE body, a repeated property is a straightforward mistake.
      assert.ok(
        values.length === 1 || isViewportFallback(values),
        `${rule.selector} declares ${prop} ${values.length}x in the same rule: ` +
          values.join("  ||  "),
      );
    }
    for (const prop of props) {
      const key = `${rule.scope}|${rule.selector.replace(/\s+/g, " ")}|${prop}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
  }
  const repeats = [...seen.entries()]
    .filter(([, n]) => n > 1)
    .map(([key, n]) => `${key.split("|")[1]} sets ${key.split("|")[2]} ${n}x in the same scope`);
  assert.deepEqual(repeats, [], "a later rule silently overrides an earlier one");
});

// A radius written as a literal is already a bug per CLAUDE.md; this is that rule, enforced.
test("every border-radius is a token, a percentage or 0", () => {
  const literals = valuesOf("border-radius", "border-top-left-radius", "border-top-right-radius")
    .filter((d) => !/var\(|%/.test(d.value) && !["0", "inherit"].includes(d.value))
    .map((d) => `${d.rule.selector} { ${d.prop}: ${d.value} }`);
  assert.deepEqual(literals, [], "a literal radius — use --radius-xs/-sm/--radius/--radius-pill");
});

// Print the scoreboard once, so a run says where the cleanup actually stands.
test("scoreboard", () => {
  const lines = Object.entries(MEASURED).map(
    ([k, v]) => `  ${k.padEnd(22)} ${String(v).padStart(4)}   budget ${BUDGETS[k][0]}`,
  );
  console.log(`\nsize-system scoreboard\n${lines.join("\n")}\n`);
});
