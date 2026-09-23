# Typography roles and tablet/phone layout — Implementation Plan

Status: **shipped 2026-09-23** (PR #104, squash-merged after the code-review fixes in `e867ec9`,
which retired this plan's tablet block and `:nth-child(4)`; the plan below is the record).
Executed on branch `typography-responsive`. Four
expectations below were wrong against the tree and were ruled on in the PR rather than forced:
the desktop quiz gap (171px, the existing resting-position floor), 900x600 (the existing
height-lock release below 640px), the exam timer's "< 30px" (one line measures 34), and the
phone type step (moved from 620 to 700px in the final review).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put every piece of text in the app on one of 16 named type roles, and fix the tablet and phone layouts the audit found broken.

**Architecture:** Each role is a `font` shorthand custom property in the base `:root` block of `index.html`. Components read it as `font: var(--type-*)`; phone sizes are two token overrides in the 620px block. `tools/scale.test.mjs` learns to parse the role tokens and ratchets every remaining component-level `font-size`/`font-family`/`font-weight` down to a named exception list. Layout changes are a handful of scoped media-query rules.

**Tech Stack:** Vanilla HTML/CSS/JS in one file (`index.html`), no build step; `node --test` for the two token tests; Chrome for measurement.

**Spec:** `docs/plans/2026-09-23-typography-and-responsive-design.md` — read it first; this plan argues from it.

## Global Constraints

- Work happens in the worktree `C:\Users\Suhas Pala\Documents\AI projects\EIB-typography` on branch `typography-responsive`. Never edit the main folder's `index.html`; another session serves it.
- Keep Bricolage Grotesque + Inter and the existing `--fs-*` steps; no new typefaces, no general size increase.
- Every `--type-*` token is exactly `<weight> var(--fs-*)/var(--lh-*) var(--font-*)`.
- **`font:` is the FIRST declaration in any rule that takes a role.** The shorthand resets `font-variant-numeric`, `font-kerning` and `line-height`; anything declared before it is lost.
- Head-family roles (display, heading, subheading, title, figure-*) keep `letter-spacing: var(--ls-display)` on the component; the shorthand carries no tracking.
- Labels are sentence case: 13px, regular weight, muted. No text is uppercase except the two taglines.
- Header page selection has no underline: current page `--text`, the other link `--muted`, `--text` on hover.
- Breakpoints stay: phone ≤ 620, tablet 621–940, laptop 941–1160, desktop > 1160.
- Colours, spacing tokens, radii, the button standard (44px / 15px / 600) and the header toggles do not change.
- Line numbers below are as of commit `8091b58`; they drift as you edit. **Search by selector**, not by line.
- Ship as a PR into `main`. Do NOT merge it; the user merges.

## Review Focus

1. **German strings at phone width with the new sizes.** Title moves to Bricolage 16 on the verdict, topic chips and history/glossary rows, labels to 13 — German is longer. Expect: nothing clips or overflows at 320/360/375 in DE; the four quiz readouts hold one line at 360. Pinned in Task 4 Step 6 and Task 5 Step 7.
2. **The session height lock on a tablet with a long question.** The new tablet quiz layout centres a content-sized card. Expect `scrollHeight == innerHeight` at 768×1024 and 900×600 on a four-image question with the explanation open. Pinned in Task 5 Step 7.
3. **Figures losing tabular digits.** `font:` resets `font-variant-numeric`; a figure whose `tabular-nums` sits before `font:` jitters during the ring count-ups. Expect every figure computes `tabular-nums`. Pinned in Task 6 Step 4.
4. **Role-less text falling back to the browser default.** `button` inherits only `font-family`; a button left without a role renders at the UA's 13.33px. Expect the role audit to report no element off-role. Pinned in every task's audit step.
5. **Exam mode at 375.** The timer row (label / figure / pacing note) and the results band's five figures change type. Expect one-line timer, no overflow, band wraps cleanly. Pinned in Task 6 Step 4.

---

## Shared verification tools (used by several tasks)

**Server.** Temporarily add this configuration to the MAIN folder's `.claude/launch.json` (it is where the preview tool reads configs; it serves the worktree via `--directory`), start it with `preview_start {name: "eib-typo"}`, and **revert the file before finishing** (`git -C "C:\Users\Suhas Pala\Documents\AI projects\EIB" checkout -- .claude/launch.json`). Never commit it.

```json
{ "name": "eib-typo", "runtimeExecutable": "python", "runtimeArgs": ["-m", "http.server", "8778", "--directory", "../EIB-typography"], "port": 8778 }
```

**Always** `resize_window` with an explicit width and read `innerWidth` before trusting a number (CLAUDE.md: a tab with no layout viewport reports 0).

**Role audit** — paste into `javascript_tool` once per page load; then call `__roleAudit()` on each screen:

```js
window.__roleAudit = () => {
  document.getAnimations().forEach(a => a.finish());
  const sig = el => { const c = getComputedStyle(el); return `${c.fontFamily.split(',')[0].replace(/['"]/g, '')} ${parseFloat(c.fontSize)} ${c.fontWeight} ${(parseFloat(c.lineHeight) / parseFloat(c.fontSize)).toFixed(2)}`; };
  const roles = {};
  for (const r of ['display','heading','subheading','title','option','body','small','label','caption','figure-lg','figure-md','figure-sm','script','control','control-sm','chip']) {
    const p = document.createElement('span'); p.style.font = `var(--type-${r})`; document.body.append(p);
    roles[sig(p)] = (roles[sig(p)] ? roles[sig(p)] + '|' : '') + r; p.remove();
  }
  const EXEMPT = '.brand-name, .footer-name, .lang-toggle, .keyboard-hint-close, .hist-mode, .hist-score, .qnav-group-count, .state-picker select';
  const off = [];
  for (const root of [document.querySelector('header'), document.querySelector('.screen.active'), document.querySelector('.site-footer')].filter(Boolean))
    for (const el of root.querySelectorAll('*')) {
      if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height || el.closest('[hidden]') || el.matches(EXEMPT)) continue;
      const s = sig(el); if (!roles[s]) off.push(`${typeof el.className === 'string' ? el.className : el.tagName} "${el.textContent.trim().slice(0, 24)}" ${s}`);
    }
  return { iw: innerWidth, roles: Object.keys(roles).length, off };
};
```

Expected once a screen is migrated: `off: []`. Before its task runs, a screen's `off` list is exactly its to-do list.

**Tests** (from the worktree root):

```bash
node --test tools/scale.test.mjs tools/contrast.test.mjs
```

---

### Task 1: Role tokens and the test harness

**Files:**
- Modify: `index.html` — base `:root` block (after `--font-hand`, ~line 328); the phone `@media (max-width: 620px)` block that starts ~line 2551
- Modify: `tools/scale.test.mjs`
- Modify: `docs/plans/2026-09-23-typography-and-responsive-design.md` (two amendments)

**Interfaces:**
- Produces: the 16 custom properties `--type-display`, `--type-heading`, `--type-subheading`, `--type-title`, `--type-option`, `--type-body`, `--type-small`, `--type-label`, `--type-caption`, `--type-figure-lg`, `--type-figure-md`, `--type-figure-sm`, `--type-script`, `--type-control`, `--type-control-sm`, `--type-chip`; the ratchet metric `typeOutsideRoles` in `BUDGETS`; the selector regex `ROLE_EXEMPT`.

- [ ] **Step 1: Write the failing tests**

In `tools/scale.test.mjs`, add after the `decls`/`ALL_DECLS`/`valuesOf` helpers (after line 144):

```js
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
```

Add to `BUDGETS` (the number is set in Step 4):

```js
  // Component rules that still state font-size / font-family / font-weight instead of
  // reading a --type-* role. ROLE_EXEMPT names the only ones allowed; target 0.
  typeOutsideRoles:     [0, "target 0 — every text rule reads a --type-* role (spec 2026-09-23)."],
```

Add before `const MEASURED`:

```js
/**
 * The only rules allowed to state type outside a role (spec §1, "Named exceptions"): the
 * inherited default, the two UA resets, iOS's no-zoom <select>, the wordmark, two glyphs
 * used as icons, the EN code's requested 700, and three inline emphasis spans that set a
 * weight inside a parent's role. A selector, never a budget: it says which and why.
 */
const ROLE_EXEMPT = /^(body|button|select|\.state-picker select|\.brand-name|\.footer-name|\.glossary-summary::after|\.keyboard-hint-close|\.lang-toggle|\.hist-mode|\.hist-score|\.qnav-group-count)$/;
const typeOutsideRoles = valuesOf("font-size", "font-family", "font-weight")
  .filter((d) => !ROLE_EXEMPT.test(d.rule.selector.trim())).length;
```

Add `typeOutsideRoles,` to the `MEASURED` object.

Add these tests after the radius test:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tools/scale.test.mjs`
Expected: FAIL — "expected 16 --type-* roles, found 0", the floor and hierarchy tests fail on `undefined`, and `typeOutsideRoles rose to <N>, budget is 0`.

- [ ] **Step 3: Add the role tokens**

In `index.html`, directly after the `--font-hand:` line in the base `:root` block, add:

```css
            /* ---- TYPE ROLES (2026-09-23) -----------------------------------------
               Every piece of text is on exactly ONE of these, read as
               `font: var(--type-*)` — and `font:` goes FIRST in its rule, because the
               shorthand resets font-variant-numeric and line-height. It carries no
               tracking, so a head-family role keeps --ls-display on the component.
               Phone sizes are two overrides in the 620px block; no component states a
               font size. Spec: docs/plans/2026-09-23-typography-and-responsive-design.md */
            --type-display:    700 var(--fs-hero)/var(--lh-tight) var(--font-head);
            --type-heading:    600 var(--fs-2xl)/var(--lh-ui) var(--font-head);
            --type-subheading: 600 var(--fs-lg)/var(--lh-ui) var(--font-head);
            --type-title:      600 var(--fs-md)/var(--lh-ui) var(--font-head);
            --type-option:     400 var(--fs-md)/var(--lh-ui) var(--font-body);
            --type-body:       400 var(--fs-base)/var(--lh-prose) var(--font-body);
            --type-small:      400 var(--fs-sm)/var(--lh-prose) var(--font-body);
            --type-label:      400 var(--fs-xs)/var(--lh-ui) var(--font-body);
            --type-caption:    400 var(--fs-2xs)/var(--lh-ui) var(--font-body);
            --type-figure-lg:  600 var(--fs-3xl)/var(--lh-tight) var(--font-head);
            --type-figure-md:  600 var(--fs-xl)/var(--lh-tight) var(--font-head);
            --type-figure-sm:  600 var(--fs-md)/var(--lh-tight) var(--font-head);
            --type-script:     400 var(--fs-xl)/var(--lh-ui) var(--font-hand);
            --type-control:    600 var(--fs-base)/var(--lh-ui) var(--font-body);
            --type-control-sm: 600 var(--fs-sm)/var(--lh-ui) var(--font-body);
            --type-chip:       600 var(--fs-2xs)/var(--lh-ui) var(--font-body);
```

At the top of the phone block (the `@media (max-width: 620px) {` near line 2551 — the one containing `.modes-grid { grid-template-columns: 1fr; …}`), add as its first rule:

```css
            /* The phone's two type steps, and the ONLY place a phone font size lives:
               a heading drops to 22 and a big figure to 28, so the 32px display
               headline still outranks both. */
            :root {
                --type-heading:   600 var(--fs-xl)/var(--lh-ui) var(--font-head);
                --type-figure-lg: 600 var(--fs-2xl)/var(--lh-tight) var(--font-head);
            }
```

- [ ] **Step 4: Run the tests; set the ratchet's starting budget**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`
Expected: the four new tests PASS; `typeOutsideRoles` FAILS with "rose to N, budget is 0". Set `BUDGETS.typeOutsideRoles[0]` to that N (the migration tasks lower it). Re-run: all PASS.

- [ ] **Step 5: Amend the spec's exceptions**

In the spec's "Named exceptions" list, add:

```markdown
- `.hist-mode`, `.hist-score`, `.qnav-group-count` — inline emphasis: a weight on a span
  inside a parent that already reads a role. They set no size or family.
```

In the spec's mapping table, move `.opt-img-hover` from **caption** to **chip** and add after the table: "`.opt-img-hover` is chip, not caption: the same 12px, at the 600 the zoom veil's label needs over a photograph."

- [ ] **Step 6: Commit**

```bash
git add index.html tools/scale.test.mjs docs/plans/2026-09-23-typography-and-responsive-design.md
git commit -m "Type roles: 16 --type-* tokens and the test harness that holds them" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Header, nav, buttons, shared labels, footer

**Files:**
- Modify: `index.html` (rules listed below)
- Modify: `tools/scale.test.mjs` (`BUDGETS.typeOutsideRoles`, `BUDGETS.globalLineHeights`, `BUDGETS.distinctTracking` if reported)
- Modify: `tools/contrast.test.mjs` (one description)

**Interfaces:**
- Consumes: `--type-label`, `--type-caption`, `--type-chip`, `--type-control`, `--type-control-sm`, `--type-small` (Task 1).

- [ ] **Step 1: Run the role audit to capture the baseline**

With the server running at 1280×900: `showScreen('home'); __roleAudit()`. Expected: a non-empty `off` list including `.nav-link`, `.footer-col-title`, `.footer-link` and the buttons' `span`s. Save it for comparison.

- [ ] **Step 2: Swap each rule to its role**

For every row: delete the "Remove" declarations and insert "Add" as the FIRST declaration of the rule. Keep every other declaration.

| Selector | Remove | Add |
|---|---|---|
| `.stat-label, .breakdown-label, .review-q-num, .timer-label, .sidebar-title, .question-num` (~490) | `font-family: var(--font-body);` `font-size: var(--fs-2xs);` `font-weight: 600;` `letter-spacing: var(--ls-caps);` `text-transform: uppercase;` | `font: var(--type-label);` |
| `.brand-tagline` (~571) | `font-size: var(--fs-2xs);` (keep `letter-spacing: var(--ls-caps)`) | `font: var(--type-caption);` |
| `.session-back` (~576) | `font-size: var(--fs-sm); font-weight: 600;` | `font: var(--type-control-sm);` |
| `.nav-link` (~598) | `font-size: var(--fs-sm); font-weight: 600;` — and change `color: var(--text)` to `color: var(--muted)` | `font: var(--type-control-sm);` |
| `.lang-toggle` (~650) | `font-size: var(--fs-2xs);` (keep `font-weight: 700`, now AFTER `font:`) | `font: var(--type-chip);` |
| `.seg-btn` (~667) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-chip);` |
| `.btn-primary, .btn-secondary` (~1840) | `font-family: var(--font-body);` `font-weight: 600; font-size: var(--fs-base);` | `font: var(--type-control);` |
| `.footer-blurb` (~1892) | `font-size: var(--fs-xs); line-height: var(--lh-prose);` | `font: var(--type-small);` |
| `.footer-col-title` (~1895) | `font-size: var(--fs-2xs); font-weight: 600; letter-spacing: var(--ls-caps);` `text-transform: uppercase;` | `font: var(--type-label);` |
| `.footer-link` (~1905) | `font-family: inherit; font-size: var(--fs-xs); line-height: var(--lh-ui);` | `font: var(--type-label);` |
| `.footer-bar` (~1917) | `font-size: var(--fs-2xs); line-height: var(--lh-prose);` | `font: var(--type-caption);` |
| `.footer-tagline` (~1927) | `font-size: var(--fs-2xs);` (keep `letter-spacing: var(--ls-caps)`) | `font: var(--type-caption);` |
| 620 block: `.session-back { … font-size: var(--fs-2xs); … }` (~2704) | `font-size: var(--fs-2xs);` | — |
| 620 block: `.brand-name { font-size: var(--fs-sm); }` (~2708) | the whole rule (the name is `display: none` there) | — |

- [ ] **Step 3: Replace the nav's underline with the grey/black marker**

Replace the hover rule, the long underline comment and `.nav-link--active` (from `/* BOTH LINKS ARE --text` through the closing `}` of `.nav-link--active`) with:

```css
        /* THE CURRENT PAGE IS --text AND THE OTHER LINK IS --muted (2026-09-23, on
           request: "get rid of underline for header page selection"). The underline was
           the only visible marker, so colour takes it over; aria-current="page" still
           names the page to a screen reader. Hover is inside (hover: hover): a tap
           leaves :hover stuck on the link just pressed. */
        @media (hover: hover) { .nav-link:hover { color: var(--text); } }
        .nav-link--active { color: var(--text); }
```

- [ ] **Step 4: Update the contrast pair description**

In `tools/contrast.test.mjs`, change the description of `["muted", "canvas", AA, …]` to `"the four headline numbers' labels, and the inactive header nav link, straight on the page"`.

- [ ] **Step 5: Run the tests; lower the budgets**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`
Expected: `typeOutsideRoles` (and possibly `globalLineHeights`, `distinctTracking`) FAIL with "is down to N from a budget of M". Lower each to the reported N. Re-run: all PASS.

- [ ] **Step 6: Verify in the browser**

At 1280×900 and 375×812, on Home and Practise: `__roleAudit().off` has no header, button or footer element. Then:

```js
[...document.querySelectorAll('.header-nav .nav-link')].map(e => [e.textContent, getComputedStyle(e).color, getComputedStyle(e).textDecorationLine])
```

Expected: the active link's colour equals `getComputedStyle(document.documentElement).getPropertyValue('--text')` resolved (rgb of `--text`), the other one `--muted`, both `textDecorationLine: "none"`. Switch page with `showScreen('practise')` and re-run: the colours swap. Header row fit, seg collapsed and open (`document.getElementById('schemeSeg').classList.add('open')`), at 320/360/375 in EN and DE: `document.documentElement.scrollWidth === innerWidth`.

- [ ] **Step 7: Commit**

```bash
git add index.html tools/scale.test.mjs tools/contrast.test.mjs
git commit -m "Type roles: header, buttons, labels and footer; no nav underline" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Home — type and the tablet bands

**Files:**
- Modify: `index.html`
- Modify: `tools/scale.test.mjs` (budgets only)

**Interfaces:**
- Consumes: `--type-display`, `--type-heading`, `--type-subheading`, `--type-title`, `--type-body`, `--type-small`, `--type-label`, `--type-figure-lg`, `--type-script` (Task 1).

- [ ] **Step 1: Baseline audit**

`showScreen('home'); __roleAudit()` at 1280. Expected `off` includes `.hero-headline`, `.hero-lead`, `h3`, `.stats-num`, `h2`.

- [ ] **Step 2: Swap each rule to its role** (same method as Task 2 Step 2)

| Selector | Remove | Add |
|---|---|---|
| `.hero-headline` (~971) | `font-family: var(--font-head);` `font-weight: 700;` `font-size: var(--fs-hero);` `line-height: var(--lh-tight);` | `font: var(--type-display);` |
| `.hero-lead` (~980) | `font-size: var(--fs-md);` `line-height: var(--lh-prose);` | `font: var(--type-body);` |
| `.script-note` (~1012) | `font-family: var(--font-hand);` `font-size: var(--fs-xl);` `line-height: var(--lh-ui);` | `font: var(--type-script);` |
| `.why-item h3` (~1097) | `font-size: var(--fs-base); font-weight: 600;` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.why-item p` (~1098) | `font-size: var(--fs-xs); line-height: var(--lh-prose);` | `font: var(--type-small);` |
| `.stats-num` (~1110) | `font-family: var(--font-head); font-weight: 700;` `font-size: var(--fs-3xl); line-height: var(--lh-tight);` | `font: var(--type-figure-lg);` and add `font-variant-numeric: tabular-nums;` after it |
| `.stats-label` (~1116) | `font-size: var(--fs-2xs); line-height: var(--lh-ui);` | `font: var(--type-label);` |
| `.cta-copy h2` (~1130) | `font-family: var(--font-head); font-weight: 600;` `font-size: var(--fs-2xl);` | `font: var(--type-heading);` |
| `.cta-lead` (~1135) | `font-size: var(--fs-base); line-height: var(--lh-prose);` | `font: var(--type-body);` |
| `.section-head h2` (~1168) | `font-family: var(--font-head);` `font-weight: 600;` `font-size: var(--fs-2xl);` | `font: var(--type-heading);` |
| `.section-head p` (~1175) | `font-size: var(--fs-base);` `line-height: var(--lh-prose);` | `font: var(--type-body);` |
| `.home-section--quiet .section-head h2` (~1182) | `font-size: var(--fs-lg);` | `font: var(--type-subheading);` |
| 620 block: `.section-head h2, .cta-copy h2 { font-size: var(--fs-lg); }` (~2592) | the whole rule | — (the role's phone override does it) |
| 620 block: `.section-head p { font-size: var(--fs-sm); }` (~2593) | the whole rule (`.section-head p` is hidden there) | — |

- [ ] **Step 3: Hide the decorative notes below 940, not 620**

In the `@media (max-width: 940px)` block (~2463), after the `.hero-lead { margin-inline: auto; }` line, add:

```css
            /* The two script notes and the gate are decorative, and at tablet width they
               have nowhere good to go: the numbers band's note wrapped onto a line of its
               own under the four figures, and the CTA band's pushed its button under the
               copy. Hidden here, the CTA band's copy and button share one row. */
            .stats-item--note, .cta-note, .cta-art { display: none; }
```

In the 620 block, change `.stats-item--note, .cta-note, .cta-art, .resume-art { display: none; }` to `.resume-art { display: none; }` (the others are now covered from 940 down) and keep its comment.

- [ ] **Step 4: Run the tests; lower the budgets**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`. Lower every "is down to N" budget to N; re-run until all PASS.

- [ ] **Step 5: Verify in the browser**

`showScreen('home'); __roleAudit()` at 375, 768, 1024, 1280, EN and DE: `off` is `[]`. At 768×1024:

```js
const cta = document.querySelector('.cta-band'), copy = cta.querySelector('.cta-copy').getBoundingClientRect(), btn = cta.querySelector('.cta-btn').getBoundingClientRect();
({ oneRow: Math.abs((copy.top + copy.bottom) / 2 - (btn.top + btn.bottom) / 2) < 30 && btn.left > copy.right, noteHidden: getComputedStyle(document.querySelector('.stats-item--note')).display })
```

Expected `{ oneRow: true, noteHidden: "none" }`. At 375: `.hero-headline` 32px, `.stats-num` 28px, `.section-head h2` 22px (`getComputedStyle(...).fontSize`). `scrollWidth === innerWidth` at 320/375/768.

- [ ] **Step 6: Commit**

```bash
git add index.html tools/scale.test.mjs
git commit -m "Type roles: the landing page; decorative notes hidden below 940" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Practise — type and the mode grid

**Files:**
- Modify: `index.html`
- Modify: `tools/scale.test.mjs` (budgets only)

**Interfaces:**
- Consumes: `--type-title`, `--type-small`, `--type-label`, `--type-caption`, `--type-figure-md`, `--type-figure-sm`, `--type-control-sm`, `--type-chip` (Task 1).

- [ ] **Step 1: Baseline audit**

`showScreen('practise'); __roleAudit()` at 1280. Expected `off` includes `.ready-ring-pct`, `.ds-num`, `.mode-title`, `.mode-description`.

- [ ] **Step 2: Swap each rule to its role**

| Selector | Remove | Add |
|---|---|---|
| `.dash-verdict strong` (~1328) | `font-size: var(--fs-base); font-weight: 600;` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.dash-verdict p` (~1329) | `font-size: var(--fs-xs); line-height: var(--lh-prose);` | `font: var(--type-small);` |
| `.dash-pass` (~1330) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-label);` |
| `.state-picker-value` (~1374) | `font-size: var(--fs-sm); font-weight: 600;` | `font: var(--type-control-sm);` |
| `.ready-ring-pct` (~1432) | `font-family: var(--font-head); font-weight: 700; font-size: var(--fs-xl); line-height: 1;` (keep `font-variant-numeric`, now after `font:`) | `font: var(--type-figure-md);` |
| `.ds-label, .ready-ring-sub` (~1455) | `font-family: var(--font-body);` `font-size: var(--fs-xs);` `font-weight: 400;` `line-height: var(--lh-prose);` | `font: var(--type-label);` |
| `.ds-num` (~1508) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-md); line-height: 1;` | `font: var(--type-figure-sm);` (keep `tabular-nums` after it) |
| `.ds-of` (~1515) | `font-size: var(--fs-2xs); font-weight: 500;` | `font: var(--type-caption);` |
| `.resume-text` (~1571) | `font-size: var(--fs-sm);` | `font: var(--type-small);` |
| `.resume-text strong` (~1572) | `font-size: var(--fs-base);` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.resume-text > span` (~1573) | `font-size: var(--fs-xs);` | `font: var(--type-label);` |
| `.mode-title` (~1677) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-md);` | `font: var(--type-title);` |
| `.mode-description` (~1678) | `font-size: var(--fs-sm); line-height: var(--lh-prose);` | `font: var(--type-small);` |
| `.mode-flag` (~1682) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-chip);` |
| `.mode-meta` (~1701) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` (keep `tabular-nums` after it) |
| `.topic-chip-name` (~1753) | `font-weight: 600; font-size: var(--fs-base);` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.topic-chip-meta` (~1754) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` |
| `.hist-exam-stats` (~1790) | `font-size: var(--fs-sm);` | `font: var(--type-small);` |
| `.hist-row` (~1797) | `font-size: var(--fs-sm);` | `font: var(--type-small);` |
| `.hist-date` (~1800) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` (keep `tabular-nums` after it) |
| `.hist-badge` (~1802) | `font-size: var(--fs-2xs); font-weight: 600; text-transform: uppercase; letter-spacing: var(--ls-caps);` | `font: var(--type-chip);` |
| `.glossary-summary` (~1811) | `font-weight: 600; font-size: var(--fs-base);` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.gloss-item > summary` (~1822) | `font-weight: 600; font-size: var(--fs-sm);` | `font: var(--type-control-sm);` |
| `.gloss-def` (~1824) | `font-size: var(--fs-sm);` | `font: var(--type-small);` |
| 620 block: `.dash-verdict strong { font-size: var(--fs-sm); }` (~2668) | the whole rule | — |
| 620 block: `.mode-card .mode-description { margin-bottom: var(--space-sm); font-size: var(--fs-xs); }` (~2685) | `font-size: var(--fs-xs);` | — |
| 620 block: `.hist-row { font-size: var(--fs-xs); gap: var(--space-sm); }` (~2815) | `font-size: var(--fs-xs);` | — |

