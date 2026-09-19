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
  - **An answer option is a well INSIDE the card, so it takes `--surface2`.** It was
    `--surface` inside a `--surface` card: in light that is white on white, separated by one
    hairline. Its letter chip takes `--surface3` so the ladder stays concentric (card →
    option → chip), and the dimmed-after-answering state is a **text tier only** — the fill it
    used to borrow is now the base. Hover is `--surface3` in both themes: darker than
    `--surface2` in light, lighter in dark, so one value steps the right way on both ladders.
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
- **Mobile is a first-class layout, not a fallback.** Every control is at least 44px tall
  (`.btn-*`, the header `.seg-btn` switches, `#stateSelect`); `#stateSelect` is `font-size: 16px` so iOS Safari
  does not zoom on focus; the keyboard hint is hidden under `@media (hover: none)`; `main` and the
  header respect `env(safe-area-inset-*)`. Under 620px the mode cards become a single-column list
  (icon beside the title), the three overview stats stay three columns, and the exam timer goes to
  one line. `html { overflow-x: clip }` is the backstop, not the plan — check `scrollWidth` at
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
    tinted** (`--accent-soft` fill, a saturated `--accent` edge, a solid `--accent-fill` icon
    chip and Start pill); the other three modes are equal-weight peers. There is exactly one
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
    and the `dash.eyebrow` key is gone. `Reset progress` sits right-aligned on the card's own
    footer rule (`.dash-foot`), out of the reading path, rather than centred under the numbers
    where it read as the card's conclusion.
  - The counter for questions due is the one stat allowed to draw attention
    (`.dash-stat--due`): **a coloured numeral only**. It was an apricot-tinted slab, which on
    charcoal reads as brown mud and buys no more attention than the colour alone. The others are
    neutral.
  - Gone with the bento: `.bento-top`, `.cta-tile`, `#bundeslandTile`, `#statTile`, `MAP_SVG`,
    `renderBundeslandTile()`, `renderStatTile()` and `stateLocalTime()`. Mastery is one of the
    overview card's three counters.
  - **A control belongs to the section it changes.** The state picker (`#statePickerSlot` /
    `renderStatePicker()`) sits in the Practise section's `.section-head--row`, beside the exam
    and state modes it governs — not in the overview card, which only reports.
  - `initHomeScreen()` is the one door that repaints the home screen. Callers do not call the
    individual renderers.
- **The navigator groups a long ordered round by category.** `renderQuestionNav()` builds
  `<details class="qnav-group">` per `q.category` (state questions group under the state name).
  The group holding the current question is always open; a group the reader opened by hand stays
  open, and the *previously* active one collapses — otherwise a lap of the round leaves every
  category expanded. Open state is carried across re-renders by reading the DOM about to be
  replaced, plus `navLastActiveKey`; there is no separate store to keep in sync.
  - **Groups appear only when they earn their keep.** A shuffled round, a round of 40 or fewer,
    or a round that is all one category renders the flat grid — one `<details>` over the whole
    list is a lid, not a grouping.
  - `.question-nav-grid` is `repeat(auto-fill, minmax(44px, 1fr))`. Measured: 4 columns of
    47px in the 256px sidebar (its own scrollbar takes ~17px of the content box) and 14 across
    in the full-width strip below 940px. Cells are finger-sized in both.
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
  is persisted in the session so a resume renders the navigator the right way.
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
  the question are Back and Next. `#quitBtn` is gone; `#sessionBack` carries it, with one
  branch — from the quiz it confirms first, from the results screen it goes straight home.
  Both buttons are driven by **`disabled`, never `display`**, so the pinned row cannot change
  height as you answer, and the Enter shortcut reads the same property the button does.
  `#sessionBack`'s accessible name is `nav.backAria` ("Back to the start page"), **not** the
  `nav.back` on its face: `#backBtn` is also called "Back" and is also on screen, and one of
  the two abandons the round. The aria label still contains the visible word, so WCAG 2.5.3
  holds. Leaving a session cancels speech on **both** branches — the results-screen path
  silently did not, while the Home button beside it did.
- **The navigator states progress once.** It used to carry a second copy of `.quiz-progress`,
  the same percentage in words, and a four-swatch legend; the stats bar restated the question
  number a fourth time. `updateProgress()` writes to one element, `#questionNum` carries its
  own total (`quiz.questionOf`), and the stats bar is three columns.
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
