# Plan — rebuild the home screen against the landing-page mockup

Status: **Phase 0 complete, 2026-09-21.** Phases 1-7 not started.

Source of truth for the design: [`docs/Mockups/ui/landing-page.png`](../Mockups/ui/landing-page.png).
Photography and the states map: [`docs/Mockups/photos/`](../Mockups/photos/ATTRIBUTIONS.md).

---

# Part 1 — High-level plan

## 1.1 What the mockup actually is

The mockup is a **marketing landing page for someone who has never taken the
test**. It opens with a pitch, sells four modes, argues why the product is
trustworthy, states four headline numbers and closes with a call to action.

The current home screen is a **returning-learner dashboard**. It opens with
accuracy, resumes an interrupted round, tracks mastery and spaced repetition,
and lists past results and a glossary.

Both are legitimate; they are for different people on different days. This is
the single fact the whole plan turns on.

## 1.2 The two decisions already taken

**Decision 1 — the home screen becomes two-tier.** First visit gets the
landing page. Once there is saved progress, the marketing falls away and the
dashboard leads.

| | First visit | Returning |
|---|---|---|
| 1 | Hero + photo | **Where you stand** |
| 2 | Choose your practice mode (5 cards) | Choose your practice mode (5 cards) |
| 3 | Simple. Effective. Reliable. | Past rounds & glossary |
| 4 | 300 · 16 · 2 · 60 | |
| 5 | Take the next step today | |

The switch is one predicate, `hasProgress()`, over data the app already
stores. It is **not** a new setting and not a route — the same screen renders
one of two section lists.

**Decision 2 — five mode cards, not four.** The mockup's four are
Practice / Exam / Topic / State. The app's four are All questions / Exam /
State / Smart Review. Shipping the mockup's set would delete Smart Review's
only entry point, and spaced repetition is a real feature with real stored
data. So all five ship: **All questions · Exam · State · Smart Review · Topic**.

The consequence: **`#topicSection` stops being a home section.** Topic is a
card now. The card reveals the existing topic chips in place rather than
opening a new screen — `renderTopics()` is reused verbatim and no routing
changes. The app already has this collapsing idiom in Past rounds and the
glossary; this is a third use of it, not a fourth invention.

## 1.3 The palette IS the mockup's — both themes

**Decision 3 — adopt the mockup's blue, and derive a dark theme for it.**
Shipped in Phase 0.

The mockup is light-only, so dark had to be derived rather than copied. The
method matters: **every neutral holds its measured luminance and changes only
its hue.** The dark ladder was tuned against `theme-dark.md` — a tile 1.16
above the canvas, a hairline at 1.60 on that tile — and re-tinting at constant
luminance preserves all of it by construction. Maximum drift across 32
neutrals was 0.006, and the resulting ladder measures 1.11 light tile step,
1.15 dark tile step, 1.62 dark hairline: the same shape, in slate.

The accents are the mockup's literal values wherever they clear AA:

| | Light | Dark | Note |
|---|---|---|---|
| accent | `#2563EB` | `#60A5FA` | the mockup's blue, 5.17 on white |
| green | `#047857` | `#10B981` | mockup's `#10B981` is 2.54 on white |
| amber | `#B45309` | `#F59E0B` | mockup's `#F59E0B` is 2.15 on white |
| red | `#CC2020` | `#F87171` | mockup's `#EF4444` is 3.76 on white |

Light needs darker greens, ambers and reds because the mockup only ever puts
those colours on **fills**, never on text. This app uses them as text tiers,
which is a floor the mockup never had to clear.

## 1.4 What is deliberately out of scope

- **About and FAQs.** The mockup's nav has three items; two are pages that do
  not exist. Building them is a separate piece of work. `Learn More` and the
  nav will point at on-page anchors instead.
- **Every screen past the home screen.** Quiz, results and review keep their
  current design. `docs/Mockups/ui/app-screens-*.png` covers those and is a
  later phase.
- **The language control's shape.** The mockup draws a globe-and-chevron
  dropdown; the app has an EN/DE segmented control that already pairs with the
  Dark/Light one beside it. Keeping the pair is worth more than matching one
  widget.

## 1.5 The icon rule, restated

Per your instruction and already the law in `CLAUDE.md`: **an icon is a
neutral glyph with no plate behind it.** The mockup puts every icon in a
tinted circle and gives each mode card its own hue — four tinted badges, four
coloured arrow discs, four coloured link labels. None of that ships. Icons
take `--sub-text` at rest and `--accent` on hover, exactly as the mode cards
and topic chips do today. The hit target stays; only the fill and the
hairline are gone.