- [ ] **Step 3: Centre the last two mode cards and equalise heights**

Replace the `@media (max-width: 1160px) { .modes-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }` rule (~1626) with:

```css
        @media (max-width: 1160px) {
            /* Five cards on three columns fell 3 + 2 with the pair hard left and taller
               than the row above. Six half-tracks, each card two of them, the fourth
               starting on the second: the last two centre under the first three. 1fr
               rows make all five one height. */
            .modes-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 1fr; }
            .modes-grid > .mode-card { grid-column: span 2; }
            .modes-grid > .mode-card:nth-child(4) { grid-column: 2 / span 2; }
        }
```

In the 620 block, change `.modes-grid { grid-template-columns: 1fr; gap: var(--space-sm); }` to:

```css
            .modes-grid { grid-template-columns: 1fr; grid-auto-rows: auto; gap: var(--space-sm); }
            .modes-grid > .mode-card, .modes-grid > .mode-card:nth-child(4) { grid-column: auto; }
```

(Without that reset, `span 2` on a one-track grid creates an implicit second column.)

- [ ] **Step 4: Run the tests; lower the budgets**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`. Lower every reported budget; re-run until all PASS.

- [ ] **Step 5: Verify the grid**

At 768 and 1024 wide, `showScreen('practise')`:

```js
const c = [...document.querySelectorAll('#modesGrid > .mode-card')].map(e => e.getBoundingClientRect()), g = document.getElementById('modesGrid').getBoundingClientRect();
({ iw: innerWidth, oneHeight: new Set(c.map(r => Math.round(r.height))).size === 1, pairCentred: Math.abs((c[3].left + c[4].right) / 2 - (g.left + g.right) / 2) < 1.5, rows: new Set(c.map(r => Math.round(r.top))).size })
```

Expected `{ oneHeight: true, pairCentred: true, rows: 2 }`. At 1280: `rows: 1`. At 375: `rows: 5`, cards full width. Force the load-error state and check it spans the grid: `document.getElementById('modesGrid').innerHTML = '<div class="load-error">x</div>'; document.querySelector('.load-error').getBoundingClientRect().width === document.getElementById('modesGrid').getBoundingClientRect().width`, expected `true`, then reload.

- [ ] **Step 6: Verify type and German fit**

`__roleAudit()` on Practise at 375 / 768 / 1024 / 1280, EN and DE, with Past rounds and the glossary opened (`document.querySelectorAll('#practiseScreen details').forEach(d => d.open = true)`): `off` is `[]`. At 320 and 375 in DE: `scrollWidth === innerWidth`; `.dash-verdict strong` is one line (`getBoundingClientRect().height < 24`); no `.mode-title` or `.topic-chip-name` overflows its box (`[...document.querySelectorAll('.mode-title, .topic-chip-name')].filter(e => e.scrollWidth > e.clientWidth + 1)` is `[]`).

- [ ] **Step 7: Commit**

```bash
git add index.html tools/scale.test.mjs
git commit -m "Type roles: the practise page; last two mode cards centred, all one height" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Quiz — type, the tablet layout, the image credit

