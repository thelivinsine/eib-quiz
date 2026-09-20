# EIB Quiz Project Memory

## Workflow Preference

- **Ship via PR + merge.** When changes are ready, open a pull request into `main`
  and merge it (squash) — don't leave finished work sitting on a feature branch.
  Merging `main` publishes to production (GitHub Pages), so only merge work that's
  been validated.

## Current Production

- Live site is GitHub Pages from the `main` branch root.
- Production entry point is `index.html`.
- On 2026-05-29 production was rolled back to the May 9 app version in commit `d2b1527`.
- PWA is intentionally re-enabled (2026-06-20): `sw.js` is now a real offline cache (NOT
  the old kill switch) and `index.html` registers it and links `manifest.json`. The SW is
  network-first for HTML + `questions.json` (so updates always win online) and cleans up all
  old caches — including the May-28 `eib-quiz*` caches — on activate, which subsumes the old
  kill switch. Bump `CACHE` in `sw.js` to invalidate cached static assets.
- **Network-first only works with `cache: 'reload'`, and both fetch paths need it**
  (fixed 2026-09-19). A plain `fetch(req)` consults the **browser's HTTP cache** first;
  GitHub Pages serves `index.html` with `max-age=600`, so the worker's "network" fetch was
  answered out of that cache without touching the network — and then stored the stale copy
  as the offline fallback. Caught on the live site right after a deploy: the CDN had the new
  build, `fetch(url, {cache:'reload'})` got it, and the same URL through the worker returned
  the old one. A reload did not help, because the reload hit the same HTTP cache. `addAll()`
  in `install` has the identical default, so a fresh install could seed itself from the very
  copies it exists to replace. **If a deploy looks like it did not ship, check this before
  suspecting Pages.**

## App Shape

Vanilla HTML/CSS/JS quiz for the German citizenship test, all 16 Bundesländer.

