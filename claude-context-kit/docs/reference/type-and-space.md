# Type and space reference — scale, leading, tracking and control size

Companion to [`theme-light.md`](theme-light.md) and [`theme-dark.md`](theme-dark.md), same intent:
record what shipping applications actually do, as numbers, so a size decision can be checked
instead of argued.

**Method differs from the colour references, and is stricter.** The colour docs were sampled from
screenshot pixels. Type and space were read **directly out of the live DOM** — every application
below was loaded in a real browser at **1280x900**, and the values come from `getComputedStyle`.
Two layers were captured for each:

- **the token layer** — the custom properties the application publishes on `:root`. This *is* the
  design system, not an inference about it.
- **the rendered layer** — every visible element that owns a text node, tallied by computed
  `font-size`, with its dominant line-height, weight and tracking. This is one page's *usage* of
  that system, and it is deliberately reported separately, because the two differ a lot.

**This is source material about four other applications.** It describes what they do; it makes no
claim about any project that reads it. Section 7 sets the four side by side, which is the payoff.

Captured 2026-09-20. Pages measured: `docs.stripe.com/payments/quickstart`,
`github.com/torvalds/linux`, `linear.app/method/introduction` (rendered) with
`linear.app/docs/cycles` (tokens), `khanacademy.org/math/algebra`.

---

## 1. The four systems, as measured

### Stripe — "Sail"

Root and body font-size **14px**. Body `line-height: normal`.

| Scale | Values |
|---|---|
| `--sail-font-size-*` | **11, 12, 13, 14, 15, 16, 20, 24, 28, 32, 48, 56** — 12 steps, all integers |
| `--sail-font-lineHeight-*` | **16, 20, 24, 28, 32, 36, 40, 56, 64** — absolute px, on a 4px grid |
| `--sail-spacing-*` | **0, 2, 4, 8, 12, 16, 20, 24, 32, 48, 64, 80** |
| `--sail-font-weight-*` | regular **400**, medium/link **500**, bold **700** — three |
| `--sail-radius` | **4px** (plus 1, 2, 3) |
| `--default-vertical-spacing` | 12px |

Rendered on the page — **8 distinct sizes**:

| px | count | line-height | weight | sample |
|---|---|---|---|---|
| 32 | 1 | normal | 700 | page title |
| 21 | 2 | normal | 700 | "Congratulations!" |
| 20 | 6 | 1.40 | 700 | section heading |
| **16** | **126** | **1.63** | 400 | body prose |
| 14.4 | 12 | 1.81 | 400 | inline code |
| **14** | **101** | **1.43** | 400 | chrome, nav |
| 13 | 54 | 1.54 | 400 | code |
| 12 | 28 | 1.33 | 500 | tab label |

Note the split: **prose 16px at 1.63, chrome 14px at 1.43.** Two different jobs, two different
leadings, in the same page.

Gaps in use: 4 (55x), **8 (143x)**, 6, 12, 16, 24. Control heights: 20, 28, 32, 34, 52.

### GitHub — "Primer"

Root 16px, body **14px / 21px**.

Primer publishes *semantic* roles rather than a bare ramp:

| Role token | size | line-height | weight |
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

| Scale | Values |
|---|---|
| `--space-*` | xxs **2**, xs **4**, sm **8**, md **12**, lg **16**, xl **24** — six steps |
| `--base-size-*` | 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 60, 64, 80, 88, 96, 112, 128 |
| `--control-*-size` | xsmall **24**, small **28**, medium **32**, large **40**, xlarge **48** |
| `--control-minTarget-coarse` | **44px** — the touch floor, named |
| `--borderRadius-*` | small **3**, medium/default **6**, large **12**, full |

Rendered — **6 distinct sizes**: 32, 24, 20, 16, 14, 12. **Every tier at line-height 1.5.**
Dominant tier 14px (156 elements), then 12px (42). Gaps: 4 (45x), 10 (41x), 8 (28x), 2, 12, 16.
Control heights: 18, 28, 30, 32, 40.

GitHub is the outlier on leading — a flat 1.5 everywhere, where the other three vary it by size.

### Linear

Root and body 16px; body line box **24px**. The most explicit system of the four: **every size
token carries its own line-height and its own tracking.**

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
| 7–9 | 56, 64, 72px | 1.1, 1.06, 1.0 | −0.022em |

| Other | Values |
|---|---|
| `--font-weight-*` | light 300, normal 400, medium **510**, semibold **590**, bold **680** (variable font) |
| `--radius-*` | 4, 6, 8, 12, 16, 24, 32, circle, rounded |
| `--min-tap-size` | **44px** |
| `--page-padding-inline` | 24px |
| `--border-hairline` | 0.5px |

Rendered — **6 distinct sizes**, and they match the tokens exactly: 72 (lh 1.0), 24 (lh 1.33,
w 590), 17 (lh 1.6), 15 (lh 1.6, w 510), 14 (lh 1.5), **13 (lh 1.5, 51 elements — the chrome)**.
Nothing below 13px rendered. Control heights: 32, 36.

