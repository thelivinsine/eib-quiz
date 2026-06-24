# EIB Quiz — Project Status & TODO

_Last updated: 2026-06-23_

## Project status

Vanilla HTML/CSS/JS quiz for the German citizenship test (Berlin variant), served by
GitHub Pages from `main` (`index.html` + `questions.json` + `img/`). No build step, no
framework. Installable PWA with offline support.

**Shipped and live:**
- Real-asset image questions with a "Bild fehlt" fallback (partial — see open point #1).
- Question data externalized to `questions.json` (source of truth).
- Persistent progress with spaced repetition (`eib_progress_v1`), resumable sessions
  (`eib_session_v1`), Smart Review mode, and a home readiness panel.
- Practice by topic (every question has a `category`).
- Results history with an exam pass-rate trend (`eib_history_v1`).
- Audio read-aloud (Web Speech API / TTS) and a bilingual glossary.
- SEO/meta, Open Graph + Twitter cards (rasterized `og-image.png`), JSON-LD, `favicon.svg`.
- Accessibility: higher-contrast text, `:focus-visible`, `prefers-reduced-motion`,
  `aria-live` results.
- Installable PWA with offline support (`manifest.json` + `sw.js`, network-first for
  HTML/data, PNG app icons in `img/icons/`).

**Quiz pool:** 310 general + 16 Bundesländer × 10 = **470** questions, all **bilingual (DE/EN)**.
The user picks a state on the home screen; the active pool is 310 general + the selected state's
10. (All 300 official general questions are covered — verified against the BAMF catalogue, 0 missing.)

---

## Open TODOs

### 1. Fetch the remaining real image assets  — _blocked (egress)_
~139 image files are still placeholders (the app shows a "Bild fehlt" fallback): the
general coats of arms / maps / flags / Reichstag photo (19), plus the **state Wappen/flag
image questions** for the 15 imported states (~120, under `img/states/<code>/`).
- **Blocker:** environment egress blocks `upload.wikimedia.org` / `commons.wikimedia.org`.
- **To resume:** allowlist those hosts, fetch per the manifest, run `node tools/validate.js`
  until the warning count is 0. See `ATTRIBUTIONS.md`.
- Already done locally: 4 Q130 ballots + exact-spec EU flag/distractor.

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

- **(this change)** Reimagined core-loop UX: animated score ring + percentage count-up on
  results, slim quiz progress bar, per-question entrance transitions, and answered-state
  option feedback (dim non-answers, pop the pick). Logic unchanged.

- **(this change)** Home reimagined as a dashboard: a "Übersicht" card with an animated
  readiness ring (% mastered), key stats (Gemeistert/Fällig/Trefferquote) and the integrated
  Bundesland picker, replacing the flat stat-tile stack.

## Notes for future work
- **PWA updates:** when changing cached assets, bump `CACHE` in `sw.js` so installed PWAs
  and SW-cached browser tabs pick up the new version (otherwise users see a stale build).
- **Branch/merge:** because PRs are squash-merged, reset the working branch to `origin/main`
  (or cherry-pick) before the next change to avoid squash conflicts.
- **Egress:** verifying the live site / fetching Wikimedia & GitHub raw is blocked by the
  environment egress allowlist (see open points 1 & 2). Pages deploy status is checkable via
  the GitHub Actions API ("pages build and deployment" runs).
