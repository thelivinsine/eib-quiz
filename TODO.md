# EIB Quiz — Project Status & TODO

_Last updated: 2026-06-21_

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

**Quiz pool:** 310 general + 10 Berlin = **320** questions in use (the former 10 `appExtra`
questions were verified against the official catalogue on 2026-06-21 and folded in).

---

## Open TODOs

### 1. Fetch the 19 remaining real image assets  — _blocked (egress)_
Coats of arms (Q21, Q209, Q311), locator maps (Q318), UN/NATO flags (Q226), and the
Reichstag photo (Q55) are still placeholders; the app shows a "Bild fehlt" fallback.
- **Blocker:** environment egress blocks `upload.wikimedia.org` / `commons.wikimedia.org`.
- **To resume:** allowlist those hosts, then fetch per the manifest and run
  `node tools/validate.js` until the warning count is 0. Full per-file source list and
  resume steps are in `ATTRIBUTIONS.md`.
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
- ~~Mobile: quiz buttons reflowed wrong~~ — done: deterministic flex order
  (Zurück+Beenden left, Weiter right).
- ~~Mobile: hero cut off after pull-to-refresh~~ — done: `scrollRestoration='manual'` +
  reset to top after the async home render (instant behavior) + on load/pageshow.

## Notes for future work
- **PWA updates:** when changing cached assets, bump `CACHE` in `sw.js` so installed PWAs
  and SW-cached browser tabs pick up the new version (otherwise users see a stale build).
- **Branch/merge:** because PRs are squash-merged, reset the working branch to `origin/main`
  (or cherry-pick) before the next change to avoid squash conflicts.
- **Egress:** verifying the live site / fetching Wikimedia & GitHub raw is blocked by the
  environment egress allowlist (see open points 1 & 2). Pages deploy status is checkable via
  the GitHub Actions API ("pages build and deployment" runs).
