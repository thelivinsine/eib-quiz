# EIB Quiz — Project Status & TODO

_Last updated: 2026-06-20_

## Project status

Vanilla HTML/CSS/JS quiz for the German citizenship test (Berlin variant), served by
GitHub Pages from `main` (`index.html` + `questions.json` + `img/`). No build step, no
framework, no service worker.

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

**Quiz pool:** 300 general + 10 Berlin = **310 verified** questions in use.
The 10 `appExtra` questions (Q301–310) are excluded — see open point #2.

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

### 2. Verify & decide on the 10 `appExtra` questions (Q301–310)  — _blocked (egress)_
They are general/federal civic questions (NOT Berlin) and are currently excluded from all
pools. Need to confirm they are real official-catalogue questions before folding in.
- Confidence today: Q301, Q307, Q308, Q309 clearly real; Q303, Q304, Q306 plausible;
  Q302, Q305, Q310 questionable.
- **Blocker:** can't fetch an authoritative copy (Wikimedia egress blocked;
  `api.github.com` / code search rate-limited on the shared IP).
- **To resume:** allowlist `raw.githubusercontent.com` + `api.github.com` (or drop the
  official catalogue text into the repo), diff the 10 against the official 310, then fold
  in only verified ones (remove the `appExtra` flag) and re-run validation.

### 3. Deferred features (by choice, not blocked)
- **Streaks / daily goal** (was point 4) — skipped on request.
- **Shareable result card** (was point 8) — skipped on request.

### 4. Done
- ~~Service worker / offline PWA~~ — done 2026-06-20: real caching SW (network-first for
  HTML/data) + installable manifest; cleans up old May-28 caches on activate.
- ~~Rasterize the OG image~~ — done: `og-image.png` (1200×630) via resvg-js.
- ~~Refine topic categories~~ — done: targeted keyword fixes in `tools/categorize.js`.
