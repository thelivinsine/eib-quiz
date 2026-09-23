# EIB Quiz logo kit

Drawn from `docs/Mockups/ui/logo-kit.png`. `overview.png` shows every piece on one sheet.

**Generated, never hand-edited.** Every file here comes from
`node tools/make-logo-kit.mjs`. To change the logo, change a constant in the script, re-run
it, and commit the whole folder. The script needs Chrome with network access, because it
fetches the two fonts and the outlining library.

## Files

| | SVG (`svg/`) | PNG (`png/`, transparent) |
|---|---|---|
| Horizontal lockup, the **primary** logo | `eib-quiz-logo-horizontal*.svg` | 1741 × 504 |
| Stacked lockup | `eib-quiz-logo-stacked*.svg` | 1478 × 1184 |
| Mark alone | `eib-quiz-mark*.svg` | 480 × 504 |
| App icon, rounded tile | `app-icon.svg` | `app-icon-512.png`, `app-icon-192.png` |
| App icon, full-bleed square | `app-icon-square.svg` | `app-icon-square-1024.png`, `-512.png`, `apple-touch-icon-180.png` |
| Favicon | `favicon.svg` | `favicon-16/32/48.png`, `favicon.ico` (all three sizes) |

Each lockup comes in four variants, marked by the filename suffix:

- *(no suffix)*: **full colour**, for light backgrounds.
- `-dark`: **dark backgrounds**. The wordmark is white, and the navy bar has a thin slate
  rim so it does not disappear into a navy background, as in the mockup.
- `-mono-dark`: **single colour, dark**. Three slate shades, for print or places where
  colour is not allowed.
- `-mono-light`: **single colour, light**. Pale slate, as in the mockup. It is low-contrast
  on purpose: use it as a watermark, never as the only logo on a page, and never at small
  sizes.

The **text is outlined** (vector shapes, not live text), so the SVGs open the same in
Figma, Illustrator or a browser whether or not the fonts are installed. All four variants of
a lockup have **identical bounds**, so one can replace another without anything shifting.

The **full-bleed app icon** is the one to give app stores, iOS and Android maskable icons,
because they cut their own shape. The mark sits inside the 80% safe circle. The rounded one
is for places that show the file as it is.

## Usage

- **Clear space:** keep at least one bar's height (a third of the mark's height) empty on
  every side.
- **Minimum size:** the horizontal lockup at 120px wide on screen. Below that, use the mark
  alone, down to 16px.
- **Do not** recolour the bars, stretch the mark, re-set the wordmark in live text, or put
  the full-colour version on a dark background. That is what `-dark` is for.

## Construction

The mark is **60 × 63 units: three 21-unit bars**, measured off the mockup's pixels.

- Each right end has a radius of **10**, so on a 21-unit bar it is almost a half-circle.
- The two outer left corners have a radius of **8**.
- The red bar stops at **45**, which is 74% of the width.

Each lower bar runs 1 unit underneath the bar above it, so the seams never anti-alias
against the background. Without that, a hairline shows between the bars on dark grounds.

The wordmark is **Bricolage Grotesque 700** at optical size 96, tracked −0.02em. The tagline
is **Inter 400**.

## Colour

| | Hex | Used for |
|---|---|---|
| Primary (navy) | `#0F172A` | top bar, wordmark |
| Accent red | `#E10600` | middle bar |
| Accent yellow | `#FFCC00` | bottom bar |
| Slate | `#64748B` | tagline, the dark variant's rim, mono-dark middle bar |
| Slate dark | `#334155` | mono-dark bottom bar and tagline |
| Slate light | `#CBD2DC` | mono-light middle bar |

These are the mockup's own values. The flag colours are the mockup's brighter red and
yellow, not the `#DD0000` / `#FFCE00` that the app header's flat flag uses today.

## Where this differs from the mockup

- **The favicon's mark is larger:** 0.62 of the tile rather than the mockup's 0.47. At 16px
  the mockup's proportion leaves each bar under 3px tall.
- **Primary and horizontal are one file.** The mockup shows two tiles, but they are the same
  lockup at two sizes.
- **Not included:** the mockup's icon library and feature icons. The app already ships its
  own glyph set (`ICONS` in `index.html`, documented by `tools/icon-packs.mjs`).
- **Not wired into the app.** The app still uses its old tick `favicon.svg`,
  `img/icons/icon-*.png` and the flat-flag header mark. Adopting these files is a separate
  change, and it needs a `CACHE` bump in `sw.js`.
