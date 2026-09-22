# Plan — rebuild the home screen against the landing-page mockup

> **SUPERSEDED IN PART (2026-09-21, later the same day).** This plan's two-tier home
> screen — a landing tier and a dashboard tier chosen by `hasProgress()` — no longer
> exists. Home is the marketing page for everyone, always, and the app (Where you stand,
> the mode band, the topic reveal, Past rounds & glossary) moved to a second screen,
> `#practiseScreen`, reached from the header nav and from both landing CTAs. `hasProgress()`
> and every `data-tier` are gone. Everything else here — the components, the palette, the
> per-phase decisions — still stands; read CLAUDE.md's "HOME AND PRACTISE ARE TWO SCREENS"
> before touching either page.

Status: **Complete, 2026-09-21** — all eight phases, including 7.7. The one thing not
done is a check on the live site; every measurement here was against `python -m http.server`.

**Follow-up, same day — three of its rejections were reversed on request**, after a
rendered side-by-side showed the page reading much flatter than the mockup:

1. **The display tier above 22px went back up** (task 1.6's inherited sizing constraint).
   Measured at 1.14x, the page was 1.3-1.5x short of the mockup everywhere above the body
   tier. `--fs-hero` is `clamp(2rem, 5.2vw, 3.5rem)`, the section and CTA headings take
   `--fs-2xl`, the four headline numbers take `--fs-3xl`. The body tier and phases 1-5's
   line-box and padding work were NOT reopened.
2. **Task 3.5's panel shipped after all**, but as a RECESS rather than a `--surface2` slab
   — which is what the mockup actually draws, and the only reading that works in both
   themes. See CLAUDE.md for the two failed readings and why the cards did not move.
3. **The band's heading is centred**, with the state picker under it rather than opposite.

**Second follow-up, same day — the last three rejections went too**, after the live
site was put beside the mockup and read nothing like it. The request was explicit: override
any project rule that obstructs the refactor, *except* the icon artwork. So:

4. **§1.5's icon rule is reversed** — *and then mostly reinstated on 2026-09-21
   (`5dd5bf2`), on request: "use neutral colour shades for icons and not the accent
   colours". The plates stay, the HUES are gone. `[data-hue]` is one neutral rule
   (`--surface2` + `--sub-text`) and `--violet`/`--violet-dim` left the palette with the
   five mappings. The overview card's three readout plates were a one-day exception —
   they took the mockup's blue/green/amber back under "stay true to the mockup" and were
   **deleted on 2026-09-22 (`bc261c6`), when the readouts lost their plates entirely**,
   so `[data-hue]` is
   now neutral everywhere with no exception. Read CLAUDE.md's ICON PLATES block before
   reaching for colour.* What the reversal originally said: tinted plates are back behind
   the hero facts, the why
   marks and the mode-card icons, and the cards carry a per-card hue — that colour is most
   of why the mockup reads as a lively page. A glyph on the CANVAS still has no plate, and
   the icon DRAWINGS are still this app's own solid set, which is the one thing the request
   held back. Five hues, and not one new token beyond `--violet`: they map onto the
   `--*-dim` / `--*` pairs the palette already carried.
5. **§1.4 shipped.** The header has the centre nav and the globe dropdown, with the theme
   switch moved inside it. About and FAQs are `disabled` buttons carrying a Soon chip
   rather than links to nowhere.
6. **The light canvas is WHITE**, app-wide, because the mockup's page measures `#FEFEFE`.
   The whole light ramp was re-derived to nest DOWN from white; primary buttons take a new
   `--btn-fill` navy, since the mockup never fills a button with the accent blue.

**Third follow-up, same day — two more of its decisions were reversed**, on request,
after the dark theme was read against `claude-context-kit`'s dark-mode reference
screenshots rather than against the mockup:

7. **The header's Practise link is a LINK again, not the primary button.** Item 5's
   header shipped it as a `--btn-fill` pill; two items in a two-item nav should read as
   the same kind of thing, so it is `.nav-link`'s own shape and in `--accent-text`. The
   hero and the CTA band still carry the button. *(The SIZE step went on 2026-09-21,
   `5dd5bf2`: the whole header strip is one size, `--fs-2xs`, so Practise is drawn louder
   by colour alone. The hero's two buttons came down to match; the CTA band's kept
   `--fs-base`.)*
8. **Item 2's RECESS is light-only.** The mockup is light-only, and applying its downward
   panel to dark inverted the nesting ladder: the band was darker than the page with the
   cards raised back out of it. `theme-dark.md` §3 — "every level of containment steps
   LIGHTER ... monotonically, every time", reversing for a large text well and nothing
   else — so in dark the band is now a RAISED panel and the page is the darkest thing on
   screen. **The whole dark palette below (the "same shape, in slate" table and the
   constant-luminance re-tint) is superseded**: dark's neutrals are true greys now, per
   §2. Light is untouched and is still the mockup's.

See the 2026-09-21 "honest refactor against the mockup" section of `docs/TODO.md` for the
measurements, and `CLAUDE.md` for the rules as they now stand.

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

**All four were closed by Phase 0** (tasks 0.1-0.4) — kept here because each one
explains why its asset looks the way it does. The icon set is 24 glyphs now, not 18.

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
_Shipped in `aa52d34` (PR #78, squash-merged 2026-09-21, live on Pages)._

### 0.0 Palette — the mockup's blue, both themes  ·  done
`[index.html, tools/contrast.test.mjs, manifest.json, favicon.svg, sw.js]`

- 88 tokens rewritten across the two `:root` blocks by holding each neutral's
  relative luminance and shifting hue to slate (H 218).
- `LITERAL_PAIRS` updated for the four rule-level literals whose grounds moved:
  the brand mark, and the correct/wrong chip letters in both themes.
- `theme-color` meta, its two JS setters and `manifest.json` follow the canvas.
- **`CACHE` bumped in `sw.js`.** `favicon.svg` and `manifest.json` are both in
  `PRECACHE` and both served **cache-first**, and `activate` only evicts caches
  whose key differs from `CACHE` — so without the bump a returning visitor keeps
  serving the lime favicon and the old `theme_color` out of the existing cache.
- `favicon.svg` still carried `#BFFF00` from a palette two generations back;
  recoloured to the accent. `og-image.svg` carries it too and was left alone —
  see the deferred note below.
- **Accepted:** `contrast.test.mjs` 10/10, `scale.test.mjs` 12/12, verified
  rendered in both themes.
- **Deliberately deferred to Phase 7 — the social card.** `og-image.png` is
  the rasterised copy of `og-image.svg` and still shows the old palette, and
  the card reads **"Berlin Quiz"** and **"310 FRAGEN"** from when the app was
  Berlin-only. It is deferred rather than fixed because **this refactor decides
  the branding the card should carry** — redoing it now would mean redoing it
  twice. `tools/make-og-image.py` is written and ready; see task 7.7.
  **The SVG was repainted by hand mid-phase and then reverted.** `index.html`
  references only the PNG, so the repaint changed nothing a user sees and left
  the pair as two different cards — the exact drift the generator exists to
  end. Both stay on the old card until 7.7 regenerates them together.


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

## Phase 1 — The two-tier switch  ·  **DONE** (1.4 landed with 3.4)

### 1.1 Add `hasProgress()`  ·  done
`[index.html <script>]`

```
hasProgress() = any spaced-repetition record in eib_progress_v1
              | any completed round in eib_history_v1
              | a resumable session in eib_session_v1
```

- Read through the existing accessors; do not re-parse `localStorage` inline.
- **Accept when:** it returns `false` on a cleared profile and `true` after
  one answered question, and `Reset progress` flips it back to `false`.

### 1.2 Restructure the home markup into two section lists  ·  done
`[index.html]`

**Shipped as ONE section list with a `data-tier` attribute, not two lists.**
The planned shape — two wrapper elements with the mode band moved between them
— needs DOM surgery on every repaint to keep one band shared. It is not
needed: there is a single DOM order that reads correctly for both tiers,

> hero · where you stand · modes · topics · why · stats · CTA · past rounds

because the shared band sits in the same place in both. `initHomeScreen()`
toggles `hidden` on every `#homeScreen [data-tier]`; a section with no
`data-tier` shows in both tiers. Nothing is moved and nothing is duplicated,
which is what the "one element" rule was protecting.

- `[hidden] { display: none !important }` was added to the reset. Several of
  these sections set their own `display`, which beats the UA's `[hidden]`
  rule — without it the hero stayed visible on the dashboard tier.
- **Accept when:** exactly one tier's sections are rendered at a time, and no
  renderer is called for a band that is not showing. **Met** — verified in the
  browser, and `renderHomeStatus()` early-returns on `el.closest('[hidden]')`
  so the guard covers `onStateChange()` too, not just the door.

### 1.3 Make `initHomeScreen()` the single door  ·  done
`[index.html <script>]`

It branches on `hasProgress()` and calls only the renderers the chosen tier
needs. The two `clearSession(); renderHomeStatus();` call sites became
`clearSession(); initHomeScreen();` — dropping a resumable session can empty
the last thing `hasProgress()` was reading, and repainting only the card it
lives in would have left the dashboard tier up over nothing.

- **`#homeMain` moved from "Where you stand" to the mode band.** That id is
  what `scrollToMain()` targets, and "Where you stand" is hidden on the tier
  that has a hero — so the hero's CTA scrolled to a `display: none` element.
  This is task 2.3's retarget, done early because Phase 1 breaks it.
- **Accept when:** finishing a first round and returning home switches tiers
  with no reload, and `Reset progress` switches back. **Met** — measured both
  directions live: `recordAnswer()` → dashboard, `clearProgress()` → landing.

### 1.4 Retire `#topicSection` as a home section  ·  done, with task 3.4

`renderTopics()` survives untouched; only its mount point moves, into the
Topic card's reveal.

Deferred because the mount it moves INTO is built in task 3.4. Doing it here
would delete topic practice for the length of one phase. Until then
`#topicSection` carries no `data-tier` and shows on both tiers.

- **Accept when:** `home.topics.title` / `home.topics.lead` are deleted from
  `I18N` and no `data-i18n` references them.

---

## Phase 2 — Hero  ·  **DONE**

### 2.1 Two-column hero shell  ·  done
`[index.html]`

Text left, photo panel right. Single column below 940px, photo first.

- `--radius` on the photo panel; `object-fit: cover`.
- **Accept when:** the panel holds its aspect at 1600 / 1280 / 940 / 620 /
  375px with no letterboxing and no horizontal scroll.

### 2.2 Eyebrow, headline, lead  ·  done
`[index.html, I18N]`

- Eyebrow takes `.eyebrow` and `--ls-caps` — reuse, do not restyle.
- Headline keeps `--fs-hero`. **Do not mint a larger token**; `--fs-hero` was
  set deliberately and a bigger value silently undoes phase 5 of the size
  system.
  - **Superseded 2026-09-21** (see the header): `--fs-hero` IS larger now —
    `clamp(2rem, 5.2vw, 3.5rem)` — but raised deliberately, measured against
    the mockup and written down, which is the thing this rule was protecting.
- New keys: `hero.eyebrow`. Rewrite `hero.headline` and `hero.lead` to the
  mockup's copy.
- **Accept when:** the headline sets on two lines at desktop width in both
  languages, and `scale.test.mjs` reports zero literal font-sizes.

### 2.3 Two buttons  ·  done
`[index.html, I18N]`

`Start Now` (primary) and `Learn More` (secondary), both `--ctl-lg`.

- `Start Now` reuses `scrollToMain()`, retargeted at the mode band.
- `Learn More` scrolls to the why-band. There is no About page; do not link
  one.
- **Accept when:** both clear 44px, and both work with the keyboard.

### 2.4 Four feature chips — neutral icons, no plate  ·  done
`[index.html, I18N]`

`300 official questions` · `All 16 federal states` · `German & English` ·
`60-minute test`, each a glyph above a two-line label.

- Icons: `allQuestions`, `bundesland`, `translate`, `clock`.
- **No tinted circle.** Glyph at `--icon-lg` in `--sub-text`; the hit area
  stays but has no fill and no hairline.
- **Accept when:** all four labels fit one line each at 375px in German, and
  no chip has a `background` or `border`.

### 2.5 Script annotation and quote card  ·  done, with two deviations
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

## Phase 3 — Mode cards, five up  ·  **DONE**

### 3.1 Retire the featured card  ·  done
`[index.html, index.html <script>]`

`.mode-card--featured`, `.mode-start-btn`, `.msb-arrow` and the `featured`
branch of `renderModes()` all go. Five equal peers.

- **Accept when:** `mode.start` is gone from `I18N` and no rule references
  `--accent-soft` as a card fill.

### 3.2 Five-card grid  ·  done, with the grid spelled out
`[index.html]`

`repeat(auto-fit, minmax(210px, 1fr))` — five up above ~1160px, then four,
three, two, one. No hardcoded 3+2.

- **Accept when:** no row is left with a single orphan card at 1600 / 1280 /
  1024 / 768 / 375px.

### 3.3 Card interior  ·  done; the estimate moved rows
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

### 3.4 The Topic card and its reveal  ·  done
`[index.html, index.html <script>, I18N]`

Fifth card. Clicking it expands the existing topic chips directly beneath the
grid, using the `details.glossary-wrap` + `summary` idiom already used twice.

- `renderTopics()` is reused as-is. Its mount moves; its body does not change.
- New keys: `mode.topic.title`, `mode.topic.desc`, `mode.topic.badge`,
  `mode.topic.time`.
- **Accept when:** picking a topic still calls `startMode('topic', key)`, the
  reveal is keyboard-operable, and the grid does not reflow when it opens.

### 3.5 Band heading and panel  ·  heading done, panel rejected
`[index.html, I18N]`

Eyebrow `PRACTICE YOUR WAY`, `h2` `Choose Your Practice Mode`, one-line sub.
Centred. The mockup's pale panel behind the band is `--surface2`.

- `--surface2` is a well **inside** something, never a tile on the canvas.
  Here it is the band's own ground and the cards sit on it, which is the
  correct nesting — the cards take `--surface`.
- **Accept when:** in light, the cards read clearly against the band and the
  band against the canvas; `contrast.test.mjs` passes both themes.


### What phase 3 decided that the plan did not

**The grid's column counts are spelled out, not `auto-fit`.** `repeat(auto-fit,
minmax(210px, 1fr))` gives four columns at most real widths, and four columns of
FIVE cards strands the fifth on a row of its own — which is the very thing task
3.2's acceptance forbids. Only 5, 3 and 1 divide five cards without an orphan, so
those are the three layouts: five above 1160px, three to 620px, one below it.

**1160px is a new breakpoint, and German is what set it.** At five columns the
title box is about 167px whatever the viewport, because `main` caps the content
long before the screen does. `Prüfungssimulation` is one 18-character word and
does not fit. Two things followed: the 1160px break, and `hyphens: auto` plus
`overflow-wrap: anywhere` on `.mode-title` — the root already carries `lang="de"`
when the UI is German, so the browser hyphenates it properly, and the same pair
is what `.opt-num` uses for `Christusmonogramm`.

**The time estimate left the head row for the meta row.** Task 3.3 said to keep
it in `.mode-head` pushed right by `margin-left: auto`, and that was right for
three cards a row. At five it is fatal: a nowrap "approx. 60-90 min" claimed 115px
of a 165px row and `.mode-title`'s `min-width: 0` let it squeeze "All questions"
down to **13px wide, wrapped over three lines**. In the meta row it sits beside
the count, separated by the same `·` the featured card used, and it can wrap.
This is the estimate's third home; the rule's comment records all three.

**The reveal is a button with `aria-expanded`, not a `<details>`.** A `<details>`
needs its summary and its body inside one element, and here the summary is a card
in a five-column grid while the body has to span the whole row beneath it. The
disclosure pattern gets the same keyboard behaviour with no DOM gymnastics.
`#topicSection` sits BELOW the grid, so opening it cannot reflow the cards, and
`renderModes()` reads the panel's `hidden` to redraw `aria-expanded` — it runs
again on every language switch and would otherwise reset the button while the
topics were still showing.

**The `--surface2` panel behind the band was rejected.** Task 3.5 argued the
cards nest on it correctly. They do in light; in dark they cannot. The dark ramp
only goes UP — `--surface2` is 1.30 above the canvas and `--surface` is 1.15 — so
cards on a `--surface2` band read as wells sunk into it rather than tiles raised
off it, and there is no rung above to promote them to that leaves hover anywhere
to go. In light the same panel is a 1.03 step, which `CLAUDE.md` already calls
invisible. The band keeps the canvas; its eyebrow and heading are what mark it.

**The heading is not centred either**, because the band carries the state picker.
A centred `h2` with a right-aligned control on the same line reads as a mistake,
and `CLAUDE.md`'s rule that a control belongs to the section it changes outranks
the mockup's alignment. `.section-head--row` keeps heading left, picker right,
with the new eyebrow above.

**Superseded 2026-09-21** (see the header): both halves of this section were
reversed. The panel ships, but as a RECESS — the mockup's panel is *darker* than
its page and its cards are the page's own white, which is the reading neither
attempt here tried. The heading is centred and the picker sits UNDER it, so the
mistake this paragraph feared never arises; the picker still belongs to the
section it changes, which is what `CLAUDE.md`'s rule actually asks. See
`CLAUDE.md` for the two failed readings and the measurements.


---

## Phase 4 — Why-band and stats band  ·  **DONE**

### 4.1 Why-band  ·  done
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

### 4.2 Stats band  ·  done
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

## Phase 5 — CTA band  ·  **DONE**

### 5.1 The band  ·  done
`[index.html, I18N]`

Eyebrow, `h2`, one-line lead, one primary button, the Brandenburg line art and
the third annotation.

- `--surface2` ground, `--radius`, no shadow.
- The button reuses `scrollToMain()`.
- New keys: `cta.eyebrow`, `cta.title`, `cta.lead`, `cta.button`,
  `cta.annotation`.
- **Accept when:** below 620px the art and the annotation are hidden and the
  band is heading, lead, button.


### What phases 2, 4 and 5 decided that the plan did not

**The photograph is 1:1 at every width, and the crop is load-bearing.**
`img/hero-reichstag.webp` is a 1100×1100 square crop of the phase-0 download,
centred at 54% of its width so the German flag survives. Holding one aspect at
every width is what lets the overlays be placed in percentages that stay true.

**The margin note is top RIGHT, and the mockup's curved arrow is gone.** The
note sits on a photograph, so its ground is not a token and its ink is the
literal `#16233A`, registered in `LITERAL_PAIRS` against `#D0D3D8` — the
darkest pixel measured under it (210 of 255). That patch is the only clean sky
in the frame: the mockup's top-left corner is our EU flag, and every region the
arrow could have swept has a flagpole running through it, where a dark stroke
would simply vanish. **If the crop is ever redone, that measurement has to be
redone with it.**

**The quote card sits INSIDE the frame, not overlapping its lower edge.** As a
sibling of the photo it was positioned against the photo *plus its credit line*,
and landed on top of the credit. Both overlays are children of `.hero-photo`
now, so they are placed against the picture and nothing hangs into the flow.

**The photo carries a visible credit.** It is CC BY-SA 4.0, which asks for
attribution where the work is used, not only in `img/ATTRIBUTIONS.md`.
`.hero-credit` / the `hero.credit` string is that line; it is not decoration and
should not be tidied away.

**`--surface2` is NOT the ground for these bands.** Task 3.5 sanctions it for
the modes band because cards sit on it there. The why, numbers and CTA bands
hold no cards, so a `--surface2` slab on the canvas is the 1.03 step in light
that `CLAUDE.md` calls invisible. All three take the tile rule instead:
`--surface` plus a `--border` hairline.

**The hairline-separated band is now one rule, shared with the results
screen.** `.result-stats, .why-grid, .stats-grid` declare `gap: 1px` together.
Written separately it took `literalSpacing` to 3 and `gapRungs` to 8, both over
budget — the ratchet caught it on the first run. For the same reason the hero's
column gap is `--space-xl` and not `--space-2xl`: 40px is a gap rung nowhere
else in the sheet, and a ninth rung is the flat histogram the test watches for.

**Three margin notes, one class.** `.script-note` is the only rule that reads
`--font-hand`; phase 0 planned for two classes and one is enough.

**New plumbing, both one-liners:** `data-i18n-alt` in `applyStaticStrings()` for
the photo's alt text, and a boot pass over `[data-icon]` that fills static
markup from `ICONS`, so the icon set stays the single definition. `scrollToMain()`
became `scrollToId(id)` — there are three on-page anchors now, not one.


---

## Phase 6 — Header  ·  **DONE**

### 6.1 Primary action in the header  ·  done
`[index.html, I18N]`

`Start Practice` at the right of the header, **home screen only** — inside a
session the header already carries the back button and must not gain a second
action.

- Reuses `scrollToMain()`.
- `--ctl-sm`, rising to `--ctl-md` under `@media (pointer: coarse)`.
- New key: `nav.startPractice`.
- **Accept when:** it is absent on every screen carrying `body.in-session`,
  and the header still fits one line at 375px with both segmented controls.

### 6.2 Brand lockup  ·  done
`[index.html, I18N]`

The mockup shows the flag mark, `EIB Quiz`, and the tagline
`Learn · Practice · Pass` beneath.

- The tagline is a new string and must go in `I18N`.
- Hidden below 620px — the header is a strip you glance at.
- **Accept when:** the flag mark's hex values are in `LITERAL_PAIRS` if any
  are written as literals.


### What phase 6 decided that the plan did not

**The header CTA is hidden below 620px, not merely small.** Task 6.1's
acceptance asks it to fit one line at 375px beside both segmented controls, and
it does not: brand, two switches and a button come to roughly 390px inside a
343px content width. It is a marketing affordance, and ten pixels below it the
hero's own **Start now** does the same job, so down there it goes.

**It sits AFTER `.btn-primary` in the sheet.** Both are single classes, so as
written above it the rule lost every declaration to the base below it, and the
button first rendered at `.btn-primary`'s full 44px and padding. Moved below, it
takes `--ctl-sm` with the usual coarse-pointer bump — the same exception
`.brand` and `.session-back` already take.

**The brand mark is the flag, and two tokens died with the letter tile.**
`--ink-tile` and `--on-dark` existed only for the charcoal `E`; nothing else read
them, so both are gone from both `:root` blocks, along with the three entries in
`contrast.test.mjs` that asserted the old mark (two token pairs and the `#fff`
literal). The flag's three bands are literals written **inside the SVG**, not in
a rule: they are the German flag's own values, identical in both themes, and a
graphic carrying no text has no pair for `LITERAL_PAIRS` to hold.

**`EIB Quiz` is not in `I18N`,** because a product name is not translated — the
same reason the old `eib` was markup. The tagline is, as `nav.tagline`.


---

## Phase 7 — Responsive and verification  ·  **DONE**

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

### 7.7 Redo the social card  ·  done
`[tools/make-og-image.py, og-image.svg, og-image.png]`

Deferred here from Phase 0 on purpose: the card's branding follows whatever
this refactor settles on, so doing it earlier means doing it twice.

`tools/make-og-image.py` emits **both** files from one set of constants — they
used to be hand-synced and drifted, which is how the PNG kept a `#BFFF00` lime
two palettes after it was replaced. **Run for production 2026-09-21.**

What it decided: the mark is the German flag, the header's, replacing a drawn
tick that said nothing about the subject and was the last stroked glyph in the
project. The copy stays **descriptive** rather than the `EIB Quiz / Learn ·
Practise · Pass` lockup — a link preview is read beside its own URL, so the
space is better spent saying what the thing IS. `300` is the number the app's
own hero and stats band give; the 460 in the repo counts all sixteen states'
sets, of which a reader ever sees ten. The palette constants already matched
the phase-0 repaint and were not touched.

- Decide the wording against the shipped header's brand lockup (task 6.2).
- Run the script, commit **both** outputs together.
- **Accept when:** the card reads correctly at thumbnail size (it is never seen
  full width), the SVG and PNG agree, and no string on it contradicts the app —
  no "Berlin", and a question count that matches what the app actually offers.

---

## Acceptance for the whole piece

1. A cleared profile lands on a page that reads as the mockup does, band for
   band, top to bottom.
2. A returning learner sees their accuracy first and never sees the marketing.
3. All five modes are reachable from the home screen, including Smart Review.
4. No icon anywhere on the page sits in a tinted plate or carries a hue of its
   own, except `.mode-flag`. *(Reversed by follow-up 4 above, then largely
   restored on 2026-09-21: plates yes, hues no — bar the overview card's three.)*
5. Both test suites pass; no budget has risen.
6. Both themes and both languages are correct at every breakpoint.

---

## Post-review corrections (PR #79)

A diff review of the whole branch found three things the phases missed. All are
fixed on `landing-page-phase-1`; the reasoning is in `CLAUDE.md` and the
2026-09-21 block of `docs/TODO.md`.

1. **Task 2.3's retarget was half done.** `#homeMain` got the new id but
   `#whyBand` — the second `scrollToId()` target, added by task 3.2 — never got
   a `scroll-margin-top`, so "Learn more" scrolled it behind the sticky header.
   The rule is `#homeMain, #whyBand { scroll-margin-top: var(--header-h) }`.
   **Any future `scrollToId()` target joins that selector.**
2. **Task 1.2's tier switch did not cover the load-failure path.**
   `initHomeScreen()` returned on `loadFailed` before applying the tier, so an
   unreachable `questions.json` rendered both tiers at once. The tier is
   `loadFailed ? null : …` and is applied first.
3. **Task 3.1 left `--accent-hover` behind.** It was the featured card's hover
   fill alone; the token and its three `contrast.test.mjs` assertions are gone,
   and the two pairs still named after that card now name their real consumers.

Acceptance item 5 still holds after all three: contrast 10/10, scale 12/12, no
budget moved.
