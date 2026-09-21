# EIB Quiz — Project Status & TODO

_Last updated: 2026-09-21_

## Project status

Vanilla HTML/CSS/JS quiz for the German citizenship test, all 16 Bundesländer, served by
GitHub Pages from `main` (`index.html` + `questions.json` + `img/`). No build step, no
framework. Installable PWA with offline support.

**The app is two pages plus the session screens** (2026-09-21): **Home** is the marketing
landing page (hero, why, four numbers, CTA) and **Practise** (`#practiseScreen`) is the app
itself — Where you stand, the five mode cards, the topic reveal, Past rounds & glossary.
The header nav switches between them and both landing CTAs lead to Practise; `PAGE_SCREENS`
in `showScreen()` is what separates a page from a locked session view. The older two-tier
home screen (`hasProgress()` + `data-tier`) is retired.

**Shipped and live:**
- Real-asset image questions (all 43 present) with a "Bild fehlt" fallback.
- Question data externalized to `questions.json` (source of truth).
- Persistent progress with spaced repetition (`eib_progress_v1`), resumable sessions
  (`eib_session_v1`), Smart Review mode, and the "Where you stand" panel on Practise.
- Practice by topic (every question has a `category`).
- Results history with an exam pass-rate trend (`eib_history_v1`).
- Audio read-aloud (Web Speech API / TTS) and a bilingual glossary.
- SEO/meta, Open Graph + Twitter cards (rasterized `og-image.png`), JSON-LD, `favicon.svg`.
- Accessibility: `:focus-visible`, `prefers-reduced-motion`, `aria-live` results,
  `lang="en"` on English text and `lang="de"` on the German exam text, WCAG AA contrast in
  both themes (asserted by `tools/contrast.test.mjs`), ≥44px touch targets.
- Installable PWA with offline support (`manifest.json` + `sw.js`, network-first for
  HTML/data, PNG app icons in `img/icons/`).

**Quiz pool:** 300 general + 16 Bundesländer × 10 = **460** questions, all **bilingual (DE/EN)**.
The user picks a state on the home screen; the active pool is 300 general + the selected state's
10. (All 300 official general questions are covered — verified against the BAMF catalogue, 0 missing.
The 10 former `appExtra` questions Q301–310 were removed in PR #28 — not in the official PDF.)

---

## Open TODOs

### 1. Real image assets — _✅ DONE_
All 43 image questions now ship real assets (general coats of arms / maps / flags /
Reichstag photo + the state Wappen and map/flag questions under `img/states/<code>/`).
`node tools/validate.js` reports 0 missing, and no file is placeholder-sized.
Sources and credits: `img/ATTRIBUTIONS.md`.

### 2. Redesign — _✅ DONE, superseded_
The Bold Retro-Modernist editorial system (2026-06-26) was replaced by the current
**Bento** design system on 2026-07-16 — see the "App Shape" section of `CLAUDE.md`,
which is the live description of the visual system. The old Retro-Modernist brief has
been removed from this file: it described a design that is no longer in the tree and
was misleading to anyone picking up UI work.

### 2a. UI items from the 2026-09-19 accuracy audit — _done 2026-09-19_
Closed by the UI refresh branch (`ui/modern-minimal`), which is what they were deferred for.
- **Light-theme contrast** — fixed by re-picking the palette against
  `claude-context-kit/docs/reference/theme-light.md`: `--gold` `#E07A1F` → `#B45309` (5.02 on
  white), `--accent` `#0F9D8F` → `#0B7D72` (5.01), `--green` `#0E9F6E` → `#047857` (5.48).
  Two more the audit did not list also failed and are fixed: `--faint` at 2.6:1, and white on
  the light `--accent-fill` at 3.4:1 (the primary button and the mastery tile).
  `node --test tools/contrast.test.mjs` now asserts every pair in both themes, so this cannot
  regress quietly. `CLAUDE.md`'s claim that `#E07A1F` "reads as text on paper" is gone.
- **Exam timer scrolls out of view** — fixed: `#timer` is `position: sticky` at
  `top: var(--header-h)`, and `syncHeaderHeight()` measures the real header rather than
  guessing a breakpoint (it is 69px on a phone, not the 56px a fixed value would have used).
- **Touch targets under 44px** — fixed at the time, and the rule has since been restated:
  every CONTENT control (options, nav cells, the card's buttons, the progress-reset link)
  holds 44px via `--ctl-md`, and a `@media (pointer: coarse)` block raises the touch cases
  a rung. The header strip is a **deliberate exception** — `.seg-btn` is 28px and
  `.brand`/`.session-back` 36px, all clearing WCAG 2.5.8's 24px. The original claim here
  ("every button, select and summary measures ≥44px") has not been true since that
  exception was introduced; see the App Shape section of `CLAUDE.md`.

### 3. Deferred features (by choice, not blocked)
- **Streaks / daily goal** (was point 4) — skipped on request.
- **Shareable result card** (was point 8) — skipped on request.

### 4. Done
- ~~Service worker / offline PWA~~ — done 2026-06-20: real caching SW (network-first for
  HTML/data) + installable manifest; cleans up old May-28 caches on activate.
- ~~Rasterize the OG image~~ — done: `og-image.png` (1200×630) via resvg-js.
- ~~Refine topic categories~~ — done: targeted keyword fixes in `tools/categorize.js`.
- ~~Verify & include the 10 `appExtra` questions~~ — done 2026-06-21: all 10 confirmed real
  official questions (correct answers match) via public catalogue sites; folded into the pool.
- ~~Catalogue coverage check + all-states import~~ — done 2026-06-23: verified 0 missing vs the
  official 300; fixed 21 ü-mojibake questions; imported all 16 states (470 total) with a
  home state-picker (`tools/import-states.js`).
- ~~English translations for imported state questions~~ — done 2026-06-23: all 150 non-Berlin
  state questions now bilingual via `tools/translate-states.js`.
- ~~Explanations where missing~~ — done 2026-06-23: bilingual explanations added to all 150
  state questions via `tools/explain-states.js`; **every question now has DE+EN explanations**
  (validate enforces it).
- ~~Mobile: quiz buttons reflowed wrong~~ — done: deterministic flex order
  (Zurück+Beenden left, Weiter right).
- ~~Mobile: hero cut off after pull-to-refresh~~ — done: `scrollRestoration='manual'` +
  reset to top after the async home render (instant behavior) + on load/pageshow.

## Session developments (2026-06-20 → 2026-06-23)

Merged to `main` (PR #):
- **#3** Real image assets (Q21/130/209/226/311/318 → `<img>`; fixed Q55) + externalized
  `questions.json` + persistent progress with spaced repetition (Smart Review, resume, readiness).
- **#4** Removed the 8-day study plan.
- **#5** Practice by topic (added a `category` to every question).
- **#6** Results history (exam pass-rate trend), audio read-aloud (TTS), bilingual glossary.
- **#7** SEO/meta + Open Graph/Twitter + JSON-LD + favicon; accessibility (contrast,
  `:focus-visible`, reduced-motion, `aria-live`); safe performance.
- **#8 / #14** Documentation (status + TODOs).
- **#9** Installable PWA with offline support (real `sw.js`, manifest, PNG icons) +
  rasterized `og-image.png` + topic-category tuning.
- **#10** Fixed quiz nav buttons reflowing on mobile (deterministic order).
- **#11–#13** Fixed the homepage hero being cut off after pull-to-refresh (scroll reset after
  async render; PWA cache bump).
- **#15** Verified & folded in the 10 former `appExtra` questions (all real official questions).
- **#16** Diffed against the official BAMF catalogue: 0 missing; fixed 21 `ü`-mojibake questions.
- **#17** Imported all 16 Bundesländer (470 questions) with a home state picker.
- **#18** English translations for all 150 imported state questions (bilingual).
- **#19** Bilingual explanations for all state questions (every question now has DE+EN).
- **#20** Premium UI redesign: appended a "Premium UI redesign layer" at the end of
  `<style>` (palette unchanged) — depth/shadows, refined type scale, elevated cards & mode
  tiles, tactile option buttons, refined header/hero/buttons/score, entrance motion. Pure
  CSS (no markup/JS changes); verified via Puppeteer screenshots (home dark+light, quiz, end).

- **#21** Reimagined core-loop UX: animated score ring + percentage count-up on results,
  slim quiz progress bar, per-question entrance transitions, and answered-state option
  feedback (dim non-answers, pop the pick). Logic unchanged.
- **#22** Home reimagined as a dashboard: a "Übersicht" card with an animated readiness ring,
  key stats (Gemeistert/Fällig/Trefferquote) and the integrated Bundesland picker, replacing
  the flat stat-tile stack.
- **#23** Fixed the dashboard readiness ring reading 0% for active users; removed the
  mode-card difficulty pips; replaced all card/chip emoji with inline SVG line-icons;
  harmonized count badges (outlined) + meta row + buttons.
- **#24** Dashboard ring now shows **Trefferquote (accuracy)** — a meaningful arc from the
  first answer. Fixed the Bundesland select overflowing the dashboard card and the resulting
  horizontal slide on mobile: picker stacks full-width (`min-width:0`), plus
  `html { overflow-x: clip }` as a guard. Tiny arcs (<2%) hide the bar so the round cap
  never shows a stray dot.
- **#25** Fixed the hero background fill (diagonal seam from bad `::before` override in
  premium layer); restored the label chip; smooth symmetric gradient in both themes.

## Session developments (2026-06-26)

