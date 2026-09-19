# Image Assets — Attributions & Source

> ## ✅ STATUS: COMPLETE (2026-06-25)
> All 43 image questions now have their real images, extracted directly from the official
> **BAMF "Gesamtfragenkatalog – Leben in Deutschland"** PDF
> (`img/gesamtfragenkatalog-lebenindeutschland.pdf`, committed for reference) via
> `tools/extract-catalogue-images.py` + `tools/wire-catalogue-images.py`.
> `node tools/validate.js` reports 0 missing assets.

## Source

Every option/prompt image is a crop of the official BAMF catalogue PDF (rendered at ~300 DPI,
cropped to the per-image bounding boxes detected in the PDF). The catalogue is the authoritative
question source published by the Bundesamt für Migration und Flüchtlinge (BAMF).

## The 43 image questions

- **Option-image (4 pictures), 19:** Q21, Q209, Q226 + the 16 state *Wappen* questions
  (`img/q21/o*.png`, `img/q209/o*.png`, `img/q226/o*.png`, `img/states/<CODE>/<CODE>-1-*.png`).
  Q21 and Q209 share the same 4 pictures (Bundeswappen / Chi-Rho / Bundeswehr-Kreuz / DDR-Emblem).
- **Composite image + "1/2/3/4" answers, 17:** Q130 (ballots) + the 16 state *map* questions
  (`img/q130/ballots.png`, `img/states/<CODE>/<CODE>-8.png`). The catalogue presents these as a
  single image with four numbered pointers, so they are modelled as one prompt image + numbered
  answers.
- **Prompt-image + text answers, 7:** Q55, Q70, Q176, Q181, Q187, Q216, Q235.

## Licensing

- **Coats of arms, flags, the DDR flag, locator maps, occupation-zone map, ballot graphic** —
  official/heraldic works (amtliche Werke, §5 UrhG) or simple geometric/diagrammatic works; not
  copyright-protected.
- **Photographs** carry the credits below (captured from the PDF and shown in-app under the image
  via the `image_credit` field). These are official Bundestag/Bundesregierung press photos and are
  **© all rights reserved** — they are reproduced here for this educational quiz with attribution.
  If strict licensing is required, swap them for CC-BY/PD equivalents (the `image_credit` field and
  these paths are the only things to update):

| Question | Image | Credit |
|---|---|---|
| Q55  | `img/q55-reichstag.webp` | © Deutscher Bundestag/Achim Melde |
| Q70  | `img/q70-heinemann-schmidt.png` | © Bundesregierung/Engelbert Reineke |
| Q181 | `img/q181-brandt-kniefall.png` | © Bundesregierung/Engelbert Reineke |
| Q216 | `img/q216-bundesadler.png` | © Deutscher Bundestag/Janine Schmitz |
| Q235 | `img/q235-mitterrand-kohl-verdun.png` | © Bundesregierung/Richard Schulze-Vorberg |
| Q176 | `img/q176-besatzungszonen.png` | (diagram — no credit in catalogue) |
| Q187 | `img/q187-ddr-flagge.png` | (flag — no credit in catalogue) |

## Regenerating

```bash
pip install pymupdf pillow
python3 tools/extract-catalogue-images.py extract   # -> img/upload/_pdf/ crops + tools/data/catalogue-image-map.json
python3 tools/wire-catalogue-images.py              # builds final assets + updates questions.json
node tools/validate.js                              # expect 0 missing assets
```

## Question data — state-specific questions

The 15 non-Berlin Bundesland question sets were imported from the official BAMF catalogue via the
open dataset **adalbero/LebenInDeutschland**, committed as
`tools/data/official-catalogue-bamf-2026-02.json` and wired by `tools/import-states.js`; English
strings via `tools/translate-states.js`.
