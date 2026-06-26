# EIB Quiz — Project Status & TODO

_Last updated: 2026-06-25_

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

### 2. Redesign: Bold Retro-Modernist editorial system — _✅ DONE (2026-06-26)_
Implemented. Replaced the lime/dark "Neon Velocity"/"Premium UI" layer with a
**"Bold Retro-Modernist editorial layer"** (end of `<style>`) + rewritten `:root`/`html.light`
tokens. All functionality preserved (pools, spaced repetition, sessions, history, TTS, glossary,
state picker, PWA). Two themes (Charcoal default / Beige `.light`) on the brief's palette;
Montserrat + Open Sans; solid offset shadows; hard 90° edges; grayscale→color images; infinite
marquee ticker; hero watermark. Verified via Chromium screenshots (home dark+light, quiz,
answered, end). The original design brief is preserved below for reference.

> # Summary
>
> A striking, high-contrast editorial design system blending 1970s retro aesthetics with modern brutalist layouts, featuring bold primary colors and massive, tightly-spaced typography.
>
> # Style
>
> The style relies on a rigid color palette: Retro Red (#BC2C2C), Vintage Blue (#5DA4C9), and Sunny Yellow (#FCD758), grounded by a Warm Beige (#F5F1E3) and a deep Charcoal Text (#2C2C2C). Typography is split between Montserrat for heavy, aggressive headlines (weights 700-900) and Open Sans for clean, functional body text. Key visual motifs include 12px-20px solid offset borders, infinite scrolling marquees, and grayscale-to-color image transitions.
>
> ## Spec
>
> Apply a Bold Retro-Modernist aesthetic.
> - **Color Palette**: Primary Red (#BC2C2C), Secondary Blue (#5DA4C9), Accent Yellow (#FCD758), Background Beige (#F5F1E3), and Deep Charcoal (#2C2C2C) for all text/borders.
> - **Typography**:
>   - Headlines: Montserrat, 700-900 weight, line-height: 0.85, letter-spacing: -0.05em, uppercase.
>   - Body: Open Sans, 400-600 weight, line-height: 1.6.
>   - Utility labels: Open Sans, font-size: 10px, weight: 900, letter-spacing: 0.1em, uppercase.
> - **Borders & Shadows**: No soft shadows. Use solid 'editorial shadows' (20px offset, #2C2C2C) or heavy borders (12px solid #2C2C2C).
> - **Images**: Default to grayscale (filter: grayscale(100%)) with a 500ms ease-in-out transition to full color on hover.
> - **Micro-interactions**: Use 'view-transition: same-origin' for smooth page changes and linear infinite scrolling for marquee elements.
>
> # Layout & Structure
>
> The layout uses a block-heavy structure with high-contrast section changes. It alternates between full-bleed primary color backgrounds and neutral beige sections to maintain visual rhythm.
>
> ## Navigation
>
> Sticky header with background color #BC2C2C. Left-aligned logo in Montserrat Black. Navigation links in 10px uppercase tracking-widest (letter-spacing: 0.15em). Right-aligned icons for search and cart, featuring a badge for cart items (white circle, #BC2C2C text, font-size: 8px).
>
> ## Hero Section
>
> Full-bleed #BC2C2C background. Features massive background text ('STRIDE') at font-size: 25vw, opacity: 0.08, right-aligned. Main headline: Montserrat 9xl, uppercase, line-height: 0.85. Hero image should be contained in a #5DA4C9 container with a solid #2C2C2C offset border (16px translate-x/y). CTA button: black background, white text, 12px font, uppercase, tracking-widest.
>
> ## Brand Ticker
>
> Infinite horizontal scrolling marquee. Background: #5DA4C9. Top/bottom borders: 2px solid #2C2C2C. Text: Montserrat, 18px, white, uppercase, letter-spacing: 0.2em. Animation: linear translate-x from 0 to -50% over 40 seconds.
>
> ## Product Grid
>
> Section background: #F5F1E3. Header with subtitle (10px uppercase) and main title (5xl, Montserrat). Grid: 4 columns. Cards: white background, light gray border, grayscale images that turn color on hover. Metadata: top row with brand (10px gray uppercase) and price (10px bold), bottom row with product name (14px black uppercase).
>
> ## Editorial Section
>
> Two-pane container with a 12px solid #2C2C2C border. Left pane: #F5F1E3 background, 1/3 width, vertical stack of headline and a circular arrow button. Right pane: White background, 2/3 width, featuring a centered grayscale image (20% opacity) as a watermark, with a bottom-left aligned 5xl headline and black CTA button.
>
> ## Footer
>
> Background #2C2C2C, text white. Two-column main layout. Left: Massive brand name (7xl) and social links. Right: 3-column sub-grid for site links. Footer labels in #FCD758 (10px uppercase). Bottom bar: 1px border-top (white/10 opacity), 8px font-size legal text, all uppercase.
>
> # Special Components
>
> ## Editorial Offset Card
>
> A container with a faux-shadow created by a solid border-only div behind the main content.
>
> Create a container with a relative parent. Add an absolute-positioned div with a 2px solid #2C2C2C border, offset by 16px (translate-x: 16px, translate-y: 16px). Place the main content div (background color #5DA4C9) on top with a higher z-index.
>
> ## Large Background Watermark Text
>
> Hero-level text that creates texture without hindering readability.
>
> Position a text element using 'absolute', bottom: 0, right: 0. Font: Montserrat 900, size: 25vw, line-height: 0.8. Color: white with 0.08 opacity (or 8% alpha). Set 'pointer-events: none' and 'letter-spacing: -0.05em'.
>
> # Special Notes
>
> MUST-DO: Use primary colors in their purest hex forms for maximum impact. MUST-DO: Ensure all typography uses tight leading (line-height < 1.0) for large headlines. MUST-NOT: Use rounded corners or soft drop shadows; all edges should be 90-degree angles and shadows should be solid color offsets. MUST-NOT: Use lowercase in labels or headings; reserve sentence case strictly for long-form paragraphs.

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

## Notes for future work
- **PWA updates:** when changing cached assets, bump `CACHE` in `sw.js` so installed PWAs
  and SW-cached browser tabs pick up the new version (otherwise users see a stale build).
- **Branch/merge:** because PRs are squash-merged, reset the working branch to `origin/main`
  (or cherry-pick) before the next change to avoid squash conflicts.
- **Egress:** verifying the live site / fetching Wikimedia & GitHub raw is blocked by the
  environment egress allowlist (see open points 1 & 2). Pages deploy status is checkable via
  the GitHub Actions API ("pages build and deployment" runs).