**Files:**
- Modify: `index.html` (CSS rules below; the `#imageCredit` markup ~line 3073)
- Modify: `tools/scale.test.mjs` (budgets only)

**Interfaces:**
- Consumes: `--type-subheading`, `--type-title`, `--type-option`, `--type-body`, `--type-small`, `--type-label`, `--type-caption`, `--type-figure-sm`, `--type-chip` (Task 1).

- [ ] **Step 1: Baseline audit**

`startMode('allQuestions')`, wait 400ms, `__roleAudit()` at 1280. Expected `off` includes `.question-text`, `.opt-text-wrap`, `.stat-value`, `kbd`.

- [ ] **Step 2: Swap each rule to its role**

| Selector | Remove | Add |
|---|---|---|
| `.stat .stat-label` (~1976) | `font-size: var(--fs-2xs); letter-spacing: var(--ls-caps);` | `font: var(--type-label);` |
| `.stat-value` (~1977) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-md); line-height: 1;` | `font: var(--type-figure-sm);` (keep `tabular-nums` after it) |
| `.stat-of` (~1978) | `font-size: var(--fs-xs); font-weight: 500;` | `font: var(--type-caption);` |
| `#timer .timer-label, #timer .timer-display, #timer .pacing-info { font-size: var(--fs-sm); line-height: 1.3; }` (~2001) | the whole rule | — |
| `.timer-display` (~2007) | `font-family: var(--font-head); font-weight: 600;` | `font: var(--type-figure-sm);` (keep `tabular-nums` after it) |
| `.pacing-info` (~2009) | `font-weight: 600;` | `font: var(--type-label);` (keep `tabular-nums` after it) |
| `.question-category` (~2048) | `font-size: var(--fs-2xs); font-weight: 500;` | `font: var(--type-label);` |
| `.speak-btn, .bilingual-toggle` (~2055) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-chip);` |
| `.question-text` (~2091) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-lg); line-height: 1.4;` | `font: var(--type-subheading);` |
| `.question-english` (~2093) | `font-size: var(--fs-sm); line-height: var(--lh-prose);` | `font: var(--type-small);` |
| `.option-btn` (~2100) | `font-size: var(--fs-md); line-height: 1.4;` | `font: var(--type-option);` |
| `.opt-letter` (~2123) | `font-weight: 600; font-size: var(--fs-2xs);` | `font: var(--type-chip);` |
| `.option-en-text` (~2143) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` (keep `font-style: italic` after it) |
| `.opt-img-hover` (~2190) | `font-size: var(--fs-2xs); font-weight: 600; line-height: 1.3;` | `font: var(--type-chip);` |
| `.img-zoom-hint` (~2210) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` |
| `.img-zoom-caption` (~2236) | `font-size: var(--fs-xs);` | `font: var(--type-label);` |
| `.option-btn--image .opt-num` (~2245) | `font-size: var(--fs-xs); font-weight: 500;` | `font: var(--type-label);` |
| `.option-btn--image.img-missing .opt-img::after` (~2247) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` |
| `.keyboard-hint` (~2250) | `font-size: var(--fs-2xs);` | `font: var(--type-caption);` |
| `kbd` (~2252) | `font-size: var(--fs-2xs);` and, at the end of the same rule, `font-weight: 600;` | `font: var(--type-chip);` |
| `.explanation-header` (~2265) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-base);` | `font: var(--type-title);` |
| `.explanation-text` (~2268) | `font-size: var(--fs-sm); line-height: var(--lh-prose);` | `font: var(--type-body);` |
| `.explanation-english` (~2269) | `font-size: var(--fs-xs);` | `font: var(--type-small);` (keep `font-style: italic` after it) |
| `.qnav-group-head` (~2329) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-chip);` |
| `.qnav-seg .seg-btn` (~2356) | `font-size: var(--fs-2xs);` | `font: var(--type-chip);` |
| `.q-nav-btn` (~2363) | `font-size: var(--fs-2xs); font-weight: 600;` | `font: var(--type-chip);` (keep `tabular-nums` after it) |
| 620 block: `.question-text { font-size: var(--fs-md); }` (~2763) | the whole rule | — |
| 620 block: `.stat-value, .stat-of { font-size: var(--fs-2xs); }` (~2800) | the whole rule | — |
| 620 block: `.stat .stat-label { font-size: var(--fs-2xs); letter-spacing: var(--ls-caps); }` (~2808) | the whole rule | — |
| `@media (max-width: 400px)`: `.option-btn--image .opt-num { font-size: var(--fs-2xs); line-height: 1.25; }` | `font-size: var(--fs-2xs); line-height: 1.25;` | `font: var(--type-caption);` |

- [ ] **Step 3: Move the image credit's inline type into the sheet**

In the markup, change

```html
<div id="imageCredit" style="display: none; font-size: 0.68rem; color: var(--muted); text-align: center; margin: -4px 0 6px;"></div>
```

to

```html
<div id="imageCredit" style="display: none;"></div>
```

(the JS toggles `style.display`), and change the rule `#imageCredit { color: var(--muted); }` (~2096) to:

