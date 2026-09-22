# Mockups & visual assets

Design exploration and source imagery for the EIB quiz. Nothing here is served
by the live site — the app loads only what is at the repo root and in `img/`.

```
Mockups/
  ui/             design boards — what the app could look like
  illustrations/  generated illustrations, ready to place
  photos/         real photographs + the states map, licences documented
  archive/        superseded; kept for provenance, do not build on
```

## `ui/` — design boards

Six ChatGPT-generated boards from 21 September 2026. The first four each pack
many screens onto one canvas; the last two are single subjects, added later the
same day. Reference only: read them, do not cut assets out of them (see
`archive/` for what happens when you do).

| File | What it shows |
|---|---|
| `landing-page.png` | Full marketing landing page, top to bottom |
| `app-screens-desktop-a.png` | 9 desktop screens — dashboard through question review |
| `app-screens-desktop-b.png` | 8 desktop screens, alternate treatment |
| `app-screens-mobile.png` | 13 mobile screens — splash through profile |
| `where-you-stand.png` | The practise page's overview card, on its own — **shipped** |
| `logo-kit.png` | Logo lockups, palette and an icon library — **not shipped** |

`where-you-stand.png` is the exception to everything below: it was built, and
the overview card on the practise page follows it closely — see the
**"The overview card is ONE CARD AND FOUR BARE BLOCKS"** block in `CLAUDE.md`,
which names every place it deliberately differs. As of 2026-09-22 those are:
the four bordered tiles are **dissolved** (the card is one ground and the four
blocks sit bare on it), there is **no rule between the ring and the verdict**,
the mountains are **stepped in size and sit lower in the banner** than the
traced silhouette, **each readout is a figure over its name with no icon plate
and no explanatory sub-line** (both drawn in the mockup, both removed on
2026-09-22 — the sub-line restated the name), the Resume button's label stays
mode-agnostic ("Resume"), the
buttons are pills where the mockup draws rounded rects, and the heading is 28px
where the mockup measures ~31 — there is no rung between `--fs-2xl` and
`--fs-3xl`. The mockup's micro-copy also runs 9-12px against this app's 12px
floor, which the ring's caption is now the single named exemption from.
`logo-kit.png` is NOT shipped: it draws a different
brand mark from the German-flag tile the app uses, a stroked icon library where
the app ships solid glyphs, and pages (`About`, `FAQs`) that were deliberately
removed.

**The other four do not match the shipped app.** They show a white-and-blue design with
a top nav (`Home / About / FAQs`), pages that do not exist, and a different
component language from the quiet-bento system described in `CLAUDE.md`
(teal + apricot, pill controls, no drop shadows). Treat them as a proposed
redesign to accept or reject deliberately — not as documentation of what is
live.

## `illustrations/` — generated, ready to place

Eight images, one illustration per canvas at ~1254 × 1254. Three are ready,
two are duplicates, two must not ship, one is reference only —
[`illustrations/README.md`](illustrations/README.md) says which is which and
why.

Short version: **the two Germany maps have invented borders and are missing
Berlin, Hamburg and Bremen.** Use `photos/germany-states-accurate.svg`.

## `photos/` — real imagery, licences documented

Six photographs from Wikimedia Commons (up to 3840px) plus an accurate SVG map
of the 16 federal states. Every file is freely licensed for any purpose
including commercial use, with attribution.

[`photos/ATTRIBUTIONS.md`](photos/ATTRIBUTIONS.md) carries the exact credit
wording — two photographers mandate a specific string — along with the German
freedom-of-panorama and Bavarian palace-grounds notes, and a plain account of
what share-alike does and does not oblige.

**If any of these ship in the app, copy their credit lines into
[`img/ATTRIBUTIONS.md`](../../img/ATTRIBUTIONS.md)**, which is where the live
site's attribution points.

## `archive/` — superseded

Four files, kept only so the history is legible. See
[`archive/README.md`](archive/README.md). Do not build on them.

**The files themselves are local-only** — `.gitignore` keeps the 11MB of
superseded crops out of git history and tracks just the README that explains
why they are dead. A fresh clone gets the explanation, not the crops.
