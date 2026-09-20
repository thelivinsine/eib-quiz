# Raw measurements — four shipping design systems

Captured **2026-09-20**, at **1280x900**, by loading each application in a real browser and
reading `getComputedStyle` off the live DOM. This is the unsummarised data behind
[`claude-context-kit/docs/reference/type-and-space.md`](../../claude-context-kit/docs/reference/type-and-space.md),
kept because the summary throws most of it away and re-gathering costs a browser session.

**This is source material about four other applications.** It describes what they do; it
makes no claim about this project.

Two layers were captured per app and are reported separately, because they differ a lot:

- **token layer** — the custom properties the app publishes on `:root`. This *is* the design
  system, not an inference about it. All four publish theirs.
- **rendered layer** — every visible element owning a text node, tallied by computed
  `font-size` with its dominant line-height, weight and tracking. One page's *usage* of that
  system.

Pages measured:

| app | design system | page |
|---|---|---|
| Stripe | Sail | `docs.stripe.com/payments/quickstart` |
| GitHub | Primer | `github.com/torvalds/linux` |
| Linear | (unnamed) | `linear.app/method/introduction` (rendered), `linear.app/docs/cycles` (tokens) |
| Khan Academy | Wonder Blocks | `khanacademy.org/math/algebra` |

---

## 1. Stripe — Sail

Root **14px**, body 14px, body `line-height: normal`.

```
--sail-font-size-*        11 12 13 14 15 16 20 24 28 32 48 56      (12 steps, all integers)
--sail-font-lineHeight-*  16 20 24 28 32 36 40 56 64               (absolute px, 4px grid)
--sail-spacing-*          0 2 4 8 12 16 20 24 32 48 64 80
--sail-font-weight-*      regular 400 · medium 500 · link 500 · bold 700
--sail-radius             4px   (plus --sail-radius-1/-2/-3/-4 = 1 2 3 4)
--default-vertical-spacing  12px
--fixed-header-height       64px
--collapsable-header-height 48px
--code-block-vertical-spacing 16px
```

Rendered — 8 distinct sizes:

| px | n | line-height | weight | sample |
|---|---|---|---|---|
| 32 | 1 | normal | 700 | page title |
| 21 | 2 | normal | 700 | "Congratulations!" |
| 20 | 6 | 1.40 | 700 | section heading |
| **16** | **126** | **1.63** | 400 | body prose |
| 14.4 | 12 | 1.81 | 400 | inline code |
| **14** | **101** | **1.43** | 400 | chrome, nav |
| 13 | 54 | 1.54 | 400 | code |
| 12 | 28 | 1.33 | 500 | tab label |

Gaps in use: 8 (143x) · 4 (55x) · 6 (10x) · 16 (6x) · 24 (4x) · 12 (2x).
Paddings: 4 (18x) · 2 (16x) · 1 (12x) · 8 (8x) · 12 (4x) · 6 (3x) · 16 (2x) · 24 · 32.
Radii: 4 (67x) · 6 (19x) · 50 (15x) · 18 (10x) · 12 (5x) · 8 (3x).
Control heights: 20 · 28 · 32 · 34 · 52.

Sail also publishes an optical-alignment layer nothing else here attempts:
`--s--cap-height`, `--s--x-height`, `--s--baseline-multiplier`, `--s--font-metrics-multiplier`.

## 2. GitHub — Primer

Root 16px, body **14px / 21px**. Primer publishes *semantic roles*, not a bare ramp.

| role | size | line-height | weight |
|---|---|---|---|
| `--text-caption-*` | 12px | 1.25 | 400 |
| `--text-body-size-small` | 12px | 1.625 | 400 |
| `--text-body-size-medium` | **14px** | 1.5 | 400 |
| `--text-body-size-large` | 16px | 1.5 | 400 |
| `--text-title-size-small` | 16px | 1.5 | **600** |
| `--text-title-size-medium` | 20px | 1.625 | **600** |
| `--text-title-size-large` | 32px | 1.5 | **600** |
| `--text-subtitle-size` | 20px | 1.625 | 400 |
| `--text-display-size` | 40px | — | — |
| `--text-codeBlock-size` | 13px | — | — |