- No framework or build step.
- Visual styling: a **quiet bento** design system (redesigned 2026-07-16, minimalised 2026-09-19
  against `claude-context-kit/docs/reference/theme-{light,dark}.md`). One cohesive `<style>` block
  in `index.html` (no layered overrides — the whole block IS the system). POV: white/charcoal tiles
  on a flat canvas, **rounded-[16px]** (`--radius`), full-**pill** buttons/chips, and a
  **DISCIPLINED accent duo**: one **teal** primary + one warm **apricot** pop. Two themes share the
  palette — DEFAULT = **light "paper-grey"** (canvas `#F2F3F5`, ink `#17181C`), `.light` is the
  default look; dark = **charcoal** (canvas `#131418`).
  - **The dark ladder is calibrated against `theme-dark.md` §1/§3, not eyeballed.** A tile sat
    1.09 off the canvas where the measured band for a card is 1.15 (PowerToys) to 1.30 (ChatGPT);
    the whole ramp above `--canvas` moved up by one delta so the shape is unchanged and
    `--surface` now sits at 1.16. `--muted`/`--faint` were spread apart at the same time — §2
    warns that four greys at 9/8/7/6 read as one mushy grey, and the tiers now read
    13.6 / 8.4 / 6.1 / 4.9 on a tile. **Light already cleared its own reference** (a light card
    is 1.11 on the page against a measured 1.07) and was not touched.
  - **A mode card's body copy is `--sub-text`, its meta and time are `--muted`.** They were
    `--muted` and `--faint`: `theme-dark.md` §2 puts a description in the SECONDARY band
    (7.3-10.2) and reserves ~4.7 for placeholder/disabled text, so the cards were painted almost
    entirely in the two quietest tiers. The icon and arrow chips' glyphs are `--sub-text` for the
    same reason.
  - **`--surface2` is a well INSIDE a tile, never a tile on the canvas.** The results screen's
    two breakdown tiles had overridden the shared tile rule back down to `--surface2` /
    `--border-soft` while sitting on the page: in light that is 1.03 fill and 1.04 hairline
    against the canvas, under `theme-light.md`'s 1.05 nesting and 1.10 hairline floors, and
    invisible beside the 1.11 every other tile manages. Dark hid it (1.30) because the dark ramp
    has the room. A tile on the page takes `--surface` + `--border`, full stop.
  - **Rounding is one three-step scale plus a pill, and there is no fourth value.**
    `--radius-xs: 4px` (bars, tracks, swatches, the image inside an image option),
    `--radius-sm: 10px` (wells, nav cells, letter chips, thumbnails, `kbd`), `--radius: 16px`
    (every tile and card), `--radius-pill`. `--radius-lg` and `--radius-xl` were deleted, and
    eight radii — five of them literals a token search never finds — collapsed into these.
    Nested corners follow **inner = outer − padding, snapped to the nearest step**: a 16px card
    with 14px of padding holds a 10px option, a 10px option with 10px of padding holds its
    image at 4px. A radius written as a literal is a bug, not a special case.
  - **No drop shadows anywhere, in either theme.** A tile is a fill plus a hairline. There are no
    `--shadow-*` tokens; do not reintroduce one for a tile. Light mode would only earn a shadow
    under something that genuinely floats, and nothing in this app does.
  - **Elevation and hover point in opposite directions in light mode.** Raised surfaces go **up**
    towards white (`--surface` above `--canvas`, `--surface2` inset inside it); hover goes **down**
    into grey (`--hover`). In dark, both go up. Hover is a fill change, never a lift.
  - **An answer option is a tile ON THE CANVAS** (2026-09-20), because the card around it is
    gone. In light it takes `--surface` (#FFF, the measured 1.11 page step) — it was
    `--surface2`, which is #F5F6F8 on a #F2F3F5 page, a 1.02 step and the whole of the
    "washed out" look. **Dark carries it one rung higher** (`--surface2`, 1.36 above the
    canvas, chip `--surface3`): `--surface` at 1.16 is the right step for a big tile and too
    quiet for a 42px row you are meant to reach for, and the dark ramp has the room light does
    not. Hover is `--hover`, the token that already knows each theme's direction. The
    dimmed-after-answering state is a **text tier only**.
  - **Every text tier is a solid hex value, never opacity** — `--text` / `--sub-text` / `--muted` /
    `--faint`, all clearing 4.5:1 on both `--surface` and `--canvas` in both themes.
    `node --test tools/contrast.test.mjs` reads the tokens out of `index.html` and asserts it.
  - The theme wiring: the JS toggles the `.light` class and DEFAULTS to light (`initTheme` only
    goes dark if `localStorage.theme==='dark'`); an inline pre-paint `<script>` in `<head>` adds
    `.light` before first paint to avoid FOUC, and `setTheme` also updates `#themeColorMeta`.
  - Palette → legacy token names (JS writes these into inline styles, DON'T rename): **teal** =
    `--accent`/`--lime` (`#0B7D72` light / `#17B5A4` dark; plus `--accent-text`, `--teal-deep`,
    `--teal-tint`, `--accent-fill`, `--accent-grad`, `--on-accent`); **apricot** = `--gold`
    (`#B45309` light so it reads as text / `#FB923C` dark; `--apricot`, `--apricot-deep`,
    `--apricot-deep`); `--blue` = info/time; semantic `--green` (correct) / `--red`+`--red-text`
    (wrong). `--accent-hover` is the tinted card's hover fill — **not** `--accent-line`, which is
    a border value: as a fill it is a 1.27x jump in light and a saturated mid-teal in dark, which
    put the featured card's own description and meta under AA the moment you pointed at it. `--ink-tile` = the charcoal-fill tile — now only the header brand mark; in dark it
    is a step **up** the ladder (`#262A33`), because a charcoal tile on a charcoal canvas reads
    as a hole.
  - Type: **Bricolage Grotesque** (`--font-head`, display + big numbers) + **Inter**
    (`--font-body`); `--font-mono` is aliased to Inter (kept only so JS refs resolve). Display
    weights top out at 700. Uppercase micro-labels tracked at 0.08em are tile eyebrows (`.eyebrow`
    + shared list).
  - Icons stay **inline SVG** via `ICONS`/`_svg()` (NOT Phosphor/Iconify — offline-first, Google
    Fonts is the only external dep). Catalogue images always show in **true colours**.
  - NOTE: ring/score geometry (`.ready-ring*` r=50→C=314, `.score-ring*` r=60→C=377) is preserved
    so the JS ring animations still work — keep the `stroke-dasharray` values.
- **In a session the page keeps wider side gutters** than the home screen: `--spacing-xl`
  (28px) rather than `--spacing-lg`, because the question is the only thing on screen and
  should not run to the edges. Below 620px it drops back to `--spacing-md`.
- **Mobile is a first-class layout, not a fallback.** Every control is at least 44px tall
  (`.btn-*`, the header `.seg-btn` switches, `#stateSelect`); `#stateSelect` is `font-size: 16px` so iOS Safari
  does not zoom on focus; the keyboard hint is hidden under `@media (hover: none)`; `main` and the
  header respect `env(safe-area-inset-*)`. Under 620px the mode cards become a single-column list
  (icon beside the title), the three overview stats stay three columns, and the exam timer goes
  to one line. The quiz readouts drop their hairlines and tighten to a 9px gap so all four stay
  on ONE line in both languages at 360px — they are the one thing on that row worth reading, so
  the numbers went UP to 1.15rem rather than down. The header goes the other way: it is a strip
  you glance at, so `.header-controls .seg-btn` is 26px, `.session-back` 32px and the brand mark
  28px — stated in the 620px block, after the coarse-pointer floor, so source order decides. `html { overflow-x: clip }` is the backstop, not the plan — check `scrollWidth` at
  375px after any layout change.
- **The home screen is four named sections, not a grid of tiles** (restructured 2026-09-19).
  Each `<section class="home-section">` opens with a `.section-head` (`<h2>` + one line of
  description) so the page reads heading > card title > body. In order: a short
  **`.hero-landing`** (content-sized, one primary action); **Where you stand** (`#homeStatus` —
  one wide `.dash` card holding the accuracy ring, three counters, the resume
  banner and the reset link); **Practise** (`#modesGrid`); **By topic** (`#topicSection`); and a
  quieter **History & reference** (`#historySection` + `#glossarySection`).
  - **A colour written as a literal must be added to LITERAL_PAIRS in `tools/contrast.test.mjs`.**
    The test parses the two token blocks; a hex in a rule is invisible to it otherwise. Five
    literals are listed today (the brand-mark letter, and the letter on the correct/wrong answer
    chips in each theme); prefer a token, and if a literal is unavoidable it goes in the list the
    same day.
  - **The exam is the only featured card.** `.mode-card--featured` is full-width and **teal-
    tinted** (`--accent-soft` fill, an `--accent-line` edge, a solid `--accent-fill` icon
    chip and Start pill); the other three modes are equal-weight peers.
    - **Its edge is `--accent-line`, NOT `--accent`** (2026-09-20). A saturated ring around a
      tinted fill is the exact treatment `.option-btn.correct` uses for the right answer, so
      the card read as *selected* on a page where nothing is selectable. `--accent-line` is
      the same hue one step off the card's own fill — #BEE0DA on #EDF7F4 in light — which
      separates it from the canvas without borrowing the answer language. Hover matches. There is exactly one
    primary action per section — do not add a second call to start the exam.
    - It used to be a charcoal slab painted in five hex literals, which put its body text at
      `#B4B7C0` on near-black while the peers beside it ran at full ink: the loudest card on the
      page had the weakest type. It now carries the **same `--text`/`--sub-text`/`--muted` tiers
      as every other tile** — emphasis comes from hue, width and the solid accents, never from
      dimming words. Its separation from the page is the hairline, not a step in lightness; in
      light mode the tint and the paper-grey canvas sit at nearly the same luminance, which is
      exactly the case light mode hands to edges.
  - **A peer card states its time in the corner and its clickability with an arrow.**
    `.mode-time` is the estimate stamped top-right, which leaves `.mode-meta` to the one fact
    that varies (the count, or the apricot due flag). `.mode-go` is the circled arrow at the
    bottom-right: the cards are buttons but read as readouts on a touch screen, where there is
    no hover to reveal it. The peers still repeat no "Start" — that stays the featured card's
    word alone. Descriptions do not restate a number the card already shows.
  - **The mode cards carry no per-card accent.** They had one hue each (teal/gold/green/blue)
    with a matching tinted badge and a matching coloured "Start" link, which is the rainbow
    `theme-dark.md` §2 warns about: chroma belongs to content and at most one accent. Icons and
    metadata are grey; the card is the button, so the peers repeat no "Start"; the only colour
    among them is `.mode-flag`, the apricot chip shown when Smart Review actually has work due.
  - **The state picker's pill hugs the selected state.** A native `<select>` is as wide as its
    longest option, so binding the pill to it sized every state to "Mecklenburg-Vorpommern" and
    left "Berlin" with a 165px gap before the caret. The visible value is a `.state-picker-value`
    span and the `<select>` is a transparent overlay across the pill; `onStateChange` updates the
    span rather than re-rendering the control, which would drop focus mid-interaction.
  - **The overview card is one band, not four boxes.** The ring and the three counters sit in a
    single row separated by **hairlines** (`.dash-stats` border-left, `.dash-stat + .dash-stat`);
    they were four nested rounded wells inside a rounded card, which is the containers-inside-
    containers look. There is no `OVERVIEW` eyebrow — the section heading above already says it,
    and the `dash.eyebrow` key is gone. `Reset progress` is a **corner glyph**
    (`.progress-reset`, `ICONS.reset`, absolutely positioned top-right of `.dash`, 44px square
    so it keeps its touch target, `title` + `aria-label` for its name). It had a footer rule and
    a 44px band of its own — a whole row for something you press once a year. `.dash-foot` and
    `dash-stats`' right padding is what keeps the band clear of it.
  - The counter for questions due is the one stat allowed to draw attention
    (`.dash-stat--due`): **a coloured numeral only**. It was an apricot-tinted slab, which on
    charcoal reads as brown mud and buys no more attention than the colour alone. The others are
    neutral.
  - Gone with the bento: `.bento-top`, `.cta-tile`, `#bundeslandTile`, `#statTile`, `MAP_SVG`,
    `renderBundeslandTile()`, `renderStatTile()` and `stateLocalTime()`. Mastery is one of the
    overview card's three counters.
  - **On a phone the state picker's label and control share a row** (2026-09-20).
    `#statePickerSlot` turns `flex-direction: row` under 620px: stacked, a two-word eyebrow
    above a full-width pill spent a whole band of the section head on four characters.
  - **A control belongs to the section it changes.** The state picker (`#statePickerSlot` /
    `renderStatePicker()`) sits in the Practise section's `.section-head--row`, beside the exam
    and state modes it governs — not in the overview card, which only reports.
  - `initHomeScreen()` is the one door that repaints the home screen. Callers do not call the
    individual renderers.
- **The navigator offers three views, and the reader picks one** (2026-09-19). `#navActions`
  holds a `.seg.qnav-seg` — the same segmented control as the header switches — with **Linear /
  Shuffle / Topics**. `state.navView` (`'linear' | 'shuffle' | 'categories'`) is what the
  navigator draws; `state.shuffled` stays the ORDER, so `setNavView()` calls `shuffleRound()`
  only when the order actually has to change and otherwise just repaints. Both are persisted in
  the session and both reset on every entry into a round. Grouping is no longer inferred from
  the round's length — it happens when the reader asks for it.
- **A shuffled round wears its ORIGINAL numbers** (2026-09-20). `roundNumber(i)` is the
  question's place in the round as BUILT (its index in `state.baseOrder`), so the cells — which
  are always in the round's CURRENT order — read 48, 263, 123 once shuffled, and a shuffle is
  visible instead of invisible. `#questionNum` reads the same helper, so the card and the cell
  you clicked always agree. Unshuffled it is just `i + 1`.
  - **`showCurrentCell()` runs in both branches.** The scroll-into-view lived only in the
    grouped branch, so in a 300-cell flat list — and in shuffle, where the numbers give you no
    way to guess where you are — the current cell was routinely off screen.
  - **The view switcher does not scroll with the list.** `.sidebar-body` is a flex column,
    `#navActions` is fixed at its top and **`#questionNavGrid` is the scroller** (the rule is
    written against the id, because the renderer swaps the element's class between
    `.question-nav-grid` and `.question-nav-groups`). The mobile `.expanded` panel is
    `display: flex` for the same reason, and the grid needs **`align-content: start`**: a grid
    defaults to `stretch`, so as a flex child that FILLS the panel its auto rows stretched and
    every cell came out a tall rounded slab with the row gap swallowed. Extra room belongs at
    the bottom of the list.
  - **The collapse control is a drawn chevron** (`ICONS.chevron` in a 30px round hit target,
    filled at boot beside `.session-back-icon`), not a `▼` dingbat — the glyph rendered at a
    different weight and baseline in every font stack. CSS rotates it on `.open`.
- **The navigator groups a round by category when asked.** `renderQuestionNav()` builds
  `<details class="qnav-group">` per `q.category` (state questions group under the state name).
  The group holding the current question is always open; a group the reader opened by hand stays
  open, and the *previously* active one collapses — otherwise a lap of the round leaves every
  category expanded. Open state is carried across re-renders by reading the DOM about to be
  replaced, plus `navLastActiveKey`; there is no separate store to keep in sync.
  - **Topics is offered only when there is more than one.** A round that is all one category
    drops the button and renders the flat grid — one `<details>` over the whole list is a lid,
    not a grouping.
  - `.question-nav-grid` is `repeat(auto-fill, minmax(30px, 1fr))` with a 4px gap and a 30px
    `min-height` — **one size for both layouts**; the sidebar's cells used to be a third bigger
    than the strip's for no reason but history. Measured 32x32, six across in the 248px
    sidebar, more on the full-width strip. It clears the 24px WCAG 2.5.8 target and still holds
    the three-digit number a shuffled round shows.
- **`NAV_COLLAPSE_AT` is the one number for the navigator's collapse.** The stylesheet's 940px
  breakpoint and the JS guards must agree: they read 720 against a 940 breakpoint once, and
  between those widths the CSS hid the panel while the toggle refused to open it.
  - **The sidebar header carries button semantics only where it is a button.** Above the
    breakpoint the panel is simply open, so `syncNavHeaderRole()` strips `role`, `tabindex` and
    `aria-expanded`; below it, it sets all three and the header answers Enter and Space. It had
    announced itself as a collapsed button on a 1400px screen, over an open panel, doing
    nothing. It runs on boot, on resize, and on every navigator render so a missed resize
    event cannot leave it lying.
- **`state.shuffled` re-orders a round, and `state.answered` moves with it.** `shuffleRound()`
  captures the round's own order into `state.baseOrder` before the first shuffle and restores
  exactly that — sorting by id was only right for rounds built from the catalogue, and turned a
  mistakes round (built in the order you missed them) into an order it never had. It remaps
  every answer by question id
  (answers are keyed by POSITION, so a re-order silently reassigns them otherwise), and keeps the
  reader on the question they were looking at. Every entry into a round resets the flag; the flag
  is persisted in the session so a resume renders the navigator the right way. It is reached
  through `setNavView()`, not from a button of its own.
- **The question navigator is bounded by the viewport, never by its contents.** 300 cells in five
  columns is a 2700px column: the sidebar grew to match, `position: sticky` stopped meaning
  anything, and the numbers painted down the page outside the card. `.quiz-sidebar` caps at
  `calc(100svh - var(--header-h) - 24px)`, preceded by the same value in `vh` so a browser that
  does not know `svh` keeps a cap instead of dropping the declaration, and `.sidebar-body`
  scrolls inside it. Nothing sets the sidebar's height from JS.
- **`showScreen()` is the one door, and it carries `body.in-session`.** Every screen past the
  home screen is an app view; the class is what makes it one, and nothing else branches on the
  screen name to do it.
- **The page does not scroll outside the home screen** (2026-09-19). `body.in-session main` is
  pinned to `calc(100svh - var(--header-h))` (the `vh` fallback stated first, as with
  `.quiz-sidebar`), and exactly one region inside it scrolls: `.question-body` on the quiz
  screen, `#endScreen` itself on the results screen. `.question-meta` and `.quiz-nav` are
  pinned either side of the card's scroller.
  - **The `min-height: 0` chain is load-bearing**: `main` → `.screen.active` → `.quiz-layout`
    → `.quiz-main` → `.question-card` → `.question-body`. A flex child defaults to
    `min-height: auto`, and one missing link lets the column grow past the viewport again.
  - **`.quiz-layout` needs `grid-template-rows: minmax(0, 1fr)`.** An auto row sizes to its
    tallest item, so the card pushed the nav bar off the bottom of a locked screen while the
    grid itself sat comfortably inside it.
  - **Both scrollers are `overflow: hidden auto`, not `overflow-y: auto`.** Setting one axis
    makes the other `auto` too, and the pick animation's 1.015 scale flashed a horizontal
    scrollbar on every answer.
  - **Below 940px an expanded navigator covers the card, it does not push it down**
    (`:has(.sidebar-body.expanded)` → `position: absolute; inset: 0`). At 45vh above a locked
    card it left about 130px for the question. A browser without `:has` gets the old
    push-down behaviour, which is a degradation rather than a break.
  - **Below `max-height: 640px` the lock is released, deliberately.** The chrome above the
    card is fixed-height, so on a short viewport the card collapsed below its own pinned
    parts: at 740x380 — any phone in landscape — `.question-body` measured 0px and
    `.quiz-nav` sat at 485px, clipped away by `main`'s `overflow: hidden` with no way to
    scroll to it. Readable content wins over the no-scroll rule, and only where the rule
    cannot be kept.
  - **Both scrollers keep a gutter**: `padding-right: var(--spacing-sm)` with a matching
    negative `margin-right`, so the bar sits in the container's own padding instead of
    against the last word of the question or the last nav cell. `padding-right` alone just
    narrows the content and leaves the bar where it was.
  - No caller scrolls the page. The four `window.scrollTo` calls that used to paper over the
    page scroll are gone; `displayQuestion()` resets `#questionBody.scrollTop` instead, and
    `#timer` / `.quiz-sidebar` are no longer `position: sticky` — there is nothing to stick to.
- **Inside a session the header shows a back button, not the logo**, and the only buttons under
  the question are Previous (left) and Next (right) — the row maps to the direction each
  button moves you. `#quitBtn` is gone; `#sessionBack` carries it, with one
  branch — from the quiz it confirms first, from the results screen it goes straight home.
  Both buttons are driven by **`disabled`, never `display`**, so the pinned row cannot change
  height as you answer, and the Enter shortcut reads the same property the button does.
  `#sessionBack`'s accessible name is `nav.backAria` ("Back to the start page"), **not** the
  `nav.back` on its face: one of the two buttons on screen abandons the round. The aria label
  still contains the visible word, so WCAG 2.5.3 holds. `#backBtn` says **`quiz.prev`**
  (Previous / Vorherige), not "Back"/"Zurück" — two buttons reading "Zurück" in German, one of
  which leaves the round, is the collision this key exists to avoid. Leaving a session cancels speech on **both** branches — the results-screen path
  silently did not, while the Home button beside it did.
- **The quiz stats bar's SCORE is accuracy so far; the results screen's is the whole round.**
  They are different numbers on purpose and neither should be "fixed" to match the other.
  `updateStats()` divides by `state.correct + state.incorrect` — one right answer out of 300
  used to read 0% and stayed near zero for most of a long set. `endQuiz()` keeps dividing by
  the round's length, because a round you left 260 questions blank in is not 75%.
- **The navigator states progress once.** It used to carry a second copy of `.quiz-progress`,
  the same percentage in words, and a four-swatch legend; the stats bar restated the question
  number a fourth time. `updateProgress()` writes to one element and `#questionNum` carries its
  own total (`quiz.questionOf`).
- **The progress bar is a track with quarters, not a hairline** (2026-09-20). It carries
  `--spacing-2xl` beneath it, so the readouts, the question and the navigator all start a clear
  step below it rather than crowding the top of the screen. 8px, pill,
  `--surface3`, with the fill's leading edge lit by a 12px gradient tip so it is findable on a
  300-question round, and `::after` drawing quarter marks in `--canvas` **over** the fill — so
  a three-quarters-full bar reads as three quarters rather than as "mostly".
- **The quiz chrome above the card is a progress bar, then one line of readouts** (2026-09-19).
  `.quiz-progress` is the first child of `#quizScreen`, above `#statsBar`, and spans the card
  and the navigator. The four readouts — correct, wrong, score, **answered `n / total`** — are
  **not tiles and carry no separators**: a value and a label on one line, 22px of whitespace
  apart. Four boxed cards cost a whole row of height the question card needed, and four numbers
  divided by three hairlines is six things to look at. The labels sit in `--faint` at 0.63rem so
  the numbers carry the row, and **a zero gets no colour** — green and red arrive with the first
  right or wrong answer rather than lighting a traffic light that is reporting nothing. The answered count came from the navigator's header (`.sidebar-count` /
  `qnav.answered` are gone), so it is stated once, above the fold, on every screen width.
  - **The phone's chrome was re-spaced around the question** (2026-09-20). Under 620px
    `.header-content` takes `padding: 16px/12px` — flush to the top edge the switch row read
    as part of the status bar, and the safe-area inset is ADDED to this, not replaced by it.
    `body.in-session .quiz-progress` then drops `10px` clear of that row. The room comes back
    from BELOW the bar: its `--spacing-2xl` is a desktop rhythm, and at `--spacing-lg` down
    here the four options of an ordinary question still fit without a scroller at 375x667
    (measured: it scrolled with the gap left at 40px). The tally shrank one step with it —
    `.stat-value` 1.15 -> 1.02rem, label 0.63 -> 0.58rem — because at the bottom of the column
    it no longer has to carry the row the way it did at the top.
  - **On a phone the readouts sit BELOW Previous and Next** (2026-09-20). `.quiz-topbar`
    takes `order: 1` inside `.quiz-main` under 940px, so the column reads question ->
    buttons -> tally -> overview strip. At the top they were the first thing on the screen,
    competing with the question, and they are a running tally you glance at rather than
    something to lead with. `order` moves them without touching the DOM, so reading and
    focus order stay question-first. The gap above is `--spacing-2xl` (`--spacing-xl` under
    620px): the buttons belong to the question, the tally and the strip below do not, and
    that distance is what says so. **Desktop is unchanged** — the readouts stay over the
    question column.
  - **The quiz view's quiet tiers were one rung too quiet** (2026-09-20), measured against
    `theme-{light,dark}.md` §2. `.opt-letter`'s glyph was `--muted`, which put A/B/C/D at
    **4.68 on the chip in dark** — the PLACEHOLDER tier (§2 measures 4.67 there) on a label
    that names the answer you are picking; it is `--sub-text` now, 6.46 dark / 9.29 light.
    `.stat-label`, `.stat-of` and `.question-category` moved `--faint` -> `--muted`
    (4.52 -> 5.41 light, 5.67 -> 7.01 dark): at 0.63rem uppercase they were the smallest
    type on screen in the quietest tier, and on a phone the tally now has to read in one
    glance from the bottom of the column. `.option-en-text` is `--sub-text` — for a reader
    using the translation that line IS the answer. **`--faint` is for placeholder and
    disabled, not for a label you read.**
  - **There is no "Pick an answer" line.** Four buttons under a question are self-evident, and
    the string only existed to fill the gap the pinned footer left. `quiz.pick` and `#answerHint`
    are gone.
  - **The question is NOT a box** (2026-09-20). `.question-card` left the tile list: no fill,
    no hairline, no padding, so the question's left edge is the column's left edge and the
    **options are the only boxes**. A card around a card around four cards is the
    containers-in-containers look, and the outer one carried no information.
  - **`.quiz-layout` is two columns and one row** (2026-09-20): the question column
    (`.quiz-main` — readouts, question, then `.quiz-nav`) beside the navigator. The column gap
    is `--spacing-xl`; below 940px it is one column and the strip takes a 10px `margin-top`,
    or it sits flush against Previous.
  - **The navigator's height is FIXED, and the question's is not.** `clamp(300px, 56svh, 680px)`
    with `align-self: start` and `max-height: 100%` (a `vh` line first, as everywhere). Sized
    against the question's own content it held a different height on every question, which is
    movement with nothing behind it. Below 940px the rule is undone — down there the navigator
    is a collapsed strip, and a 450px strip is 450px of nothing.
  - **The question column is content-sized, capped by its grid area.** `.question-card` is
    `flex: 0 1 auto` so Previous and Next sit under the answers rather than at the foot of a
    half-empty column, and `body.in-session .quiz-main { max-height: 100% }` is what makes the
    card SHRINK instead of spilling out of a locked screen — that is the cap
    `.question-body`'s scroller hangs off.
  - **The footer row has a resting position**: `body.in-session .question-body` carries a
    `50svh` floor (a `vh` line first), so Previous and Next land in the same place on every
    ordinary question — measured 622/623 of an 800px viewport, 78% down, with 177px beneath
    them — and a longer question pushes them further down from there until the column hits the
    viewport and the body starts scrolling. Below 940px the floor is dropped and the card fills
    its area instead, which pins the buttons 10px above the overview strip; that needs
    `align-self: stretch` on `.quiz-main`, because the grid places items at the start and a
    content-sized column gives `flex: 1` nothing to grow into.
  - **The block below the progress bar starts 15% of the screen down** (2026-09-20).
    `body.in-session .quiz-layout` takes `margin-top: min(15svh, 50svh - 260px)` (a `vh` line
    first), which moves the readouts, the question AND the navigator down together — the margin
    is on the grid, so both columns travel. It is spent out of the slack that already sat under
    Previous and Next: at 1280x800 the readouts go 126 -> 246 and the buttons 614 -> 734, with
    66px still beneath them and an ordinary question still not scrolling.
    - **The cap is not decoration.** 260px is the chrome above and below `.question-body`'s own
      `50svh` floor; without it, the shift and the floor claim more than the viewport at the
      short end of the locked band and Next is clipped away with no way to scroll to it
      (941x645 overflowed by 4px in testing). Above ~750px tall the full 15% applies; below it
      the SHIFT gives way rather than the question — 90px at 700, 62.5px at 645.
    - **The exam takes the same shift, but pays for it out of the QUESTION** (2026-09-20).
      Its clock is a row the practice screen does not have — chrome 341px against 214px —
      which leaves 67px under the buttons at 800px tall against the 120px the shift spends,
      so there is no slack to pay from. Inside `@media (min-height: 780px)` the exam drops
      `.question-body`'s floor and lets `.question-card` fill (with `align-self: stretch` on
      `.quiz-main`, or `flex: 1` has nothing to grow into). Measured at 1280x800: full 120px
      shift, readouts 134 -> 254, buttons rock-stable at 792, 0/8 unanswered questions
      scrolling. The cost is the open explanation, which scrolls at 800 where it did not;
      at 900 and up it still fits.
      - **The 780px gate is the whole safety margin, and it was found the hard way.**
        Ungated, stripping the floor cost 8/8 unanswered questions scrolling at 941x645
        against 1/8 on the shipped build — for a shift that had already tapered to nothing
        there. Below 780 the exam keeps the shipped behaviour exactly and simply inherits
        the shared `min(15svh, 50svh - 260px)`; above it, no cap is needed because the full
        15svh always fits. Filling also fixes a wobble: content-sized with no floor,
        Previous/Next wandered 748-776 across a round.
      - `in-exam` is set in `showScreen()` beside `in-session`, from `state.currentMode` —
        not in `startMode()`, so the topic, mistakes and resume paths are covered by the same
        line. It is ANDed with `screenName !== 'home'`, or the class outlives the round.
    - Below 940px and below `max-height: 640px` the shift is zeroed. Down there the card
      already fills its area and the buttons are already pinned, so the shift would come
      straight out of the question; and under 520px tall the capped expression goes negative
      and would pull the question up under the bar.
  - **The question block is TOP-aligned under the readouts, not centred.** Centring it opened a
    gap between the readouts and the question they report on, and pushed the question away from
    the panel's top edge; the readouts now sit `--spacing-md` above the question (measured
    16px) and the slack falls below the answers, where the panel's own bottom edge already is.
  - Below 940px the card goes back to filling its area, so the two buttons hold one position
    on every question, directly above the overview strip where a thumb can learn them.
  - **There is no rule above Previous and Next**, and the buttons are 34px / 0.8rem — smaller
    than a page-level action, because you press them a hundred times a round and they should
    not weigh as much as the question. **The keyboard hint rides between them**, inside
    `.quiz-nav`: out of the reading path, on a row that already exists, costing the question no
    height. It is still hidden below 940px and under `@media (hover: none)`.
  - **The question view's spacing says what matters.** The status band is tight to itself
    (a 3px bar, 14px above the readouts) and a full `--spacing-xl` away from the question;
    inside the card the label row gives the question `--spacing-md`, the question gives the
    options `--spacing-lg`, and options are 8px apart. Chrome crowds itself; the question and
    its answers get the room.
  - **The label row above the question is plain text, and it travels WITH the question.**
    `.question-category` is `--faint` after a `·`, not a bordered pill. The row lives inside
    `.question-body`, so it is part of the centred block rather than pinned at the top with the
    slack under it.
  - **An icon-only control keeps its hairline and fill.** Speak, translate, the hint's dismiss
    and the home card's reset were quiet to the point of not looking clickable; each is a
    bordered pill on the tile fill again. Quiet is a colour and a size, not the absence of a
    button.
  - **The question block is CENTRED in the room it has.** `.question-body` is a flex column
    with `justify-content: safe center`, and above 940px the content-sized card adds
    `margin-block: auto`. `safe` is load-bearing: plain `center` in a scroller clips content
    that outgrows the box at the TOP, with no way to scroll back up; a browser that does not
    know the keyword drops the declaration and gets top alignment, which is a degradation
    rather than a break.
  - **Every scroller the app owns gets one thin bar** — `scrollbar-width: thin` plus a 6px
    `::-webkit-scrollbar` with a `--border-hover` thumb on a transparent track, sitting in the
    gutter each scroller already reserves.
  - **The explanation is a tinted box with a hairline, not a slab.** The 3px left accent said
    right-or-wrong a third time, after the tint and the green/red header; the hairline takes
    the hue instead.
  - **Expanded below 940px the panel takes a SHARE of the screen, not all of it.**
    `.sidebar-body.expanded` caps at `26svh` (with a `vh` line first), which puts the WHOLE
    panel — header and padding included — just under **35%** of the screen, and the numbers
    scroll inside it, so the question stays on screen above and the card shrinks into what is
    left.
    It used to cover the card outright (`position: absolute; inset: 0`), which was right when
    the strip was at the top of the screen and wrong now that it is at the bottom — you lost
    the question you were answering the moment you opened the overview.
  - **Below 940px the navigator sits UNDER the question, not above it.** As the first thing on
    a phone screen the strip competed with the question for the reader's first look; at the
    bottom it is also where a thumb already is. `.quiz-layout`'s rows are
    `minmax(0, 1fr) auto` there, and `.quiz-sidebar` no longer carries `order: -1`.
  - **The readouts sit over the question column and centre on it.** `.quiz-topbar` is the first
    child of `.quiz-main`, not of `#quizScreen`: they report on the question you are reading.
    The progress bar stays at screen level, above everything, spanning the card and the
    navigator.
  - **The card is compact so the scrollbar is the exception, not the default.**
    The meta row and `.quiz-nav` take `--spacing-sm`, and `.options` 12px. The question
    is `clamp(1.02rem, 1.5vw, 1.18rem)`, an option is 0.9rem in a 42px row (48px under
    `@media (pointer: coarse)` — a thumb gets the height back, a mouse does not need it) with a
    26px letter chip, and the explanation is 0.86rem. At 994x734 a four-option text question
    fits with no scroller at all; a four-IMAGE question or an open explanation still scrolls
    `.question-body`, which is what it is for.
