# EIB Quiz — Project Status & TODO

_Last updated: 2026-09-23_

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
  both themes (asserted by `tools/contrast.test.mjs`), ≥44px touch targets on content
  controls (text buttons draw 36px and reach 44 on touch through an invisible `::after`;
  the header strip is a deliberate 36px exception — see Touch targets below).
- Installable PWA with offline support (`manifest.json` + `sw.js`, network-first for
  HTML/data, PNG app icons in `img/icons/`).
- Motion and depth (2026-09-23): soft per-theme tile shadows, a hover lift on cards and
  answer options, staggered card entrances, a landing scroll reveal with counting
  numbers, and a correct-answer glow / wrong-answer shake outside the exam. All of it
  is off under `prefers-reduced-motion` (see CLAUDE.md, "Motion system").

**Quiz pool:** 300 general + 16 Bundesländer × 10 = **460** questions, all **bilingual (DE/EN)**.
The user picks a state on the **Practise** page — under the mode band's heading, beside the
exam and state modes it governs, not on the marketing home page; the active pool is 300
general + the selected state's 10. (All 300 official general questions are covered — verified against the BAMF catalogue, 0 missing.
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
  a rung. The header strip is a **deliberate exception** — the EN box and the scheme seg's
  cells are 36px (the cells 28px wide below 360px) and `.brand`/`.session-back` 36px, all
  clearing WCAG 2.5.8's 24px. The original claim here
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


## Session developments (2026-09-22, the header row)

Three asks, one row: adopt a reference UI's control language (an EN pill beside a
sun/monitor/moon segment), show BOTH pages in the phone's nav, and bring the active
link's underline closer to a larger label. The first is what made the second possible.

- **The globe `<details>` is gone.** It held the language and, below 620px, the theme seg
  as well. Two languages do not need a disclosure — `#langToggle` is a pill showing the
  current code that flips on press — and the deletion took `.hmenu-*`, `#langBadge`,
  `#schemeLabel`, `syncThemeControlPlacement()`, the outside-click and Escape listeners,
  the `nav.language` / `nav.preferences` strings, `ICONS.globe` (in both `index.html` and
  `tools/icon-packs.mjs`) and **the app's only drop shadow** with it. Net: ~90 lines out.
- **The scheme has three modes: light / system / dark**, as `sun` / `monitor` / `moon`.
  `system` follows `prefers-color-scheme` and keeps following it (`_schemeMql` is listened
  to, and the listener acts only while the stored mode is `system`). **The default did not
  change** — nothing stored is still light — and the pre-paint script in `<head>` learned
  the third value so a system-dark reader gets no white flash.
- **The underline is `text-decoration`, not `box-shadow: inset`.** A box-shadow draws at
  the bottom of the control, which is a 36px hit target around the word; the native
  property tracks the text, skips descenders and still adds nothing to the height. The nav
  went `--fs-2xs` -> `--fs-sm` (14px) with it and is now the one thing in the header strip
  that is not 12px — it is the only content in that row.
