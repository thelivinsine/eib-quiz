# EIB Quiz Project Memory

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

Vanilla HTML/CSS/JS quiz for the German citizenship test, Berlin variant.

- No framework or build step.
- Visual styling: a "Premium UI redesign layer" at the END of the `<style>` block overrides/
  refines earlier component rules (depth, type, motion). Keep the lime/dark palette tokens; when
  restyling, prefer editing that layer. New design tokens: `--shadow-sm/md/lg`, `--glow`,
  `--card-grad`, `--hairline`, `--radius-lg`.
- **Dashboard home:** the home screen is a dashboard with an animated SVG readiness ring
  showing **Trefferquote (accuracy)**, key stats (Beantwortet/Gemeistert/Fällig), and the
  integrated Bundesland picker — all inside a single "Übersicht" card. The ring uses
  `stroke-dasharray`/`dashoffset` with a spring-ease animation; arcs <2% hide the bar to
  avoid a stray round-cap dot.
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

## Tracked Files

- `TODO.md` - current project status + open TODOs (image assets, appExtra verification,
  deferred features). Check/update this when picking up or finishing work.
- `index.html` - production app served by GitHub Pages; loads `questions.json` at runtime.
- `questions.json` - question data, source of truth. Generated from the good `QUESTIONS`
  data via `tools/extract-questions.js` (NOT from `questions-final-extended.json`).
  Each question carries a `category` (see `tools/categorize.js`).
- `img/` - real image-question assets (+ `ATTRIBUTIONS.md` fetch manifest). Some assets are
  still pending fetch (egress blocked Wikimedia); the app shows a "Bild fehlt" fallback for any
  missing image and otherwise works.
- `tools/extract-questions.js` - regenerates `questions.json` from index.html's data + wires
  image questions to real asset paths and descriptive labels.
- `tools/validate.js` - runs the validation checklist (count/IDs/structure/spot-checks/assets).
- `tools/import-states.js` - (re)generates the 15 non-Berlin state question sets from
  `tools/data/official-catalogue-bamf-2026-02.json` (BAMF catalogue; see ATTRIBUTIONS.md).
- `tools/translate-states.js` - adds English `en`/`options_en` to the imported state questions
  (dictionary-based: templated stems + translated semantic options, verbatim proper nouns).
- `tools/explain-states.js` - adds bilingual `explanation_de`/`explanation_en` to the 150
  non-Berlin state questions (template-based from question stem + correct answer).
- `tools/categorize.js` - assigns a `category` to every question (rights/politics/history/
  society/symbols) using question text + correct answer keyword matching.
- `sw.js` - production service worker (offline cache; network-first for HTML/questions.json).
- `manifest.json` - PWA manifest (name, icons, theme); linked from `index.html`.
- `favicon.svg`, `og-image.png` + `og-image.svg`, `img/icons/icon-{192,512}.png` - icons & social card.
- `einbuergerungstest-berlin.html` - May 28 standalone source file; currently not production.
- `questions-final-extended.json` - May 28 JSON source; known to contain corrupted data. Do NOT use.
- `regen_questions.js` - May 28 regen tool; do not run until JSON is repaired.
- `BUG_AUDIT_MEMORY.md` - concise audit/rollback memory.

## Image Questions

Image questions (Q21, Q130, Q209, Q226, Q311, Q318) use real asset files in `img/`,
referenced as `option_images: ["img/.../x.svg", ...]` and rendered as `<img>` (no longer
inline-SVG doodles). Q55 ("Was zeigt dieses Bild?") uses `image: "img/q55-reichstag.webp"`.
Image-option `options` are descriptive labels (not "Option 1"). See `ATTRIBUTIONS.md` for the
pending-asset fetch manifest. Keep the `correct` index pointing at the correct asset.

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
4. Serve over http (`python3 -m http.server`) and confirm `questions.json` loads, the six
   image questions + Q55 render (or show the "Bild fehlt" fallback for not-yet-fetched assets),
   progress persists across reload, and Smart Review surfaces due/weak questions.
5. PWA: `node --check sw.js`; confirm `manifest.json` is valid JSON and the icon paths exist.
   When changing cached static assets, bump `CACHE` in `sw.js`.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `questions-final-extended.json` first.
2. Confirm the six image questions keep valid `option_images`: Q21, Q130, Q209, Q226, Q311, Q318.
3. Run `node regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