Merged to `main` (PR #):
- **#26** Docs: session changelog cleanup + the Bold Retro-Modernist redesign brief.
- **#27** Extracted all catalogue images from the BAMF PDF and wired them into the quiz
  (image-option assets under `img/` and `img/states/<code>/`).
- **#28** Removed the 10 former `appExtra` questions (Q301–310) — not in the official BAMF
  PDF (300 general questions). Pool is now 300 general + 160 state = 460.
- **#29** Redesign UI: the Bold Retro-Modernist editorial system (see point #2 above).
- **#30** Theme/readability pass: muted the heavy border/offset-shadow colour (`--ink`/`--border`)
  to a warm taupe (`#8E887A` dark, `#5A5246` light) so borders no longer read as stark
  white/black — body `--text` stays full beige/charcoal, so legibility is unchanged. Removed the
  `grayscale(100%)` image filter so **catalogue images always show in their true official colours**
  (the old hover-to-colour never triggered on touch devices). Made the quiz read-aloud (🔊) button
  a clearly outlined pill so it's no longer a faint dark-on-dark control.
- **#31** Docs: recorded the **ship-via-PR-and-merge** workflow preference in `CLAUDE.md`.
- **#32** Red-text legibility on dark: brand red `#BC2C2C` only clears ~2:1 as text on charcoal,
  so added a `--red-text` token (coral `#F2705C` on dark, brand `#BC2C2C` on light) and routed all
  red text/icons to it (stat values, score, FALSCH, bilingual toggle, timer, keyboard hints,
  review/results). Red **fills/borders** keep the brand red.

> **Token names in the dated blocks below are as they were on their date.** The
> `--spacing-*` family was renamed `--space-*` and then deleted on 2026-09-20, and every
> size literal quoted below became an `--fs-*` / `--ctl-*` / `--icon-*` token on the same
> day. These entries are a record of what was decided when, not a source of values to
> copy — `CLAUDE.md` is that.

## Session developments (2026-09-19)

Full accuracy + quality audit of the app. Findings fixed in the audit PR
(UI/CSS findings deliberately deferred to #2a above, to avoid colliding with in-flight
UI work):
- **Exam sampling was ~7x biased.** `.sort(() => Math.random() - 0.5)` is not a shuffle;
  over 20k simulated exams Q1 turned up 5022 times and late-catalogue questions 732,
  against an expected 2000 each. Replaced with a Fisher-Yates `sample()` helper —
  re-measured max/min ratio is now 1.21 (binomial noise).
- **`let history = []` shadowed `window.history`.** Both live in the same script scope, so
  `if ('scrollRestoration' in history)` tested the results array and the pull-to-refresh
  scroll fix from PRs #11–13 had never actually run (`scrollRestoration` stayed `"auto"`).
  Renamed the array to `resultsHistory`; verified it now reads `"manual"`.
- **Two stale `berlin` mode keys** (the mode was renamed `bundesland`): the end-screen title
  map fell back to "Fertig! 🎉" and the Verlauf list printed the raw string `bundesland`.
- **`resumeSession()` dropped `missedQuestions`**, so the end-screen wrong-answer review only
  covered mistakes made after a resume. Now rebuilt from the saved answers — derived rather
  than persisted, so sessions saved by older builds resume correctly too.
- **`overallAccuracy()` was cross-state**, unlike every other number on the overview tile:
  switching Bundesland kept the previous state's answers in the Trefferquote ring.
- **Metadata drift:** `manifest.json` claimed "310 amtliche Fragen" and carried
  `#050505` theme/background colours from the pre-Bento dark theme (near-black PWA splash in
  front of a light paper-grey app); `<title>`, description, OG/Twitter and JSON-LD all
  claimed Berlin-only / 300 questions. Canonical URL was already correct.
- **Cosmetics:** stripped the UTF-8 BOM before the doctype; removed a duplicate `answered`
  key in the `state` literal; `startMode('review')` no longer half-resets state before its
  early return; `sw.js` no longer caches non-OK responses (a 404 could become the offline
  fallback). `CACHE` bumped.

Data was clean: 460 questions, contiguous IDs, no mojibake, no empty or duplicate options,
every question bilingual with DE+EN explanations, 0 missing image assets. The 13 repeated
question stems are legitimate — the official catalogue repeats stems with different option
sets.

## Session developments (2026-09-19, quiz-screen pass)

Reworked the quiz screen's chrome against a screenshot review, plus one home-screen item.

- **Progress bar first, then one line of readouts.** `.quiz-progress` moved out of
  `.quiz-main` to the top of `#quizScreen`, above `#statsBar`, so it spans the card and the
  navigator.
- **The stats are no longer tiles.** `.stat` is a value + label on one line with hairline
  separators (`.stat-card` left the tile list and the class is gone). A fourth readout,
  **answered `n / total`**, joined them; it used to live in the navigator's header
  (`.sidebar-count` and `qnav.answered` were deleted). Measured 20px tall on desktop and
  17px at 375px, against ~60px for the old four tiles.
- **The card was compacted so the scrollbar is the exception.** `padding: 14px`,
  `--spacing-sm` on the meta row and `.quiz-nav`, `--spacing-md` on `.options`. At 994x734 a
  four-option text question now fits with `scrollHeight === clientHeight`; a four-image
  question still scrolls, which is the case the scroller exists for.
- **Back → Previous, paired with Next.** `quiz.back` became `quiz.prev`
  (Previous / **Vorherige** — "Zurück" was already the header's word for leaving the round),
  and `.quiz-nav` is `justify-content: flex-end`.
- **The navigator's shuffle toggle became three views.** Linear / Shuffle / Topics in a
  `.seg.qnav-seg`, driven by `state.navView` via `setNavView()`; `state.shuffled` stays the
  order and `shuffleRound()` is called only when the order has to change. Grouping is now the
  reader's choice rather than inferred from the round's length; Topics is dropped when the
  round has fewer than two categories. `ICONS.shuffle` went with the old button.
- **Reset progress is a corner glyph.** `.dash-foot` is gone; `.progress-reset` is a 44px
  icon button in the top-right of the overview card (`ICONS.reset`, `title` + `aria-label`).

Second round, same session:

- **Header switches shrank.** `.seg-btn` 38 -> 30px (36px on coarse pointers), `.brand` and
  `.session-back` 44 -> 38px (44px on coarse). The 44px floor still holds for everything that
  is content.
- **No hairline under the header in a session** — the page does not scroll there.
- **A global compact pass.** `--spacing-lg/xl/2xl` 24/32/48 -> 20/28/40, `.home-section`
  56 -> 40px, the hero one step shorter, and every display numeral one step down. The whole
  home screen's hero + overview card now fit one 755px viewport.
- **The keyboard hint left the question card** for `.quiz-topbar`, right of the readouts, and
  is hidden below 940px as well as under `@media (hover: none)`.
- **Previous is on the left, Next on the right** (the pairing tried first was reverted).
- Collapsed below 940px the navigator strip is 6px-padded — it was a 76px box around one
  line of text.
- `CACHE` bumped to `eib-cache-2026-09-20-compact-chrome`.

Verified in the browser at 1400px, 994px, 768px and 375px, both themes, EN and DE: no page scroll on the
quiz or results screens, `scrollWidth === innerWidth` at 375px, `node --check` on the script
and `sw.js`, `node --test tools/contrast.test.mjs` (10/10), `node tools/validate.js` clean.

## Session developments (2026-09-20, navigator + density)

- **Shuffle now looks shuffled.** `roundNumber()` gives every cell the question's place in the
  round as built, so a shuffled navigator reads 48, 263, 123 rather than 1, 2, 3. `#questionNum`
  uses the same helper, so the card and the clicked cell agree.
- **`showCurrentCell()` runs in the flat branch too** — it only ran when the list was grouped,
  so in a 300-cell list the current cell was usually off screen.
- **The overview panel:** the Linear/Shuffle/Topics switcher is pinned and `#questionNavGrid`
  is the scroller; sidebar 256 -> 248px with 12px padding; cells `minmax(40px)` with a 5px gap
  (5 columns, room for three digits); group heads and the seg one step shorter.
- **The question stopped being a box.** `.question-card` has no fill, hairline or padding; the
  options are the only boxes on the column. It is also `flex: 0 1 auto`, so it is content-sized
  rather than stretched down the screen with its buttons pinned to the bottom.
- **The readouts moved into the question column** (`.quiz-topbar` is now the first child of
  `.quiz-main`) and centre on it; the progress bar stays full-width above.
- **The keyboard hint moved under the card**, and "Pick an answer" (`quiz.pick`, `#answerHint`)
  was deleted.
- **The navigator's collapse control is `ICONS.chevron`** in a round 30px target, not `▼`.
- **Spacing pass on the question view.** Status band tight to itself and `--spacing-lg` clear
  of the question; meta -> question 14px, question -> options 16px, option gap 8px, footer 14px
  clear of the last option; 16px side gutter in session below 620px. Below 940px the collapsed
  navigator moved under the question.
- **Question and options compacted:** question `clamp(1.02, 1.5vw, 1.18rem)` (was 1.18-1.45),
  option 0.9rem in a 42px row (48px on coarse pointers) with a 26px letter chip, explanation
  0.86rem, and the speak/translate buttons 34px.

## Session developments (2026-09-20, mobile proportions)

- Expanded, the mobile navigator is capped so the whole panel stays under **35%** of the screen
  (`.sidebar-body.expanded` at 26svh); measured 34.2% at 360x780 with the question still above it.
- The quiz readouts got **bigger** (1.3rem desktop / 1.15rem mobile) and the row tightened to a
  9px gap and 0.58rem labels so all four stay on one line at 360px in DE as well as EN.
- The mobile header got **much smaller**: seg buttons 26px, back button 32px, brand mark 28px,
  header padding 6px — 44px total header height, down from ~56.

## Session developments (2026-09-20, quiet chrome)

- **The status row lost its separators**: 22px of whitespace instead of three hairlines,
  `--faint` 0.63rem labels, and **zeros are neutral** — green/red arrive with the first answer.
- **The label row above the question is plain text**: the category is `--faint` after a dot
  rather than a bordered pill, and speak/translate are borderless until hover.
- **The rule above Previous/Next is gone** everywhere, and the buttons are 38px / 0.84rem.
- **Below 940px the card stretches again** so the two buttons hold one position on every
  question, right above the overview strip (measured identical at 677px on Q1 and Q2 at 375px).
- **The navigator's cells were stretching.** `#questionNavGrid` became a flex child that fills
  the panel, and a grid defaults to `align-content: stretch` — so the auto rows grew and every
  cell was a tall slab with no row gap. `align-content: start` puts the slack at the bottom.
- **Option images no longer carry `loading="lazy"`** — see the gotcha in CLAUDE.md.
- **Contrast fixed in both themes.** With the card gone, an option is a tile on the CANVAS:
  light takes `--surface` (#FFF on #F2F3F5 — it was `--surface2`, a 1.02 step and the whole of
  the washed-out look) and dark goes one rung higher to `--surface2` (1.36), chip `--surface3`.
- **Icon-only buttons look like buttons again** (speak, translate, hint dismiss, home reset):
  borderless-until-hover made them read as decorations.
- **The question block is centred** in the room it has (`justify-content: safe center`, plus
  `margin-block: auto` on the content-sized card above 940px), and the meta line moved inside
  `.question-body` so it travels with the question.
- **Thin scrollbars** (6px, `--border-hover` thumb) on every scroller the app owns.
- **The explanation lost its 3px left accent**; the hairline carries the hue.
- Below 940px the hint container is hidden outright and the layout gap drops to 8px, so
  Previous/Next sit 24px above the overview strip rather than 86px.
- **More air around the question**: 3px progress bar, `--spacing-xl` between the status row and
  the question, `--spacing-lg` between the question and its options, `--spacing-lg` page padding
  in session.

## Session developments (2026-09-20, layout + progress bar)

- **The navigator panel is exactly as tall as the question section.** `.quiz-layout` became a
  2x2 grid with explicit `grid-area`s: row 1 is the readout strip over the question column, row
  2 is question + navigator, both stretched. Measured identical top and bottom at 1100x800.
- **The card fills its row everywhere**, so Previous/Next sit level with the panel's bottom
  edge, and the keyboard hint moved INTO that row between the two buttons (buttons down to
  34px to fit).
- **The progress bar became a track**: 8px, quarter marks drawn over the fill, lit leading edge.
- **Mobile navigator cells** are 34px/4px (measured 35x35, 8 across at 375px), and the strip
  keeps a 10px clearance under the buttons — the grid's row gap is 0 and Previous was sitting
  flush against it.
- **Bug: a practice round after an exam kept the exam's clock.** `startTimer()` shows `#timer`
  and no practice path hid it; `startMode()` now clears the interval and hides it for every
  non-exam mode.

## Session developments (2026-09-20, panel rows and gutters)

- **The panel starts at the readouts and ends at the question's content.** `.quiz-topbar` moved
  back into `.quiz-main` and `.quiz-nav` moved OUT of the card into its own grid row under the
  question column: row 1 is question-column + panel (both stretched), row 2 is the buttons.
  Measured at 1100x800 — panel top 100 = readouts top 100, panel bottom 733 = question body
  bottom 733, buttons at 749.
- **The question is top-aligned under the readouts again** (16px), so the readouts sit next to
  the question they report on rather than a centred block's worth of gap away.
- **One cell size for both layouts**: `minmax(30px, 1fr)`, 4px gap, 30px min-height — measured
  32x32, six across in the sidebar. The sidebar's cells were a third bigger than the strip's.
- **Wider gutters in session**: `--spacing-xl` sides instead of `--spacing-lg`, and the same
  value as the column gap between the question and the panel (measured 28px each).

## Session developments (2026-09-20, fixed panel + picture scale)

- **The navigator's height is fixed on desktop** — `clamp(300px, 56svh, 680px)`, `align-self:
  start`, `max-height: 100%`; undone below 940px where it is a collapsed strip. A first pass
  measured it against the question's content in JS (`syncNavHeight`, exact to a pixel); it was
  removed on request — a panel that changes height on every question is movement with nothing
  behind it.
- **The footer row rejoined the question column** and the card is content-sized again, so
  Previous/Next sit under the answers. `body.in-session .quiz-main { max-height: 100% }` is
  what keeps a long question shrinking into its scroller instead of spilling out.
- **`--spacing-2xl` under the progress bar**, so everything starts a clear step lower.
- **The footer row has a resting position on desktop**: a 50svh floor under `.question-body`
  puts Previous/Next at 622-623 of an 800px viewport (78%, 177px below) on every ordinary
  question; longer questions push them down from there. On mobile the floor is dropped and the
  column stretches, pinning them 10px above the overview strip on every question.
- **The exam withholds marks until the end**: no green/red, no explanation and no coloured
  navigator cell during the round (the cell says `qnav-answered`); the results screen then lists
  the whole paper — right, wrong and blank — beside the result card. The navigator is shown in
  the exam now, without its view switcher.
- **Desktop question view restructured**: the readouts are a grid item of `.quiz-layout`
  (`"main stats" / "main nav"`), so they sit above the navigator as a 2x2; the navigator starts
  COLLAPSED at every width with only the Linear/Shuffle/Topics switch showing; and the block
  rides 20% higher via a 40:60 pair of zero-basis grow spacers, which yield to the question
  before it scrolls.
- **Image grids are capped by viewport height** (`min(70%, 33svh)`, `min(92%, 26svh)` under
  400px) and stay 2x2 at every width, so a four-image question no longer scrolls — 0px
  overflow at 390px and 1280px.
- **Mobile: every block matches the question's width** — bar, buttons, tally and the overview
  panel all take the card's `--spacing-md` inset.
- **Both gaps now yield to content**: `.quiz-layout` is `flex: 0 1 auto` + `margin-block: auto`,
  so the room above and below the question is spent before `.question-body` scrolls
  (1280x900: 150/126 at rest, 40/16 on a four-image question, body 450 -> 670). The rigid
  shift and its 260px magic number are gone, and with the timer flattened the exam needs no
  special case at all.
- **Exam timer is a line, not a tile**; the exam no longer names the topic; the progress bar is
  one track (the unexplained quarter marks are gone).
- **Home mode icons are filled duotone glyphs on the title's line**, with no chip behind them;
  the featured card's edge is the same neutral hairline as its peers.
- **Image options are square frames with click-to-zoom**: uniform 1/1 boxes (crests were
  136-174px wide in an identical box), a hover veil on pointer devices, a quiet line under the
  question on touch, `z` for the keyboard, and a lightbox whose close button sits off the
  picture. `openZoom` stops propagation or looking at an image would answer it.
- **The exam screen takes the 15% too**, paid out of the question rather than slack (its clock
  costs it 341px of chrome against practice's 214px). Inside `@media (min-height: 780px)` it
  drops `.question-body`'s floor and lets the card fill: full 120px shift at 1280x800, buttons
  stable at 792, 0/8 questions scrolling. Gated at 780 because ungated it cost 8/8 scrolling at
  941x645 against 1/8 on the shipped build.
- **Phone: the readouts moved below Previous/Next** (`order: 1`, `--spacing-2xl` above), the
  header row gained 16px of air, the progress bar dropped 10px clear of it and gave the room
  back from below, and the tally shrank a step. The state picker's label and control share a row.
- **Contrast in the quiz view**, against `theme-{light,dark}.md` §2: the A/B/C/D chip was at the
  PLACEHOLDER tier in dark (4.68) and is now 6.46 / 9.29; `.stat-label`, `.stat-of` and
  `.question-category` went `--faint` -> `--muted` (4.52 -> 5.41 light, 5.67 -> 7.01 dark).
- **The featured exam card's edge is `--accent-line`, not `--accent`** — a saturated ring round a
  tinted fill is what marks the CORRECT answer, so the card read as "selected".
- **The results card states each number once**: the line restating the ring is gone, and the
  breakdown reads Correct / Wrong.
- **The block below the progress bar starts 15% down the screen**: `.quiz-layout` takes
  `margin-top: min(15svh, 50svh - 260px)`, moving the readouts, the question and the navigator
  together — at 1280x800 the readouts go 126 -> 246 and Previous/Next 614 -> 734, with 66px
  still beneath them. The cap keeps the shift and the body's 50svh floor from together
  outgrowing a locked screen (941x645 overflowed by 4px without it), so below ~750px tall the
  shift tapers instead of the question. The exam is exempt (`body.in-exam`, set in
  `showScreen()`): its clock already spends the slack the shift would use.
- **Image options scaled down 30%** (prompt image 294px): a four-image question fits without
  the body scroller. _Superseded 2026-09-20_ — the grid is ONE ROW above 620px and 2x2 below,
  capped against the viewport (`max-width: min(100%, 72svh)`), not 70% of the column.

## Session developments (2026-09-20, the size system)

The app had a rigorous, tested colour system and **no type or space system at all**: 103
literal font sizes, 54 off-scale spacing lengths, 14 control heights, 11 tracking values —
and an inverted hierarchy where the quiz screen's loudest text was the score counter, 44%
larger than the answer it counted, with eight tiers rendering under 12px.

- **Measured first.** `claude-context-kit/docs/reference/type-and-space.md` reads four
  shipping design systems out of their **live DOM** — Stripe (Sail), GitHub (Primer), Linear,
  Khan Academy (Wonder Blocks) — token layer and rendered layer separately. All four publish
  their whole scale on `:root`, so those are the systems themselves, not inferences.
  The finding that reframed the work: **compare the LINE BOX, not the ratio.** All four land
  their dominant UI line at 19.5-21px; this app was 16 x 1.6 = 25.6px.
- **`tools/scale.test.mjs` is the guardrail**, built as a RATCHET: every metric has a budget
  and fails both when a number rises and when it falls without the budget being lowered in
  the same commit. It found **four dead declarations on its first run**.
- **Every budget is now at target**: 0 literal font-sizes, 0 tiers under 12px, 0 off-scale
  spacing, 2 spacing literals (the results band's 1px hairline), 4 control heights, 2
  tracking values, 4 font weights.
- **The `--spacing-*` aliases are gone**; everything reads `--space-*`.
- **Past rounds is collapsed** behind a `<details>`, reusing the glossary's structure.

Measured, 1280x900 then 390x844:

| | before | after |
|---|---|---|
| home page | 2.46 / 3.35 screens | **1.58 / 2.35** |
| hero | 357 / 391px | **226 / 278** |
| overview card | 154 / 236px | **122 / 185** |
| past-rounds block | 480px | **46px** (closed) |
| exam card | 79px visible / 1029px down | **fully above the fold / 833px** |
| body line box | 25.6px | **20.8px** |

**A post-merge review of the range caught two regressions**, both since fixed: `--fs-hero`
was minted LARGER than the value it replaced (silently undoing the hero cut), and
`.option-btn`'s coarse-pointer height was mapped onto the same token as its base, so the
rule set the height it already had. Both are now rules in `CLAUDE.md`.

**Not met:** the gap histogram's top-2 share is 64% against a target of 80 (every gap is on
the scale; the app simply uses six rungs where the references use two), and mobile is 2.35
screens against a target of 2.2. Both are recorded in `docs/plans/sizing-system.md` §5.

**Process note:** phases 2-5 were pushed straight to `main` without a PR, against this
project's own workflow rule. They were reviewed after the fact instead.

## Session developments (2026-09-21, palette + landing-page phase 0)

**The UI refactor begins.** `docs/plans/landing-page-refactor.md` is the live plan: rebuild
the home screen against `docs/Mockups/ui/landing-page.png`, in 8 phases. **Phase 0 shipped
in `aa52d34` (PR #78, squash-merged 2026-09-21, live on Pages); phases 1-7 are open.**
Nothing about the home screen's structure has changed yet — this session changed the
palette underneath it and gathered the assets the hero needs.

**Two decisions were taken by the user and are recorded in the plan's Part 1:**
- The home screen becomes **two-tier**: the landing page on a first visit, the existing
  dashboard once `hasProgress()` is true. The mockup is a page for someone who has never
  taken the test; the current home screen is a returning-learner dashboard. Neither
  replaces the other.
- **Five mode cards, not the mockup's four**: All questions, Exam, State, Smart Review and
  Topic. Shipping the mockup's set verbatim would delete Smart Review's only entry point,
  and spaced repetition is a real feature with real stored data. `#topicSection` retires;
  Topic becomes a card that reveals the existing chips in place.

**The palette is now the mockup's blue, in both themes.** This is the whole of Phase 0's
risk, so the method is written down in `CLAUDE.md` rather than only here: **every neutral
holds its measured relative luminance and changes only hue** (slate, H 218). The dark
ladder had been tuned against `theme-dark.md` over two previous sessions, and re-tinting at
constant luminance preserves it by construction. Max drift across 32 neutrals: 0.006.
Measured after: light tile step 1.11, dark tile step 1.15, dark hairline 1.62 on a tile.

The accents are the mockup's literal values wherever they clear AA. `#2563EB` is 5.17 on
white, so the accent ships exactly as drawn. Green, amber and red do not: the mockup only
ever puts those on **fills**, and this app uses them as **text tiers** — `#10B981` is 2.54
on white, `#F59E0B` 2.15, `#EF4444` 3.76. Light therefore runs darker (`#047857` /
`#B45309` / `#CC2020`) while dark takes the mockup's own values. Red landed at `#CC2020`
rather than `#DC2626` because the latter measured 4.29 on the red tint and the fix that
kept `#DC2626` would have shipped a 4.51 squeaker.

**Also in Phase 0:**
- **Four icons drawn, two aliased.** `book`, `shield`, `star`, `topic` are new in both
  `ICONS` and `tools/icon-packs.mjs`. `clock` and `community` turned out to be the existing
  `history` and `society` glyphs, so they are one-line aliases rather than second drawings.
- **Caveat** added as `--font-hand`, in the same single Google Fonts request.
- **`GATE_ART`** — a Brandenburg Gate ornament for the CTA band, filled shapes only.
- **A hero photograph that crops to portrait.** `photos/reichstag.jpg` is a 2.6:1 panorama
  and the mockup's panel is square. `photos/hero-reichstag-flag.jpg` (Dietmar Rabich,
  CC BY-SA 4.0) holds the inscription and both flags at 4:5 **and** 1:1 — but only centred;
  crop right and `DEM` is lost.
- **`favicon.svg` still carried `#BFFF00`**, a lime from a palette two generations back.
  Recoloured. `og-image.svg` carries it too and was deliberately **left alone** — see the
  deferred note below: the SVG and the PNG move together or not at all.

**`docs/Mockups/` is new**, holding the design boards, the generated illustrations, and
licensed Wikimedia photography with full attribution. **Both illustration character sets
are complete** — female (`study-woman-dog` or `-cat` + `success-woman`) and male
(`study-man-dog` + `success-man`). Phase 2 ships ONE set and deletes the other, so the
same person appears in the hero and on the results screen. Two findings there are worth carrying:
- **The generated Germany maps must not ship.** Berlin, Hamburg and Bremen are absent — all
  three are states and all three are exam answers — the internal borders match no real
  boundary, and the Brandenburg Gate is drawn on the Baltic coast.
  `photos/germany-states-accurate.svg` (David Liuzzo, CC BY-SA 2.0 DE) replaces them.
- **The generated icon sheet must not ship either.** It is stroked, and this app's set is
  solid; using it would break the no-stroked-icons rule or leave two icon languages.

**Verified this session:** `contrast.test.mjs` 10/10 and `scale.test.mjs` 12/12 after the
swap, `tools/validate.js` OK, `node --check sw.js`, the extracted `<script>` block parses,
`grep 'stroke="currentColor"' index.html` empty, and both themes rendered at 1280x900 and
375x720 with `scrollWidth === innerWidth`.

**Re-verified after the review fixes, and again on `main` after the merge:** all of the
above, plus `manifest.json` parses, the DE/EN switch clean in both directions with
`<html lang>` following, the answered-state chips measured in both themes
(`#CC2020`/`#047857` on white in light, `#F87171`/`#10B981` with their dark inks in dark —
the four `LITERAL_PAIRS` entries), and a **fresh** 375px load holding both
`scrollWidth === innerWidth` and `scrollHeight === innerHeight` on the quiz screen.

**Deferred on purpose:** the social card. `og-image.png` still shows the old palette, and
the card reads **"Berlin Quiz"** and **"310 FRAGEN"** from when the app was Berlin-only.
Redoing it now would mean redoing it twice — **the landing-page refactor decides the
branding the card carries**, so it waits for Phase 7 (task 7.7).
`tools/make-og-image.py` is written and ready: it emits the SVG and the PNG from **one**
set of constants, because hand-syncing them is exactly how the PNG kept a `#BFFF00` lime
two palettes after it was replaced. It has not been run for production.
**`og-image.svg` was recoloured by hand mid-session and then reverted**, because that is
the very drift the script exists to end: `index.html` references only the **PNG**, so
repainting the SVG changed nothing anyone can see while splitting the pair into two
different cards. Both files stay on the old card until Phase 7 regenerates them together.

Nothing was checked on the live site; all measurement was against `python -m http.server`.

**Phase 0 was then reviewed as a diff, and four findings were fixed before the merge:**
- **`sw.js`'s `CACHE` had not been bumped.** `favicon.svg` and `manifest.json` both changed
  in the branch, both sit in `PRECACHE`, and both are served **cache-first** — and
  `activate()` only evicts caches whose key differs from `CACHE`. A returning visitor would
  have kept serving the lime favicon and the pre-repaint `theme_color` out of the very cache
  the deploy was meant to replace. Now `eib-cache-2026-09-21-blue-repaint`; verified live
  against the local server that the old key is evicted once the worker updates. **This is
  the standing note under "PWA updates" below, missed in practice the first time it applied.**
- **`og-image.svg` had been hand-repainted** — reverted, as described above.
- **`tools/make-og-image.py` did not XML-escape the copy** before it reached the SVG text
  nodes, while the docstring tells the next person to revise `LINE1`/`LINE2`/`STRAP`. An
  ampersand ("460 FRAGEN & 16 LÄNDER") produced a file that is not well-formed XML, which
  the PNG branch rendered happily — drifting the two outputs apart again. Now
  `xml.sax.saxutils.escape`, exercised against that exact case.
- **The script hardcoded `C:\Windows\Fonts`.** Elsewhere `svg()` wrote its file and then
  `ImageFont.truetype` raised a bare `OSError` naming a Windows path, leaving a fresh SVG
  beside an untouched PNG. Now a per-platform candidate list, first hit wins, with a message
  naming what to edit.

Two things were checked and deliberately **not** filed. **Caveat is dead weight but not a
download**: `--font-hand` has no `.script-note` to apply to yet, and the WOFF2 is never
fetched (only the Bricolage and Inter faces load), so it costs a marginally larger CSS
response rather than a font request. Same for the four unused icons and `GATE_ART` — all
staged for phases 1-7. And a 3px overflow first measured at 375px was an artifact of
resizing the viewport mid-session, which leaves `--header-h` stale; a **fresh** load at
375px is exact on both axes.


## Notes for future work
- **PWA updates:** when changing cached assets, bump `CACHE` in `sw.js` so installed PWAs
  and SW-cached browser tabs pick up the new version (otherwise users see a stale build).
- **Branch/merge:** because PRs are squash-merged, reset the working branch to `origin/main`
  (or cherry-pick) before the next change to avoid squash conflicts.
- **Egress:** **Wikimedia is reachable** — the 2026-09-21 session fetched the Commons API
  and `upload.wikimedia.org` directly (7 photos + an SVG). The older claim that it was
  blocked by the egress allowlist was true of some earlier environment and is not a standing
  limit. Pages deploy status is checkable via the GitHub Actions API ("pages build and
  deployment" runs).
- **Code gotchas** (biased shuffle, shadowed globals, mode-key renames, `lang="en"`) live in
  the Gotchas section of `CLAUDE.md`, which loads into every session. The reasoning behind
  each one is in the 2026-09-19 session block above.

## Session developments (2026-09-21, landing-page phases 1-7)

**Live on `main` as `19c6da8`** (PR #79, squash-merged 2026-09-21) — the landing-page
refactor plus the three post-review fixes below.

**Phases 1-6 shipped and Phase 7's verification ran; the refactor is done bar a live
check.** `docs/plans/landing-page-refactor.md` carries the full task-by-task record,
including a "what phase N decided that the plan did not" block per phase — read those
before touching any of this, because several of the plan's own instructions turned out to
be wrong and the reasons are the durable part.

**The home screen is two tiers over ONE section list.** `hasProgress()` picks the tier and
`initHomeScreen()` toggles `hidden` on every `#homeScreen [data-tier]`. The plan drew two
wrapper elements with the mode band moved between them; that is not needed, because there
is a single DOM order that reads correctly for both tiers (the shared band sits in the same
place in each). Nothing is moved and nothing is duplicated, which is what the plan's "the
mode band is one element" rule was protecting. `[hidden] { display: none !important }` went
into the reset — several of these sections set their own `display` and beat the UA rule.

**The landing tier is a hero, five modes, a why-band, four numbers and a CTA band.** The
hero photograph is `img/hero-reichstag.webp`: a 1100x1100 square crop of the phase-0
download, 161 KB, CC BY-SA 4.0 and therefore carrying a **visible** credit under it. Its
handwritten margin note sits top RIGHT — the mockup's top-left corner is our EU flag — over
the only clean patch of sky in the frame, and its ink is a literal registered in
`LITERAL_PAIRS` against the measured worst case, the same shape the zoom veil's entry uses.
The mockup's curved arrow was dropped: every region it could have swept has a flagpole
through it, where a dark stroke vanishes.

**Five equal mode cards; the exam's featured treatment is gone**, and with it
`.mode-card--featured`, `.mode-start-btn`, `.msb-arrow` and `mode.start` — the only place
any card said "Start" in words. "By topic" stopped being a home section and became the
fifth card, revealing the existing chips below the grid. Two things the plan got wrong
here: `auto-fit` strands the fifth card on a row of its own at most real widths (only 5, 3
and 1 divide five cleanly), and keeping the time estimate in the head row squeezed "All
questions" to **13px wide over three lines** once there were five columns. A new 1160px
breakpoint and `hyphens: auto` on `.mode-title` exist because of one German word,
`Prüfungssimulation`.

**The header has the flag, the lockup and a call to action.** `--ink-tile` and `--on-dark`
died with the charcoal `E`; nothing else read them, and three `contrast.test.mjs` entries
went with them.

**The `--surface2` panel the mockup draws behind its bands was rejected twice.** In light it
is a 1.03 step — invisible. In dark the ramp only goes up, so `--surface` cards on a
`--surface2` band read as wells sunk into it rather than tiles raised off it, with no rung
above that leaves hover anywhere to go. Every new band takes the tile rule instead.

**The scale ratchet earned its keep.** Writing a second `gap: 1px` took `literalSpacing` to
3 and `gapRungs` to 8 on the first run; the three new bands share one rule with
`.result-stats` now, and the hero's column gap is `--space-xl` because 40px is a gap rung
nowhere else in the sheet.

**Task 7.7 is done: the social card was regenerated.** `tools/make-og-image.py` ran for
production for the first time. The card now carries the German flag mark — the header's,
replacing a drawn tick that said nothing about the subject and was the last stroked glyph
in the project — over "Einbürgerungstest / Alle 16 Bundesländer / 300 FRAGEN · DE / EN ·
KOSTENLOS". No "Berlin", no "310". 300 is the number the app's own hero and stats band give;
the 460 in the repo counts all sixteen states' sets, of which a reader ever sees ten. Both
outputs came from the one run, as the script exists to guarantee.

**Verification.** contrast 10/10, scale 12/12 with every budget held, `validate.js` OK,
`node --check` on the extracted script and on `sw.js`, `manifest.json` parses, `CACHE`
bumped, `grep 'stroke="currentColor"'` empty, and **no NUL bytes** — one got into the
stylesheet from a Python octal escape (`'\00b7'`) and neither suite looks for that, so
check it by hand after any scripted edit. Swept at 1600 / 1280 / 1024 / 940 / 768 / 620 /
375px in both languages and both themes: no horizontal scroll, no heading over two lines,
and the only sub-44px controls are the documented header exceptions. The two-tier switch
was exercised end to end (cleared profile → landing, one real answer → dashboard, reset →
landing, all without a reload), and the in-session viewport lock still measures
`scrollHeight === innerHeight` on both the quiz and the results screen.

**Diff review of PR #79, and three fixes.** A careful pass over the whole
`main...landing-page-phase-1` diff found three things, all fixed on the same branch:

1. **Only `#homeMain` carried `scroll-margin-top`**, so the hero's new "Learn more" button
   scrolled `#whyBand` behind the sticky header — the eyebrow and the heading it was meant
   to reveal both hidden. The rule is `#homeMain, #whyBand { scroll-margin-top:
   var(--header-h) }` now: the TOKEN, because `syncHeaderHeight()` measures the real strip
   and a phone's header is 65px against the desktop's 76. Measured in the pane before
   (top 0, behind a 65px header) and after (top 65, flush under it).
2. **`initHomeScreen()`'s `loadFailed` guard returned before the tier was applied**, so a
   questions.json failure left every `[data-tier]` section at its markup default — visible
   — and rendered BOTH tiers at once: hero, why-band, numbers and CTA interleaved with the
   dashboard's empty headings, with the hero's buttons scrolling to the error card. The
   tier is computed as `loadFailed ? null : …` and applied first now. Reproduced against a
   copy served without `questions.json`, and re-checked after: all six tiered sections
   hidden, error card alone.
3. **`--accent-hover` was left behind by the featured card's removal** — no consumer in
   `index.html`, three live `contrast.test.mjs` assertions, and two more pairs still
   labelled "the featured exam card". The token is deleted and the assertions retargeted at
   the real `--accent-soft` consumers (the resume banner, an exam-mode picked option, a
   navigator cell), which also added the missing `accent-text`/`accent-soft` pair.

Re-ran after the fixes: contrast 10/10, scale 12/12 with every budget unmoved,
`validate.js` OK, `node --check` on the extracted script OK.

**Not done:** nothing was checked on the live site; all measurement was against
`python -m http.server`. Task 7.1's full breakpoint sweep of the QUIZ and RESULTS screens
was spot-checked rather than exhausted — those screens were out of this refactor's scope.
The three fixes above were written by the same session that reviewed the diff, so nobody
else has read them.
## Session developments (2026-09-21, closing the mockup gap)

**Live on `main` as `cd16686`** (PR #80, squash-merged 2026-09-21) — the branch's work
(`57593bd`) plus the four review fixes recorded below (`c0bdb28`). It was parked as a
visual judgement call nobody but its author had looked at; the user accepted it on that
basis and merged, which publishes to Pages. **The design was still never reviewed by a
second pair of eyes** — the review that unblocked it was correctness only.

**Trigger:** a rendered side-by-side of the live landing tier against
`docs/Mockups/ui/landing-page.png` — the page matched the mockup structurally and read
much flatter than it. Measured at **1.14x** (the mockup's 928px content column against
this app's 1060px) it came back **1.3-1.5x short everywhere above the body tier**: hero
38px against 59, the three section headings 22 against 30, the four headline numbers 28
against 39.

**The gap list was almost entirely prior decisions, not drift**, which is the finding
worth carrying. Of ten differences, seven were recorded rejections — the icon rule, the
band panel, the centred heading, About/FAQs, the globe dropdown, five cards instead of
four, no "Start" link text — and two more were the sizing system's own caps. Only the hero
fact labels were unexamined. The user was shown the split and chose three of the four
clusters; **the icon rule was NOT reversed and still stands** (no plates, no per-card hue).

**1. The display tier above 22px went back up.** `--fs-hero` is
`clamp(2rem, 5.2vw, 3.5rem)` (56px desktop, 32 on a phone, two lines in both languages),
`.section-head h2` and `.cta-copy h2` take `--fs-2xl`, `.stats-num` takes `--fs-3xl`, and
`.mode-card` padding is `var(--space-lg) var(--space-md)`. **The body tier did not move** —
phases 1-5 of the size system were about line boxes and padding, and none of that was
reopened. `--fs-3xl` now has a second consumer beside the score ring.

**2. The hero fact labels left the quietest tier.** `.hero-chip-label` was `--fs-2xs` in
`--muted` — the smallest type on the page in one of its two quietest tiers, carrying four
claims the hero is making. Now `--fs-xs` in `--sub-text`.

**3. The mode band is a RECESS, and that is the durable part.** Task 3.5 had rejected the
mockup's panel as `--surface2`, correctly: in light that is a 1.03 step off the canvas and
invisible, and in dark the ramp only goes up, so `--surface` cards on a `--surface2` band
read as wells sunk into it. But the mockup's panel is **darker than its page** and its
cards are the page's **own white** — so the band steps DOWN (`--band`: `#E7EBF3` light,
1.08 below the canvas; `#0A0E15` dark, 1.06 below) and the cards stay ordinary `--surface`
tiles, 1.20 above it in both themes. **Nothing on the band needed repainting**, which is
the tell that this is the right reading. It carries a `--border` hairline, because 1.06 and
1.08 are both under the 1.20 where `theme-dark.md` §5 says to draw the edge instead.
Its heading is centred and `#statePickerSlot` moved under it; `.section-head--row` is gone.

**Two attempts recorded in the CSS so they are not retried:**
- **A `--band-card` token**, moving the cards to `--surface2` in dark and `--surface` in
  light. The contrast test caught it immediately: `--faint` landed at **4.35** on a dark
  card (under AA) and `--hover` sat **1.04** from rest. The recess reading needs neither.
- **Bleeding the band out through `main`'s gutter** with a negative `margin-inline`, to buy
  the five cards back the width the panel's padding costs them. `main` is only capped above
  ~1140px, so below that the band ran flush to the window with its 16px corners cut off —
  confirmed in a render at 1000px. The card's own side padding was what the meta row
  actually needed.

**Checked against `HEAD` and NOT a regression:** `Prüfungssimulation` still breaks over two
lines at five columns. `.mode-title`'s box measures **135px before and after** (the flex
`min-width: 0` makes it independent of the card's width), against 152px of text.
`CLAUDE.md` claims the 1160px breakpoint makes that word fit on one line; **it does not,
and cannot** — `main` caps the content at 1060px, so five columns can never give it the
~182px it needs. Left as found; worth its own fix.

**Verified this session:** `scale.test.mjs` 12/12 with every budget unmoved,
`contrast.test.mjs` 10/10 with **five new pairs** (`text` and `muted` on `--band`;
`surface` and `canvas` against `--band`; `border` on `--canvas`, for the panel's own edge).
`border` against `--band` is deliberately **not** asserted — in light it measures 1.04 on
the panel, and there the fill's 1.20 step is what separates a card from its ground, `tools/validate.js` OK,
`node --check` on the extracted `<script>` block and on `sw.js`. Rendered and read at
1280x900 and 1000x2100 in light/EN, 1280x900 in dark/DE, and 375x812 in light/DE and
dark/DE. `scrollWidth === innerWidth` at 375px in German with an empty overflowing-element
list. Both tiers exercised — the dashboard tier by seeding `eib_history_v1` and
`eib_progress_v1`. Page height 1564 -> **1753px** desktop (+12%), **3.31 screens** at 375px
on the landing tier.

**Not verified:** nothing was checked on the live site — all measurement was against
`python -m http.server`, and the landing screenshots were taken with headless Chrome, whose
375px canvas mis-sized the page (the pane's own measurement was used instead). The quiz and
results screens were not re-measured: `.section-head h2` and `.cta-copy h2` do not exist
there, `--fs-3xl`'s score-ring use is unchanged, and `.mode-card` / `.topic-chip` /
`.state-picker` all ended the session on the same `--surface` they started on — but that is
an argument from the diff, not a measurement. `sw.js`'s `CACHE` was **not** bumped, and
should not be: this change touches neither `favicon.svg`, `manifest.json` nor the PNG
icons, and `index.html` is network-first.

### Diff review of PR #80, and four fixes

A separate session reviewed the branch above and found four things, all fixed on it. The
"argument from the diff, not a measurement" in the paragraph above is where two of them
were hiding.

1. **The recess was asserted for the card at REST and not for its STATES.** "Nothing on the
   band needed repainting" was true of the resting card and false of hover and press: in
   light a white card can only step down, and the panel is 1.20 beneath it, so `--hover`
   landed **1.067** from `--band` and `--surface3` **1.039** — under the 1.05 nesting floor
   the new `["surface","band",NEST]` pair applies to rest — and the hairline could not
   rescue a pressed card, because `--border` is 1.039 on that ground too (already known and
   accepted for the resting edge; its consequence for `:active` was not). `html.light
   .modes-band` now takes hover to `--surface2` and `:active` to `--hover`, for
   `.mode-card` and `.topic-chip`. Dark is untouched at 1.43 / 1.57. Two more FILLS pairs
   assert it; `surface3`/`band` is deliberately not one, being dark's press fill only.
2. **Two phone overrides restated their base value.** `.score-ring-pct` re-set `--fs-3xl`
   and `.ready-ring-pct` re-set `--fs-xl` inside the 620px block, so both were dead: the
   score ring shrank 190 -> 160px while its percentage stayed 36px, i.e. proportionally
   LARGER on the smaller dial. `.score-ring-pct` is `--fs-2xl` there now (measured 36px
   desktop, 28px below 620); `.ready-ring-pct`'s line was deleted rather than retuned,
   because that ring GROWS on a phone (88 -> 96px) and the numeral holding its size is
   right. **Pre-existing since `214e7ac`** — `scale.test.mjs`'s duplicate-property check is
   scoped per-scope and cannot see a media override that matches its base, so nothing but
   reading catches this class.
3. **The `.modes-band` header comment said `--space-xl` at the sides** where the rule sets
   `--space-lg`, contradicting the comment eight lines below it that exists to explain the
   choice; its opening sentence was also a fragment. Repaired.
4. **`--fs-xl`'s comment named a use no rule has** ("the phone's home headings" — those are
   `--fs-lg`). It now names its three real consumers.

**Verified by that session:** contrast 10/10 with the two new pairs, scale 12/12 with every
budget unmoved, `validate.js` OK, `node --check` on the extracted script, no NUL bytes. The
cascade was read out of the PARSED stylesheet in headless Chrome rather than argued — both
new rules are present, in the right media context, after the base rules and at higher
specificity. Ring numerals measured at two widths.

**Not verified there either:** the in-app browser pane would not paint or synthesise hover
(window hidden), so the light hover and press states are confirmed from the CSSOM and the
measured token values, **not from a rendered pixel**. Nothing was checked on the live site.


## Session developments (2026-09-21, honest refactor against the mockup)

The live site was compared against `docs/Mockups/ui/landing-page.png` side by side and read
nothing like it. **On request, every project rule that stood in the way was overridden** —
with one exception the request named: the ICON ARTWORK stays this app's own inline solid
set, so the mockup's outlined style was not chased.

The gap was not cosmetic. Sampled out of the mockup PNG rather than eyeballed:

| | mockup | was live |
|---|---|---|
| canvas | **#FEFEFE** (white) | `#F1F3F8` paper-grey |
| primary button | **#132338** near-black navy | `#2563EB` blue |
| the lower bands | pale panels `#F4F8FB` | grey recess + white tiles |
| hero facts | 4 **tinted 52px discs**, coloured glyphs | bare grey glyphs |
| mode cards | 4, tinted plate + **solid coloured arrow disc with a named action** | 5, all grey, corner arrow |
| why marks | 4 **tinted discs**, coloured glyphs | bare grey glyphs |
| header | centre nav + globe/EN dropdown + navy CTA | no nav, two segments, blue CTA |

### Three forks the user decided

1. **Five mode cards, not the mockup's four** — in the mockup's card style. Dropping Smart
   Review to make the grid match a picture is a product decision, and the answer was no.
2. **The white canvas goes app-wide in light**, not just on the landing tier.
3. **Full header match**, including the globe dropdown, with the theme switch moved inside it.

### What shipped

- **The whole light ramp was re-derived against a white canvas**, numerically, before any
  CSS was written — every value checked against the FILLS and PAIRS floors in one script,
  then re-asserted by the test. Light now nests **DOWN** from white, which reverses the
  direction of the old "raised surfaces go up towards white" rule. `--canvas`/`--surface`
  `#FFFFFF`, `--surface2` `#E9F0F8` (1.15), `--surface3` `#DAE3F0`, `--hover` `#EEF3FA`,
  `--band` `#F5F8FC` (1.065 below the page), `--border` `#E0E7F1` (1.245 on both).
  The four tints deepened a rung with it, because a `#EFF4FE` wash is 1.04 on white and
  invisible as a plate.
- **`surface / canvas` is the one FILL pair the contrast test no longer asserts**, and the
  reason is written into the list: at the top of the ramp a tile cannot step up, so the
  HAIRLINE carries a tile on the page — the argument `theme-dark.md` §5 makes for dark
  being out of fill room at the bottom, applied to light being out of room at the top.
- **Four new tokens**: `--btn-fill` / `--on-btn` (navy in light, the accent blue in dark —
  the mockup never fills a button with blue), `--on-hue` (the glyph on any solid hue disc,
  one value per theme because every light hue is a dark colour and every dark hue a light
  one; white on dark's `#A78BFA` is 2.72 and would have failed), and `--violet`/`--violet-dim`.
- **A hue-disc system that minted no other token.** `[data-hue]` maps five hues onto the
  `--*-dim` / `--*` pairs the palette already carried, so every plate in the app was already
  covered by `contrast.test.mjs`. The hero facts, the why marks and the mode-card icons read
  it; a glyph on the canvas still has no plate.
- **Mode cards**: a tinted `--radius-sm` plate above the title, and `.mode-go` replaced by
  `.mode-start` — a solid hue disc with a white arrow and the action named beside it
  (`mode.*.start`, five new strings, kept short because German decides that row's width).
  Per-card hues: exam blue, all questions green, your state amber, Smart Review **rose**
  (the one card where a warm alert hue says something true), by topic violet.
- **Header**: a centre nav, and one globe `<details>` menu holding both switches. About and
  FAQs are **`disabled` buttons carrying a Soon chip**, not links to nowhere — asked for
  mid-session. The menu closes on an outside click or Escape (two listeners, no state).
- **Answer options moved to `--surface2` in both themes.** The old light override existed
  because `--surface2` was a 1.02 step on paper-grey; on white that argument inverts.

### Two the ratchet caught, both real

- **`.opt-letter` set `background` twice in one scope** — the new line came BEFORE the
  chip's own rule, so `--surface2` won and the chip painted the same colour as the option
  it sits in. Merged into the one rule and moved to `--surface3`; the option's hover and
  `:active` went with it, because `--hover` steps DOWN from `--surface` in light and from
  `--surface2` that is both the wrong direction and a 1.03 step.
- **`gapRungs` rose to 8.** `--space-xs` (6px) was not a gap anywhere in this sheet and
  four new header rules made it one. All four are `--space-sm`, the rung that already
  carries the page.

### Verified

`contrast` 10/10 both themes with the new pairs, `scale` 12/12 with every budget unmoved,
`validate.js` OK (460 questions), `node --check` on the extracted script and on `sw.js`.
Rendered in headless Chrome and measured in the pane: **375px** `scrollWidth == clientWidth
== 375` with zero overflowing elements, in English and German; **German at 1265px** five
cards at 191px with every title and action row on ONE line, `Prüfungssimulation` included;
the quiz screen's `scrollHeight == innerHeight` at 375, 940, 1280 and 1400; the results
screen locked at 900 with `#endScreen` scrolling internally (8748/803) and all 33 review
items present. The globe panel sits inside the viewport at both 375 and 1280, its theme
switch works, and an outside click closes it.

`sw.js`'s `CACHE` was **not** bumped and should not be: this touches neither `favicon.svg`,
`manifest.json` nor the PNG icons, and `index.html` is network-first.

Shipped as PR #81, squash-merged to `main` as `1273f10`. A diff review of it found ten
things, all applied in PR #82 (`7debe81`) — the two that mattered were colour
regressions OUTSIDE the style block, where `contrast.test.mjs` cannot see them:
`manifest.json`’s theme/background colours and the `<meta name="theme-color">`
default were both still `#F1F3F8`, so an installed PWA painted a grey splash in
front of a white app. **`CACHE` was bumped there**, because `manifest.json` is a
cache-first `PRECACHE` entry. A third was a real regression this change introduced:
moving the two segments into the globe menu left the 620px rule that pins
`.header-controls .seg-btn` to 28px, which won on source order and handed a phone
four 28px targets inside an opened menu (44px now).

**Not verified at commit time:** nothing was checked on the live site. Two things were
confirmed as **pre-existing, not caused here**, by rendering `HEAD:index.html` the same
way — the question navigator's grid renders empty in a headless run, and `#nextBtn` is
`disabled` and near-invisible on dark before the first answer. Both reproduce identically
on the previous build and are left alone.


## Session developments (2026-09-21, landing polish: PRs #83-#87)

Five follow-up PRs after the mockup refactor and its review, each squash-merged to `main`
and deployed. Landing-tier height at the end: **2021px / 2.25 screens** at 1280x900,
**3464px / 4.27 screens** at 375x812; dashboard tier **1311px / 1.46 screens** at
1280x900. Measured against `python -m http.server`, not the CDN.

### `bc041f3` (#83) — the why band left its panel
Four claims in a tinted panel with hairline dividers read as a table. `.why-grid` left the
shared `.result-stats`/`.stats-grid` band rule for one of its own: no fill, no border, no
1px separator gap. The numbers and CTA bands keep the panel deliberately — a row of four
FIGURES is a readout and wants a frame. `contrast.test.mjs` gained `muted / canvas` and
`sub-text / canvas`: in light `--surface` IS `--canvas`, so the surface pairs covered it,
but in dark `--surface` is a rung above and they did not reach.

### `f3864f0` (#84) — footer, credit, and the phone's hero crop
`.site-footer` after `</main>`, hidden by `body.in-session` — a session screen is pinned to
the viewport and anything after `<main>` breaks `scrollHeight == innerHeight`. `main`'s
bottom padding came down from a literal 96px to `--space-2xl`. The photo credit moved out
of the hero. `.hero-photo` took 16/10 below 620px only, because `.hero-note` was already
hidden there and its ink is measured against the frame's sky above it.

Also in this PR, on request: the header's `.header-cta` went (the hero's own Start sits ten
pixels below it), and the theme toggle came out of the globe dropdown into the header row.
The two segs then wanted two sizes, and the `>` in `.header-controls > .seg .seg-btn` is
what keeps the row's 36px off the panel's 44px.

### `9737dea` (#85) — spacing and trims
Why-band air, all of it in margins and padding: the four columns stay 28px apart because
`--space-2xl` is not a gap anywhere in this sheet and using it would take `gapRungs` 7 -> 8.
Footer small print 52ch/`--fs-2xs` -> 76ch/`--fs-xs`. "Practise your way" and "Five ways in"
removed from the modes band. The Soon chip shrank by dropping uppercase and `--ls-caps`
rather than the type, because `--fs-2xs` IS the 12px floor. Hero buttons down a rung.

**That last one found a pre-existing bug by measurement.** `.cta-btn` set `min-height:
--ctl-lg`, `--space-xl` padding and `--fs-md`, and ALL THREE were dead: the markup is
`btn-primary btn-lg cta-btn` and `.btn-lg` sits ~440 lines later at the same single-class
specificity. That button had always rendered at `--ctl-md`. `scale.test.mjs` cannot catch
this — its duplicate-property check is per-scope and these are two scopes. I only caught it
because I measured the button to check a comment I had just written about it, and the
comment was false.

### `e22e508` (#86) — the mobile touch floor
A mobile pass found `CLAUDE.md` asserting something the CSS did not keep: "everything that
is CONTENT ... keeps 44px". `.quiz-nav`'s Previous/Next and `.end-actions`' three buttons
are sized down on purpose for visual weight, but neither rule had a coarse-pointer bump, so
the app's most-pressed control sat at **36px on a thumb**. Both take `--ctl-md` under
`@media (pointer: coarse)` now; 36px with a mouse, 44px on touch. The doc records that the
sentence was false and adds the general rule: a control shrunk for visual weight gets added
to the coarse block in the same change.

### `3d96f42` (#87) — hero 16/10 everywhere, footer built out
The hero is 16/10 at every width (495x309 desktop, 343x214 phone); the FILE is untouched and
still square. **The handwritten margin note went, and the crop is why**: its ink was a
literal measured against the one patch of clean sky, and a 16/10 centre crop drops the top
206 source rows, which is where all the sky is. Scanned at note size across the whole
visible band, the brightest darkest-pixel anywhere was luminance **15**. No position reads,
so the note went rather than the crop, and `LITERAL_PAIRS` went 8 -> 6 entries.

The footer became three columns over a legal bar. The Practise links are the real
`startMode()` calls; every Sources link was `curl`-checked (200 each), including the
catalogue PDF that ships in this repo. The copyright and the legal line are deliberately
TWO lines: a blanket "all rights reserved" spanning official BAMF catalogue text and a
CC BY-SA photograph would be false, so the copyright claims the app and the line beside it
names what the app does not own.

### Verified across all five
`node --test tools/contrast.test.mjs` 10/10 and `tools/scale.test.mjs` 12/12 with every
budget unmoved, after each one. `node tools/validate.js` OK (460 questions). `node --check`
on the extracted script and on `sw.js`. No horizontal overflow at 375 or 1280 in either
theme or language; quiz and results screens `scrollHeight == innerHeight`. Live HTML
byte-compared against local after #81.

### Not verified
- **No automated test covers any of the layout facts above.** Every height, ratio and
  touch-target figure here was measured by hand in the browser pane this session; nothing
  re-checks them on a later change. `scale.test.mjs` guards the token scales, not layout.
- The three external Sources URLs were checked once, today. Nothing re-checks them, and a
  dead source link is the kind of rot that shows up months later.
- The catalogue PDF is ~9MB and the footer links it directly. Confirmed served on the live
  site (HEAD 200, range fetch returns `%PDF`), but a full download timed out once out of
  three tries — that is a transient TLS failure, not a missing file, and it was not
  investigated further.
- Screenshots were read for every change, but the in-app pane refuses to repaint after a
  scroll, so mid-page views were captured by emulating a tall viewport instead. Layout that
  depends on the real viewport height (`svh` floors) was therefore measured, not seen.
- `docs/Mockups/ChatGPT Image Sep 21, 2026, 04_51_59 PM.png` is untracked in the working
  tree and is **not mine**. Left alone.


## Session developments (2026-09-21, the hero's fact chips came out)

**The four hero fact chips are gone**, on request: 300 official questions / All 16
federal states / German & English / 60-minute test. `.hero-chips`, `.hero-chip`,
`.hero-chip-icon`, `.hero-chip-label`, their two media-query overrides, the `<ul>` and
`hero.chip1`-`4` all went. They restated `hero.lead`, which sits one line above them and
says all four things in a sentence, and the numbers band restates them again further down
the page.

`ICONS.clock` went with them. It was an alias (`= ICONS.history`) minted for chip 4 and
had exactly one reader; the icon set is 23 drawings plus one alias
(`ICONS.community = ICONS.society`) now. No other `ICONS` entry lost its last consumer —
`allQuestions`, `bundesland` and `translate` are all still read by the mode cards and the
bilingual toggle.

**The desktop alignment needed no new CSS.** `.hero-landing` has carried
`align-items: center` since the refactor; with the chips gone `.hero-text` is 283px tall
against the photo's 309 and both centres measure 263.5px at 1280x900, so the columns sit
on one horizontal band with a symmetric 13px overhang. A margin or an `align-self` here
would be a second mechanism doing the first one's job.

### Measured after
Landing tier **1926px / 2.14 screens** at 1280x900 (was 2021 / 2.25) and **3328px /
4.10 screens** at 375x812 (was 3464 / 4.27). `scrollWidth == clientWidth == 375` with
zero overflowing elements. `node --test tools/contrast.test.mjs` 10/10 and
`tools/scale.test.mjs` 12/12, every budget unmoved. `node --check` on the extracted
script. `node tools/validate.js` OK (460 questions).

### Not verified
- Only the landing tier was re-measured. The dashboard tier, the quiz and the results
  screens were not touched and were not re-checked.
- The DE switch WAS re-run: `#langBadge` follows, the headline becomes
  `Der deutsche Einbürgerungstest`, no `[data-i18n]` element renders empty, and the two
  hero columns stay centred at 264/264 in German too.


## Session developments (2026-09-21, mode cards + the update path)

### The mode band's air
`padding-block` `--space-2xl` -> `--space-xl` and `padding-inline` `--space-lg` ->
`--space-md`; the band is 522 -> 473px. The cards' own padding was not touched — the
roominess was the panel's, above the heading and below the last row.

### The estimate joined the count's line, behind a clock
`.mode-time` wrapped to a second row in every card. Four changes together bought the one
line, and the card content box is 165px so none of them alone is enough:

1. the count came down to `--fs-2xs`, the estimate's own size ("300 questions" 95 -> 81px);
2. the strings dropped "approx."/"ca." and "limit" — the clock glyph is what says
   *duration*, so `60–90 min` carries what `approx. 60–90 min` did;
3. `.modes-grid`'s gap `--space-md` -> `--space-sm` and the band's side padding
   `--space-lg` -> `--space-md`, worth +8px of card;
4. both gaps in the row are `--space-2xs`. `--space-xs` (6px) is deliberately NOT a gap
   rung here — `gapRungs` is budgeted at 7 and 6px was merged away — so using it fails
   the ratchet. Tried, caught, reverted.

Worst case is **English** "All questions": 81.2 + 4 + 14 + 4 + 59.9 = **163.1 in 165**.
German clears by ~15. `white-space: nowrap` is the guarantee: a longer translation
overflows visibly rather than quietly becoming two rows again. `ICONS.clock` came back
(an alias for `ICONS.history`, which is literally a clock face) hours after being deleted
with the hero's fact chips.

### The action row flipped and centred
`.mode-start` is now label-then-disc, centred in the tile. The hover animation is
untouched — `translateX(3px)` on the disc, which now slides away from the label instead
of into it. On a phone the row stays hard left: the card is a list row there, with title,
description and meta all flush left.

### The update path: a network-first worker was only half of it
The reported symptom was a tab that keeps showing an old build through a hard refresh.
`sw.js` was already network-first with `cache: 'reload'` on both fetch paths; the
registration was the gap. Three additions in `index.html`:

- `updateViaCache: 'none'` — the worker script itself must not come from the HTTP cache,
  or the browser compares a stale `sw.js` against itself and installs nothing. The
  `cache: 'reload'` trap, one level up.
- `reg.update()` on load and on `visibilitychange` — a left-open tab may go days without
  the navigation that would otherwise be the only check.
- `controllerchange` -> `location.reload()`, with three guards: only if the tab already
  had a controller, never while `body.in-session`, and at most once per tab (stamped in
  `sessionStorage`, so the bound survives the reload). A reload loop would be worse than
  a stale tab. `localStorage` is untouched by a reload, so progress, the resumable
  session and the history all survive.

`CACHE` bumped to `eib-cache-2026-09-21-mode-card-meta`.

### Verified
`contrast.test.mjs` 10/10, `scale.test.mjs` 12/12 with every budget unmoved,
`node --check` on the extracted script and on `sw.js`, `manifest.json` parses,
`validate.js` OK. Meta rows measured one line (16px, zero overflow) in **both** languages
at 1280 and at 375; no horizontal overflow at 375. Network-first proved locally with a
persistent Chrome profile: registered the worker, edited `index.html`, reloaded, and the
second load through the worker carried the edit.

### The swap, verified in a real browser (same day)
Headed Chrome, driven over CDP, against `python -m http.server`:

| check | result |
|---|---|
| worker registers, controls the tab on the next load | yes (`regs: 1`, `controller: true`) |
| ordinary reload of a controlled tab serves freshly edited HTML | yes — marker added to `index.html`, no new `sw.js`, no hard refresh |
| new `sw.js` while the tab sits open | tab reloaded ITSELF once (loads 1 -> 2), new cache in, old evicted |
| a SECOND deploy right after | no reload (loads stayed 2) — the once-per-tab stamp holds, no loop |
| deploy while `body.in-session` | no reload, and no stamp written — the guard returns first |
| `localStorage` across the swap | intact |
| network emulated offline | all five mode cards render from cache |

**The profile must not live under `%TEMP%`.** A throwaway profile there had CacheStorage
fail outright — `caches.open()` threw "Unexpected internal error" with 10GB of quota free
and IndexedDB healthy — which is why the first three attempts (two headless, one headed)
reported `getRegistrations(): 0` and looked like the app's fault. The same Chrome with a
profile under the repo worked on the first try. The in-app preview pane will not register
a worker either.

### The bug that broken profile exposed
`caches.open()` rejecting inside `install` rejected `event.waitUntil`, the worker went
redundant, and **the whole registration was discarded** — no worker, so no network-first
either. The old `.catch(() => {})` only covered `addAll`, not `open`. `sw.js` now routes
every cache call through `safeOpen`/`safeMatch`/`safePut`, wraps `activate`'s sweep, and
writes the network-first response through `safePut` so a broken cache cannot turn a good
network response into a failed navigation. No cache means no offline; it must not mean no
app. Re-verified after the change: clean baseline (loads 1, no stamp), one deploy, loads
2, stamp set, new cache, five cards rendering.

### Still not verified
- Whether the user's original staleness was the registration or the GitHub Pages CDN's
  own `max-age=600` on HTML. The CDN window is not something the client can fix.
- Everything above was measured on `http://localhost`. The live site is HTTPS behind a
  CDN; the worker logic is the same, the timing is not.


## Session developments (2026-09-21, Home and Practise split into two screens)

### What moved
`#practiseScreen` is a new `.screen` holding **Where you stand · the mode band · the topic
reveal · Past rounds & glossary**. `#homeScreen` keeps the hero, the why band, the four
numbers and the CTA band, and is the landing page for **everyone, always**. Nothing was
duplicated: the three sections were lifted out of the home screen's DOM and dropped into
the new one.

Three choices were put to the user before any code moved:

1. **Name** — "Practise" (DE "Üben"), not "Dashboard" or "App".
2. **The two-tier home screen is retired.** `hasProgress()` and every `data-tier` are gone;
   there is nothing left to choose between when each half has its own page.
3. **Past rounds moved too**, with the glossary it shares a section with.

### What that forced
- **`PAGE_SCREENS`**, because `body.in-session` was computed from `screenName !== 'home'`.
  Left alone it would have locked the Practise page to the viewport, hidden its footer and
  hidden the very nav the user arrived by. A page scrolls; a session is locked.
- **`syncNav(screenName)`** moves `.nav-link--active` and `aria-current="page"` between the
  two links, from `showScreen()`, so the underline and the screen-reader state cannot drift
  apart.
- **Both landing CTAs navigate** (`showScreen('practise')`) instead of `scrollToId('homeMain')`.
  `#homeMain` is gone and the scroll-margin rule is `#whyBand` alone — "Learn more" is the
  one on-page anchor left.
- **Leaving a round returns to Practise**, both `#sessionBack` branches. You came from the
  app; the sales pitch is not where a finished round belongs.
- **A load failure is not a tier either.** The two data-dependent sections carry
  `data-needs-data` and `initHomeScreen()` hides them when `loadFailed`, leaving the error
  alone in the mode grid.

### Also on request, same session
- **About and FAQs left the header**, with `.nav-soon`, the `[aria-disabled]` state rule and
  `nav.navAbout` / `nav.navFaqs` / `nav.soon` / `nav.soonTitle`. They were chips promising
  pages that do not exist.
- **Practise wears the primary button** (`.nav-link--cta`: `--btn-fill` / `--on-btn`, pill,
  `.btn-primary`'s brightness hover). It keeps the pill on its own page, because
  `.nav-link--active` would square the corners off and repaint the label `--text`, which on
  that navy is unreadable in light; `aria-current` still carries the state.

### A mobile route that was measured and rejected
Below 620px the nav is hidden, so Practise would have been reachable only by the hero's
button and Home only by the logo. A **one-item nav** ("the page you are not on") was tried:
at 375px the content row is 343, the brand is 77 and the controls are 211, leaving **55px**
for a link that sets 56 ("Home") to 71 ("Practise"). Dropping the nav's auto margins changed
nothing — the row is simply full, and removing About and FAQs freed none of it because the
whole nav was already hidden down there. So the phone keeps the conventional pair: the hero
and CTA buttons in, the brand mark out. The measurement is recorded in the 620px block so
the next person does not re-try it.

### Verified
`contrast.test.mjs` 10/10, `scale.test.mjs` 12/12 with every budget unmoved, `node --check`
on the extracted script and `sw.js`, `manifest.json` parses, `validate.js` OK (460).
In the browser: both pages render and the nav mark follows; a round started from Practise
locks the page — measured in real Chrome over CDP at **375x812, 620, 940 and 1400**, on a
four-image question with the navigator expanded, `scrollHeight == innerHeight` on the quiz
AND the results screen at every one, zero horizontal overflow;
`#sessionBack` lands on Practise with the history repainted; the phone round-trip
(hero button in, brand mark out) works with **zero overflowing elements at 375px**; the DE
switch leaves no `[data-i18n]` element empty. Practise measures 1217px / 1.35 screens at
1280x900 with no progress recorded.

### Not verified
- **No automated test covers the split.** `showScreen('practise')`, `PAGE_SCREENS` and
  `syncNav()` are exercised by hand only, like every other layout fact in this file.
- The browser BACK button still does nothing for either page — the app has never had
  routing, and this change did not add any. Reloading always lands on Home.
- A returning learner now needs one extra tap to reach the app (Home → Practise). That is
  the cost of retiring the tiers, and it was the user's call.

### One phantom failure worth knowing about
The first pass of that lock check, run in the in-app pane, read **819 against an 812
viewport** on the phone. It is not the app: `syncHeaderHeight()` runs off a
`ResizeObserver`, whose callbacks the rendering loop delivers, and a HIDDEN pane does not
run that loop — so after resizing the pane to 375 the header really was 68px while
`--header-h` still said 61, and `main`'s `calc(100svh - var(--header-h))` overshot by
exactly the difference. Calling `syncHeaderHeight()` by hand fixed it on the spot, and real
Chrome never showed it. Added to CLAUDE.md's gotchas beside the `rAF` and screenshot ones.


## Session close (2026-09-21, evening)

Four PRs merged to `main` in this session, each squash-merged and live on Pages. Live
commit at close: **`3ea3ce1`** (`Split the app onto its own Practise screen (#91)`).

| PR | What it did |
|---|---|
| [#88](https://github.com/thelivinsine/eib-quiz/pull/88) | Dropped the hero's four fact chips; the two hero columns centre against each other with no new CSS |
| [#89](https://github.com/thelivinsine/eib-quiz/pull/89) | Tightened the mode band, put the estimate on the count's line behind a clock glyph, hardened the service-worker update path |
| [#90](https://github.com/thelivinsine/eib-quiz/pull/90) | Kept the worker alive when CacheStorage fails — found while verifying #89 in a real browser |
| [#91](https://github.com/thelivinsine/eib-quiz/pull/91) | Split the app onto `#practiseScreen`; removed About/FAQs; made the nav's Practise link a primary pill |

A dark-mode pass over the Practise page closed the session: rendered in real Chrome with a
finished round and a half-played one seeded, every text element measured against the
background it is actually painted on. All clear their floor — worst is the new nav pill at
**5.17** (white on `#2563EB`, floor 4.5); section and band headings 15.6 / 16.5; mode
description 8.36; dash label, mode meta and the reset glyph 6.12; footer link 10.14. At
375px dark: zero horizontal overflow, zero overflowing elements. **No code changed** as a
result, so there is no PR for it.

### Not verified at close
- **Nothing on the live site was re-checked after any of the five merges.** Every
  measurement in this session was taken against `python -m http.server` on localhost.
- **No automated test covers the screen split, the nav, or the service-worker update
  path.** `contrast.test.mjs` and `scale.test.mjs` guard the token scales only; everything
  layout- or routing-shaped here was measured by hand.
- **The service worker's auto-reload was verified on `http://localhost`, not over HTTPS
  behind the Pages CDN.** The logic is identical; the timing is not, and the CDN's own
  `max-age=600` on HTML is outside the client's control.
- **The browser Back button still does nothing** for either page — the app has never had
  routing and this session did not add any. A reload always lands on Home.
- `docs/Mockups/ChatGPT Image Sep 21, 2026, 04_51_59 PM.png` is untracked in the working
  tree and is **not mine**. Left alone, as in the previous session.

---

## Session close (2026-09-21, review of #88–#91 and its five fixes)

Live commit at close: **`fe8f3ca`** (`Apply the five findings from the review of #88-#91`),
squash-merged straight to `main` and pushed. **No PR** — a minor ending, on request: five
smallest-possible fixes to a range already reviewed in this session, with nothing in them
for a second reviewer to weigh.

A review session, not a building one: `git diff 4c74b40..3ea3ce1` read hunk by hunk, five
findings raised, all five applied as the smallest edit that fixes them. No feature changed.

### The two that were real bugs

- **`.mode-meta` had ZERO slack, not the ~2px `CLAUDE.md` recorded.** Re-measured in Chrome
  at 1280x900 with `document.fonts.ready` awaited: the English "All questions" card's meta
  content box is **164.7px** and its content needs **164.7px** (count 81.8 + 4px gap + clock
  row 78.9). German's worst ("Nach Thema") is at zero too. `.mode-card` has no
  `overflow: hidden`, so any pixel lost — an ordinary classic scrollbar on the Practise page
  takes about 7 — drew the estimate across the card's own border into the grid gap.
  `.mode-meta` now carries `overflow: hidden`, which keeps that overflow inside the tile
  while leaving `nowrap`'s deliberate "overflow visibly rather than wrap" intact. Verified
  both ways: untouched at the resting 165px (`scrollWidth == clientWidth`), and contained
  when the band is forced to 1000px (`scrollWidth 165 > clientWidth 153`).
- **A catalogue load failure was invisible.** The error goes into `#modesGrid`, which moved
  to `#practiseScreen` in #91 — so a 404 on `questions.json` left the reader on a landing
  page that rendered perfectly, with a working Start button and the error on a screen they
  had no reason to open. Worse, the footer's four Practise links call `startMode()` directly
  and, with an empty pool, started a quiz screen with no question and no message — it throws
  nothing, which is what made it quiet. Fixed in two places: `initHomeScreen()` navigates to
  Practise when `loadFailed` and the reader is on Home, and `startMode()` opens with
  `if (loadFailed) { showScreen('practise'); return; }`, which is the one choke point every
  caller routes through.

### The three smaller ones

- **`sw.js` awaited its own cache write.** `if (res.ok) await safePut(...)` held every
  navigation and every `questions.json` response until CacheStorage finished writing — on
  exactly the slow, contended profiles `safePut` was written for. It is
  `event.waitUntil(safePut(...))` now: the write outlives the handler, the response does not
  wait on it, and since `safePut` cannot reject the `await` was buying nothing.
- **The nav's comment still described About and FAQs**, two lines above markup that has held
  only Home and Practise since #91.
- **Two comments above `ICONS.clock = ICONS.history`**, the older one naming the hero chip
  #88 deleted. Merged into one that names both live readers.

### Verified

- `node --check` clean on `sw.js` and on the extracted `<script>` block.
- `node --test tools/contrast.test.mjs` — 10/10. `node --test tools/scale.test.mjs` — 12/12,
  every budget still at target (no budget moved; none of these edits adds a token, a radius
  or a size).
- Real Chrome at 1280x900 over `python -m http.server`: the clip measurement above; a load
  failure landing on Practise with the error visible; the footer's "All questions" link
  routing to that error instead of a blank quiz; and the normal path unchanged — nav
  `aria-current` moving, hero CTA reaching Practise with five cards, a 10-question state
  round starting with real question text, DE/EN switching the mode titles and `#langBadge`.

### Not verified

- **Nothing was checked on the live site.** All of it was localhost over `http.server`.
- **The `overflow: hidden` fix was proven by measurement, not by eye at the failing width** —
  the squeeze was forced with an inline `width` on the band rather than by producing a real
  classic scrollbar, and no screenshot of the clipped state was taken.
- **The service-worker change was not exercised at all.** `waitUntil` here is read, syntax-
  checked and reasoned about; no worker was installed or updated to watch it behave, and the
  latency it is meant to remove was never measured before or after.
- **No automated test covers any of these five.** The two ratchets guard tokens only; the
  meta row's slack, the load-failure route and the worker's write path are all hand-checked.
- The two `docs/Mockups/ChatGPT Image Sep 21, 2026, *.png` files are untracked and **not
  mine**. Left alone.

---

## Session close (2026-09-21, the dark theme re-derived and the nav link de-buttoned)

Live at close: branch **`ui/dark-ladder-and-nav-link`**, commit **`b775b9e`**, pushed and
opened as [#93](https://github.com/thelivinsine/eib-quiz/pull/93) — **waiting, not merged.** A
substantial ending: it re-derives a whole theme, and the *not verified* list below is what a
reviewer is being asked to weigh before it reaches production.

Two requests, one of them in two passes. Everything here is DARK-only plus one header
rule; **light is untouched and is still the mockup's own palette.**

### 1. The header's Practise link is a link again

`.nav-link--cta` was `--btn-fill` / `--on-btn` in a pill — shipped earlier the same day.
It is `.nav-link`'s own shape now, one step up the type scale (`--fs-md`) and in
`--accent-text`: two items in a two-item nav should read as the same KIND of thing, and a
solid button beside a bare word reads as a control that acts rather than a page you go to.
The hero's Start and the CTA band still carry the primary button, so nothing lost that
voice. Its `:hover`, `:active` and `.nav-link--active` overrides all stay —
`.nav-link:hover` is (0,2,0) and the active rule repaints the label `--text`, so without
them the accent is lost in both states. `accent-text / canvas` was added to `PAIRS`: the
header sits on the canvas, and in dark that is a rung below `--surface`, so the existing
`accent-text / surface` pair did not cover it.

### 2. The dark palette, re-derived against the reference (two passes)

**First pass — the two things a script could see.** `theme-dark.md` §2 is flat: "greys are
perfectly neutral, R = G = B *exactly* ... no fashionable dark navy. A tinted dark grey
photographs well in a mockup and goes muddy on a real monitor." Every dark surface was
H 218 slate, 11–21 apart per channel, **derived from a light-only mockup** — the exact move
that sentence warns against. And `--hover` sat at **1.182** on a tile, under §4's "1.20 is
the floor for a state change"; `contrast.test.mjs` cannot catch that, because `FILLS`
asserts `STATE` at 1.08.

**Second pass — the one that mattered, and the first pass missed it.** The user pointed at
the reference screenshots: the page is the darkest thing on screen and every level of
containment steps lighter. `--band` — the panel under the practise band, the why, numbers
and CTA bands and the footer — was **darker than the page**, with cards raised back out of
it. That came from the light mockup (white page, panel recessed below it) and was applied
to dark as if it were a fact about the COMPONENT. §3 reverses for exactly one element in
the reference's whole sample, a large multi-line text well — "a chip or a button is a
raised object you press; a big text well is a hole you type into" — and a panel holding
five cards is not one.

The ladder now, each rung measured on the one below:

| token | dark | step | what it is |
|---|---|---|---|
| `--canvas` | `#1A1A1A` | — | the page, the darkest thing on screen |
| `--band` | `#262626` | 1.15 | a panel ON the page |
| `--surface` | `#323232` | 1.18 | a card IN the panel (1.36 on the bare page) |
| `--surface2` | `#3B3B3B` | 1.14 | a well or an answer option INSIDE a card |
| `--surface3` | `#434343` | 1.13 | a letter chip inside THAT, and the press fill |

The step shrinks with depth exactly as §3.a describes. `--hover` is 1.22 on a tile,
`--border` `#505050` is 1.59 on a tile and 2.16 on the page (§5's divider band), and the
text tiers read 12.82 / 8.40 / 6.11 / 5.02 on a tile — `--muted`'s real floor is its
LIGHTEST ground, `--surface3`, where it reads 4.72.

**Two knock-ons, both forced by the ladder rising:**

- The seven tinted `--*-dim` plates (`--accent-soft`, `--teal-tint`, `--gold-dim`,
  `--green-dim`, `--red-dim`, `--violet-dim`, `--blue-dim`) sat **1.01–1.15** on a tile —
  invisible as fills, with the hue doing all the work. Each was lifted to **1.20**, hue and
  saturation held, luminance moved.
- `--accent`, `--green`, `--red`/`--red-text` and `--violet` each gained a little lightness
  (`#60A5FA`→`#70ADFA`, `#10B981`→`#10C185`, `#F87171`→`#F98989`, `#A78BFA`→`#B39CFA`) so
  their own text still clears AA on those risen plates — §6's "lighten it until it clears".

`--accent-line` moved with the hairline, `--lime-glow` follows the new accent, `--on-hue`
and the JS `theme-color` meta follow the new canvas.

### Verified

- `node --test tools/contrast.test.mjs` — 10/10, including the new `accent-text / canvas`
  pair. `node --test tools/scale.test.mjs` — 12/12, no budget moved (no token, radius or
  size was minted).
- `node --check` clean on the extracted `<script>` block. `node tools/validate.js` — 460
  questions, structure valid.
- **No dark token sits below the page**, checked by parsing the `:root` block and comparing
  luminances: the only two that do are `--on-apricot` / `--on-gold`, which are dark INK on
  a gold fill, not surfaces.
- Rendered in a real browser at 1280x900 over `python -m http.server`, dark: the Practise
  page (page → band → cards reading as three planes) and the quiz screen (page → option →
  letter chip), plus the header showing Practise in the accent with its underline.

### Not verified

- **Nothing was checked on the live site**, and no PWA cache was cleared — all of it was
  localhost over `http.server`.
- **Light was never re-rendered.** No light token changed and the light half of
  `contrast.test.mjs` passes, but no screenshot of the light theme was taken this session.
- **No mobile check at all.** The 375px sweep in `CLAUDE.md`'s validation checklist
  (`scrollWidth == viewport` on both pages, `scrollHeight == innerHeight` on the session
  screens) was NOT run, and the header's nav is hidden below 620px so the changed link
  was never seen at phone width.
- **No exam simulation was run**, so the exam's neutral `.picked` state and its results
  list were not seen against the new palette.
- **The hover and press fills were not looked at by eye**, in either theme — they are
  asserted by ratio only, and the pane would not synthesise a hover.
- **The colour work is judged by ratio and by three screenshots**, not by an audit of every
  screen: the results screen, the glossary, the history list, the lightbox and the resume
  banner were never opened in dark after the change.

---

## Session close (2026-09-21, review of #93 and its four fixes)

A review of the open PR #93 (`ui/dark-ladder-and-nav-link`) — the dark re-derivation and the
de-buttoned nav link. The ladder itself held up: every ratio in the new `:root` block was
re-measured independently (band 1.15 on the page, surface 1.18 on the band, surface2 1.145,
surface3 1.132, hairline 1.59 on a tile, hover 1.22, `--muted` 4.72 on `--surface3`, the
seven `--*-dim` plates at 1.197–1.207) and matches what the comments claim. Four things did
not.

### 1. The one real bug: a brightness filter took the hover under AA

`.nav-link--cta:hover` was `filter: brightness(1.12)`. In light that renders `#2563EB` as
**`#296FFF` — 4.36 on the white canvas**, under the 4.5 floor that the `accent-text /
canvas` pair added in this very PR exists to hold. **A filter is invisible to
`contrast.test.mjs`**, which parses tokens, so the ratchet passed while the hovered label
failed. Scoped `html.light .nav-link--cta:hover { filter: brightness(0.88) }` — 6.31, and
it is the direction the rest of the sheet already goes (down in light, up in dark). Dark is
untouched at 9.14. The rule is written into `CLAUDE.md` beside the LITERAL_PAIRS one,
because it is the same class of hole: **a colour the test cannot see.**

### 2. The literal pairs were asserting colours the app no longer has

`LITERAL_PAIRS.dark` still named `#10B981` and `#F87171` as the answer-chip grounds after
this PR moved `--green` to `#10C185` and `--red` to `#F98989`. The chips really are
`background: var(--green)` / `var(--red)`, so the test was checking two colours that exist
nowhere — and passed on luck, both grounds having got lighter (7.13 and 7.30). Corrected to
the shipped values.

### 3 and 4. Two comments that recorded values that never shipped

- The re-derivation comment said `#F87171 -> #F97F7F` and `#A78BFA -> #AD92FA`; the tokens
  twenty lines below it are `#F98989` and `#B39CFA`. `CLAUDE.md` carried the same two wrong
  values while its own palette line had `#F98989` right — the two contradicted each other
  inside one commit. Both fixed.
- `--text` was annotated `13.97 on tile, 16.5 on the page`. Measured it is **12.82 on a
  tile and 17.40 on the page** (16.51 was the OLD text-on-band figure, carried over). The
  three tiers below it were right, which is what made the wrong one easy to trust.

### Verified

- `node --test tools/contrast.test.mjs` — 10/10 with the corrected grounds.
  `node --test tools/scale.test.mjs` — 12/12, no budget moved.
- `node --check` clean on the extracted `<script>` block and on `sw.js`.
  `node tools/validate.js` — 460 questions, structure valid.
- Every ratio quoted above was computed from the shipped hex values in this session, not
  read out of a comment.

### Not verified

- **Nothing was rendered.** No browser, no server, no screenshot — the hover fix is
  asserted by arithmetic on `filter: brightness()`, which is how the bug got in. The
  browser's own compositing of that filter (sRGB, before any colour-space conversion) is
  assumed, not observed.
- **The reviewer wrote the fixes**, so the four changes have had one pair of eyes.
- Everything in #93's own *Not verified* list still stands: no live-site check, no mobile
  sweep, no exam run, no light-theme render.

### Live

PR #93 squash-merged to `main` as **`8f0dd38`** — the dark re-derivation, the de-buttoned
Practise link and these four fixes are on GitHub Pages. `index.html` is network-first in
`sw.js`, so no `CACHE` bump was needed; nothing in `PRECACHE`'s cache-first set changed.