```
--space-*         xxs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24        (six steps)
--base-size-*     2 4 6 8 12 16 20 24 28 32 36 40 44 48 60 64 80 88 96 112 128
--control-*-size  xsmall 24 · small 28 · medium 32 · large 40 · xlarge 48
--control-minTarget-coarse  44px      ← the touch floor, NAMED
--control-minTarget-fine    16px
--borderRadius-*  small 3 · medium 6 · default 6 · large 12 · full
--stack-gap-*     condensed 8 · normal 16 · spacious 24
```

Rendered — 6 distinct sizes: 32 · 24 · 20 · 16 · 14 · 12. **Every tier at line-height 1.5.**
Dominant 14px (156 elements), then 12px (42). Gaps: 4 (45x) · 10 (41x) · 8 (28x) · 16 · 12 · 2.
Radii: 6 (24x) · 50 (22x) · 24 · 20 · 3. Control heights: 18 · 28 · 30 · 32 · 40.

Primer's marketing layer (`--brand-*`) is a separate, larger scale and was excluded from the
summary; it is the only place tracking goes positive: `--brand-text-letterSpacing-100/200/300`
= `.21px / .24px / .18px`, against `-0.035em` at `--brand-text-letterSpacing-1000`.

## 3. Linear

Root and body 16px; body line box 24px. **The most explicit system of the four: every size
token ships with its own line-height AND its own tracking, so the three cannot be separated.**

| `--text-*` | size | line-height | letter-spacing |
|---|---|---|---|
| tiny | 10px | 1.5 | −0.015em |
| micro | 12px | 1.4 | 0 |
| mini | 13px | 1.5 | −0.01em |
| small | 14px | 1.5 (`calc(21/14)`) | −0.013em |
| **regular** | **15px** | **1.6** | −0.011em |
| large | 17px | 1.6 | 0 |

| `--title-N` | size | line-height | letter-spacing |
|---|---|---|---|
| 1 | 17px | 1.4 | −0.012em |
| 2 | 20px | 1.33 | −0.012em |
| 3 | 24px | 1.33 | −0.012em |
| 4 | 32px | **1.125** | −0.022em |
| 5 | 40px | 1.1 | −0.022em |
| 6 | 48px | **1.0** | −0.022em |
| 7 | 56px | 1.1 | −0.022em |
| 8 | 64px | 1.06 | −0.022em |
| 9 | 72px | 1.0 | −0.022em |

A second, older family also exists: `--font-size-micro .6875rem (11) · mini .75 (12) ·
small .8125 (13) · regular .9375 (15) · large 1.125 (18) · title3 1.25 (20) · title2 1.5 (24)
· title1 2.25 (36)`.

```
--font-weight-*  light 300 · normal 400 · medium 510 · semibold 590 · bold 680   (variable font)
--radius-*       4 6 8 12 16 24 32 · circle 50% · rounded 9999
--min-tap-size   44px          ← NAMED, as in Primer
--page-padding-inline  24px
--border-hairline      0.5px
--header-height        72px
--scrollbar-size       6px (10px active), --scrollbar-gap 4px
--editor-font-size .9375rem · --editor-line-height 1.6 · --editor-letter-spacing -.00667em
```

Rendered — 6 distinct sizes, matching the tokens exactly: 72 (lh 1.0) · 24 (lh 1.33, w 590) ·
17 (lh 1.6) · 15 (lh 1.6, w 510) · 14 (lh 1.5) · **13 (lh 1.5, 51 elements — the chrome)**.
Nothing below 13px rendered. Control heights: 32 · 36. Gaps: 2 · 8 · 16 · 20.

