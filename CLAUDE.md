# EIB Quiz Project Memory

## Current Production

- Live site is GitHub Pages from the `main` branch root.
- Production entry point is `index.html`.
- On 2026-05-29 production was rolled back to the May 9 app version in commit `d2b1527`.
- `sw.js` is intentionally a kill switch for the May 28 service worker. Keep it until returning visitors have had time to receive the unregister/cache-clear update.
- The rolled-back `index.html` does not register a service worker and does not reference `manifest.json`.

## App Shape

Vanilla HTML/CSS/JS quiz for the German citizenship test, Berlin variant.

- No framework or build step.
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
- SEO/meta, Open Graph/Twitter cards, `favicon.svg` and `og-image.svg` are in `<head>`;
  JSON-LD (LearningResource) is included. NO service worker is registered (sw.js stays a
  kill switch) — PWA/offline remains intentionally deferred.
- The 10 `appExtra` questions (Q301-310) are general (NOT Berlin) and remain EXCLUDED from
  all pools until verified against the official catalogue.

## Tracked Files

- `index.html` - production app served by GitHub Pages; loads `questions.json` at runtime.
- `questions.json` - question data, source of truth. Generated from the good `QUESTIONS`
  data via `tools/extract-questions.js` (NOT from `questions-final-extended.json`).
- `img/` - real image-question assets (+ `ATTRIBUTIONS.md` fetch manifest). Some assets are
  still pending fetch (egress blocked Wikimedia); the app shows a "Bild fehlt" fallback for any
  missing image and otherwise works.
- `tools/extract-questions.js` - regenerates `questions.json` from index.html's data + wires
  image questions to real asset paths and descriptive labels.
- `tools/validate.js` - runs the validation checklist (count/IDs/structure/spot-checks/assets).
- `sw.js` - temporary rollback kill switch.
- `einbuergerungstest-berlin.html` - May 28 standalone source file; currently not production.
- `questions-final-extended.json` - May 28 JSON source; known to contain corrupted data. Do NOT use.
- `regen_questions.js` - May 28 regen tool; do not run until JSON is repaired.
- `manifest.json` - May 28 PWA artifact; currently unused by production.
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
2. Run `node tools/validate.js` (320 questions, contiguous IDs 1-320, no duplicates,
   structure valid, spot-checks Q6/7/9/10/12/15/16/28, lists any missing image assets).
3. Extract the final `<script>` block from `index.html` and run `node --check` on it.
4. Serve over http (`python3 -m http.server`) and confirm `questions.json` loads, the six
   image questions + Q55 render (or show the "Bild fehlt" fallback for not-yet-fetched assets),
   progress persists across reload, and Smart Review surfaces due/weak questions.
5. Confirm production `index.html` does not unintentionally re-register the old PWA service worker.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `questions-final-extended.json` first.
2. Confirm the six image questions keep valid `option_images`: Q21, Q130, Q209, Q226, Q311, Q318.
3. Run `node regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
