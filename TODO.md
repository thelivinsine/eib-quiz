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
- SEO/meta, Open Graph + Twitter cards, JSON-LD, `favicon.svg`, `og-image.svg`.
- Accessibility: higher-contrast text, `:focus-visible`, `prefers-reduced-motion`,
  `aria-live` results.

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
- **Service worker / offline PWA** — intentionally NOT added; `sw.js` stays the kill
  switch for returning May-28 visitors. Revisit only once that cleanup window is safely
  past (see `CLAUDE.md`).

### 4. Nice-to-haves / polish (optional)
- Swap `og-image.svg` for a rasterized PNG (better social-scraper support) once image
  tooling/egress is available.
- Refine topic categories by spot-reviewing edge cases (`tools/categorize.js`).
