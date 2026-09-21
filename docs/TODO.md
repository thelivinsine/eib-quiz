# EIB Quiz — Project Status & TODO

_Last updated: 2026-09-21_

## Project status

Vanilla HTML/CSS/JS quiz for the German citizenship test, all 16 Bundesländer, served by
GitHub Pages from `main` (`index.html` + `questions.json` + `img/`). No build step, no
framework. Installable PWA with offline support.

**Shipped and live:**
- Real-asset image questions (all 43 present) with a "Bild fehlt" fallback.
- Question data externalized to `questions.json` (source of truth).
- Persistent progress with spaced repetition (`eib_progress_v1`), resumable sessions
  (`eib_session_v1`), Smart Review mode, and a home readiness panel.
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