```css
        /* Was an inline 0.68rem — 10.9px, under the floor, and invisible to
           scale.test.mjs because it lived in the markup. */
        #imageCredit { font: var(--type-caption); color: var(--muted); text-align: center; margin: calc(-1 * var(--space-2xs)) 0 var(--space-xs); }
```

- [ ] **Step 4: The tablet quiz — buttons under the answers**

Directly AFTER the closing `}` of the `@media (max-width: 940px)` block that begins ~2463 (so it wins on source order over that block's `align-self: stretch` and `flex: 1`), add:

```css
        /* TABLET PORTRAIT (621-940px, 2026-09-23, on request): Previous and Next sit
           directly under the answers, as they do above 940. The phone rule it overrides
           parks them at the bottom of the column, which on a 1024px-tall tablet left
           ~430px of nothing between the last answer and the buttons. The card is
           content-sized again and the column centres in its row; the readouts and the
           collapsed overview strip keep the rows below, at the bottom of the screen.
           .quiz-main's max-height: 100% still caps a long question, so .question-body
           scrolls instead of the page. */
        @media (min-width: 621px) and (max-width: 940px) {
            body.in-session .quiz-main { align-self: center; }
            body.in-session .question-card { flex: 0 1 auto; }
        }
```

- [ ] **Step 5: Run the tests; lower the budgets**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`. Lower every reported budget; re-run until all PASS. Also run the script syntax check:

```bash
node -e "const s=require('fs').readFileSync('index.html','utf8');const m=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)];require('fs').writeFileSync(process.env.TEMP+'/eib.js',m[m.length-1][1])" && node --check "$TEMP/eib.js"
```

Expected: no output (syntax OK).

- [ ] **Step 6: Verify the tablet layout**

At 768×1024, `startMode('allQuestions')`, wait 400ms, `document.getAnimations().forEach(a => a.finish())`:

```js
const o = document.querySelector('.options').getBoundingClientRect(), n = document.querySelector('.quiz-nav').getBoundingClientRect();
({ iw: innerWidth, gap: Math.round(n.top - o.bottom), locked: document.documentElement.scrollHeight === innerHeight })
```

Expected `gap` ≤ 40 and `locked: true`. At 375×812 the same script: `gap` > 100 (the phone keeps the bottom row) and `locked: true`. At 1280×900: unchanged from before this task (`gap` ≤ 40).

- [ ] **Step 7: Verify type, readouts and the height lock**

`__roleAudit()` on the quiz at 375 / 768 / 1024 / 1280 in EN and DE, after answering one question (`document.querySelector('.option-btn').click()`) so the explanation shows: `off` is `[]`. At 360×740 in DE:

```js
new Set([...document.querySelectorAll('#statsBar .stat')].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().top))).size
```

Expected `1`. Height lock — `scrollHeight === innerHeight` at 375, 620, 940, 1400 wide AND at 768×1024 and 900×600, each on a four-image question with the explanation open: `state.currentQuestionIndex = state.currentQuestions.findIndex(q => q.option_images); displayQuestion(); document.querySelector('.option-btn').click()`, then measure; repeat with the mobile navigator expanded (`document.querySelector('.sidebar-header').click()`) below 940.

- [ ] **Step 8: Commit**

```bash
git add index.html tools/scale.test.mjs
git commit -m "Type roles: the quiz; tablet keeps Previous/Next under the answers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Results — type, and the ratchet to zero