- **Both nav links show on a phone, and the width was found rather than assumed.** The
  globe summary (92px) became a 46px pill, the seg came back into the row as three square
  icon buttons (92px against a two-word toggle's ~120), the nav's own gaps tightened, and
  the BRAND NAME joined the tagline in hiding below 620px (-62px). Measured at 375: the row
  ends at 359 in a 359px box with 14.8px between the nav and the pill, German narrower than
  English. Below 360px a nested media block trims the gutter, the group gap and the button
  width (28x36, over the 24px WCAG 2.5.8 floor) — the row needs 361.5px as it stands, which
  is where that breakpoint comes from; at 320 it then ends at 296.7 in a 304px box.

**Verified in the pane** at 320 / 360 / 375 / 620 / 940 / 1400: nothing clipped,
`scrollWidth == innerWidth` everywhere, `scrollHeight == innerHeight` on the quiz screen,
the nav's `aria-current` follows `showScreen()`, the language toggle flips face + label +
storage, and all three scheme buttons paint, persist and survive a reload. Both ratchets
(`contrast.test.mjs`, `scale.test.mjs`) pass with every metric still at budget.

**One thing could NOT be verified here**: the `prefers-color-scheme` **change event** does
not fire under the preview pane's emulation — a freshly armed listener saw `matches` flip
false -> true and got nothing — which is the same gotcha that made `syncNavHeaderRole` use
`resize`. The handler's body was proved by calling `setTheme('system')` against a dark
`prefers-color-scheme`; the delivery needs a real OS toggle.

## Session developments (2026-09-22, the landing bands inverted)

Three asks, all on request, and two of them reverse something written down the day before.

- **The why band and the numbers band SWAPPED treatments.** The why band is the panel now
  — `--band`, a `--border` hairline, the 16px radius, a `--space-xl` inset — and
  **deliberately has no vertical separators**, which is the half of the old argument that
  survives: hairlines between four claims make a table, a frame around the set groups
  them. The numbers band is bare on the page: `.stats-grid` left the shared
  `.result-stats` rule, which now has one consumer, and took a `--space-xl` gap (an
  existing rung, so `gapRungs` stays at 7). `.why-item` dropped its `padding-block` to
  the panel's inset and `.stats-item` picked the same shape up.
- **The nav sits low in the header strip.** `align-self: flex-end` for the first 4px —
  the links' box bottom lands on the brand's, which is what sizes the flex line — and a
  `calc(-1 * var(--space-2xs))` bottom margin for 4 more, into the strip's own padding.
  It cannot move `--header-h`: the margin box is 36 - 4 = 32, still under the brand's 44.
- **No contrast pair had to be minted** — every one already existed — but four
  DESCRIPTIONS in `contrast.test.mjs` did, because `text/band` and `muted/band` now name
  the why band's title and body, and `text/canvas` and `muted/canvas` the numbers'.

Verified at 320 / 375 / 1280 in both themes: nothing overflows, `scrollHeight ==
innerHeight` still holds on the quiz screen at 375 and 1280, and both ratchets pass with
every metric still at budget.

**A stale page nearly got this filed as "the edit did not apply":** after a plain
`navigate` to the same URL the pane served the PREVIOUS build, so the measurement came
back byte-for-byte as the old layout while the file on disk was plainly changed.
Unregistering the worker, clearing CacheStorage and navigating with a `?cb=` query fixed
it. Check the file on disk before believing a measurement that says nothing happened.

## Session developments (2026-09-22, the landing page's rhythm)

- **The doubled section gap is gone.** `#whyBand` carried `padding-block:
  var(--space-2xl)` of its own, written when it was the BARE section between two panels.
  Once it became the panel, that padding paid the 40px `.home-section` gap a second time:
  **80px between the panel's edge and the numbers under it against 40 everywhere else**,
  which is what the screenshot was pointing at. Deleted, so one block sets the gap to the
  next and `.home-section` is the only place it is set. Its section head came down with
  it, `--space-2xl` -> `--space-lg`, because the panel's own edge now does half the
  separating 40px of whitespace had been doing alone. **Nothing inside a band was
  touched** and the page still came down 1439 -> **1339px** at 1280.
- **A scroll target that loses its top padding needs its scroll margin re-derived.**
  "Learn more" jumps to `#whyBand`, and that padding was the air between the sticky
  header and the heading after the jump; `scroll-margin-top` is
  `calc(var(--header-h) + var(--space-lg))` now.
- **The hero needed no rule**: it is not a `.home-section`, so it never took a gap from
  that margin — its own `padding-block` ends with 40px. Measured: the ink gap above the
  why heading is 44, in line with the 40s below it.
- **The two script notes swapped bands**, and **the CTA band's note and button swapped
  places** — it reads copy · note · ornament · action now. The button swap is in the
  MARKUP rather than CSS `order`: only one focusable element is in that band, so focus
  order was never at risk, but a screen reader reads the DOM and should hear what is on
  screen. The note KEYS did not move with the values, so `stats.annotation` and
  `cta.annotation` each still name the band they render in — look for one of those lines
  by its value.

Measured at 1280 and 375 in both themes and both languages: the ink gaps are 44 / 40 / 40,
nothing overflows, and the notes and the ornament are still hidden below 620px, so the
band arrangement is desktop-only. Both ratchets pass with every metric at budget.

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
- `docs/Mockups/ChatGPT Image Sep 21, 2026, 04_51_59 PM.png` was untracked in the working
  tree and is **not mine**. Left alone at the time; a later session committed it as
  `docs/Mockups/ui/logo-kit.png`.


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
- `docs/Mockups/ChatGPT Image Sep 21, 2026, 04_51_59 PM.png` was untracked in the working
  tree and is **not mine**. Left alone, as in the previous session; a later session
  committed it as `docs/Mockups/ui/logo-kit.png`.

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

---

## Session close (2026-09-21, the practice band's panel removed)

On request: **"Choose your practise mode" need not have an outer box.** `.modes-band`'s
`--band` fill, `--border` hairline, `--radius` and `--space-xl`/`--space-md` padding are
deleted, along with the 620px padding override and the two `html.light .modes-band` state
rules that only existed because of that ground. The five cards sit on the canvas now, like
the why band's four items. The class survives as the hook for `.modes-band .section-head`'s
`--space-lg`.

Three things follow, none of them cosmetic:

- **The cards separate better.** In dark a `#323232` tile is **1.36** off the `#1A1A1A`
  page against 1.18 off the panel. The plate was the shallowest rung on the ladder.
- **The meta row gained 7.3px.** The panel's side padding came straight off the five card
  widths; the card content box is **172px against 165**, and "All questions" — the row's
  worst case in English, the one CLAUDE.md records at *zero* slack — is 164.7 in it.
  Measured with `scrollWidth === clientWidth` on all five cards, in English and German.
- **`contrast.test.mjs` lost three FILL pairs** — `surface`/`band`, `surface2`/`band` and
  `surface3`/`band`. No `--surface` tile sits on `--band` any more, resting, hovered or
  pressed, and a pair whose consumer is gone is the stale-ground fault the review of #93
  had just fixed in the LITERAL_PAIRS list. `canvas`/`band` stays: the numbers band, the
  CTA band and the footer are still panels.

### Verified

- `node --test tools/contrast.test.mjs` 10/10, `node --test tools/scale.test.mjs` 12/12
  with **no budget moved**, `node --check` clean, `node tools/validate.js` 460.
- Rendered over `python -m http.server` at 1280x900: panel confirmed gone
  (`background-color: rgba(0,0,0,0)`, `border-width: 0px`, `padding: 0px`), card 206px
  wide, page `#FFFFFF` in light and `#1A1A1A` with `#323232` cards in dark. Screenshot
  taken in light.
- German + dark at 1280: no `.mode-meta` clipped on any of the five, and
  `Prüfungssimulation` sets on one line at that width.
- 375x812: `scrollWidth === clientWidth === 375`, no element overflowing, card 343px.

### Not verified

- **Nothing was checked on the live site after this change** — all of it localhost.
- **No hover or press was exercised on a card**; the state fills are asserted by ratio
  only, and the two light-scoped rules were deleted on the arithmetic above rather than
  by pressing a card in a light browser.
- The 1160px three-column breakpoint was not re-measured. It may now be conservative —
  the German word it exists for fits on one line at five columns with the extra width —
  but nothing was changed there and it was not tested at 1160-1280.

---

## Session close (2026-09-21, review of #94 and its three fixes)

A review of the just-merged #94 (the practice band's panel removed). The removal itself
held: `.mode-card` and `.topic-chip` both carry base `:hover`/`:active` rules, so deleting
the band-scoped ones left no state unstyled, and every `background: var(--surface)` rule in
the sheet was checked against the three remaining `--band` grounds — none can land on one,
so dropping the three FILL pairs was right. **All three fixes are comments; no declaration
changed.**

### 1. Two token comments still described the deleted panel

`--band` read "The panel under the practise band, the numbers band, the CTA band and the
footer" — three consumers now, not four — and its ladder had `--surface` as "a card IN the
panel", while `--surface` itself was annotated "1.18 on the band, 1.36 on the page". The
same commit had deleted the FILL pairs asserting exactly that step, so the comment and the
test contradicted each other. The band → surface rung is now labelled as **the derivation**
it is: it sized `--surface`, and has had no instance on screen since the panel went.

### 2. The light hover: the finding was right, the fix is NOT to raise it

The hover did get quieter — 1.149 on the band, 1.115 on the canvas — and the comment did
cite the wrong floor (the 1.05 nesting floor, for a state change). But **`theme-light.md`
§4 settles it the other way**: light's whole state band is "roughly 1.10 to 1.25", real nav
and menu hovers measure **1.11**, and the loudest state change in the reference is 1.25.
The flat 1.20 floor is `theme-dark.md`'s. Reading it onto light is the same category error
as reading the light-only mockup onto dark — the error the whole 2026-09-21 re-derivation
existed to undo. Every other hoverable tile in light is 1.115; the band's 1.149 was
compensation for a ground that no longer exists. **The value stays and the argument is
rewritten**, in the sheet and in `CLAUDE.md`.

### 3. One of the two deleted state rules was a no-op

`html.light .modes-band .mode-card:active` set `--surface3` — exactly what
`.mode-card:active` already sets. It never painted a pixel, and the 1.039 both the sheet
and `CLAUDE.md` quoted for the light press fill was `--hover`'s number; the press was
really 1.215 off the band. Both now say so, with "do not restore it".

### Verified

- `contrast.test.mjs` 10/10, `scale.test.mjs` 12/12, `node --check` clean.
- The diff is comments only — checked by filtering the hunks for declarations, and the one
  line that looks like a token change (`--surface`) is its trailing comment.

### Not verified

- **Nothing was rendered for this change**, deliberately: no declaration moved, so there
  is nothing new to look at. The 1.115 and 1.149 figures are computed from the tokens.
- The claim that every other hoverable tile in light is 1.115 was checked by reading the
  `--hover` rules in the sheet, not by hovering each one in a browser.

### Live

Squash-merged straight to `main` as **`b307e28`** — no PR, on request: the change is
comments only and was reviewed in the session that wrote it. No `sw.js` `CACHE` bump
(`index.html` is network-first and nothing cache-first changed).

---

## Session close (2026-09-21, the overview card rebuilt against its mockup)

Three requests in sequence, each partly reversing the one before it — the record matters
here, because two of the reversals look like regressions without it.

### 1. Practise tiles, one header size, centred mode cards

`.mode-card`, `.dash`, `.topic-chip` and the history/glossary wraps went from `--surface`
to **`--band`** + the `--border` hairline the numbers band, the CTA band and the footer
carry. Session screens (`.quiz-sidebar`, `.review-item`) kept `--surface`: there is no band
near them to match, so the shared tile rule is two rules now.

**Light needed its hover override back.** `--hover` is **1.047** off `--band` — under even
the nesting floor — so `html.light .mode-card:hover, html.light .topic-chip:hover` raise to
`--surface2` (1.078). This is the rule #94 deleted a few hours earlier, restored because
its ground came back. Dark keeps `--hover` (1.437); press is `--surface3` in both.

The header strip is **one size**: `.nav-link`, `.nav-link--cta` and `.hmenu-summary` join
`.seg-btn` at `--fs-2xs`, and the hero's two buttons came down from `--fs-base`. The CTA
band's button kept `--fs-base` — it is the page's last call, not header chrome. Practise is
drawn louder by colour alone now. **Home came down too, unasked**: Practise alone at 12px
beside Home at 14 reads as a mistake, and it was flagged rather than assumed.

A mode card's contents are centred with `text-align` + `justify-content`, **not**
`align-items` on the card — that sizes every child to fit-content, and `.mode-meta`'s nowrap
width is measured at zero slack.

### 2. Icons: already the solid pack, now neutral

Nothing needed replacing. `ICONS` is already `tools/icon-packs.mjs`'s solid set
(`grep 'stroke="currentColor"'` → 0), and the three inline arrows are byte-identical to its
`ARROW` path. What changed is **colour**: `[data-hue]` is one neutral rule
(`--surface2` + `--sub-text`), the five hue mappings are gone, a topic chip hovers to
`--text`, and **`--violet` / `--violet-dim` left the palette** — those plates were their
only consumer. `contrast.test.mjs` lost seven hue pairs and gained `on-hue / sub-text`.

### 3. The overview card, rebuilt against `docs/Mockups/ui/where-you-stand.png`

Its own heading and an encouragement chip **inside** the card; a wide ring tile carrying a
four-tier **verdict** (the 52% step is the exam's own 17-of-33 pass mark); three readout
tiles (plate, figure, name, and a line saying what the figure counts); the resume banner
with the mockup's book plate and mountain ornament. `.dash-body` and `.dash-stats` are gone.

On **"stay true to the mockup"** two departures from §2 were reversed:

- **Light takes the mockup's shading exactly** — white card, `--band` summary tile, white
  readouts separated by hairlines alone. Dark cannot copy it (nothing goes below the page
  there) and keeps the `--band` card with readouts stepping up. `surface / band` is a live
  FILLS pair again.
- **This card is the ONE place icons carry a hue**, scoped as
  `.dash-stat--blue/green/amber` so `[data-hue]` stays neutral for the mode cards and the
  why marks.

Three things that took a second pass:

- **`MOUNTAIN_ART` is sized FROM the banner.** At a fixed 250px it stood 83px tall in a
  68px banner and `overflow: hidden` cropped the peaks and the flag off. `top: 0; bottom: 0`
  with `height: 100%` on the SVG; `aspect-ratio: 3 / 1` pins the width, because an inline
  SVG's `auto` width is the engine's call and only Chromium was tested.
- **The flag has to clear the apex.** Drawn inside the silhouette it is the same colour as
  it — the first version shipped three peaks and no flag at all.
- **`.ready-ring-sub` is back**, at a 104px dial with no letter-spacing and a separate
  `dash.accuracyShort` key (German **"Quote"**). See the correction in
  `docs/plans/sizing-system.md` §"Two regressions from the 12px floor".

**On a phone the three readouts became one column of rows**, reversing "the three overview
stats stay three columns": as bordered tiles at 375px the label gets an 85px box while
`BEANTWORTET` sets 109 — one German word, nothing to wrap, so it spilled over the tile's
own border.

`file`, `checkCircle` and `leaf` were drawn into the pack's `solid` object first, then
copied into `ICONS` — 28 glyphs now, 26 drawings plus two aliases.

### The review of #95, and its six fixes

Four were comment faults and two were real:

1. The card's comment cited `docs/Mockups/"…07_04_29 PM.png"`, which the **same commit**
   renamed to `docs/Mockups/ui/where-you-stand.png`.
2. That comment kept the superseded "this one inverts that pair" paragraph directly above
   the one reversing it, so it asserted both shading rules as current.
3. `.resume-art` carried two stacked comments, the first naming `--border-hover` as the
   colour — which the rule below it argues against.
4. **Real:** `.resume-art svg` relied on the engine deriving an inline SVG's width from its
   viewBox. `aspect-ratio: 3 / 1` — measured 204x68 in a 68px banner.
5. **Real:** `.mode-card .mode-meta` was two rules in one `@media` scope, the shape
   `scale.test.mjs`'s duplicate-property check cannot see. Merged.
6. Two `docs/TODO.md` notes called the logo-kit mockup untracked; #95 tracks it.

### Verified

- `contrast.test.mjs` 10/10, `scale.test.mjs` 12/12 with **no budget moved**, `node --check`
  clean on the extracted script, `node tools/validate.js` 460.
- Rendered at **1280, 980 and 375**, both themes, both languages, with and without a saved
  session — in the in-app pane for measurement and headless Chrome for the screenshots.
- No SVG on any of the four screens computes to an accent or semantic hue, scanned in both
  themes (the check that proved §2 landed).
- No horizontal overflow at 375px on either page, and no element overflowing its tile in
  the overview card in German.

### Not verified

- **The live site.** Everything was measured against `python -m http.server`.
- **Only Chromium.** Both the in-app pane and headless Chrome are Chromium; the
  `aspect-ratio` fix exists precisely because another engine was not available to test.
- **The verdict's four tiers were read, not exercised.** Only `start` and `strong` were
  ever on screen; `onTrack` and `building` come from the same two-comparison expression.
- **No `sw.js` `CACHE` bump** — nothing cache-first changed (`index.html` is network-first).
- The mountain ornament's opacity steps (0.55 / 0.75 / 1) were judged on screen in light and
  dark, not measured.

### Live

PR [#95](https://github.com/thelivinsine/eib-quiz/pull/95), squash-merged to `main` as
**`5dd5bf2`** after the review above. `docs/Mockups/ui/where-you-stand.png` and
`logo-kit.png` are tracked with it; the logo kit is **not** shipped — it draws a different
brand mark, a stroked icon library and pages that were deliberately removed.

---

## Session close (2026-09-22, the overview card against its mockup, then dissolved)

One card, six requests, and the last one reverses the shape the first five refined. The
order matters, because "the tiles are gone" reads as a regression against #95 without it.

### 1. Fidelity: the card measured against `ui/where-you-stand.png`

The user said the card still did not look like the mockup. Both were measured at equal
scale — the mockup's card is 2074px and the app's 1060, so they map 1:2.02 and can be
compared pixel for pixel — and the gaps were real:

| | was | now | mockup |
|---|---|---|---|
| `.ds-num` | `--fs-lg` (18) | **`--fs-xl` (22)** | ~23 |
| ring drawn size | 94px | **104px** | 104 |
| ring at 0% | invisible | **blue cap** | cap |
| verdict head / body | 15 / 13px | **13 / 12px** | ~12 / ~12 |
| resume button | navy `--btn-fill`, 36px | **`--accent-fill`, `--ctl-md`** | blue, 41px |
| banner | `--accent-line` hairline | **no border** | none |
| mountains | 3 triangles, flag clipped | **traced bell curves** | — |
| pill | `--ctl-xs` | **`--ctl-sm`** | 36 |

Three of those are worth keeping the reasoning for:

- **The ring's window moved, not its geometry.** `.ready-ring`'s viewBox is `5 5 110 110`:
  at r=50 with a 9-unit stroke the ink only ever reaches 109 of 120 units, so a 104px wrap
  drew a 94px ring. r, C and the `stroke-dasharray` are untouched, which is what the JS
  animation counts on.
- **`animateReadyRing` floors the arc at 10 of 314 units.** It used to set
  `opacity = pct >= 2 ? 1 : 0` — it hid exactly the state a new learner spends their whole
  first visit looking at, and an empty dial reads as a broken one.
- **`.resume-banner .btn-primary` is the ONE exception to "a primary button is
  `--btn-fill`"**: the banner is already an `--accent-soft` tint and a near-black slab in
  the middle of it reads as a hole.

### 2. The ornament, traced three times

The mockup's silhouette was read out column by column. Each flank is near-linear over most
of its run and rounds only at the apex, so each peak is a cubic whose first control point
sits ON the base-to-apex line at t=0.72 and whose second sits 0.16 back from the apex.
Three earlier passes missed this in three directions — plain triangles, then Gaussian
humps, then spikes. The pole and pennant needed their OWN colours (`--text` and `--accent`
via `style="fill:var(--...)"`); in `currentColor` they are the same pale blue as the peaks,
which is how the old art shipped a flag nobody could see. Layer opacities are **0.15 / 0.5
/ 1**, derived from the mockup's measured fills, against 0.55 / 0.75 / 1 — the two back
layers were four times too strong.

On request the three peaks were then **stepped in size and dropped down the block**: apexes
at 60 / 48 / 34 of 80, so they stand 20 / 32 / 46 units (1 : 1.6 : 2.3). The traced version
had two of them the same height and read as one ridge. **This is the one place the ornament
leaves the mockup on purpose.**

### 3. The ring's caption, and the 12px floor's first exemption

> **Superseded later on 2026-09-22** — see "the four blocks harmonised" below. The
> exemption survived; its tenant changed. `.ready-ring-sub` is 11px/400 in one rule
> with `.ds-label`, and the percentage it names came down to `--fs-md`.

"Make the accuracy label much smaller" was measured before it was acted on, and the
measurement redirected the change: `0%` is **already right** (32.5px against the mockup's
32.7). It is the caption that was a quarter too wide — 68.3px at `--fs-2xs` untracked
against the mockup's 54.2 inside an 89px dial.

`.ready-ring-sub` is **9px with `--ls-caps`** now (55.5px), the tracking coming back with
the smaller size. It is the app's only sub-floor type, and it is **named in `TYPE_EXEMPT`
in `tools/scale.test.mjs` rather than bought by raising `fontSizesBelowFloor` to 1** — a
budget says "one is tolerated" and invites a second; a selector says which and why. The
argument: this caption carries no information of its own (`role="img"` +
`aria-label="0% Accuracy"` on the wrapper, and the figure it names is 22px two pixels
above). `docs/plans/sizing-system.md` §"Two regressions from the 12px floor" is corrected
to match.

### 4. The vertical rule beside the ring — removed

The mockup draws one; it went anyway, on request. The ring is already a shape with its own
edge, and a hairline two tokens from it is a divider inside a tile inside a card.

### 5. THE TILES DISSOLVED — this reverses #95's "four tiles"

On request, and the mockup loses this one. `.dash-tile` is gone with the borders and
`.dash-tile--ring` became **`.dash-summary`**; four bare blocks sit on the card's one
ground. Five boxes to say one thing is the containers-inside-containers look this sheet
keeps taking out, and each readout already has a coloured plate anchoring it.

- **What replaces the borders is air, and it had to GROW.** The card's inset went
  `--space-lg` -> `--space-xl` and the grid gap `--space-md` -> `--space-xl`: one rhythm,
  28px, for the inset, the head-to-row gap, the columns and the row-to-banner gap. A tile's
  padding used to do the separating; the gap replacing it cannot be the same size.
  `--space-2xl` is not available — 40 is not a gap rung anywhere in this sheet and would
  take `gapRungs` from 7 to 8.
- **`align-items: center`, not a plate-on-the-ring's-axis spacer.** A readout is not
  symmetric about its own plate, so centring the block leaves the plate ~12px above the
  ring's centre. A variant that padded each readout to put every plate exactly on the ring's
  axis was built and rendered beside this one; **the user picked the simpler one.** The
  spacer is written down in `CLAUDE.md` in case it is revisited — as
  `calc(var(--fs-2xs) * var(--lh-ui) + var(--space-sm))`, not the 30px literal that
  produces the same number and breaks the day the ring resizes.
- **The plate-to-figure gap went BACK UP to the mockup's `--space-lg`.** While each readout
  was a tile its 32px of padding came off the column: "DUE FOR REVIEW" sets 111.6px at the
  12px floor (the mockup's own label is ~10px and sets ~92) and had 104.4 to sit in. The
  column is 131px dissolved.
- **German drops a word rather than a line.** `dash.due` is `Wiederholung`, not
  `Zur Wiederholung` — 137.5px in a 131px column wraps and drops that readout's sub-line out
  of line with the other two. The sub-line under it still reads "Fragen zur Wiederholung".
- **`surface / band` left `contrast.test.mjs`** with its last consumer, and **`faint / band`
  joined it**: the `/310` denominator used to sit on a `--surface` readout tile and now sits
  on the card, which is `--band` in dark.

### 6. `ICONS.reset`, redrawn

Its arrowhead was 4.8 units on a 2.6 band and, at the 18px it shipped at, read as a nub on a
broken ring — the glyph said "loading". The band is 2.4 now and the head flares to 8.4, 3.5x
its width, **and** it renders at `--icon-lg`. The redraw alone still disappeared at 18px;
both were needed. `head()` in `tools/icon-packs.mjs` took a `flare` argument for it,
defaulting to the old 1.1 so no other glyph moved, and the generator's output was diffed
against the shipped string.

### Verified

- `contrast.test.mjs` 10/10 and `scale.test.mjs` 12/12, **no budget moved** — the type
  exemption is a named selector, not a raised number. `node tools/validate.js` 460.
  `node --check` clean on the extracted script block and on `sw.js`; `manifest.json` parses.
- Rendered at **1280x900** in headless Chrome at 2x in **English, German and dark**, and
  measured in the in-app pane at 1280 and 375.
- **No horizontal overflow at 375px** on Home and Practise, both languages, and zero
  elements overflowing the viewport inside `#practiseScreen`.
- The card measures **348.5px** in both languages — German no longer runs taller.
- Language switch exercised both ways (`Where you stand` <-> `Dein Stand`).
- `grep 'stroke="currentColor"'` still returns 0, and `RESET_ARC` in the icon pack
  regenerates the shipped `ICONS.reset` string byte for byte.
- The reset glyph magnified 4x in **both** themes.

### Not verified

- **The live site.** Everything was measured against `python -m http.server`.
- **Only Chromium.** Both the in-app pane and headless Chrome are Chromium.
- **Only the `building` verdict was ever on screen.** `start`, `onTrack` and `strong` come
  from the same two-comparison expression and were read, not exercised.
- **The session screens were not re-checked.** The diff is confined to the practise page's
  overview card, but `scrollHeight === innerHeight` on the quiz and results screens was not
  re-run this session.
- **Nothing was clicked.** Resume, Discard and the reset button's confirm were rendered, not
  exercised; the exam simulation (checklist item 8) was not run.
- **No `sw.js` `CACHE` bump**, on the judgement that nothing cache-first changed —
  `index.html` is network-first and the favicon, manifest and PNG icons were untouched.
- The mountains' stepped sizes and the banner's headroom were judged on screen, not measured
  against a target; the ornament is hidden below 620px and was not looked at on a phone.
- The heading stays 28px against the mockup's ~31: there is no rung between `--fs-2xl` and
  `--fs-3xl`, and a literal font-size fails the ratchet. Flagged to the user, not fixed.
- The buttons stay pills where both mockups draw ~13px rounded rects. Flagged as an
  app-wide question rather than changed in one card.

### Live

PR [#96](https://github.com/thelivinsine/eib-quiz/pull/96), squash-merged to `main` as
**`6014457`**. Two departures from the mockup were flagged to the user and left: the
heading at 28px against its ~31 (no rung between `--fs-2xl` and `--fs-3xl`), and pill
buttons where both mockups draw ~13px rounded rects — an app-wide change, not a one-card
one, and it is waiting on a decision.

---

## Session developments (2026-09-22, diff review of #96)

A review pass over the squash-merged #96, on request. Two corrections, both in
`index.html`; no new feature work.

### The one real fault

**#96's overview row only fitted above ~1160px.** `.dash-grid` is `1.7fr 1fr 1fr 1fr` at
every width down to 620, and below ~1160 a readout column measures ~150px — 86px for the
label after the 44px plate and the 20px gap. `Due for review` sets 111.7 and
`WIEDERHOLUNG` 107, so both wrapped to two lines, the three `.dash-stat` blocks came out
96 / 83 / 81px tall, and `align-items: center` put the amber plate at y=228 against 220
for the other two. **The row stopped reading as a row — the exact fault the centring and
the shortened `dash.due` string exist to prevent**, and the comment on `.dash-stat-top`
claiming the column "fits with room to spare" is only true at the widest sizes.

Not a regression #96 introduced: the tiles' 32px of padding made the column *narrower*
still, so the dissolve improved the numbers without fixing the fault (the gap going
`--space-ms` -> `--space-lg` gave 8 of those 32 back). It is a fault #96 left standing
while documenting the opposite.

`.dash-summary { grid-column: 1 / -1 }` below 1160 — the mode grid's own breakpoint — with
the three readouts on `repeat(3, minmax(0, 1fr))`. **Narrowing all four columns to `1fr`
was tried first and rejected**: it fixes the labels and starves the verdict to ~40px.

### Also corrected

- The 620px `.dash-grid` comment argued for `--space-md` where the rule sets
  `--space-lg`.

### Reported, not changed

- **The resume banner's primary button clears AA by 0.04 when hovered.** #96 moved it from
  `--btn-fill` (near-black navy) to `--accent-fill` (`#2563EB`); `.btn-primary:hover` is
  `filter: brightness(1.08)`, which renders ~`#286BFE`, on which `--on-accent` white
  measures **4.54** (rest 5.17, active 5.70). It passes, so the design was left alone — but
  a filter is invisible to `contrast.test.mjs`, so the next re-derivation of
  `--accent-fill` fails silently. Same class as the `.nav-link--cta` hover the sheet
  already documents.

### Verified

- `contrast.test.mjs` 10/10 and `scale.test.mjs` 12/12, **no budget moved**.
  `node tools/validate.js` 460. `node --check` clean on the extracted script block and on
  `sw.js`; `manifest.json` parses.
- The overview row measured in the in-app pane with real viewport emulation, **both
  languages**, at **1400 / 1200 / 1159 / 1024 / 900 / 760 / 640** and at **375**: every
  label one line from 1400 down to 760, all three plate tops identical at every width
  above 620, and `scrollWidth == innerWidth` at 375.
- `1159` and `1024` checked either side of the new breakpoint; `1400`/`1200` confirm the
  four-across layout is untouched above it.
- The reset glyph's generator (`RESET_ARC`) still regenerates the shipped `ICONS.reset`
  string byte for byte — re-diffed, because the review touched neither.

### Not verified

- **The live site.** Everything was measured against `python -m http.server`.
- **Only Chromium**, and only the in-app pane.
- **640px still wraps two labels** (`Due for review`, `Beantwortet`). The plates stay
  aligned there, so the fault this session fixed is gone, but the 620-680 band was left as
  found rather than tuned.
- **The session screens were not re-checked.** The change is one media query on the
  practise page, but `scrollHeight === innerHeight` on the quiz and results screens was not
  re-run.
- **Nothing was clicked**, and the exam simulation (checklist item 8) was not run.
- **No `sw.js` `CACHE` bump** — nothing cache-first changed.
- The two departures from the mockup #96 flagged (the 28px heading, the pill buttons) are
  still open and were not revisited.

### Live

PR [#97](https://github.com/thelivinsine/eib-quiz/pull/97), squash-merged to `main` as
**`e188240`**. The resume button's 4.54 hovered ratio was reported and left as a design
decision, not fixed.

---

## Session close (2026-09-22, the readouts cut to a figure over a name)

On request, and landed **directly on `main` without a PR** — the user judged it small and
said so explicitly, overriding `CLAUDE.md`'s "ship via PR + merge" default. One commit,
`bc261c6`, plus this sweep.

### What was asked

Remove the three sub-lines under the overview card's readouts ("Questions you've
attempted" / "…mastered" / "Questions to review") **and the icons beside them**, then
rearrange what is left cleanly. A second request mid-session: move the encouragement chip
("Small steps make big progress.") up onto the reset button's line.

### What shipped

- **A readout is a figure over its name, and nothing else.** `.dash-stat` IS what
  `.dash-stat-fig` was — a `--space-2xs` column of `.ds-num` over `.ds-label`.
  `.dash-stat-top`, `.dash-stat-icon`, `.dash-stat-fig`, `.ds-sub`, both 620px
  overrides and the three `dash.*Sub` strings are deleted. The sub-line said what the
  name said, so the card stated each of its three numbers twice and drew a box beside
  each one to do it.
- **The three `.dash-stat--blue/green/amber` hue rules went with the plates**, so **no
  icon in the app carries an accent or semantic hue any more** — the exception this card
  won on 2026-09-21 under "stay true to the mockup" lasted one day. `--accent-soft`,
  `--green-dim` and `--gold-dim` all keep other consumers, so the palette and
  `contrast.test.mjs` are untouched (no pair lost its ground).
- **`ICONS.file` and `ICONS.checkCircle` lost their only reader and are deleted** from
  `index.html` *and* from `tools/icon-packs.mjs`, which documents production. 26 glyphs
  now — 24 drawings plus two aliases, verified by counting the `ICONS` literal. `leaf`
  stays; it is the encouragement chip's.
- **The chip rides the reset glyph's line.** `.dash-pill` takes
  `margin-top: calc(var(--ctl-sm) / -2)` — half its own height. `.progress-reset` is
  absolute at `top: 6px` in a `--ctl-md` box, so its glyph centre is 6 + 22 = **28px**
  below the card's top edge, which is exactly the card's `--space-xl` padding, i.e. where
  `.dash-head` starts. **Derived, not a `-18px` literal**, so it tracks `--ctl-sm`; and
  the 620px block sets it back to `0`, because the head becomes a COLUMN down there and
  the lift would ride the chip up over the heading.

### What the diff review caught (before the commit, on request)

Two stale comments the deletion left sitting above their deleted siblings — `index.html`'s
"The overview card's readouts. Same three as tools/icon-packs.mjs's solid pack", now above
`leaf` alone, and the pack's three lines explaining `checkCircle`'s `donut()` reuse. Both
rewritten. `donut()` and `ev()` keep five-plus other callers, so nothing else went dead.

### Reported, not changed

- **The 1160px breakpoint stays, but its reason changed.** It was introduced by #97
  because the LABEL could not fit past the 44px plate and its 20px gap. With the plate
  gone the label has the whole column, so what the break now buys is the **verdict's**
  width — narrowing all four columns to `1fr` still starves the sentence beside the ring.
  Left at 1160; the comment says why.
- **`dash.due` = `Wiederholung` no longer has to be short.** The readout column measures
  **195.3px** now; `Zur Wiederholung` sets **137.5** and would fit. The short form stays
  because nobody asked for it back, not because it is forced.

### Verified

- **In a real browser, both themes, both languages**, via the in-app pane with real
  viewport emulation: chip and reset glyph centres identical at **118.0** (1280px) and
  **72.0** (1000px); the ring and all three readouts on one centre at **261.6**;
  `Due for review` (111.6) and `Wiederholung` (107.1) each one line at four-across;
  `scrollWidth == clientWidth == 375` on the phone, with the chip below the heading and
  clear of the reset; the four-across → summary-full-row break at 1000px; and the
  **empty-progress** state (three zeros, no reset button).
- `contrast.test.mjs` **10/10** and `scale.test.mjs` **12/12**, **no budget moved**.
  `node tools/validate.js` 460. `node --check` clean on the extracted script block and on
  `sw.js`. `node tools/icon-packs.mjs` still renders all three sheets after the two
  deletions.
- `grep 'stroke="currentColor"' index.html` still returns **0**.
- Re-ran the whole checklist a second time after the comment tidy, and reloaded the page
  with **no uncaught console errors**.

### Not verified

- **The live site.** Everything was measured against `python -m http.server` on :8777.
  `bc261c6` is pushed, but the published Pages build was not opened or re-measured.
- **Only Chromium**, and only the in-app pane.
- **The session screens were not re-checked.** The change is confined to the practise
  page's overview card, but `scrollHeight === innerHeight` on the quiz and results
  screens was not re-run.
- **Nothing was clicked.** The reset button, the resume banner and the exam simulation
  (checklist item 8) were not exercised; the card was rendered and measured, not driven.
- **The DE/EN switch was driven by `setLang()` from the console**, not by opening the
  globe menu and clicking (checklist item 5).
- **No `sw.js` `CACHE` bump** — nothing cache-first changed.
- The two departures from the mockup that #96 flagged (the 28px heading, the pill buttons)
  are still open and were not revisited.

### Live

Committed and pushed straight to `main` as
[`bc261c6`](https://github.com/thelivinsine/eib-quiz/commit/bc261c6) — **no PR**, on the
user's explicit instruction.

---

## Session close (2026-09-22, the four blocks of "Where you stand" harmonised)

Five requests in one sitting, each one measured before it was acted on, each one landing
on the same card: the overview panel on the practise page. The through-line is that the
card's readouts stopped being the mockup's tiles on 2026-09-21 and nobody re-derived their
TYPE afterwards — a figure sized to sit inside a bordered tile with a plate and a sub-line
was still sitting bare on the card, and it read as heavy. Every change below is a
consequence of that one fact.

### 1. The figures: 22 → 18 → 16, and the ring came with them

"The big numbers in the three stats block look cheap. Use smaller sleeker font similar to
the ring graph text." The first finding was that there was nothing to match — `.ds-num` and
`.ready-ring-pct` were **already identical** (`--fs-xl`, Bricolage 600, `--ls-display`,
tabular). What differed was the surroundings: a percentage inside a 104px dial is
contained, a bare numeral in a 195px column is not.

| | before | after |
|---|---|---|
| `.ds-num` / `.ready-ring-pct` | `--fs-xl` (22) | **`--fs-md` (16)** |
| `.ds-of` (`/310`) | `--fs-xs` (13) | **`--fs-2xs` (12)**, then held on request |
| `.ds-label` / `.ready-ring-sub` | 12/600 and 9/600 | **11px / 400, one rule** |
| `.dash-verdict strong` / `p` | 13 / 12 | **15 / 13** (14/13 below 620px) |

The denominator is the one thing asked to stay put ("keep the size of 310 intact"), and it
is the right instinct: `/310` is a SCALE, not part of the number, and at 12px under a 16px
figure it reads one rung down rather than three.

### 2. The spacing: centred readouts, and the verdict pulled in

A readout is ~100px of content in a 195px column. Left-aligned it pooled every pixel of
slack on its right — three ragged blocks trailing off into nothing. `.dash-stat` is
`text-align: center` now, and **the 620px block puts it back to left**, where the column
IS the page and there is no slack to split. The summary block stays left in both: a ring
followed by a sentence, and a sentence is read from a left edge.

"The text should be closer to the ring" removed `.dash-verdict`'s `padding-left`. It was
standing in for the vertical rule deleted the day before, at 32px total, and with nothing
drawn in it that read as a gap rather than as a pair. `.dash-summary`'s `--space-md` gap is
the whole separation now — a true 16px only at the text's own vertical band, where the
circle is at its widest.

### 3. The exemption changed tenant, it did not go away

`TYPE_EXEMPT` was **deleted** when the caption came back onto the scale at 12px, and
**restored hours later** holding `.ds-label` + `.ready-ring-sub` at 11px/400. Both moves
were real: at 22px the percentage pushed the caption into a 78px chord where a tracked
ACCURACY grazed the stroke, and at 16px it does not (83.2px chord, 74px word, 4.6 clear
each side — and 66px at 11px, which only made it easier).

The four names **left the shared eyebrow rule** rather than dragging it down: a quiz
readout's label, a tile eyebrow and a review number are all still `--fs-2xs` at 600. This
is the mechanism the sheet has for going under its own floor — a named selector, never a
budget of 1 — and it is now carrying two selectors instead of one.

### 4. `.dash-grid` went `1.7fr` → `2fr`

Not cosmetic: it is what pays for the verdict's type going back up. The verdict box is
**247.2px** and the worst headline ("You're just getting started") sets **188.0** — 59px of
clearance. At 375px the same box is **189px** and the same string sets **188**, one pixel,
which is not clearance; hence `--fs-sm` in the 620px block (175.4 in 189).

### Verified

- **In a real browser** (in-app pane with real viewport emulation, plus headless Chrome at
  2x for the screenshots), at **1280 / 1024 / 375**, both themes, both languages:
  - all four figures `16px/600`, all four labels `11px/400`, `/310` at `12px/500`;
  - all four blocks on **one centre line** (261.6 at 1280, and the summary-full-row break
    below 1160 measured at 1024);
  - **every verdict headline on ONE line** — all four tiers × both languages × both widths,
    measured by range rather than eyeballed;
  - ring caption fit: `ACCURACY` 74px / `QUOTE` 45.7px in an 83.2px chord;
  - `scrollWidth == clientWidth == 375` on the phone.
- **The resume banner renders**, checked by seeding `eib_session_v1` — it was reported
  missing, and it is conditional, not broken (`saveSession()` also skips exam and mistakes
  modes by design).
- `scale.test.mjs` **12/12** and `contrast.test.mjs` **10/10**, **no budget moved** in
  either direction. `node --check` clean on the extracted script block and on `sw.js`.
  `node tools/validate.js` 460, contiguous, spot-checks intact.
- **The diff was reviewed before committing**, and it caught four comments left describing
  a mid-session state the later passes overwrote — the ring caption's ("same rule as the
  eyebrow list", "the figure is --fs-lg", "scale.test.mjs lost its TYPE_EXEMPT"), the
  verdict's (still arguing 12/12 above a 15/13 rule), `.ds-num`'s ("a rung BELOW the
  ring's percentage", when it is the same size) and `.ds-of`'s. All four rewritten; this
  is the same fault class the previous session's review caught, and five requests landing
  on one card in one sitting is how it happens.

### Not verified

- **The live site.** Everything was measured against `python -m http.server` on :8777.
- **Only Chromium.**

- **Nothing was clicked.** The card was rendered and measured, not driven: the reset glyph,
  the Resume/Discard buttons and the exam (checklist item 8) were not exercised, and the
  DE/EN switch was driven by `setLang()` from the console rather than through the globe
  menu (checklist item 5).
- **The session screens were not re-checked** (`scrollHeight === innerHeight` on the quiz
  and results screens). The change is confined to the practise page's overview card and the
  shared eyebrow rule, which those screens read through `.stat-label` — unchanged — but
  that was reasoned, not measured.
- **No `sw.js` `CACHE` bump** — nothing cache-first changed.
- The mockup departures inherited from earlier sessions (the 28px heading, the pill
  buttons) were not revisited.

### Live

Squash-merged to `main` and pushed as
[`fc9e8e7`](https://github.com/thelivinsine/eib-quiz/commit/fc9e8e7) — **no PR**, on the
user's explicit instruction after the diff review, which is how a tweak ships here
(`CLAUDE.md`'s "ship via PR + merge" is applied by SIZE). The work was committed on
`ui/where-you-stand-type` first, reviewed there — that review is what caught the four
stale comments above — then squashed; the branch is deleted.

---

## Session developments (2026-09-22, the card's phone layout)

Three more requests on the same card, after `fc9e8e7` shipped.

### The three readouts stay in ONE ROW on a phone

This re-reverses 2026-09-21's "they become one column of rows", and the reversal is
earned rather than a change of mind: that rule was measured against **12px/600** labels,
where `BEANTWORTET` set 109px in an 85px column. At **11px/400** the widest German label,
`WIEDERHOLUNG`, measures **97.4** and all three fit the card's 311px with room over.

**It is a flex row, because a grid cannot do it.** `.dash-summary` spans `1 / -1`, and a
spanning item distributes its size across every track it spans EQUALLY — so all three
columns came out **97.7px** with the German word at 97.4 inside, whatever the track sizing
said. Measured three ways before the cause was found: `repeat(3, 1fr)`,
`minmax(90px, auto)`, and `minmax(90px, max-content)` + `justify-content: space-between`
all produced the identical 97.664 / 97.664 / 97.672. **0.3px is not clearance, it is luck.**
Flex sizes each readout to its own content (DE 91.2 / 75.8 / 97.4, EN 67.3 / 65.2 / 101.8),
`space-between` puts the leftover between them, and `flex-wrap` is the 320px escape.

### The readouts are centred at every width

The `text-align: left` phone override went with the one-column layout it was written for.

### Resume / Discard are centred on a phone

`.resume-banner` is a `space-between` row; once the text takes the full width the buttons
are the only item on line two, and `space-between` parks a lone item hard left — under the
book plate rather than under the sentence. `.resume-actions` takes `width: 100%` so
`justify-content: center` has something to centre in.

### Verified

- **375px, both languages**: all three readouts on one row (tops all 325.4), spread 33 →
  342 edge to edge, every label on ONE line — including `Due for review`, which the equal
  columns had been wrapping to two. Buttons centred: pair centre 187.5, banner centre 187.5.
- **320px, German**: two on the first row, the third wrapped to its own — no mid-word
  break, `scrollWidth == 320`.
- **390px**: all three on one row. **Dark at 375**: one row.
- **1280px unchanged**: still a grid, 367 / 183.6 × 3, all four blocks on one centre
  (261.6), readouts centred, banner buttons still right.
- `scale.test.mjs` 12/12, `contrast.test.mjs` 10/10, `node --check` clean.

### Not verified

- **The live site** — measured against `python -m http.server` only.
- **Nothing was clicked**; Resume and Discard were measured, not pressed.
- **320px was checked in German only** (the binding case); English fits in one row at 375
  and was not re-checked at 320.
- The session screens and the exam were not re-run — the change is inside the 620px block
  and touches `.dash-grid`, `.dash-stat` and `.resume-actions` only.

### Then the labels became body text, and that retired the exemption

"The labels answered, mastered, etc. should have paragraph text formatting same as
'Above pass mark..'" — so `.ds-label` and `.ready-ring-sub` now carry `.dash-verdict p`'s
rule exactly: `--fs-xs`, 400, `--muted`, `--lh-prose`. Verified by computed style, all
three identical: `13px | 400 | none | normal | 20.15px | rgb(79, 98, 128)`.

**The two absent declarations are the point.** No `text-transform: uppercase`, no
`--ls-caps`. The strings were always sentence case ("Answered", "Due for review"); the
shouting was CSS.

This is the third answer to "not bold and reduced" and the only one that needed no
exemption. The first two went UNDER the 12px floor — 9px for the ring's caption, then
11px for all four — and `TYPE_EXEMPT` is **gone from `tools/scale.test.mjs` again**,
with the reasoning written into its place: a tracked capital is WIDE, so dropping the
case and the tracking is quieter *and* narrower than 11px uppercase was, at a scale step
rather than under the floor.

The width it bought, measured: `Wiederholung` 97.4 → **86.1**, `Beantwortet` 91.2 →
74.9, `Accuracy` 74 → **58.2** in an 83.7px chord, `Quote` 37.1. Which means **all three
readouts now fit one row at 320px in German too** (33–107.9, 120.7–188, 200.9–287) — the
`flex-wrap` escape is still there, but nothing on a supported width needs it.

### The chip came off the encouragement line, and the phone card centred

"The green text doesn't need a chip around — remove it for all views." `.dash-pill` keeps
its green, its leaf and its weight, and loses the `--green-dim` fill, the pill radius, the
padding and the `--ctl-sm` min-height. The mockup draws the pill; the card is one ground
with bare blocks on it since the tiles dissolved, so the capsule was the only enclosure
left inside it.

**The fill's removal moved a colour onto a new ground**, which is the rule this repo keeps
tripping over: `--green` now sits on the card, so `green / band` joined
`contrast.test.mjs` beside the existing `green / surface`.

**The reset-glyph alignment survived a re-derivation.** The chip was lifted by
`calc(var(--ctl-sm) / -2)` — half a 36px chip. A line of text is lifted by half its own
line box, `calc(var(--fs-2xs) * var(--lh-ui) / -2)`. Measured: the line's centre and the
reset glyph's are both **29.0** below the card's top edge.

On a phone the summary now **stacks and centres** — side by side it measured
104 + 16 + 189 = 309 in a 311px card, which is not centred, it is edge to edge — and the
three readouts are **centred rather than `space-between`**, which leaves 31px either side
in English and 20px in German, the inset the resume banner has.

Measured at 375: ring 135.5–239.5 (centre 187.5 = the card's), verdict one line in both
languages, readouts EN 63–312 / DE 53.3–321.7 inside a 33–342 content box. Desktop
unchanged at 1280 — all four blocks still on 261.6, summary still `104px 247.2px`.

### One tile shade on the practise page, and the phone action moves to the corner

"In mobile view the CTA and the arrow should be on the bottom right corner. Also, the tile
colour shade should be adapted referring to the Where you stand section."

**The shade was a real inconsistency, not a preference.** Every practise tile took `--band`
on 2026-09-21 so the practise and landing pages would read as one surface system; the
overview card then took `--surface` back in light, alone. The page has carried two shades
since, with no rule behind which is which. They are one rule now — `--band` in dark,
`--surface` in light — listing `.dash`, `.mode-card`, `.topic-chip`, `.hist-list`,
`.hist-exam` and `.glossary-wrap`. Measured after: all five read `rgb(255,255,255)` in light
and `rgb(38,38,38)` in dark.

**The light hover override went with the ground it was written for.** It raised a light tile
to `--surface2` because `--hover` sat 1.047 off `--band` — invisible. On a white tile
`--hover` is 1.115, light's own reference number, so the base rule is correct unaided.
Confirmed by reading the parsed stylesheet: the only remaining rules are `.mode-card:hover`
/ `.topic-chip:hover` → `var(--hover)` and `:active` → `var(--surface3)`.

`contrast.test.mjs` keeps `border/band`, `surface2/band` and `surface3/band` — all three
still have consumers in DARK, where the tile IS `--band`: its hairline, the `--surface2`
icon plate on it, and the `--surface3` press fill. No pair went stale.

**The phone action is `justify-content: flex-end`**, third position in two days (centred →
left → bottom right). The card is a list row read top-left to bottom-right, so the action
belongs at the end of that diagonal. Measured at 375px: the disc's right edge is 342, which
is the card's content edge exactly.

### Not verified

- Live site; nothing clicked; hover was read from the parsed stylesheet rather than
  synthesised, which is what this repo's own gotcha prescribes.

### The heading came out of the card, the encouragement line went to its foot

"Where you stand / Your accuracy across every question…" is a
`.section-head.section-head--centred` **above** the card now, matching the practise
heading below it; `.dash-head` is deleted. It lived inside the card from 2026-09-21
because the mockup draws one panel that opens with its own title — but the mockup's panel
also held four bordered tiles, those dissolved on 2026-09-22, and the title was then the
last thing inside a single-ground card still behaving like chrome.

The encouragement line is the card's LAST child, centred (`display: flex` +
`justify-content: center` — an `inline-flex` pill has nothing to centre in). Its band is
`--space-md` on both sides: `margin-top` on the line, `padding-bottom` on the card, which
is why the card's inset is `--space-xl` on three sides and 16 at the foot. Unconditional,
because `.dash-pill` is static markup and the card always ends with it. Measured 16 above
/ 17 below (16 + the border).

**The reset glyph needed no rescue.** It is still absolute in the card's top-right corner
and nothing reserves room for it now: 308–352 against a ring ending at 239.5 at 375px, and
25px clear of the third readout's ink at 1280.

**Spacing, all three on request:** the readouts' centres came from 211.6px apart to **181**
(`.dash-grid` 2fr → 3fr — the column width sets that distance, not the gap, and the verdict
GAINED width doing it: 339px, headline still one line); on a phone their column gap went
`--space-lg` → `--space-xl`, so 28 between with 22px (EN) / 12.3 (DE) either side. That
phone gap costs the 320px case — 284.3 of content and gap in a 256px card, so the third
wraps there, which is what `flex-wrap` is for.

### Verified

- 1280: head centred on the content axis (632.5 = the card's), outside `.dash`; columns
  459/153/153/153; stat centres 695/876/1057; verdict 339px, one line.
- 375, both languages: head centred at 187.5 = the card's centre, lead hidden by the
  existing 620px rule, line centred at the foot, all three readouts on one row,
  `scrollWidth == 375`.
- `contrast.test.mjs` 10/10, `scale.test.mjs` 12/12 with `gapRungs` still 7 of 7.

### The state picker stops stretching on a phone

The 620px override is **deleted**, not adjusted: it took the pair full width with the
label hard left and the pill hard right, and `flex: 1` on the pill is what stretched it —
"Berlin" in a ~250px capsule with a gap before the caret. The base rule was what was
wanted all along: the slot centres the pair, the pill is `inline-flex`.

Measured at 375: pill **116px** for Berlin in both languages, pair centre **187.5** = the
slot's centre = the page's. The longest name still truncates with an ellipsis
(`Mecklenburg-Vorpommern`, 196.7 of ink in a 184px box in English) — that is
`max-width: 100%` plus `min-width: 0` doing their job, and it is what the old full-width
rule did too, so nothing regressed.

### Page rhythm: --space-3xl, and the summary centres in the middle band

Two requests. **Spacing**: `.home-section`'s bottom margin went `--space-xl` → `--space-2xl`
(28 → 40, measured 40 between each pair of sections), and `main`'s `padding-bottom` went
`--space-2xl` → a newly minted **`--space-3xl` (56)**, measured 56 from the last section to
the footer. The new rung is PAGE rhythm and is documented as such — nothing inside a card
may use it — and `SPACE_SCALE` in `tools/scale.test.mjs` gained 56 in the same commit, so
`offScaleSpacing` stays 0 rather than a literal hiding under it. The end of the page is
deliberately a bigger break than the gap between two sections: at 40/40 the last card sat
as close to the footer as the sections sat to each other.

**The summary now centres once it owns the row** (below 1160). A row-wide `auto 1fr` pinned
the ring to the left edge with the sentence beside it — at 1000px, a pair in the corner of
an empty row.

**It failed silently the first time, and the reason is worth keeping.** The centring was
written into the existing `@media (max-width: 1160px)` block, which sits ABOVE the base
`.dash-summary` rule; both are single-class selectors, so the base won on source order and
the pair still spanned 49–936 of an 887px row. `grid-column: 1 / -1` had always worked
there only because the base never states it. The rule now lives in a second 1160 block
placed after the base. Same trap as `.cta-btn`'s dead sizing under `.btn-lg` — **when a
media rule appears to do nothing, look for what states the same property below it.**

Measured at 1000px, both languages: pair centre 492.5 = the row's centre, verdict 227.6
(EN) / 243.8 (DE), headline one line. Section gaps 40/40, footer run-out 56.

### The picker scales down, the state label becomes body text, the reset glyph is redrawn

Four requests in one sitting, all measured.

**The state picker is a rung down the ladder.** `--ctl-sm` with an `--fs-sm` value, an
`--icon-xs` pin and tighter padding on both sides: 91.2px wide against 116, **36px tall
with a mouse and 44 on a thumb** — `@media (pointer: coarse)` puts `--ctl-md` back, because
a deliberate size-down without the touch floor is the accessibility regression the quiz's
Previous/Next pair once shipped with. The invisible `<select>` keeps `--fs-md`: under 16px
iOS Safari zooms the page on focus, which is not a visual choice. The slot's
`margin-bottom` came down `--space-lg` → `--space-md`.

**"Your state" is now "Accuracy"'s rule.** `.state-picker-label` joined
`.ds-label, .ready-ring-sub`, and the `eyebrow` class came off the markup rather than being
overridden — it is not an eyebrow any more. Verified by computed style, byte-identical:
`13px | 400 | none | normal | 20.15px | rgb(79, 98, 128)`.

**The mobile section gap went `--space-lg` → `--space-xl`** (20 → 28, measured), keeping the
same ratio to the phone's 40px footer run-out that the desktop's 40 has to its 56.

**The reset glyph was redrawn.** Its arrowhead was `flare 3.2 / adv 52` — **8.8 units of
base on a 2.4-unit band, 3.7x** — a spear that stood proud of the ring's own left edge, and
the only reason the icon was sized `--icon-lg`. At `1.6 / 40` the base is 5.4 on a 2.2 band
(2.45x) and it reads at **`--icon-md`**. Rendered old-vs-new at 16/18/22/88px before
committing. `RESET_ARC` in `tools/icon-packs.mjs` changed with it and **the shipped string
was diffed against the generator's output — identical**, which is the check that pack
exists for.

### The practise heading sits a touch lower on a phone

`.modes-band { padding-top: var(--space-sm) }` inside the 620px block — 28 → **36** between
the overview card and the heading, with the other section gaps left at 28 and the desktop
untouched (`padding-top: 0`, gap still 40).

**It was written as `margin-top` on the head first and painted nothing.** A first child's
top margin collapses through its parent — no top padding or border to stop it — and then
adjoins the previous section's `margin-bottom`, so the gap stayed `max(28, 8)` = 28.
Measurement is the only reason that was caught rather than shipped; the trap is now in
`CLAUDE.md`'s gotchas.

### A one-item nav on a phone, paid for by collapsing the theme toggle

"There is no way to go to the practise page in mobile view — add it on the header by
collapsing the dark/light toggle." Both halves shipped.

**The theme seg has two homes and one element.** `syncThemeControlPlacement()` appends
`#schemeSeg` to `.header-controls` above 620px and to `.hmenu-panel` below it, and flips
`#schemeLabel`'s `hidden` with it. **Moved, not duplicated** — `#darkBtn`/`#lightBtn` are
ids `setTheme()` writes `aria-pressed` on, and two elements cannot share one. It appends
only when the parent actually has to change, so a resize storm cannot rip the control out
mid-press, and it listens to `resize` rather than a `matchMedia` change (the latter does
not fire under viewport emulation — the same reason `syncNavHeaderRole` does).

Inside the panel the seg inherits the panel's rules for free, including the `--ctl-md`
buttons under `@media (pointer: coarse)` that the header row deliberately withholds:
measured **all four panel buttons at 44px** on a 375px phone, panel right edge 359 of 375.

**The nav is one item: the page you are NOT on.** `.header-nav .nav-link--active
{ display: none }` in the 620px block, and `syncNav()` already moves that class on every
`showScreen()` — no second markup path, no new JS. This reverses "a one-item nav was
measured and does not fit": it did not fit while the row carried brand + globe + a
two-word seg.

### Verified

- **Clicked at 375px**, not reasoned about: Home offers "Practise", the tap lands on
  `#practiseScreen`, and the header then offers "Home". `scrollWidth == 375` throughout.
- Desktop 1280: seg back in `.header-controls`, `#schemeLabel` hidden, BOTH nav links
  shown, `setTheme()` still flips the class and `aria-pressed`.
- In a round: `.header-nav` is `display: none` (the `body.in-session` rule still wins).
- `node --check` clean, `scale.test.mjs` 12/12.

### Live

Squash-merged to `main` and pushed as
[`d7d53be`](https://github.com/thelivinsine/eib-quiz/commit/d7d53be) — **no PR**, on the
user's instruction, which is how a tweak ships here. The eleven commits were reviewed on
`ui/dash-phone-row` first (that review is what caught the stale comments and the two silent
no-ops recorded above); the branch is deleted.

**Not verified, carried forward:** the live Pages build was never opened — everything was
measured against `python -m http.server` on :8777, in Chromium only. Nothing was clicked
except the phone's Practise link; the reset glyph, Resume/Discard and the exam simulation
(checklist item 8) were rendered and measured, not driven. The DE/EN switch was driven by
`setLang()` from the console rather than through the globe menu (checklist item 5), and the
session screens' `scrollHeight === innerHeight` was not re-run — the changes are confined to
the practise page, the header and page-level spacing, which is reasoned rather than
measured. No `sw.js` `CACHE` bump: nothing cache-first changed.

### Live check (2026-09-22, after the merge)

Checked on the deployed site, not inferred. `gh api .../pages/builds` reports **`588a031`
built** at 14:01:06Z (the `d7d53be` build shows `errored` — it was superseded by the doc
push 15 seconds later, and the build that shipped is the later one, which contains it).

**All three caches agree, which is the check `CLAUDE.md` prescribes:** a cache-busted
origin fetch and the bare edge URL returned **byte-identical** documents (357,970 bytes,
`age: 0`, `last-modified` 14:01:00Z), and that is the local file exactly once CRLF is
normalised to LF (5,559 lines → 5,559 bytes of difference; `local.replace(/\r\n/g,'\n')
.length === 357970` is true). Five markers from this session present in both: `--space-3xl`,
`syncThemeControlPlacement`, the redrawn reset path, the one-item nav rule, and the absence
of the chip's `--green-dim` fill.

**Driven on the live site at 375px**, which closes two items that were open all session:
- **Checklist item 5, through the real globe menu** rather than `setLang()` from the
  console: tapping DE gave `lang="de"`, badge `DE`, nav `Üben`, hero
  "Der deutsche Einbürgerungstest", headings "Einfach. Wirksam. Verlässlich." and
  "Wähle deinen Übungsmodus"; tapping EN restored every one of them.
- **The phone's new nav**: the theme seg is in `.hmenu-panel`, the header offers
  "Practise", tapping it lands on `#practiseScreen` and the header then offers "Home".
  The three readouts sit on one row (all top 319.7), the encouragement line is centred on
  the card's axis, `scrollWidth == 375`.

**Note for the next live check: `curl` cannot reach the network from this sandbox**
("Recv failure: Connection was reset"). The browser pane can, and a same-origin `fetch()`
from the loaded page gives both the cache-busted and the bare document plus their headers.

**Still not verified:** only Chromium, and only this pane's device emulation — no real
handset. The exam simulation (checklist item 8) and the session screens'
`scrollHeight === innerHeight` were not exercised on the live site either; nothing in this
session touched the quiz or results screens.


## Session developments (2026-09-23, the logo kit)

**A logo kit, and the app wears it.** `docs/brand/` is generated by
`tools/make-logo-kit.mjs` from `docs/Mockups/ui/logo-kit.png`: horizontal, stacked and mark
lockups in four variants, the app icon and the favicon, as outlined SVG, transparent PNG and
a `.ico`. The mark is an E built from three flag bars, and its geometry was **measured off the
mockup's pixels** (60 x 63 units, r=10 right ends, r=8 outer left corners, red to 45). A
first attempt drawn by eye was rejected for exactly that: the red bar ended square and the
rounding was too shy.

- The same run writes the app's `favicon.svg` and `img/icons/` (two new files there:
  `icon-maskable-512.png` and `apple-touch-icon.png`, both the full-bleed square). The
  manifest's maskable entry and the `apple-touch-icon` link point at them.
- The header and footer `.brand-mark` is the kit's E inline, with the dark variant's rim
  under a light-only top bar. The OG card reads its mark from `docs/brand/` and was
  regenerated. `CACHE` in `sw.js` was bumped, because the favicon and the icons are
  cache-first.
- Verified: validate, `node --check`, contrast and scale tests all pass. The mark keeps the
  flag's 36px / 28px box, `scrollWidth` is 375 on both pages at 375px, and headless
  screenshots of the header look right in light and dark.
- **Font outlines need a non-browser UA.** The Google Fonts CSS API gives WOFF2 to Chrome,
  which opentype.js cannot parse. The script launches Chrome with `--user-agent=curl/8.0`
  and gets TTF. The Bash tool still has no egress, but a Chrome it launches does.


## Session developments (2026-09-23, the practise-mode mockup)

**The mode cards follow `docs/Mockups/ui/practise-modes.png`**, measured off its pixels
and mapped by card width (362 -> 205.6px).

- **Shade:** every practise tile reads the new `--tile` on `--tile-edge`. In dark that is
  `#202020`, 1.068 on the page, against the mockup's 1.064, and a `#2F2F2F` hairline, 1.300,
  exactly the mockup's. Before, the tiles were `--band` on the heavy `--border`. Light did
  not change.
- **Minimal:** circular discs; no action label and no clock glyph; one foot row with the
  facts on the left and an arrow disc on the right; the due chip on its own line. The picker
  is a filled pill with no visible label (its `aria-label` stays).
- **The one departure:** at five columns the two facts stack. At the mockup's scale they
  would be ~10px, under the 12px floor. A container query on the card does it.
- **Removed:** `--on-hue`, `ICONS.clock`, `mode.*.start`, `dash.state` and
  `.state-picker-label`, all of which had lost their last reader.
- **Verified:** contrast and scale tests pass, with new pairs for `--tile`. At 1280, all five
  arrows share one line in both languages. At 1024 the facts sit on one line, centred on the
  disc. At 375 there is no overflow, and `scrollWidth` is 375.
- **Headless Chrome, launched back to back from one Bash call, silently writes no
  screenshot after the first.** One launch per call works every time.



## Session close (2026-09-23, diff review of #98–#102 and its fourteen fixes)

A review of the five merged PRs nobody had reviewed (#98 header row, #99 and #100 landing
bands, #101 logo kit, #102 practise-mode cards). None was open; the last recorded review
was #96/#97. It found fourteen things, and all fourteen are fixed here. **The same session
wrote the fixes it reviewed**, so no second reader has seen them.

Live commit: **[`9b98fcb`](https://github.com/thelivinsine/eib-quiz/commit/9b98fcb)**. It was squash-merged to `main` with **no PR**, on the
user's instruction, from `fix/review-98-102`, which is deleted.

### The two that could stop the app booting
- **`_schemeMql.addEventListener` threw on Safari < 14.** Safari 13.1 parses the script
  (it has `?.`) but only has `addListener`, so the top-level call threw and nothing after it
  ran. Now it falls back to `addListener`.
- **The theme's `localStorage` calls were unguarded**, unlike every other key. In a
  storage-blocked browser `initTheme()` threw before `loadQuestions()`. They are guarded
  now, and the change listener reads an in-memory `_themeMode` instead of storage.

### The rest
- `#langToggle`'s name is now "EN – Switch to German", so it contains its visible label
  (WCAG 2.5.3).
- The mode card's container query is 195px, not 240: a container query measures the
  content box, so the facts were stacking at 820px when one line fit.
- The glossary/history `<summary>` hover is back on `--hover`. `--tile-hover` is 1.105 on
  a dark tile, and those rows have no edge to carry the state.
- The phone's `gap: 0` is scoped to `.header-controls > .seg`, so the navigator's
  Linear/Shuffle/Topics seg keeps its gap.
- Two new pairs in `contrast.test.mjs`: `accent-text / hover` (the language pill, 4.54 in
  dark) and `hover / tile`. Two stale pair descriptions were corrected.
- `make-logo-kit.mjs` now deletes the old kit only after both network steps succeed. Its
  tagline reads "Practise", and the kit was re-run. Only the eight lockups that carry the
  tagline changed; the mark, favicon and app icons came out identical, so no `CACHE` bump.
- Cleanups: the dead `state.themeDark`, the split `.result-stats` rule, an orphaned
  `mode.*.start` comment, and a "flag mark" comment.

### Verified
Contrast (10), scale (12), `validate.js` and `node --check` on the main script all pass.
In the preview pane:
- At 820px the facts are on one line; at 1280 they stack with all five arrows on one line.
- The pill's name follows the language switch: "EN – …" and "DE – …".
- All three scheme buttons save their mode and paint the right theme.
- With `localStorage` stubbed to throw, `initTheme()` and `setTheme('system')` run without
  throwing.
- At 375px, `scrollWidth` is 375 and the header seg ends at 359.

### Not verified
- **The Safari fallback was never run.** There was no Safari 13 to test on; the branch is
  read, not exercised.
- **The dark summary-row hover was never seen hovered.** Its value was checked in the
  parsed stylesheet and its ratio worked out by hand.
- **The narrow navigator seg's restored gap** was confirmed only as a parsed rule. No
  phone round was opened to look at it.
- Chromium only. The live site was not opened.

## Session developments (2026-09-23, one button size, header toggles, eyebrows)

- **Every text button is one size**: 44px (`--ctl-md`), a 15px/600 label (`--fs-base`),
  `--space-xl` a side (`--space-md` below 620px, `--space-sm` below 360px), a 16px glyph,
  8px corners (`--radius-ctl`, new, measured off `logo-kit.png`). `.btn-sm`, `.btn-lg`,
  `.btn-group` and every per-context size override are deleted. The rationale is in the
  BUTTONS comment in `index.html` and in `CLAUDE.md`.
- The secondary button is the logo kit's Learn More: `--text` label, a `--faint` edge in light.
- On a phone the hero's two buttons stay **side by side** (one line, 44px, both languages,
  at 375 and 320).
- The three grey eyebrows above the landing page's headings are gone, and `.eyebrow` with them.
- Both nav links are `--text`; `.nav-link--cta` is gone.
- The header toggles follow the user's screenshot. A first attempt was reverted because it
  removed the accent, and "remove the colour" meant the fills. They are now hairline boxes
  with 8px corners, 36px tall, and no fill or chip. EN is in the accent. The chosen mode is
  a solid accent glyph and the other two are `--muted` outlines drawn in CSS. They sit on
  the nav's centre line.

### Verified
Contrast (10), scale (12), `validate.js` and `node --check` pass. In the pane: every button
measures 44 / 15px / 8px on Home, Practise (resume banner), quiz and results, at 1280 and
375. Quiz and results stay height-locked at 393 / 620 / 940 / 1280 / 1400 on a four-image
question with the explanation open. The header row fits at 375 / 361 / 320 in both
languages. Nav and toggles share one centre (38px), and in a session the toggles line up
with the back button.

### Not verified
- Dark mode was not seen rendered. The pane would not repaint it; every colour involved is
  an asserted token.
- The results screen's three actions wrap to 2 + 1 on a phone. Three cannot share 343px at 15px.

## Session developments (2026-09-23, the Where-you-stand ring)

- The overview ring is **152px** (was 104). It has an `--accent` arc (a gradient went in review), a knob on the arc's
  leading end, and a tick at the 52% pass mark, with a "Pass mark 52%" key under the verdict.
  The percentage is `--fs-xl`/700.
- "Small steps make big progress." is removed, with `.dash-pill`, `dash.pill`, the leaf glyph
  (from `ICONS` and `tools/icon-packs.mjs`) and the `green / tile` contrast pair.
- Both count-ups now time from the first frame's timestamp, through one `countUp()` helper. The first frame could paint a
  negative percentage.

### Verified
Contrast (10), scale (12), `validate.js`, `node --check` and the icon-pack generator all
pass. In the pane: the arc and knob land exactly (67% gives dashoffset 103.6 and 241.2deg),
the count-up settles on 67%, the layout is centred with no overflow at 1000 / 375 / 320 in
both languages, and the reset glyph clears the bigger ring. Screenshots were taken in light
and dark.

## Session developments (2026-09-23, scheme icons from the reference)

- The header's sun / monitor / moon are now **line icons** taken from the user's reference:
  a ring with eight short rays, a rounded screen on a neck and base, and a crescent. The
  header seg's CSS strokes them, and the chosen mode's body is filled in the accent. They
  moved to `tools/icon-packs.mjs`'s `line` pack, and the shipped strings match the
  generator's output.
- The reference's blue moon was not copied. On its light page with System chosen, it is
  not the resolved theme and is most likely a hover.

## Session close (2026-09-23, buttons, header toggles, Where-you-stand ring)

This work was substantial, so it ended with a PR: **thelivinsine/eib-quiz#103** from
`header-toggles-buttons`. It was reviewed and fixed in a follow-up session (below) and
**merged** as [`2b05bc4`](https://github.com/thelivinsine/eib-quiz/commit/2b05bc4). The PR
body lists what was verified and what was not. The open items are: dark-mode buttons were not seen rendered, no hover state was seen hovered,
only Chromium was tested (Safari's SVG `transform-origin` on the ring's knob in particular),
and the scheme icons were drawn by eye because the reference screenshot never reached disk.

## Session developments (2026-09-23, review of #103)

`/code-review` at xhigh on #103 found thirteen things, and all thirteen are fixed on
`header-toggles-buttons`. **The same session wrote the fixes it reviewed**, so no second
reader has seen them.

Live commit: **[`2b05bc4`](https://github.com/thelivinsine/eib-quiz/commit/2b05bc4)**, #103 squash-merged with the fixes on it, on the
user's go-ahead. `header-toggles-buttons` is deleted. No new PR was opened.

- The ring's arc is plain `--accent`, and so is the knob's ring. The gradient could not
  follow a circle, light's two blues were near-identical, and dark's `--accent-fill` end
  measured ~1.9:1 on the track.
- `.nav-link:hover` is inside `@media (hover: hover)`. A tap left it stuck on the link just
  made active, which greyed the current page.
- The exam's pass mark is the top-level `EXAM_PASS` / `EXAM_SIZE`, and `PASS_PCT` is derived
  from them. The results pass check, `end.threshold` and the ring's tick all read it.
- One `countUp()` helper serves both rings.
- The secondary button's edge is the `--btn-edge` / `--btn-edge-hover` tokens, not two
  `html.light` overrides.
- `.header-nav, .header-controls` share one rule for their drop onto the nav's line.
- The phone-only `.modes-band { padding-top }` is deleted. It cleared the green line, which
  is gone.
- German writes "52 %" in `dash.passMark` too.
- `contrast.test.mjs` lost `accent-text / hover`, which had no consumer, and two pair
  descriptions were corrected. Stale comments in `ICONS` and on the overview card were fixed.

### Verified
Contrast and scale (22 tests), `validate.js` and `node --check` on the main script pass. In
the pane: the arc is #2563EB in light and #70ADFA in dark with no gradient element left, the
secondary button's edge is `--faint` in light and `--border` in dark, the German key reads
"Bestehensgrenze 52 %", and `end.threshold` renders from the constants in both languages.
`countUp()` was run in Node under a stubbed `requestAnimationFrame`: 0% to 67%, no negative
frame.

### Not verified
- **No geometry from this session counts.** The pane reported `innerWidth` 0, so the shared
  nav/toggle centre (38) is not a measurement, and no phone width was checked.
- The count-up was not seen animating in a browser: the pane does not run
  `requestAnimationFrame`.
- No hover state was seen hovered, and nothing was tried on a touch device.
- Chromium only.

## Session developments (2026-09-23, grey scheme icons)

- The header toggles are **grey only**. EN and the chosen mode are `--text` (the chosen
  mode's body filled); the other two icons are `--muted` lines. No accent anywhere.
- sun / monitor / moon are redrawn to the reference's proportions: short rays round an r 4
  ring, a 20x14 screen on a neck and base, and a full crescent. They are 16px, which
  matches the reference's 0.37 of the box. The shipped strings match `tools/icon-packs.mjs`.

### Verified
Contrast (10), scale (12), `validate.js` and `node --check` pass. Headless screenshots in
light, System and dark were looked at.

### Not verified
- Drawn to the reference by eye; the screenshot never reached disk.
- Light's `--muted` is the app's slate grey (#4F6280), a blue-tinted grey. It is not the
  neutral grey the reference may use.
- Hover was not seen hovered.
- **Merged directly to `main` as `9f6044b`** (on request, no PR; the diff is one colour, one
  icon size and three drawings). Pages publishes it from there.

## Session developments (2026-09-23, header centre line and collapsing scheme seg)

- The nav and the two toggles sit on the header's **centre line** (on request: "quite close
  to the border"). The `flex-end` + `-4px` drop from 2026-09-22 is gone, and so is the
  in-session override it needed. The nav box ends 12px above the hairline, not 4.
- `.header-content` is a `1fr auto 1fr` grid, so the nav is centred on the page and the
  seg opening in the right column does not move it on desktop.
- The scheme seg shows **only the chosen mode** and slides open: on hover, on keyboard
  focus (`:has(:focus-visible)`), and on a tap where there is no hover (`.open`). A choice
  closes it (`.picked`, cleared on `mouseleave` / `focusout`). A `pointerdown` outside
  closes a tapped-open seg.

### Verified
Contrast and scale (22 tests) and `node --check` on the main script pass. In the pane, with
`innerWidth` read first: at 1280 the brand, nav and controls share centre 30 and the nav
stays at 565-700 open and closed. At 375 and 320, in both languages, open and closed, there
is no overflow and the open nav clears the brand by 10.9 at 320. The touch sequence works
(tap opens, pick closes and applies dark, pointerdown outside closes). The in-session
header is on one centre line and holds 734/734.

### Not verified
- No real hover: the pane does not synthesise one. The parsed hover rule was read instead.
- Keyboard focus-visible opening was not driven; the rule is present.
- Nothing was tried on a real touch device. Chromium only.
- **Merged directly to `main` as `a2203fe`** (on request, no PR). Pages publishes it from there.

## Session developments (2026-09-23, scheme icons bolded, not filled)

- The chosen scheme glyph is **bolded** (`stroke-width: 2.75` against 2), not filled. Only
  the sun also fills its r 4 disc, which is too small to read as bold. Monitor and moon stay
  outlines (on request).

### Verified
Contrast and scale (22 tests) pass. Headless screenshots of all three selected states were
looked at, and every glyph stays inside its 24-unit box at 2.75.

### Not verified
- Dark theme was not screenshotted; the rule is theme-independent (`currentColor`).
- **Merged directly to `main` as `e0e058c`** (on request, no PR). Pages publishes it from there.

## Session developments (2026-09-23, review of #103 and the three header commits)

No PR was open, so `/code-review` at xhigh ran over #103 plus `9f6044b`, `a2203fe` and
`e0e058c`. It found ten things and all ten are fixed. **The same session wrote the fixes it
reviewed**, so no second reader has seen them.

Live commit: **[`b1328ff`](https://github.com/thelivinsine/eib-quiz/commit/b1328ff)**,
squash-merged straight to `main` from `review-103-fixes` on the user's go-ahead ("no new PR
needed"). The branch was never pushed and is deleted.

- **The scheme seg's chosen cell is `order: 1` (last).** The seg opens leftward from a
  right-aligned column. With the sun first, opening it slid the sun 72px away and put the
  moon under the cursor. EN still slides left on open, and the open order no longer matches
  the Tab order.
- **A tap is decided by the seg's `pointerdown` `pointerType`, not only by `(hover: hover)`.**
  On a touchscreen laptop, finger taps could never open the seg.
- `.open` and the `:has(:focus-visible)` rule are **two rules**. In one list, a browser
  without `:has()` dropped `.open` too.
- `initTheme()` runs **before** the first `syncHeaderHeight()`. Otherwise the collapse
  transition played on every dark or system load.
- `EXAM_GENERAL` / `EXAM_STATE` define the exam, `EXAM_SIZE` is their sum, and
  `startMode()` draws from them. `mode.exam.desc` / `.badge`, `end.general`, `end.stateOf3`
  and `dash.verdict.buildingSub` take placeholders.
- sun / monitor / moon use a `_line()` wrapper and a global `.icon-line` stroke, so they draw
  correctly outside the header seg too. `.seg-btn--icon` is gone, folded into the header rule.
- `clock` is deleted from `tools/icon-packs.mjs` (no reader). Two `accent-text` pair
  descriptions in `contrast.test.mjs` now name their real consumers. Three stale header
  comments were rewritten.

### Verified
Contrast and scale (22 tests), `validate.js`, `node --check` on the main script and the
icon-pack generator all pass, and markup carries no `stroke="currentColor"`. In the pane at
1280 (`innerWidth` read first): the sun keeps its 1126-1162 cell when the seg opens. With
synthetic pointer events, touch taps open and choose, and mouse and keyboard clicks choose.
A dark-mode reload starts no seg transition. `ICONS.sun` outside the seg draws stroked. The
exam card, verdict and results sub-scores render the same strings in both languages, and an
exam still draws 30 + 3.

### Not verified
- No real touch device or touchscreen laptop, and no real hover. The pointer events were
  synthetic.
- No browser without `:has()` was tried. The split rule's effect there is argued.
- No phone width was re-measured after the reorder. The cells' widths did not change.
- Chromium only.

## Session developments (2026-09-23, type roles and tablet/phone layout)

Branch `typography-responsive`, shipped as PR #104 (squash-merged on the user's go-ahead after
the code review below). Spec and plan:
`docs/plans/2026-09-23-typography-and-responsive-{design,plan}.md`.

- **Every piece of text reads one of 16 `--type-*` roles** (`font: var(--type-*)`), each
  a `font` shorthand of `--fs-*` / `--lh-*` / `--font-*`. Phone type is two token
  overrides in a max-width 700px block (heading 22, figure-lg 28; 700 because the 5.2vw headline only clears 36px above 692). `scale.test.mjs` gained the
  `typeOutsideRoles` ratchet (160 -> 0), a role-format test, a 12px floor test for the
  roles and a hierarchy test at both widths.
- **Labels are sentence case** everywhere (quiz readouts, results figures, footer column
  titles, the history badge); nothing is uppercase (the two taglines only keep `--ls-caps`
  tracking).
- **No nav underline**: the current page is `--text`, the other link `--muted`.
- **Phone hierarchy fixed**: headline 32 > numbers 28 > headings 22 (numbers were 36,
  headings 18); the question is 18 over 16px answers (both were 16).
- **Tablet (621-940)**: the quiz keeps Previous/Next under the answers (gap 16px at
  768x1024, was ~430); the mode grid is six half-tracks so the last two cards centre under
  the first three, all five one height; the script notes and the gate hide below 940, so
  the CTA band is one row (122px tall at 768, was 209).
- **Found and fixed**: the phone readout gap (`--space-sm`) had never applied — the
  in-session rule's `--space-md` outranked it — and the image credit was an inline 10.9px.
- The dark-mode why/CTA panels (practise tile shade) ride on the branch as its first commit.

### Verified
Contrast + scale (28 tests), `validate.js` (460 questions), `node --check` on `sw.js` and
the main script, `manifest.json` parses. In the pane with `innerWidth` read first: a role
audit (every visible text element's computed font matched against the 16 roles) is empty on
Home, Practise (details open), the quiz (image question, explanation open, exam) and results
at 375 / 768 / 1024 / 1280 in EN and DE. No horizontal overflow at 320 / 375 / 768 / 1024;
`scrollHeight == innerHeight` on the quiz at 360 / 375 / 620 / 768 / 940 / 1400 with the
navigator closed and open, and on results at 375 / 768 / 1280. Quiz readouts one line at 360
in both languages even at 150 / 150 / 50% / 300. All figures compute `tabular-nums`. Mode
grid measured one height and centred (offset 0.0) at 768 and 1024 in both languages. All
four verdict headlines one line at 320. The language switch leaves no stale `data-i18n`
string; the three scheme modes survive a reload.

### Not verified
- The role audit matches computed signatures, so two roles with the same signature as an
  unrelated style (e.g. Inter 15/600 = control) can pass a wrong-role element; the declared
  CSS ratchet is the backstop.
- No real touch device, no Safari/Firefox; the pane cannot show a hover.
- 900x600 scrolls, by the existing max-height 640 release, not locked.

### Final review and where it is
- **Final review** (fresh reviewer): no Critical findings. Two were fixed. First, phone type
  moved from 620 to 700px, because the 5.2vw headline sat under the 36px figure at
  621-692px (measured 32.3 against 36 at 621, now 32.3 against 28). A test now sweeps the
  hierarchy at every width from 320 to 1600. Second, the role tests had holes: a misspelt
  `--type-*` name passed, and an exception could grow a property it was never granted.
  Stale comments were corrected too. The colour-only page marker in the nav was left as
  the user chose it, and is raised in the PR.
- **Code review fixes** (same day, on the branch): the inactive nav link is also a weight
  lighter (400), because colour alone was 2.85 / 2.10:1; the results ring shrinks at 700 with
  its numeral; the `/ 310` and `/ 300` denominators keep `tabular-nums`; list rows
  (`.hist-row`, `.hist-exam-stats`, `.review-answer`) keep `--lh-ui`; the why/CTA panels
  read a `--panel` token instead of an `html.light` override; `button, select` reset with
  `font: inherit`; the 621-940 tablet block is gone (its two phone rules moved into the 620
  block, which also closes the 620-621px sub-pixel gap); the closing-pair selector no longer
  hard-codes `:nth-child(4)`; the duplicate label rules joined the shared list.
  The quiz readouts wrapped at 320 as soon as the counts reached two digits (the row needs
  up to 310px, the screen had 256): the row drops its phone inset and, below 342px, the
  score's word, and now holds one line at 320 / 343 / 360 in both languages.
- **PR #104 is squash-merged to `main`** as **[`e5bb588`](https://github.com/thelivinsine/eib-quiz/commit/e5bb588)**, which Pages publishes. The worktree `../EIB-typography` and the `typography-responsive` branch (local and remote) are deleted. Main's `b1328ff` was merged into the branch first;
  the only conflicts were the nav rule, where the branch's no-underline version won, and this
  file. **The review's fixes were written by the session that reviewed them**, so no second
  reader has seen `e867ec9`. After `e867ec9` the full role audit was not re-run; it would flag
  the three list rows and the inactive nav link by design (14/400 at `--lh-ui` matches no role).

## Session developments (2026-09-23, compact buttons, readout glyphs, resume title)

On request, on branch `ui/compact-buttons-readout-icons` (worktree `../EIB-compact`):
- **Hero headline** `--fs-hero` 44 -> **40** desktop, 32 -> **30** phone
  (`clamp(1.875rem, 5.2vw, 2.5rem)`); both ends still clear the 36/28 figures.
- **CTA band heading** ("Take the next step today.") `--type-heading` -> `--type-subheading`,
  24 -> 18.
- **Every text button** 44 / 15px / 28px / 16px glyph -> **36 / 14px / 20px / 14px**, the old
  shape scaled by 36/44 (width:height within ~4%: Start now 3.45 -> 3.59, Discard 2.58 -> 2.61).
  `--type-control` deleted (15 roles). Buttons are `flex: none; white-space: nowrap` — never
  stretched or squeezed on a phone; the hero pair's `flex: 1 1 0`, `.cta-btn`'s phone
  `width: 100%` and the 620/360px padding cuts are gone, and rows wrap instead (German at
  320 wraps both the hero and the resume pair, centred). Touch: a coarse-pointer `::after`
  makes a 44px target without changing the drawn shape.
- **Overview readouts** each carry a bare `--icon-lg` glyph centred above the figure:
  `ICONS.file` / `checkCircle` (restored from `bc261c6^` to the pack and to `index.html`, and
  diffed against the generator) / `clock` (alias re-minted).
- **Resume banner**: the title is the practise card's name instead of "Pick up where you left
  off" (`dash.resume` deleted), the plate is that card's glyph, and the line under it keeps
  the count, prefixed by the topic or state for those two round types.
- **Tagline** "Learn · Practise · Pass" -> **"Learn. Practise. Pass."** (DE "Lernen. Üben.
  Bestehen."); logo kit re-run. Only the lockups changed; the favicon and app icons are
  identical after line-ending normalisation, so no `CACHE` bump.
- Verified in the pane at 1280 / 375 / 320, both languages, light and dark: no horizontal
  overflow on Home or Practise; quiz and results screens still 812/812 at 375.
