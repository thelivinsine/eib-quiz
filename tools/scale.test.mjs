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
const TYPE_SCALE = [12, 13, 14, 15, 16, 18, 22, 28, 36];

/** The space scale, as px. Mirrors --space-*; see the plan §3.3.
 *  56 (--space-3xl) joined on 2026-09-22: PAGE rhythm, not component rhythm — the gap
 *  between two titled sections' worth of content and the run-out before the footer. It is
 *  deliberately above everything a card uses. */
const SPACE_SCALE = [0, 1, 2, 4, 6, 8, 12, 16, 20, 28, 40, 56];

/** The control ladder, as px. Mirrors --ctl-*; see the plan §3.4. 44 is the touch floor. */
const CONTROL_SCALE = [28, 36, 44, 52];

/**
 * Budgets. Each is `[current ceiling, note]`. Lower the number whenever the work lets you —
 * the test tells you when.
 */
const BUDGETS = {
  literalFontSizes:     [0, "reached 2026-09-20 (phase 2). A literal font-size is now a bug."],
  fontSizesBelowFloor:  [0, "reached 2026-09-20 (phase 4). 12px is the floor, and since 2026-09-22 nothing is exempt."],
  offScaleSpacing:      [0, "reached 2026-09-20 (phase 3). Off-scale spacing is now a bug."],
  // The two left are the results band's 1px separator gap, which is a hairline
  // rather than rhythm and has no rung to snap to.
  literalSpacing:       [2, "reached 2026-09-20. Spacing is tokens now, not literals."],
  // The one left is the 120px floor under a MISSING option image — a placeholder
  // box, not a control, so it has no business on the control ladder.
  distinctControlH:     [1, "reached 2026-09-20 (phase 3)."],
  distinctTracking:     [2, "reached 2026-09-20 (phase 3): --ls-caps and --ls-display."],
  literalIconSizes:     [0, "reached 2026-09-20. An icon size is --icon-*, a hit target --ctl-*."],
  gapRungs:             [7, "target ~5 — two rungs should carry the page; 2px and 6px merged away."],
  globalLineHeights:    [3, "leading lives in the --type-* roles since 2026-09-23; what is left is glyph boxes and the lockups"],
  // Component rules that still state font-size / font-family / font-weight instead of
  // reading a --type-* role. ROLE_EXEMPT names the only ones allowed; target 0.
  typeOutsideRoles:     [0, "reached 2026-09-23. Every text rule reads a --type-* role; ROLE_EXEMPT names the rest."],
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

// --- type roles (2026-09-23) -------------------------------------------------------------
// Every piece of text reads one --type-* role as `font: var(--type-*)`. decls() above drops
// custom properties, so the role tokens are parsed here on their own.
const customProps = (body) =>
  Object.fromEntries([...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(([, k, v]) => [k, v.trim()]));
const ROOT = customProps(RULES.filter((r) => r.scope === "" && r.selector === ":root").map((r) => r.body).join(";"));
const PHONE_ROOT = customProps(
  RULES.filter((r) => r.selector === ":root" && /max-width:\s*620px/.test(r.scope)).map((r) => r.body).join(";"),
);
const ROLE_NAMES = Object.keys(ROOT).filter((k) => k.startsWith("--type-"));

/** An --fs-* token in px. --fs-hero is a clamp: its floor on a phone, its ceiling elsewhere. */
function fsPx(token, phone) {
  const v = ROOT[token];
  assert.ok(v, `${token} is not defined in :root`);
  const rem = /^([\d.]+)rem$/.exec(v);
  if (rem) return +rem[1] * ROOT_PX;
  const clamp = /^clamp\(([\d.]+)rem,\s*[^,]+,\s*([\d.]+)rem\)$/.exec(v);
  if (clamp) return (phone ? +clamp[1] : +clamp[2]) * ROOT_PX;
  throw new Error(`cannot resolve ${token}: ${v}`);
}
const ROLE_RE = /^(\d{3})\s+var\((--fs-[a-z0-9]+)\)\s*\/\s*var\((--lh-[a-z]+)\)\s+var\((--font-[a-z]+)\)$/;
function role(name, phone = false) {
  const v = (phone && PHONE_ROOT[name]) || ROOT[name];
  const m = ROLE_RE.exec(v ?? "");
  assert.ok(m, `${name} is not "<weight> var(--fs-*)/var(--lh-*) var(--font-*)": ${v}`);
  return { weight: +m[1], size: fsPx(m[2], phone), lh: m[3], family: m[4] };
}

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

/**
 * THERE IS NO TYPE EXEMPTION, and the way it was retired is the useful part.
 *
 * This constant held the overview card's labels twice in one day — .ready-ring-sub at 9px,
 * then it plus .ds-label at 11px — both times to make "not bold and reduced" fit inside a
 * dial and a phone row. What finally did it was FORMAT, not size: dropping the uppercase
 * and the --ls-caps and giving the four names the verdict paragraph's own rule (--fs-xs,
 * 400, --muted, --lh-prose) is quieter AND narrower than 11px uppercase was, at a scale
 * step. A tracked capital is wide.
 * ICON_EXEMPT below keeps the shape if a type exemption is ever needed again: NAME the
 * selector, do not raise a budget — a budget says "one bug is tolerated" and invites a
 * second, where a named selector says which one and why.
 */

/**
 * font-size declarations still written as a literal rather than a --fs-* token. This is the
 * number phase 2 drives to zero; a var() reference is the goal, so it must not be counted.
 */
const literalFontSizes = valuesOf("font-size").filter(
  (d) => !/var\(/.test(d.value) && d.value !== "inherit",
).length;

const fontSizesBelowFloor = valuesOf("font-size")
  .map((d) => px(d.value))
  .filter((n) => n !== null && n < Math.min(...TYPE_SCALE)).length;

const offScaleSpacing = valuesOf(...SPACING_PROPS).flatMap((d) =>
  parts(d.value)
    .map(px)
    .filter((n) => n !== null && !SPACE_SCALE.includes(Math.abs(n)))
    .map((n) => `${d.rule.selector} { ${d.prop}: ${d.value} }  <- ${n}px`),
);

/**
 * `min-height` ONLY, deliberately. The first version of this metric also counted `height`,
 * which reported 32 "control heights" — but almost every literal `height` in this sheet is
 * an icon box (22, 18, 15px) or a layout pane (190, 160, 96px), a different axis entirely.
 * A control declares `min-height`; conflating the two measured the wrong thing.
 */
/**
 * Spacing declarations still written as a px literal rather than a --space-* token.
 *
 * offScaleSpacing reaching 0 does NOT mean spacing is tokenised — it only means no literal
 * sits BETWEEN the rungs. A `gap: 8px` lands on a rung and sails through, so the sheet can
 * drift back to literals indefinitely while the off-scale count stays at zero. This is the
 * companion count, and it is the one that has to reach 0, exactly as literalFontSizes did
 * for type.
 */
const literalSpacing = valuesOf(...SPACING_PROPS).filter((d) =>
  parts(d.value).some((t) => /^-?[\d.]+(px|rem)$/.test(t) && t !== "0px"),
).length;

/**
 * Square width+height pairs still written as a px literal — icon glyphs and glyph boxes.
 * Excluded, because they are not icons: the two ring diameters (layout), the scrollbar,
 * the state picker's caret and .sr-only. A hit target is --ctl-*, an icon is --icon-*.
 */
const ICON_EXEMPT = /ring-wrap|scrollbar|\.sr-only|state-picker::after|qnav-group-head::before|\.opt-letter/;
const literalIconSizes = RULES.filter((r) => {
  if (ICON_EXEMPT.test(r.selector)) return false;
  const d = Object.fromEntries(decls(r.body));
  return d.width && d.height && d.width === d.height && /^[\d.]+px$/.test(d.width);
}).length;

const distinctControlH = new Set(
  valuesOf("min-height")
    .map((d) => px(d.value))
    .filter((n) => n !== null && n > 0),
).size;

const distinctTracking = new Set(
  valuesOf("letter-spacing").map((d) => d.value).filter((v) => v !== "normal"),
).size;

/** Distinct gap rungs in play. The references converge on two doing most of the work. */
const GAP_TOKEN = { "--space-3xs": 2, "--space-2xs": 4, "--space-xs": 6, "--space-sm": 8,
  "--space-ms": 12, "--space-md": 16, "--space-lg": 20, "--space-xl": 28, "--space-2xl": 40 };
const gapRungs = new Set(
  valuesOf("gap", "row-gap", "column-gap").flatMap((d) =>
    d.value.split(/\s+/).map((t) => {
      const m = /^var\((--space-[a-z0-9]+)\)$/.exec(t);
      if (m) return GAP_TOKEN[m[1]];
      const px = /^(\d+)px$/.exec(t);
      return px ? +px[1] : null;
    }).filter((n) => n !== null),
  ),
).size;

const globalLineHeights = new Set(valuesOf("line-height").map((d) => d.value)).size;

/**
 * The only rules allowed to state type outside a role (spec §1, "Named exceptions"): the
 * inherited default, the two UA resets, iOS's no-zoom <select>, the wordmark, two glyphs
 * used as icons, the EN code's requested 700, and three inline emphasis spans that set a
 * weight inside a parent's role. A selector, never a budget: it says which and why.
 */
const ROLE_EXEMPT = /^(body|button|select|\.state-picker select|\.brand-name|\.footer-name|\.glossary-summary::after|\.keyboard-hint-close|\.lang-toggle|\.hist-mode|\.hist-score|\.qnav-group-count)$/;
const typeOutsideRoles = valuesOf("font-size", "font-family", "font-weight")
  .filter((d) => !ROLE_EXEMPT.test(d.rule.selector.trim())).length;

const MEASURED = {
  typeOutsideRoles,
  literalFontSizes,
  fontSizesBelowFloor,
  offScaleSpacing: offScaleSpacing.length,
  literalSpacing,
  literalIconSizes,
  gapRungs,
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
  assert.deepEqual(literals, [], "a literal radius — use --radius-xs/-sm/-ctl/--radius/--radius-pill");
});

test("every type role is built only from --fs-*, --lh-* and --font-*", () => {
  assert.equal(ROLE_NAMES.length, 16, `expected 16 --type-* roles, found ${ROLE_NAMES.length}: ${ROLE_NAMES.join(", ")}`);
  for (const name of ROLE_NAMES) { role(name); role(name, true); }
  for (const name of Object.keys(PHONE_ROOT))
    assert.ok(ROLE_NAMES.includes(name), `the 620px :root overrides ${name}, which is not a role`);
});

test("no type role renders below the 12px floor, at either width", () => {
  for (const name of ROLE_NAMES) for (const phone of [false, true]) {
    const { size } = role(name, phone);
    assert.ok(size >= Math.min(...TYPE_SCALE), `${name} is ${size}px${phone ? " on a phone" : ""}`);
  }
});

test("the type hierarchy is the right way up at both widths", () => {
  for (const phone of [false, true]) {
    const s = (n) => role(`--type-${n}`, phone).size;
    const at = phone ? "on a phone" : "on a desktop";
    const chain = ["display", "figure-lg", "heading", "subheading", "title"];
    for (let i = 1; i < chain.length; i++)
      assert.ok(s(chain[i - 1]) > s(chain[i]), `${chain[i - 1]} (${s(chain[i - 1])}) must outrank ${chain[i]} (${s(chain[i])}) ${at}`);
    assert.ok(s("subheading") > s("option"), `the question (${s("subheading")}) must outrank its answers (${s("option")}) ${at}`);
  }
});

test("every font shorthand outside :root reads a type role", () => {
  const bad = valuesOf("font")
    .filter((d) => d.value !== "inherit" && !/^var\(--type-[a-z0-9-]+\)$/.test(d.value))
    .map((d) => `${d.rule.selector} { font: ${d.value} }`);
  assert.deepEqual(bad, [], "a font shorthand that is not a --type-* role");
});

// Print the scoreboard once, so a run says where the cleanup actually stands.
test("scoreboard", () => {
  const lines = Object.entries(MEASURED).map(
    ([k, v]) => `  ${k.padEnd(22)} ${String(v).padStart(4)}   budget ${BUDGETS[k][0]}`,
  );
  console.log(`\nsize-system scoreboard\n${lines.join("\n")}\n`);
});