**Files:**
- Modify: `index.html`
- Modify: `tools/scale.test.mjs`

**Interfaces:**
- Consumes: `--type-heading`, `--type-subheading`, `--type-title`, `--type-small`, `--type-label`, `--type-figure-lg`, `--type-figure-md` (Task 1).

- [ ] **Step 1: Swap each rule to its role**

| Selector | Remove | Add |
|---|---|---|
| `.end-screen > h1` (~2375) | `font-family: var(--font-head); font-weight: 700; font-size: var(--fs-2xl);` | `font: var(--type-heading);` |
| `.score-ring-pct` (~2386) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-3xl);` `line-height: 1;` | `font: var(--type-figure-lg);` (keep `tabular-nums` after it) |
| `.score-ring-center .score-number` (~2387) | `font-size: var(--fs-sm); font-weight: 600;` | `font: var(--type-label);` (keep `tabular-nums` after it) |
| `.pass-fail` (~2393) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-md);` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.result-stat .rs-label` (~2422) | `font-size: var(--fs-2xs); letter-spacing: var(--ls-caps); text-transform: uppercase;` | `font: var(--type-label);` |
| `.result-stat .rs-num` (~2423) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-xl); line-height: 1;` | `font: var(--type-figure-md);` (keep `tabular-nums` after it) |
| `.pass-threshold-note` (~2424) | `font-size: var(--fs-xs);` | `font: var(--type-label);` |
| `.review-section-header h2` (~2432) | `font-family: var(--font-head); font-weight: 600; font-size: var(--fs-lg);` | `font: var(--type-subheading);` |
| `.review-count` (~2434) | `font-size: var(--fs-sm);` | `font: var(--type-label);` |
| `.review-q-text` (~2437) | `font-weight: 600; font-size: var(--fs-md); line-height: 1.4;` | `font: var(--type-title);` and add `letter-spacing: var(--ls-display);` |
| `.review-answer` (~2439) | `font-size: var(--fs-sm);` | `font: var(--type-small);` |
| `.review-explanation` (~2445) | `font-size: var(--fs-sm);` `line-height: var(--lh-prose);` | `font: var(--type-small);` |
| 620 block: `.score-ring-pct { font-size: var(--fs-2xl); }` (~2814) | the whole rule (the role's phone override gives 28) | — |

- [ ] **Step 2: Run the tests; the ratchet must reach 0**

Run: `node --test tools/scale.test.mjs tools/contrast.test.mjs`. Expected: `typeOutsideRoles is down to 0`. Set `BUDGETS.typeOutsideRoles` to `[0, "reached 2026-09-23. Every text rule reads a --type-* role; ROLE_EXEMPT names the rest."]` and lower any other reported budget. If it reports more than 0, the test output's selector list is the remainder: map each one per the spec and re-run. Re-run until all PASS.

- [ ] **Step 3: Grep for anything the ratchet cannot see**

```bash
grep -n "font-size:\|fontSize" index.html | awk -F: -v end="$(grep -n '</style>' index.html | head -1 | cut -d: -f1)" '$1 > end'
```

Expected: no output — no inline or JS-written font size left after the stylesheet, in the markup or the script.

- [ ] **Step 4: Verify results, figures and exam mode**

`startMode('exam')`, answer one question, `endQuiz()`: `__roleAudit()` at 375 / 768 / 1280 in EN and DE: `off` is `[]`. Figures keep tabular digits on every screen:

```js
[...document.querySelectorAll('.stats-num, .score-ring-pct, .ready-ring-pct, .rs-num, .ds-num, .stat-value, .timer-display')].filter(e => getComputedStyle(e).fontVariantNumeric !== 'tabular-nums').map(e => e.className)
```

Expected `[]` on Home, Practise, the quiz (exam) and results. Exam at 375: `#timer` is one line (`document.getElementById('timer').getBoundingClientRect().height < 30`), `scrollWidth === innerWidth`, and on results `scrollHeight === innerHeight`.

- [ ] **Step 5: Commit**

```bash
git add index.html tools/scale.test.mjs
git commit -m "Type roles: the results screen; every text rule now reads a role" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Docs, full validation, PR

**Files:**
- Modify: `CLAUDE.md`, `docs/TODO.md`
- Modify (header only): `docs/plans/2026-09-23-typography-and-responsive-design.md`

- [ ] **Step 1: Add the roles to CLAUDE.md**

In `CLAUDE.md`, under "**There is a SIZE system now, and it is measured**", add as the first sub-bullet:

```markdown
    - **EVERY PIECE OF TEXT IS ON ONE OF 16 TYPE ROLES** (2026-09-23, on request: "set a
      clear typography"). `--type-display` / `-heading` / `-subheading` / `-title` /
      `-option` / `-body` / `-small` / `-label` / `-caption` / `-figure-lg` / `-figure-md`
      / `-figure-sm` / `-script` / `-control` / `-control-sm` / `-chip`, each a `font`
      shorthand of `--fs-*` / `--lh-*` / `--font-*` in `:root`, read as
      `font: var(--type-*)`. **`font:` goes FIRST in its rule** — it resets
      `font-variant-numeric` and `line-height`. Phone type is TWO token overrides in the
      620px block (heading 22, figure-lg 28); no component states a font size.
      `scale.test.mjs` holds it: `typeOutsideRoles` is 0 and `ROLE_EXEMPT` names the
      only exceptions (body, the UA resets, the iOS `<select>`, the wordmark, two glyphs,
      EN's 700, three inline emphasis spans). **Labels are sentence case** — nothing is
      uppercase but the two taglines. Spec and plan: `docs/plans/2026-09-23-typography-*`.
```

- [ ] **Step 2: Correct every CLAUDE.md claim this change falsified**

Search `CLAUDE.md` for each search phrase below (plain text, use Grep) and rewrite that sentence to match the new state — keep the history, state the new value:

| Search phrase | New state to write |
|---|---|
| Uppercase micro-labels take | labels are sentence case and read `--type-label` |
| the underline alone marks the page | no underline; current page `--text`, the other link `--muted` |
| THE UNDERLINE BELONGS TO THE WORD | retire the bullet: the underline is gone (2026-09-23) |
| The VERDICT is 15/13px | `--type-title` over `--type-small`, with no phone step |
| fs-2xs` today | the quiz readouts: figure-sm 16 over label 13, phone included |
| both sit at | same as the row above (the phone tally line) |
| question-text` is 18px | subheading 18 at every width, `--lh-ui` |
| the percentage at | figure-md 22 at weight 600 |
| stats-num` takes | figure-lg 36, 28 on a phone |
| Both are hidden below 620px | the script notes and `.cta-art` hide below 940 |
| divide the set cleanly | 3 + 2 with the pair centred and all five one height from 1160 down |
| Below 940px the card goes back | tablet (621-940) keeps the buttons under the answers; only phones keep the bottom row |

- [ ] **Step 3: Session block in docs/TODO.md and spec status**

Append a `## Session developments (2026-09-23, type roles and tablet/phone layout)` block to `docs/TODO.md` in the file's existing format (bullets, `### Verified`, `### Not verified`), listing what shipped and exactly what Tasks 2-6 measured. Change the spec's status line to `**implemented on branch typography-responsive; PR open.**`

- [ ] **Step 4: Run the full CLAUDE.md validation checklist**

```bash
node tools/validate.js
node --test tools/contrast.test.mjs tools/scale.test.mjs
node --check sw.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))"
```

plus the `node --check` of the extracted script (Task 5 Step 5). Expected: validate reports 460 questions and 0 missing assets; every test passes. Then items 5-8 of the checklist in the browser: the EN box flips every chrome string and the question stays German; the three scheme buttons each survive a reload; both pages have `scrollWidth === innerWidth` at 375; an exam is 33 questions with the 60-minute timer. No `sw.js` bump is needed (no favicon, manifest or icon changed).

- [ ] **Step 5: Revert the temporary server config and commit**

```bash
git -C "C:\Users\Suhas Pala\Documents\AI projects\EIB" checkout -- .claude/launch.json
git add CLAUDE.md docs/TODO.md docs/plans/2026-09-23-typography-and-responsive-design.md
git commit -m "Docs: type roles and the tablet/phone layout" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Push and open the PR (do not merge)**

```bash
git push -u origin typography-responsive
gh pr create --base main --head typography-responsive --title "Type roles and tablet/phone layout" --body-file <file>
```

The body lists: the 16 roles; the visible changes (sentence-case labels, no nav underline, phone hierarchy, tablet quiz, mode grid, hidden notes below 940, dark panels commit); what was measured; what was not. It ends with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Report the PR URL to the user and stop. The user merges.
