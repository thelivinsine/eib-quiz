# EIB Quiz Project Memory

## Current Production

- Live site is GitHub Pages from the `main` branch root.
- Production entry point is `index.html`.
- On 2026-05-29 production was rolled back to the May 9 app version in commit `d2b1527`.
- `sw.js` is intentionally a kill switch for the May 28 service worker. Keep it until returning visitors have had time to receive the unregister/cache-clear update.
- The rolled-back `index.html` does not register a service worker and does not reference `manifest.json`.

## App Shape

Single-file vanilla HTML/CSS/JS quiz for the German citizenship test, Berlin variant.

- No framework or build step.
- Google Fonts is the only intended external dependency.
- Dark/light theme uses `localStorage` key `theme`.
- Quiz state should remain session-only unless persistence is explicitly reintroduced.

## Tracked Files

- `index.html` - production app served by GitHub Pages.
- `sw.js` - temporary rollback kill switch.
- `einbuergerungstest-berlin.html` - May 28 standalone source file; currently not production.
- `questions-final-extended.json` - May 28 JSON source; currently known to contain corrupted question data.
- `regen_questions.js` - May 28 regen tool; do not run until JSON is repaired.
- `manifest.json` - May 28 PWA artifact; currently unused by production.
- `BUG_AUDIT_MEMORY.md` - concise audit/rollback memory.

## Known May 28 Regression

The May 28 build introduced PWA/persistence features and a JSON-to-HTML regen flow. The major bug was corrupted question data in `questions-final-extended.json`, which was then copied into HTML by `regen_questions.js`.

Examples of corrupted May 28 questions: Q6, Q7, Q9, Q10, Q12, Q15, Q16, Q28.

Do not publish from `questions-final-extended.json` until it has been repaired and validated.

## Validation Checklist

Before publishing any app change:

1. Extract the final `<script>` block from `index.html`.
2. Run `node --check` on the extracted script.
3. Verify 320 questions, contiguous IDs 1-320, and no duplicates.
4. Spot-check previously corrupted questions Q6, Q7, Q9, Q10, Q12, Q15, Q16, Q28.
5. Confirm production `index.html` does not unintentionally re-register the old PWA service worker.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `questions-final-extended.json` first.
2. Confirm the six image questions keep valid `option_images`: Q21, Q130, Q209, Q226, Q311, Q318.
3. Run `node regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
