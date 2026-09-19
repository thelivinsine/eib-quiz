# EIB Quiz — Project Status & TODO

_Last updated: 2026-09-20_

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
- **Touch targets under 44px** — fixed: the theme/language switches are 46px controls, the
  progress-reset link is 44px, and a `@media (pointer: coarse)` block takes the question-card
  icon buttons and the navigator cells to 44px. Audited live at 375px: every `button`,
  `select` and `summary` on screen measures ≥44px.

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
- **The block below the progress bar starts 15% down the screen**: `.quiz-layout` takes
  `margin-top: min(15svh, 50svh - 260px)`, moving the readouts, the question and the navigator
  together — at 1280x800 the readouts go 126 -> 246 and Previous/Next 614 -> 734, with 66px
  still beneath them. The cap keeps the shift and the body's 50svh floor from together
  outgrowing a locked screen (941x645 overflowed by 4px without it), so below ~750px tall the
  shift tapers instead of the question. The exam is exempt (`body.in-exam`, set in
  `showScreen()`): its clock already spends the slack the shift would use.
- **Image options scaled down 30%** (`.options--image { max-width: 70% }`, prompt image 294px):
  a four-image question now fits without the body scroller at 1100x800.

## Notes for future work
- **PWA updates:** when changing cached assets, bump `CACHE` in `sw.js` so installed PWAs
  and SW-cached browser tabs pick up the new version (otherwise users see a stale build).
- **Branch/merge:** because PRs are squash-merged, reset the working branch to `origin/main`
  (or cherry-pick) before the next change to avoid squash conflicts.
- **Egress:** verifying the live site / fetching Wikimedia & GitHub raw is blocked by the
  environment egress allowlist. Pages deploy status is checkable via the GitHub Actions API
  ("pages build and deployment" runs).
- **Code gotchas** (biased shuffle, shadowed globals, mode-key renames, `lang="en"`) live in
  the Gotchas section of `CLAUDE.md`, which loads into every session. The reasoning behind
  each one is in the 2026-09-19 session block above.