### Khan Academy — "Wonder Blocks"

**`html { font-size: 10px }`**, deliberately, so every rem token reads as px/10 (`1.6rem` = 16px).
Body **14px / 19.6px**.

| Role | size | line-height | delta |
|---|---|---|---|
| body xsmall | 12px | 16px | +4 |
| body small | **14px** | 18px | +4 |
| body medium | 16px | 20px | +4 |
| heading small | 12px | 16px | +4 |
| heading medium | 20px | 24px | +4 |
| heading large | 24px | 28px | +4 |
| heading xlarge | 28px | 32px | +4 |
| heading xxlarge | 36px | 40px | +4 |

**Every line-height in the system is its font-size plus exactly 4px.** One rule, no table needed.
It produces a ratio that falls from 1.33 at 12px to 1.11 at 36px — the same curve Linear
hand-tunes, from a single line of arithmetic.

| Scale | Values |
|---|---|
| `--wb-sizing-size_*` | 0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96 |
| `--wb-border-radius-*` | 0, 1, 4, 8, 12, 24, 50% — button radius **4px** |
| `--wb-font-weight-*` | light 300, regular 400, bold 700, black 900 — and **medium and semi both alias 400** |

Rendered — **8 distinct sizes**: 36, 28, 20, 17, 16, 14, 12. Dominant tier **14px (886 elements)**,
then 16px/700 (145), then 12px (68). Nothing below 12px.

Gaps: 2 (36x), 4 (102x), **8 (1470x)**, 16 (48x), 32 (3x). Paddings: **16 (83x)**, 10, 12, 8, 20, 24.
Control heights: 40, **44**, 56, 60.

---

## 2. Rules all four follow

**The dense UI base is 13–15px, not 16.** Stripe 14, GitHub 14, Khan 14, Linear 15. Where 16px
appears it is *reading content* — Stripe's prose tier, GitHub's `body-large`, Khan's `body-medium`.
So there are two bases, not one: **chrome at 13–14, prose at 15–16**, and the application default
is the lower of the two.

**The UI line box lands at 18–21px.** GitHub 14/21, Linear 14/21 and 13/19.5, Khan 14/19.6 (18 by
token), Stripe 14/20. Four systems, four different ratios, and they converge on the same absolute
line box. **The ratio is the wrong thing to compare; the resulting box is the right thing.** A 16px
base at 1.6 gives 25.6px — about 25% taller than any of these, and that difference is paid once per
line, everywhere.

**Three of four scale leading down as size goes up.** Linear falls 1.6 → 1.5 → 1.33 → 1.125 → 1.0
across its ramp; Khan is size + 4px flat, which is the same curve; Stripe publishes absolute
line-height tokens on a 4px grid against sizes from 11 to 56. Only GitHub holds one ratio (1.5) for
everything. **A single line-height applied from a 10px label to a 40px display is the minority
position, and the three that avoid it are the three with tighter UIs.**

**The floor is 12px.** No application renders body-adjacent text below 12px — Linear stops at 13,
the other three at 12. Tokens exist below that (Linear's `tiny` 10px and `micro` 11px, Stripe's
`font-size-11`) but nothing on a measured page used them. Treat 12px as the practical floor and
anything smaller as a token you have to justify per use.

**The scale is long; the usage is narrow.** Khan's gap of **8px accounts for 1470 of its 1661
measured gaps (88%)**, and its 16px padding for 83 of 96 (86%). Stripe's 8px and 4px cover 87% of
its gaps. A published scale of 12 steps does not mean 12 steps in play on a page — it means one or
two do the work and the rest are available. **Variety in spacing is a symptom, not a feature.**

**Control heights are a short, named ladder, and 44px appears by name.** Primer publishes exactly
five (24/28/32/40/48) plus `--control-minTarget-coarse: 44px`; Linear publishes `--min-tap-size:
44px` and renders 32 and 36; Khan renders 40, 44, 56. Two of the four name 44px as a token rather
than leaving it to a media query.

**Three or four weights, never more.** Stripe 400/500/700. GitHub 400/500/600. Linear 400/510/590/
680 (variable font, custom axis values). Khan ships 300/400/700/900 but **aliases both `medium` and
`semi` to 400** — a design system actively refusing a weight it has available.

**Tracking is a function of size, and it is signed.** Where it is deliberate (Linear, GitHub's brand
layer) it runs **slightly positive at the smallest sizes** (GitHub: +0.21px, +0.24px, +0.18px on its
100–350 tiers), **zero through the middle**, and **negative at display** (Linear −0.022em at 32px
and above, GitHub −0.035em at its largest). Stripe and Khan render `normal` nearly everywhere.
Nobody carries more than four distinct values, and none of them assign tracking per component.