- **The sizing scale was tightened for a page of sections** (2026-09-20). `--spacing-lg`
  24 -> **20**, `--spacing-xl` 32 -> **28**, `--spacing-2xl` 48 -> **40**; `.home-section`
  56px -> 40px. The steps were set when the home screen was a wall of bento tiles. `--spacing-xs`
  / `-sm` / `-md` are the rhythm INSIDE a control and did not move. Display numbers came down
  one step each (ready ring 1.9 -> 1.6rem and 132 -> 112px, `.ds-num` 1.75 -> 1.5, timer
  1.7 -> 1.45, score ring 2.7 -> 2.3, breakdown 1.8 -> 1.5), as did `.option-btn`
  (56 -> 50px), `.btn-lg` (50 -> 46px) and the glossary rows.
  - **The header's switches are the one deliberate exception to the 44px floor.** `.seg-btn`
    is 30px (36px under `@media (pointer: coarse)`), and `.brand` / `.session-back` are 38px
    (44px on coarse). They are chrome you touch rarely, in a row with nothing else to hit;
    everything that is CONTENT — options, nav cells, the card's own buttons — keeps 44px.
    WCAG 2.5.8 AA asks 24px, and 2.5.5 AAA's 44px is what the rest of the app holds to.
  - **In a session the header drops its bottom hairline** (`body.in-session header`). The page
    does not scroll there, so there is nothing to separate the header from — the rule was just
    a line drawn across a locked screen.