## 4. Khan Academy — Wonder Blocks

**`html { font-size: 10px }`** deliberately, so every rem token reads as px/10 (`1.6rem` =
16px). Body **14px / 19.6px**.

| role | size | line-height | delta |
|---|---|---|---|
| body xsmall | 12 | 16 | +4 |
| body small | **14** | 18 | +4 |
| body medium | 16 | 20 | +4 |
| heading small | 12 | 16 | +4 |
| heading medium | 20 | 24 | +4 |
| heading large | 24 | 28 | +4 |
| heading xlarge | 28 | 32 | +4 |
| heading xxlarge | 36 | 40 | +4 |

**Every line-height in the system is its font-size plus exactly 4px.** One rule, nothing to
look up, impossible to make inconsistent. It yields a ratio falling from 1.33 at 12px to 1.11
at 36px — the same curve Linear hand-tunes across fourteen tokens.

```
--wb-sizing-size_*   0 1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 32 36 40 44 48 56 64 72 80 88 96
--wb-border-radius-* 0 1 4 8 12 24 · full 50%          (button radius 4px)
--wb-font-weight-*   light 300 · regular 400 · bold 700 · black 900
                     — and medium AND semi BOTH alias 400
--wb-c-button-root-font-lineHeight-*  small 22 · default 24 · large 26
--wb-c-cell-title-font-lineHeight 20 · --wb-c-cell-subtitle 14/18
```

Rendered — 8 distinct sizes: 36 · 28 · 20 · 17 · 16 · 14 · 12.
**Dominant tier 14px at 886 elements**, then 16px/700 (145), then 12px (68).
Gaps: **8 (1470x)** · 4 (102x) · 16 (48x) · 2 (36x) · 32 (3x) · 5 (2x).
Paddings: **16 (83x)** · 10 (4x) · 12 (4x) · 8 (2x) · 24 (2x) · 20.
Radii: **4 (254x)** · 8 (20x) · 2 (3x) · 3 · 50.
Control heights: 15 · 16 · 18 · 24 · 40 · **44** · 56 · 60.

---

## 5. The numbers that mattered

- **Dense UI base is 13–15px, never 16.** 16px appears only as a *reading* tier.
- **The UI line box converges on 19.5–21px** across all four, at ratios spanning 1.40–1.50.
  Compare boxes, not ratios.
- **Leading falls as size rises** in three of four. Khan's `size + 4px` is the cheapest
  implementation of that curve.
- **Nothing renders below 12px** (Linear stops at 13). Sub-12 tokens exist and went unused.
- **One or two spacing values carry a page**: Khan 8px = 1470 of 1661 gaps (**88%**), 16px =
  83 of 96 paddings (86%); Stripe's 8+4 = 87% of gaps.
- **Three or four weights**, and Khan actively *aliases two of its own away*.
- **44px is a named token** in two of four, not a media query.
- **Radius is small**: 4 (Stripe, Khan) · 6 (GitHub) · 8 (Linear).

## 6. What this does NOT cover

Recorded so nobody mistakes the gaps for findings:

- **No colour or contrast data.** That axis is
  [`theme-light.md`](../../claude-context-kit/docs/reference/theme-light.md) /
  [`theme-dark.md`](../../claude-context-kit/docs/reference/theme-dark.md), measured from
  screenshot pixels of PowerToys, ChatGPT desktop and Claude desktop — a different method and
  a different set of apps.
- **One page per app**, desktop width only. A page's usage is not the system's full range,
  and none of these were measured at a phone width.
- **No dark-mode capture.** All four were read in whatever theme they defaulted to.
- **No motion, elevation or shadow data.**
- **Linear's rendered layer** came from `/method/introduction` after `/docs/cycles` 404'd;
  its token layer loaded on both, and the rendered sizes match the tokens exactly, so the
  two agree — but the rendered sample is a content page, not the app proper (which needs a
  login).