**Corner radius is small.** Stripe 4, Khan 4, GitHub 6, Linear 8. None of the four exceeds 8px for
a standard card or control, though all publish larger values for specific surfaces. Recorded as
observation, not prescription — this is the most style-dependent number in the set.

---

## 3. The line-height law, stated three ways

The same behaviour, in three implementations, in descending order of how easy it is to keep right:

1. **Khan — arithmetic.** `line-height = font-size + 4px`. One rule. No table, nothing to look up,
   impossible to get inconsistent. Produces 1.33 at 12px down to 1.11 at 36px.
2. **Stripe — absolute tokens on a grid.** Nine line-height values (16…64) on a 4px grid, paired
   with sizes by hand. Same curve, more freedom, more to keep aligned.
3. **Linear — a ratio bound to each size token.** Every size ships with its own `line-height` *and*
   `letter-spacing`, so the three always travel together and a size can never be used without them.
   The most expressive and the most verbose.

All three beat a single global ratio, because a global ratio is only ever correct at one size. The
practical consequence: **body copy and a display numeral must not share a line-height**, and if only
one mechanism can be afforded, `size + 4px` buys most of the benefit for one line of CSS.

---

## 4. What the numbers say about density

Taking the dominant chrome tier of each application and its line box:

| | base | line box | ratio |
|---|---|---|---|
| Khan Academy | 14px | 19.6px | 1.40 |
| Stripe | 14px | 20px | 1.43 |
| Linear (mini) | 13px | 19.5px | 1.50 |
| Linear (small) | 14px | 21px | 1.50 |
| GitHub | 14px | 21px | 1.50 |

The spread of *ratios* is 1.40–1.50. The spread of *line boxes* is 19.5–21px. Anything outside that
box is denser or looser than all four, whatever its ratio looks like.

Second-order, and worth as much: the dominant tier is dominant by a wide margin. Khan renders 886
elements at 14px and 68 at 12px; GitHub 156 at 14px; Stripe 126 at 16px and 101 at 14px. **A page is
mostly one size.** The other tiers are punctuation.

---

## 5. Side by side

### Same in all four

- A published, closed numeric scale for size, space and radius, exposed as tokens on `:root`.
- Dense UI base **below 16px** (13–15).
- Nothing rendered below **12px**.
- **Three to four** font weights, no more.
- Spacing dominated by **one or two values**; 4px and 8px are in every system.
- A named touch/control ladder, short (5 steps or fewer in active use).

### Differs

- **Leading strategy** — Khan `size + 4px`; Stripe absolute tokens; Linear per-token ratios;
  GitHub one flat 1.5.
- **Root font-size** — Khan sets `html` to **10px** so rem reads as px/10; Stripe sets it to 14px;
  GitHub and Linear leave it at 16 and set `body` down.
- **Tracking** — Linear and GitHub systematise it by tier; Stripe and Khan leave it `normal`.
- **Radius** — 4 (Stripe, Khan), 6 (GitHub), 8 (Linear).
- **Semantic vs. ramp** — GitHub and Khan publish *roles* (`body-medium`, `heading-large`); Stripe
  publishes a bare *ramp* (`font-size-14`); Linear publishes both.

### Has no counterpart

- Khan's 10px root, which makes every token self-documenting in px, at the cost of every third-party
  rem value in the page being wrong by 0.625x.
- Linear's variable-font weights (510, 590, 680) — unavailable to a static font stack.
- Stripe's `--s--cap-height` / `--s--x-height` machinery for optical baseline alignment, which is a
  layer beyond anything the other three attempt.

---

## 6. Checklist for a size system

Drawn from what all four do, in the order the decisions have to be made.

1. **Publish the scale as tokens.** Size, line-height, space, radius, control height. If a value is
   written as a literal in a rule, it is outside the system and cannot be audited.
2. **Pick the chrome base first, at 13–15px**, and let 15–16px be the separate, larger tier for
   content the user reads rather than scans.
3. **Aim the dominant UI line box at 19–21px.** Compute it (`size x ratio`), do not reason about the
   ratio alone.
4. **Make leading a function of size.** `size + 4px` if nothing more elaborate is affordable.
   Never one global ratio from label to display.
5. **Floor the type at 12px.** Below that requires a named reason per use.
6. **Cap the ramp at 8–12 steps and expect 2–3 to carry the page.** Near-duplicate steps (a 4%
   difference) are noise — if two steps are not obviously different, they are one step.
7. **Three weights.** Add a fourth only for a display tier.
8. **Two or three spacing values should cover most of the layout.** If the histogram of gaps is
   flat, the system is not being used.
9. **Four or five control heights, named**, with the coarse-pointer target (44px) among them as a
   token rather than a media query.
10. **Tracking by tier, not by component**: slightly positive at the smallest sizes, zero in the
    middle, negative at display. Four values at most.
11. **Nothing may be sized so that chrome outranks content.** None of the four render a counter,
    label or nav item larger than the primary content of the same screen.