- **UI language: English by default, German optional** (added 2026-09-19). The switch is the
  left segmented control in the header (`#langEn` / `#langDe`), persisted under `localStorage`
  key `eib_lang`, defaulting to `en`.
  - **Only the chrome is translated.** Question text, options and `explanation_de` stay German —
    that is the exam. The per-question translate toggle (`#bilingualToggle`) still reveals each
    question's `en` / `options_en` / `explanation_en`.
  - Every chrome string lives in the `I18N` dictionary as `{ en, de }` and is read through
    `t(key, vars)`, which fills `{placeholders}`. Topic labels go through `catLabel(key)`, which
    reads `CATEGORIES[key][lang]`.
  - Static markup carries `data-i18n` (textContent), `data-i18n-html` (innerHTML, for the hero
    headline's `<span>`) or `data-i18n-aria`. `applyStaticStrings()` fills them; `initLang()`
    runs on boot and `setLang()` on a switch. **A new visible string goes in `I18N`, never
    inline** — an untranslated literal is a string that silently stays German.
  - `setLang()` repaints the screen that is on. `endQuiz()` records the round once and
    `renderEndScreen()` paints it from `state`, so switching language on the results screen
    repaints without recording the round a second time.
- **The results card states each number once** (2026-09-20). The score ring's centre already
  carries the percentage AND `n/total`, so the `.score-text` line under it — "22 of 33 correct
  (67%)" — was a pure restatement; it is gone, with `#scoreMessage`, `end.scoreExam` and
  `end.scoreOther`. The breakdown tiles read **Correct / Wrong** (`Richtig` / `Falsch`), not
  "Answered correctly" / "Answered wrongly" — the second is not English, and the quiz readouts
  already use the short pair. `.pass-fail:empty { display: none }` because only an exam has a
  pass mark and an empty inline-block still spent its margin and padding as a blank band.
- **SVG icon system:** all UI emoji on mode cards, topic chips, and badges are replaced by
  inline SVG line-icons via the `ICONS` const and `_svg()` helper in the `<script>` block.
  When adding new icons, add them there (not as emoji or external SVGs). The question card's
  read-aloud and translate buttons use `ICONS.speaker` and `ICONS.translate`, not emoji.
- **Animated results:** the results screen shows an SVG score ring with a percentage count-up
  animation (green=pass, red=fail). The quiz has a slim animated progress bar and per-question
  entrance transitions. All motion respects `prefers-reduced-motion`.

- `index.html` loads question data at runtime from `questions.json` via `fetch`
  (so the app must be served over http/https, not opened via `file://`).
- Google Fonts is the only intended external network dependency.
- Dark/light theme uses `localStorage` key `theme`; UI language uses `eib_lang`
  (default `en`).
- Learning progress IS persisted (reintroduced 2026-06-20): spaced-repetition records
  under `localStorage` key `eib_progress_v1`, a resumable in-progress session under
  `eib_session_v1`, and a results history under `eib_history_v1`. A "Fortschritt
  zurücksetzen" control clears all three.
- Each question has a `category`; the home screen offers topic practice, a results-history
  trend, and a bilingual glossary. Questions can be read aloud via the Web Speech API (TTS).
- SEO/meta, Open Graph/Twitter cards (`og-image.png`), `favicon.svg` and JSON-LD
  (LearningResource) are in `<head>`. The app is an installable PWA with offline support
  (`manifest.json` + `sw.js`); icons live in `img/icons/`.
- The former 10 `appExtra` questions (Q301-310) were removed (2026-06-26) — they were not
  part of the official BAMF catalogue PDF (which has exactly 300 general questions).
- All 16 Bundesländer are supported: 300 general + 16×10 state = 460 questions. The user picks
  a state on the home screen (`localStorage` key `eib_state`, default `BE`); the active pool is
  300 general + the selected state's 10. State questions carry `state` (code) + `stateName` and
  are bilingual (DE/EN). `tools/import-states.js` (re)generates the 15 non-BE state sets from
  `tools/data/official-catalogue-bamf-2026-02.json`; `tools/translate-states.js` adds the
  English `en`/`options_en` (the official source is German-only); `tools/explain-states.js`
  adds bilingual `explanation_de`/`explanation_en` (generated from the templated stem + correct
  answer). Every question now has both explanations.

## Gotchas

Rules that cost real bugs. Reasoning is in the 2026-09-19 session block of `docs/TODO.md`.

- **Never shuffle with `.sort(() => Math.random() - 0.5)`.** It is heavily biased — it made
  early catalogue questions ~7x likelier to be drawn into an exam than late ones. Use the
  `sample()` Fisher-Yates helper next to `activePool()`.
- **Don't shadow browser globals in the one big `<script>` scope.** It is a single top-level
  scope, so a `let history` silently shadowed `window.history` and killed the
  `scrollRestoration` fix for months. The results array is named `resultsHistory` for this
  reason; keep it that way.
- **Mode keys are `allQuestions` / `bundesland` / `exam` / `review` / `topic` / `mistakes`.**
  There is no `berlin` mode — two label maps kept a stale `berlin` key and silently fell
  through. When renaming a mode, grep every lookup map.
- **Only the exam has a clock, and `startMode()` is what enforces it.** `startTimer()` shows
  `#timer`; nothing on the practice path hid it again, so a round started straight after an
  exam ran with the exam's timer counting down above the question. `startMode()` now clears the
  interval and hides the element for every non-exam mode.
- **An option image is never `loading="lazy"`.** It IS the answer you are choosing, so it is
  always above the fold and deferring it buys nothing — and the deferred load raced the rest
  of the round's requests and came back `net::ERR_FAILED` often enough to paint "Bild fehlt"
  over a file that was sitting right there (reproducible against `python -m http.server`; the
  same `<img>` loaded on the spot once its `src` was re-set without the attribute).
- **Tag the language of any text that is not the chrome's.** `<html lang>` now follows the UI
  language switch, so it may be `en` or `de` and neither direction can be inherited safely:
  English strings carry `lang="en"` and the German exam text — question, options,
  `explanation_de`, the review list, glossary terms — carries `lang="de"`. Untagged text is
  read aloud in the wrong voice.

## Repo Layout

Root holds exactly what GitHub Pages serves; everything else is foldered.

```
/                 live site (served from main root)
  index.html      production app; loads questions.json at runtime
  questions.json  question data, source of truth
  sw.js           service worker (offline; network-first for HTML/questions.json)
  manifest.json   PWA manifest (name, icons, theme); linked from index.html
  favicon.svg, og-image.png (+ og-image.svg source)
  .nojekyll       stops Pages running Jekyll
  .gitignore      ignores local/ scratch dir
  CLAUDE.md       this file
img/              image-question assets + ATTRIBUTIONS.md, icons/, states/
tools/            data-generation + validation scripts (not served)
docs/             project notes (TODO.md, BUG_AUDIT_MEMORY.md)
legacy/           May 28 build; not production, do NOT publish from it
```

Nothing at root may move: `sw.js` precaches `./`, `./index.html`, `./questions.json`,
`./favicon.svg`, `./manifest.json`, `./img/icons/icon-{192,512}.png` by path.

## Tracked Files

- `index.html` - production app served by GitHub Pages; loads `questions.json` at runtime.
- `questions.json` - question data, source of truth. Generated from the good `QUESTIONS`
  data via `tools/extract-questions.js` (NOT from `legacy/questions-final-extended.json`).
  Each question carries a `category` (see `tools/categorize.js`).
- `img/` - image-question assets extracted from the official BAMF catalogue PDF (43 image
  questions, all present). `img/ATTRIBUTIONS.md` has sources and credits.
- `docs/TODO.md` - current project status + open TODOs. Check/update this when picking
  up or finishing work.
- `docs/BUG_AUDIT_MEMORY.md` - concise audit/rollback memory.
- `tools/extract-questions.js` - regenerates `questions.json` from index.html's data + wires
  image questions to real asset paths and descriptive labels.
- `tools/validate.js` - runs the validation checklist (count/IDs/structure/spot-checks/assets).
- `tools/contrast.test.mjs` - reads the colour tokens out of `index.html` and asserts the WCAG
  floors for both themes (`node --test tools/contrast.test.mjs`). Adapted from
  `claude-context-kit/scripts/contrast.test.mjs`; the PAIRS/FILLS lists are this project's.
  LITERAL_PAIRS covers colours written as hex in a rule rather than as tokens, which the block
  parser cannot see — five today (the brand-mark letter, and the letter on the correct/wrong
  answer chips in each theme), matching the rule stated under the home-screen section.
- `tools/import-states.js` - (re)generates the 15 non-Berlin state question sets from
  `tools/data/official-catalogue-bamf-2026-02.json` (BAMF catalogue; see img/ATTRIBUTIONS.md).
- `tools/translate-states.js` - adds English `en`/`options_en` to the imported state questions
  (dictionary-based: templated stems + translated semantic options, verbatim proper nouns).
- `tools/explain-states.js` - adds bilingual `explanation_de`/`explanation_en` to the 150
  non-Berlin state questions (template-based from question stem + correct answer).
- `tools/categorize.js` - assigns a `category` to every question (rights/politics/history/
  society/symbols) using question text + correct answer keyword matching.
- `tools/extract-catalogue-images.py` - parses the official BAMF PDF to enumerate all image
  questions and extract/crop image assets.
- `tools/wire-catalogue-images.py` - wires extracted images into `questions.json` (sets
  `option_images`, `image`, `image_credit` fields).
- `sw.js` - production service worker (offline cache; network-first for HTML/questions.json).
- `manifest.json` - PWA manifest (name, icons, theme); linked from `index.html`.
- `favicon.svg`, `og-image.png` + `og-image.svg`, `img/icons/icon-{192,512}.png` - icons & social card.
- `legacy/` - May 28 build (standalone HTML, corrupted JSON, old regen tool). See
  `legacy/README.md`. Do NOT publish from it.

## Image Questions

**43 image questions**, all extracted from the official BAMF catalogue PDF. Every asset is
present (`node tools/validate.js` reports 0 missing).

- **A four-image grid is capped at 70% of the question's width** (`.options--image`,
  `max-width: 70%`; 72% in the one-column phone layout) and a prompt image at 294px. At full
  width the pictures dwarfed the question they belonged to, and a four-image question no longer
  needs the body scroller at 1100x800.
