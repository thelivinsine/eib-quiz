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
- Visual styling: a **Bento** design system (redesigned 2026-07-16, adapted from a superdesign.dev
  bento profile brief). One cohesive `<style>` block in `index.html` (no layered overrides — the
  whole block IS the system). POV: clean, confident bento — big friendly **rounded-[26px] tiles**
  (`--radius-lg`), full-**pill** buttons/chips, two soft layered shadows (`--shadow-soft`/`--shadow-lift`),
  a faint **24px dotted grid** on `body` (`--grid-dot`), and a **DISCIPLINED accent duo**: one **teal**
  primary + one warm **apricot** pop, most tiles white/charcoal with a hairline border. Two themes
  share the palette — DEFAULT = **light "paper-grey"** (canvas `#F2F3F5`, ink `#17181C`), `.light` is
  the default look; dark = **charcoal** (canvas `#131418`). NOTE the theme wiring: the JS toggles the
  `.light` class and DEFAULTS to light (`initTheme` only goes dark if `localStorage.theme==='dark'`);
  an inline pre-paint `<script>` in `<head>` adds `.light` before first paint to avoid FOUC, and
  `setTheme` also updates `#themeColorMeta`. Palette → legacy token names (JS writes these into inline
  styles, DON'T rename): **teal** = `--accent`/`--lime` (`#0F9D8F` light / `#17B5A4` dark; `--teal-deep`,
  `--teal-tint`, `--accent-fill`, `--accent-grad`, `--on-accent`); **apricot** = `--gold` (`#E07A1F`
  light so it reads as text / `#FB923C` dark; `--apricot`, `--apricot-deep`, `--apricot-tint`); `--blue`
  = info/time; semantic `--green` (correct) / `--red`+`--red-text` (wrong). `--ink-tile` = the charcoal
  fill for dark tiles. `.tile` (and dash/mode/etc.) share the tile look and a **springy hover-lift**
  (`translateY(-4px)`, `--ease-spring` = `cubic-bezier(.34,1.56,.64,1)`). Type: **Bricolage Grotesque**
  (`--font-head`, display + big numbers) + **Inter** (`--font-body`); `--font-mono` is aliased to Inter
  (kept only so JS refs resolve). Uppercase tracked (0.16em) micro-labels are tile eyebrows (`.eyebrow`
  + shared list). Icons stay **inline SVG** via `ICONS`/`_svg()` (NOT Phosphor/Iconify — offline-first,
  Google Fonts is the only external dep). Catalogue images always show in **true colours**. NOTE:
  ring/score geometry (`.ready-ring*` r=50→C=314, `.score-ring*` r=60→C=377) is preserved so the JS ring
  animations still work — keep the `stroke-dasharray` values.
- **Bento home:** the home screen is a **bento grid** (`.bento-top`, 4-col → collapses to 2/1). Tiles:
  a 2×2 white **overview anchor** (`#homeStatus`/`.dash` — the Trefferquote readiness ring centered over
  a Beantwortet/Gemeistert/Fällig stat row, + resume banner + reset); a 2-wide charcoal **CTA tile**
  (`.cta-tile`, static HTML — "Prüfung starten" launches exam, apricot hero-underline + teal glow); a
  teal-tint **Bundesland map tile** (`#bundeslandTile`/`renderBundeslandTile` — inline-SVG street grid +
  apricot `.map-pin` + the moved `#stateSelect` picker + local time); and a solid-teal **mastery stat
  tile** (`#statTile`/`renderStatTile` — `masteredCount()/pool` + accuracy trend chip). Then the 4 mode
  tiles (`#modesGrid`), topics/history/glossary as full-width tiles. `renderBundeslandTile()` +
  `renderStatTile()` are called from `initHomeScreen`, `onStateChange`, the progress-reset, and the
  quit/home handlers (so mastery/state stay fresh). The ring uses `stroke-dasharray`/`dashoffset` with a
  spring-ease animation; arcs <2% hide the bar to avoid a stray round-cap dot.
- **SVG icon system:** all UI emoji on mode cards, topic chips, and badges are replaced by
  inline SVG line-icons via the `ICONS` const and `_svg()` helper in the `<script>` block.
  When adding new icons, add them there (not as emoji or external SVGs).
- **Animated results:** the results screen shows an SVG score ring with a percentage count-up
  animation (green=pass, red=fail). The quiz has a slim animated progress bar and per-question
  entrance transitions. All motion respects `prefers-reduced-motion`.
- `html { overflow-x: clip }` prevents horizontal scroll on mobile (guard against overflows).
- `index.html` loads question data at runtime from `questions.json` via `fetch`
  (so the app must be served over http/https, not opened via `file://`).
- Google Fonts is the only intended external network dependency.
- Dark/light theme uses `localStorage` key `theme`.
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
4. Serve over http (`python3 -m http.server`) and confirm `questions.json` loads, the 43
   image questions render, progress persists across reload, and Smart Review surfaces
   due/weak questions.
5. PWA: `node --check sw.js`; confirm `manifest.json` is valid JSON and the icon paths exist.
   When changing cached static assets, bump `CACHE` in `sw.js`.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `legacy/questions-final-extended.json` first.
2. Confirm image questions keep valid `option_images`/`image` paths (43 total; see Image Questions).
3. Run `node legacy/regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