This applies to the arrow discs too. A circled arrow on a card that is itself
a button is a box inside a box.

## 1.6 Constraints every task inherits

These are enforced by tests that currently pass. Breaking one is a
regression, not a trade-off.

| Constraint | Enforced by |
|---|---|
| No literal `font-size` — `--fs-*` only, floor 12px | `scale.test.mjs` |
| No off-scale or literal spacing — `--space-*` | `scale.test.mjs` |
| No literal `border-radius` or icon size | `scale.test.mjs` |
| Control heights are `--ctl-*`; only 2 tracking values | `scale.test.mjs` |
| No property declared twice for one selector in one scope | `scale.test.mjs` |
| Every text tier ≥ 4.5:1 on its ground, both themes | `contrast.test.mjs` |
| Any hex written in a rule is listed in `LITERAL_PAIRS` | `contrast.test.mjs` |
| No stroked icons — `grep 'stroke="currentColor"' index.html` is empty | `CLAUDE.md` |
| No drop shadows in either theme | `CLAUDE.md` |
| Every visible string in `I18N`, never inline | `CLAUDE.md` |
| German text carries `lang="de"` | `CLAUDE.md` |
| 44px touch targets; no horizontal scroll at 375px | `CLAUDE.md` |

## 1.7 Phases

| # | Phase | Why it is here |
|---|---|---|
| 0 | **Palette, assets and foundations** | The palette is foundational — building bands in the old teal and reskinning later is wasted work. Four asset gaps block the hero outright. |
| 1 | The two-tier switch | Structural. Do it before any styling, so each band is built once into its final home. |
| 2 | Hero | The largest single piece and the one with the most new parts. |
| 3 | Mode cards, five up | Touches `renderModes()` and retires `#topicSection`. |
| 4 | Why-band and stats band | Two new marketing bands, both pure markup and CSS. |
| 5 | CTA band | Smallest band; needs the line art from phase 0. |
| 6 | Header | Adds the primary action; leaves the language and theme controls alone. |
| 7 | Responsive and verification | The full checklist from `CLAUDE.md` §Validation, plus both test suites. |

Phases 2–5 are independent of each other once 0 and 1 are done, and can land
as separate commits in any order.

## 1.8 The four gaps you should know about now

1. **No hero photo of the right shape.** The mockup's photo panel is roughly
   square. `photos/reichstag.jpg` is 3840 × 1452 — a 2.6:1 panorama. Cropping
   it to square throws away most of the building. A portrait-friendly
   Reichstag-with-flag needs sourcing. One is already identified.
2. **No handwriting font.** The mockup's two script annotations are its
   signature. That is a third font family, and the strings are translated so
   they cannot be drawn as SVG paths.
3. **Six icons are missing** from the 18 the app ships: clock, book, shield,
   community, star, topic.
4. **No Brandenburg Gate line art** for the CTA band.

---

# Part 2 — Detailed task list

Each task states its acceptance criterion. `[file]` marks what it touches.

---

## Phase 0 — Palette, assets and foundations  ·  **DONE**

### 0.0 Palette — the mockup's blue, both themes  ·  done
`[index.html, tools/contrast.test.mjs, manifest.json, favicon.svg, og-image.svg]`

- 88 tokens rewritten across the two `:root` blocks by holding each neutral's
  relative luminance and shifting hue to slate (H 218).
- `LITERAL_PAIRS` updated for the four rule-level literals whose grounds moved:
  the brand mark, and the correct/wrong chip letters in both themes.
- `theme-color` meta, its two JS setters and `manifest.json` follow the canvas.
- `favicon.svg` and `og-image.svg` still carried `#BFFF00` from a palette two
  generations back; recoloured to the accent.
- **Accepted:** `contrast.test.mjs` 10/10, `scale.test.mjs` 12/12, verified
  rendered in both themes.
- **Left open — the social card needs a content fix, not just a re-render.**
  `og-image.png` is the rasterised copy of `og-image.svg`, so it still shows
  the old palette. But re-rendering it alone would be half a job: the card
  reads **"Berlin Quiz"** and **"310 FRAGEN"**, written when the app was
  Berlin-only. It covers all 16 states and 460 questions now. Fix the copy and
  the raster together, once someone decides the wording.


### 0.1 Source a portrait-friendly hero photograph  ·  done
`[docs/Mockups/photos/]`