- **Option-image questions (19)** — 4-image grids, rendered as `<img>` from
  `option_images: ["img/…", …]` with descriptive `options` labels (never "Option 1"):
  general Q21, Q209, Q226, plus each state's Wappen question (Q301, Q311, Q321, … every `*1`).
- **Prompt-image questions (24)** — a single photo above text answers, from `image: "img/…"`:
  general Q55, Q70, Q130, Q176, Q181, Q187, Q216, Q235, plus each state's map/flag question
  (Q308, Q318, Q328, … every `*8`).
- **`image_credit`** (on 5 questions) renders as a small caption under the image.

Assets live in `img/` — per-question folders (`img/q21/`, `img/states/<CODE>/`) or standalone
files (`img/q55-reichstag.webp`). Sources and credits are in `img/ATTRIBUTIONS.md`. Keep the
`correct` index pointing at the correct asset.

## Known May 28 Regression

The May 28 build introduced PWA/persistence features and a JSON-to-HTML regen flow. The major bug was corrupted question data in `questions-final-extended.json`, which was then copied into HTML by `regen_questions.js`.

Examples of corrupted May 28 questions: Q6, Q7, Q9, Q10, Q12, Q15, Q16, Q28.

Do not publish from `questions-final-extended.json` until it has been repaired and validated.

