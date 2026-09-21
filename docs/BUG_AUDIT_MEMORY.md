# EIB Bug Audit Memory

Dated record, newest first. **Entries below are historical — they describe the tree as it
was on their date, not as it is now.** Read `docs/TODO.md` for current state.

Superseded since: the 19 "PENDING" image assets in the 2026-06-20 entry were all obtained
(2026-06-25, from the official BAMF PDF — 43/43 present, 0 missing); the pool grew from 320
to **460** (300 general + 16 Bundesländer x 10), so every "320 contiguous" check below now
reads 460; and the `appExtra` questions referenced in the May 28 notes were removed entirely
in PR #28.

## 2026-09-19 — Accuracy & quality audit (branch `fix/accuracy-audit`)

Full audit of the shipped app. Data came back clean — 460 questions, contiguous IDs, no
mojibake, no empty or duplicate options, every question bilingual with DE+EN explanations,
0 missing image assets. Code did not. Confirmed bugs, all fixed except the UI ones:

- **Exam sampling was ~7x biased.** `.sort(() => Math.random() - 0.5)` is not a shuffle.
  Measured over 20k simulated exams: Q1 drawn 5022 times, late-catalogue questions 732,
  against an expected 2000. Replaced with Fisher-Yates `sample()`; ratio now 1.21.
- **`let history = []` shadowed `window.history`** in the same top-level script scope, so
  the `scrollRestoration = 'manual'` fix from PRs #11-13 had never run. Renamed
  `resultsHistory`.
- **Two stale `berlin` mode keys** after the rename to `bundesland`: end-screen title fell
  back to "Fertig!", Verlauf printed the raw mode string.
- **`resumeSession()` dropped `missedQuestions`**, losing the wrong-answer review on resume.
- **`overallAccuracy()` counted other Bundeslaender's answers** in the Trefferquote ring.
- **Metadata drift:** manifest claimed 310 questions and pre-Bento `#050505` colours;
  title/OG/JSON-LD claimed Berlin-only + 300 questions.
- **Deferred (UI, tracked in `docs/TODO.md` #2a):** light-theme contrast fails WCAG AA
  (`--gold` 2.71:1, `--accent` 3.03:1, `--green` 3.05:1), the exam timer scrolls out of
  view, and several touch targets are under 44px.

## 2026-06-20 — Real image assets + persistence (branch `claude/web-app-audit-improvements-mf8kvi`)

Deliberate, scoped follow-up to the audit. NOT a revival of the May 28 architecture.

- Question data externalized to `questions.json`, **generated from the known-good `QUESTIONS`
  array in `index.html`** via `tools/extract-questions.js` — explicitly NOT from the corrupted
  `questions-final-extended.json`. `index.html` now `fetch`es it at runtime (needs http, not file://).
- Image questions (Q21/130/209/226/311/318) rewired from inline-SVG doodles to real `<img>`
  assets under `img/`; placeholder labels ("Option 1") replaced with descriptive labels used by
  alt text + the review screen. Q55 given its missing Reichstag image. `correct` indices preserved.
- Persistence reintroduced on purpose (overrides the old "session-only" rule): Leitner
  spaced-repetition under `eib_progress_v1`, resumable session under `eib_session_v1`, a new
  "Smart Review" mode, a home readiness panel, and a "Fortschritt zurücksetzen" reset.
- Locally authored assets committed: 4 ballots (Q130) + exact-spec EU flag/distractor (Q226).
  19 real assets (coats of arms, maps, UN/NATO flags, Reichstag photo) are PENDING — the build
  env's egress blocked Wikimedia. App shows a "Bild fehlt" fallback for any missing image. See
  `img/ATTRIBUTIONS.md` for the fetch manifest.
- Validation: `node tools/validate.js` passes (320 contiguous, no dupes, structure, spot-checks);
  extracted `<script>` passes `node --check`; SR/session logic unit-tested against shims.

---

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
node tools/validate.js   # 460 questions, contiguous IDs 1-460, no duplicates, image assets
```

Repair order if reviving the May 28 architecture:

1. Repair `legacy/questions-final-extended.json` first.
2. Run `node legacy/regen_questions.js`.
3. Copy regenerated app to `index.html`.
4. Validate script parse and dataset invariants.
5. Fix `Alle Fragen`, timer cleanup, and decide whether persistence/focus mode should stay.
