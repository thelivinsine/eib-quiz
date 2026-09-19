# EIB Quiz — Project Status & TODO

_Last updated: 2026-09-19_

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
  `lang="en"` on the English text. Light-theme colour contrast still fails AA — see #2a.
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

### 2a. Open UI items from the 2026-09-19 accuracy audit — _not started_
Deliberately left out of the audit fix PR so as not to collide with in-flight UI work.
All three are CSS/palette changes:
- **Light-theme contrast fails WCAG AA.** Measured against the `#F2F3F5` canvas:
  `--gold` `#E07A1F` = **2.71:1** (fails even large-text AA at 3.0), `--accent`
  `#0F9D8F` = **3.03:1**, `--green` `#0E9F6E` = **3.05:1**. `--gold` is used as text
  on `.badge-gold` and the exam sub-score numbers; `--accent` on `.question-num`, the
  bilingual toggle and the current-question nav chip. Dark theme passes (6.8–9.6:1).
  Note `CLAUDE.md` currently claims `#E07A1F` "reads as text on paper" — it does not.
- **Exam timer scrolls out of view.** `#timer` sits at roughly `top: -130px` once you
  are on question 1, so a 60-minute timed simulation runs with an invisible countdown.
  Needs `position: sticky`.
- **Touch targets under 44px on mobile.** `darkBtn`/`lightBtn` at 27px,
  `.progress-reset` at 15px.

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