The identified candidate is
[`File:Berlin, Reichstagsgebäude -- 2019 -- 6310.jpg`](https://commons.wikimedia.org/wiki/File:Berlin,_Reichstagsgeb%C3%A4ude_--_2019_--_6310.jpg)
— Dietmar Rabich, CC BY-SA 4.0, 6496 × 4331. It shows the German flag, the EU
flag and `DEM DEUTSCHEN VOLKE`, which is exactly the mockup's framing, and it
crops to portrait without losing the subject.

- Download at ≤ 3840px as `photos/hero-reichstag-flag.jpg`.
- Add its entry and credit line to `photos/ATTRIBUTIONS.md`.
- **Accept when:** the file crops to 4:5 and to 1:1 with the inscription and
  the flag both still readable.

### 0.2 Decide and wire the handwriting font  ·  done
`[index.html <head>]`

Recommended: **Caveat 400** from Google Fonts, appended to the existing
`css2?family=` request so it stays one stylesheet fetch.

- Add `--font-hand` beside `--font-head` / `--font-body`.
- Scope it to exactly two classes; it must never be inherited by body copy.
- **Accept when:** the font request is still a single `<link>`, and
  `--font-hand` appears in no rule other than the two annotation classes.
- **If rejected:** drop both annotations. They are decorative. Do not
  substitute an italic serif — it reads as a pull-quote, not a margin note.

### 0.3 Add the six missing icons  ·  done
`[tools/icon-packs.mjs, index.html]`

`clock`, `book`, `shield`, `community`, `star`, `topic`.

**Only four were actually new.** `clock` is the `history` glyph and
`community` is the `society` glyph — already drawn, already shipping. Those
two are one-line aliases (`ICONS.clock = ICONS.history`) rather than redrawn
paths, so there is one definition to maintain, not two.

- Draw them into the `solid` pack in `tools/icon-packs.mjs` **first**, so the
  contact sheet keeps documenting production, then copy into `ICONS`.
- Solid silhouettes with detail knocked out by `fill-rule="evenodd"`, on the
  same 24×24 grid as the existing 18.
- **Accept when:** `grep 'stroke="currentColor"' index.html` is empty, and all
  24 icons render at the same optical weight on the contact sheet.

### 0.4 Brandenburg Gate line art  ·  done
`[index.html]`

One decorative inline SVG for the CTA band, `--faint`, `aria-hidden="true"`.

- **Accept when:** it is a single path set, solid-filled not stroked, and
  omitting it leaves the CTA band correctly laid out. It is an ornament and
  must not be load-bearing.

---

## Phase 1 — The two-tier switch

### 1.1 Add `hasProgress()`
`[index.html <script>]`

```
hasProgress() = any spaced-repetition record in eib_progress_v1
              | any completed round in eib_history_v1
              | a resumable session in eib_session_v1
```

- Read through the existing accessors; do not re-parse `localStorage` inline.
- **Accept when:** it returns `false` on a cleared profile and `true` after
  one answered question, and `Reset progress` flips it back to `false`.

### 1.2 Restructure the home markup into two section lists
`[index.html]`

Both lists live in `#homeScreen`. `initHomeScreen()` shows one.

- `.home-landing` — hero, modes, why, stats, CTA.
- `.home-dashboard` — where you stand, modes, past rounds & glossary.
- The mode band is **one element**, moved between the two by DOM order, not
  duplicated. Two copies of five cards is two things to keep in sync.
- **Accept when:** exactly one of the two lists is in the DOM at a time, and
  no renderer is called for a band that is not showing.

### 1.3 Make `initHomeScreen()` the single door
`[index.html <script>]`

It already is; keep it that way. It branches on `hasProgress()` and calls only
the renderers the chosen tier needs.

- **Accept when:** finishing a first round and returning home switches tiers
  with no reload, and `Reset progress` switches back.

### 1.4 Retire `#topicSection` as a home section
`[index.html]`

`renderTopics()` survives untouched; only its mount point moves, into the
Topic card's reveal.

- **Accept when:** `home.topics.title` / `home.topics.lead` are deleted from
  `I18N` and no `data-i18n` references them.

---

## Phase 2 — Hero

### 2.1 Two-column hero shell
`[index.html]`

Text left, photo panel right. Single column below 940px, photo first.

- `--radius` on the photo panel; `object-fit: cover`.
- **Accept when:** the panel holds its aspect at 1600 / 1280 / 940 / 620 /
  375px with no letterboxing and no horizontal scroll.

### 2.2 Eyebrow, headline, lead
`[index.html, I18N]`

- Eyebrow takes `.eyebrow` and `--ls-caps` — reuse, do not restyle.
- Headline keeps `--fs-hero`. **Do not mint a larger token**; `--fs-hero` was
  set deliberately and a bigger value silently undoes phase 5 of the size
  system.
- New keys: `hero.eyebrow`. Rewrite `hero.headline` and `hero.lead` to the
  mockup's copy.
- **Accept when:** the headline sets on two lines at desktop width in both
  languages, and `scale.test.mjs` reports zero literal font-sizes.

### 2.3 Two buttons
`[index.html, I18N]`

`Start Now` (primary) and `Learn More` (secondary), both `--ctl-lg`.

- `Start Now` reuses `scrollToMain()`, retargeted at the mode band.
- `Learn More` scrolls to the why-band. There is no About page; do not link
  one.
- **Accept when:** both clear 44px, and both work with the keyboard.

### 2.4 Four feature chips — neutral icons, no plate
`[index.html, I18N]`

`300 official questions` · `All 16 federal states` · `German & English` ·
`60-minute test`, each a glyph above a two-line label.

- Icons: `allQuestions`, `bundesland`, `translate`, `clock`.
- **No tinted circle.** Glyph at `--icon-lg` in `--sub-text`; the hit area
  stays but has no fill and no hairline.
- **Accept when:** all four labels fit one line each at 375px in German, and
  no chip has a `background` or `border`.

### 2.5 Script annotation and quote card
`[index.html, I18N]`

- Annotation top-left over the photo, `--font-hand`, plus the curved arrow as
  an inline solid SVG.
- Quote card bottom-right, overlapping the photo's lower edge: `--surface`,
  `--radius`, `--border` hairline. **No shadow** — it is the one place the
  mockup uses one and the app does not.
- New keys: `hero.annotation`, `hero.quote`.
- **Accept when:** the card never covers the inscription, both strings
  translate, and at 620px the annotation is hidden rather than overlapping
  the building.

---

## Phase 3 — Mode cards, five up

### 3.1 Retire the featured card
`[index.html, index.html <script>]`

`.mode-card--featured`, `.mode-start-btn`, `.msb-arrow` and the `featured`
branch of `renderModes()` all go. Five equal peers.

- **Accept when:** `mode.start` is gone from `I18N` and no rule references
  `--accent-soft` as a card fill.

### 3.2 Five-card grid
`[index.html]`

`repeat(auto-fit, minmax(210px, 1fr))` — five up above ~1160px, then four,
three, two, one. No hardcoded 3+2.

- **Accept when:** no row is left with a single orphan card at 1600 / 1280 /
  1024 / 768 / 375px.

### 3.3 Card interior
`[index.html, index.html <script>]`

Icon beside the title, description, then the action row. Per §1.5 the icon
has no tinted plate and the arrow no disc. The card is the button, so peers
still carry no `Start` label — the arrow says it.

- Keep `.mode-time` in `.mode-head` pushed right by `margin-left: auto`. It
  was `position: absolute` once and printed on top of the title.
- Keep `.mode-flag`, the apricot chip when Smart Review has work due. It is
  the only colour allowed among the five.
- **Accept when:** no card's estimate collides with its title in either
  language at any width.

### 3.4 The Topic card and its reveal
`[index.html, index.html <script>, I18N]`

Fifth card. Clicking it expands the existing topic chips directly beneath the
grid, using the `details.glossary-wrap` + `summary` idiom already used twice.

- `renderTopics()` is reused as-is. Its mount moves; its body does not change.
- New keys: `mode.topic.title`, `mode.topic.desc`, `mode.topic.badge`,
  `mode.topic.time`.
- **Accept when:** picking a topic still calls `startMode('topic', key)`, the
  reveal is keyboard-operable, and the grid does not reflow when it opens.

### 3.5 Band heading and panel
`[index.html, I18N]`

Eyebrow `PRACTICE YOUR WAY`, `h2` `Choose Your Practice Mode`, one-line sub.
Centred. The mockup's pale panel behind the band is `--surface2`.

- `--surface2` is a well **inside** something, never a tile on the canvas.
  Here it is the band's own ground and the cards sit on it, which is the
  correct nesting — the cards take `--surface`.
- **Accept when:** in light, the cards read clearly against the band and the
  band against the canvas; `contrast.test.mjs` passes both themes.

---

## Phase 4 — Why-band and stats band

### 4.1 Why-band
`[index.html, I18N]`

Eyebrow `WHY EIB QUIZ?`, `h2` `Simple. Effective. Reliable.`, then four items:
icon, bold title, two-line body. Hairline separators between, never
`border-left` on each cell — a border draws a stray rule on the first cell of
a wrapped row. Use a 1px `gap` over the band's ground, as the results band
does.

- Icons: `book`, `shield`, `community`, `star`, all `--sub-text`, no plate.
- Bodies take `--lh-prose`; they are running text.
- New keys: `why.eyebrow`, `why.title`, and four × `{title, body}`.
- **Accept when:** four across above 940px, two across at tablet, one at
  375px, with no stray separator on any wrapped row.

### 4.2 Stats band
`[index.html, I18N]`

`300` · `16` · `2` · `60` with labels, hairline-separated, plus the second
script annotation at the right.

- Figures take `--font-head` and `--lh-tight`. They are **readouts**: they
  must not outrank the `h2` above them. Cap at `--fs-2xl`.
- Same gap-not-border separator rule as 4.1.
- New keys: `stats.*` (four label pairs) and `stats.annotation`.
- **Accept when:** at 375px the four wrap to 2 × 2 with no stray separator,
  and the annotation drops out rather than wrapping under the figures.

---

## Phase 5 — CTA band

### 5.1 The band
`[index.html, I18N]`

Eyebrow, `h2`, one-line lead, one primary button, the Brandenburg line art and
the third annotation.

- `--surface2` ground, `--radius`, no shadow.
- The button reuses `scrollToMain()`.
- New keys: `cta.eyebrow`, `cta.title`, `cta.lead`, `cta.button`,
  `cta.annotation`.
- **Accept when:** below 620px the art and the annotation are hidden and the
  band is heading, lead, button.

---

## Phase 6 — Header

### 6.1 Primary action in the header
`[index.html, I18N]`

`Start Practice` at the right of the header, **home screen only** — inside a
session the header already carries the back button and must not gain a second
action.

- Reuses `scrollToMain()`.
- `--ctl-sm`, rising to `--ctl-md` under `@media (pointer: coarse)`.
- New key: `nav.startPractice`.
- **Accept when:** it is absent on every screen carrying `body.in-session`,
  and the header still fits one line at 375px with both segmented controls.

### 6.2 Brand lockup
`[index.html, I18N]`

The mockup shows the flag mark, `EIB Quiz`, and the tagline
`Learn · Practice · Pass` beneath.

- The tagline is a new string and must go in `I18N`.
- Hidden below 620px — the header is a strip you glance at.
- **Accept when:** the flag mark's hex values are in `LITERAL_PAIRS` if any
  are written as literals.

---

## Phase 7 — Responsive and verification

### 7.1 Breakpoint sweep
At **1600 / 1280 / 1024 / 940 / 768 / 620 / 375px**, both tiers, both
languages, both themes:

- `document.documentElement.scrollWidth === innerWidth` at 375px.
- No band's heading wraps to three lines in German.
- Every control ≥ 44px, except the header's segmented switches, which are the
  documented exception.

### 7.2 Run the suites
```
node --test tools/contrast.test.mjs
node --test tools/scale.test.mjs
node tools/validate.js
```
A **falling** budget in `scale.test.mjs` must be lowered in the same commit.
A rising one is a regression.

### 7.3 Syntax and PWA
- Extract the final `<script>` block and `node --check` it.
- `node --check sw.js`; bump `CACHE` if any cached static asset changed.

### 7.4 Language sweep
Switch EN ⇄ DE on both tiers. No chrome string may stay in the other
language. Confirm `<html lang>` follows, and the German annotations carry
`lang="de"`.

### 7.5 Two-tier sweep
- Cleared profile → landing page.
- Answer one question, return home → dashboard.
- `Reset progress` → landing page again, with no reload.

### 7.6 Measurement, not eyeballing
Before reading any computed style in the preview pane, call
`document.getAnimations().forEach(a => a.finish())`. A tab that is not
painting leaves transitions at `currentTime: 0` **forever**, and
`getComputedStyle()` then returns the transition's start value. This produced
four phantom contrast failures in one previous session.

---

## Acceptance for the whole piece

1. A cleared profile lands on a page that reads as the mockup does, band for
   band, top to bottom.
2. A returning learner sees their accuracy first and never sees the marketing.
3. All five modes are reachable from the home screen, including Smart Review.
4. No icon anywhere on the page sits in a tinted plate or carries a hue of its
   own, except `.mode-flag`.
5. Both test suites pass; no budget has risen.
6. Both themes and both languages are correct at every breakpoint.