## Validation Checklist

Before publishing any app change:

1. Question data lives in `questions.json` (source of truth) — edit it directly.
   (`tools/extract-questions.js` was the one-time migration from index.html; it no-ops now.)
2. Run `node tools/validate.js` (460 questions, contiguous IDs 1-460, no duplicates,
   16 states × 10 + 300 general,
   structure valid, spot-checks Q6/7/9/10/12/15/16/28, lists any missing image assets).
3. Extract the final `<script>` block from `index.html` and run `node --check` on it.
4. Run `node --test tools/contrast.test.mjs` — it reads the colour tokens out of `index.html`
   and asserts the text and fill floors in both themes.
5. Switch the header to DE and back: no chrome string may stay in the other language, and the
   question text must stay German in both.
6. Serve over http (`python3 -m http.server`) and confirm `questions.json` loads, the 43
   image questions render, progress persists across reload, and Smart Review surfaces
   due/weak questions. Check the page at 375px wide: `document.documentElement.scrollWidth`
   must equal the viewport width. **On the quiz and results screens `scrollHeight` must also
   equal `innerHeight`** — check it at 375 / 620 / 940 / 1400px, on a four-image question with
   the explanation open, and with the mobile navigator both collapsed and expanded.
7. PWA: `node --check sw.js`; confirm `manifest.json` is valid JSON and the icon paths exist.
   When changing cached static assets, bump `CACHE` in `sw.js`. A stale service worker will
   serve the old page during local testing — clear it before judging a change.
8. Exam simulation: 30 general + 3 state = 33 questions, 60-minute timer, pass at 17/33.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `legacy/questions-final-extended.json` first.
2. Confirm image questions keep valid `option_images`/`image` paths (43 total; see Image Questions).
3. Run `node legacy/regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
