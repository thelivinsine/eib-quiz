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

## Non-question imagery

### `img/hero-reichstag.webp` — the landing page hero

The only photograph the app itself serves; everything above is question data.

| | |
|---|---|
| **Subject** | Reichstag west façade — `DEM DEUTSCHEN VOLKE`, with the German and European flags |
| **Source** | [Commons: Berlin, Reichstagsgebäude -- 2019 -- 6310.jpg](https://commons.wikimedia.org/wiki/File:Berlin,_Reichstagsgeb%C3%A4ude_--_2019_--_6310.jpg) |
| **Author** | Dietmar Rabich |
| **Licence** | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| **Here** | 1100 × 1100 WebP, 161 KB · square crop centred at 54% of `docs/Mockups/photos/hero-reichstag-flag.jpg` (3840 × 2560), itself from the 6496 × 4331 original |

**BY-SA asks for the credit where the work is used**, not only in this file, so the app
renders it in the page **footer**: the credit itself in the legal bar (`footer.legal`) and
a link to this Commons page beside it (`footer.photo`). It sat under the photo as
`.hero-credit` until 2026-09-21; the footer of the page carrying the photo satisfies the
licence just as well and keeps the hero clean. Do not remove either while the photograph
is on the page.

**The file stays a square crop** even though the app shows it 16/10 at every width: that
is `object-fit: cover` on a wider box, not a different asset, and the centred band it keeps
holds the full pediment, the whole inscription and both flags. The recrop command below
still regenerates the square file and does not need changing.

Regenerate the crop with:

```bash
python3 -c "from PIL import Image; im=Image.open('docs/Mockups/photos/hero-reichstag-flag.jpg'); W,H=im.size; l=int(W*0.54)-H//2; im.crop((l,0,l+H,H)).resize((1100,1100), Image.LANCZOS).save('img/hero-reichstag.webp','WEBP',quality=80,method=6)"
```

The square crop was originally chosen for its sky: the app's handwritten margin note sat
over the top-right, the only clean patch in the frame (darkest pixel 210 of 255), and
`LITERAL_PAIRS` asserted the note's ink against it. **That note is gone as of 2026-09-21**,
because the app now displays this file at 16/10 and a centre crop drops the top 206 rows —
all of the sky with them. Scanned at note size across the whole visible band, the
brightest darkest-pixel available was luminance 15. Nothing in the app reads the sky any
more, and the `LITERAL_PAIRS` entry went with the note.
