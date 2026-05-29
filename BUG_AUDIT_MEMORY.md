# EIB Bug Audit Memory

Date: 2026-05-29

## Current Production State

Production was rolled back and pushed to `main` in commit `d2b1527` (`revert production app to May 9 version`).

- `index.html` was restored from May 9 commit `ce64bd8`.
- `sw.js` is now a kill switch that unregisters the May 28 service worker and clears `eib-quiz*` caches.
- The restored production app has no manifest or service-worker registration references.
- Validation after rollback: script parse passed, 320 contiguous question IDs, sampled corrupted questions restored.

Note: this exact May 9 rollback also restores Q21 to `correct: 1`; the later Q21 fix (`correct: 0`) is not included.

## May 28 Regression Summary

The May 28 work introduced a larger PWA/persistence feature set and a JSON-to-HTML regen flow. The major regression was bad question data in `questions-final-extended.json` being copied into the shipped HTML.

Key changed commits:

- `1e9549f` / merge `e0d7569`: PWA, dashboard, bookmarks, focus mode, TTS, vocabulary tooltips, JSON source.
- `54bf481`: added `regen_questions.js` and rebuilt embedded `QUESTIONS` from JSON.
- `3a19cad`: made question navigator visible in all modes.
- `40997a6`: changed Q21 correct index from `1` to `0`.

## Confirmed Bugs In May 28 Build

- Corrupted options in the JSON/HTML for questions including Q6, Q7, Q9, Q10, Q12, Q15, Q16, and Q28.
- `Alle Fragen` still filtered with `!q.berlin && !q.appExtra`, so it loaded 300 instead of the intended 310.
- Timer cleanup was incomplete when returning home or switching modes.
- Added persistent `eib_study_history`, bookmarks, focus mode, and dashboard, conflicting with the simpler stateless app constraint.
- Tooltip code used implicit global `event.stopPropagation()`.
- Q21-Q30 had pending translation/explanation placeholders in the May 28 JSON/HTML.

## Useful Checks

For any future repair, run:

```powershell
node --check <extracted-script.js>
node -e "/* validate 320 questions, IDs 1-320, no duplicates, image question IDs */"
```

Repair order if reviving the May 28 architecture:

1. Repair `questions-final-extended.json` first.
2. Run `node regen_questions.js`.
3. Copy regenerated app to `index.html`.
4. Validate script parse and dataset invariants.
5. Fix `Alle Fragen`, timer cleanup, and decide whether persistence/focus mode should stay.
