# Image Assets — Attributions & Fetch Manifest

The image questions reference real asset files under `img/`. Assets that could be
produced locally (ballots + the exact-spec EU flag/distractor) are already committed.
The remaining assets must be sourced from open/public-domain repositories — the egress
policy in the build environment blocked `upload.wikimedia.org`, so they are **pending**.

To complete them, either:
1. **Allowlist** `upload.wikimedia.org` (and `commons.wikimedia.org`) in the environment's
   network egress settings, then re-run the fetch, **or**
2. **Drop the files** into the exact paths listed below (any equivalent open/PD artwork).

After adding files, run `node tools/validate.js` — the "fetch manifest" warning should
shrink to zero.

---

## Already committed (authored locally)

| File | What | Source |
|---|---|---|
| `img/q130/ballot-valid.svg` | Valid ballot (one cross per column) | Original SVG (generic ballot layout) |
| `img/q130/ballot-two-marks.svg` | Invalid: two crosses in one column | Original SVG |
| `img/q130/ballot-defaced.svg` | Invalid: crossed-out ballot | Original SVG |
| `img/q130/ballot-empty.svg` | Invalid: empty ballot | Original SVG |
| `img/q226/flag-eu.svg` | EU flag (12 gold stars, exact geometry) | Original SVG to official spec |
| `img/q226/flag-eu-wrong.svg` | Distractor: wrong star count | Original SVG |

These are original works (CC0 / no attribution required).

---

## Pending — to fetch from open/PD sources

Public-domain note: German federal/state coats of arms and the GDR emblem are official
works (amtliche Werke, §5 UrhG) — not copyright-protected. The EU/UN/NATO flags are
freely usable. The Reichstag photo must be a CC-BY/CC-BY-SA or PD image (record its author).

### Q21 — Wappen der Bundesrepublik (`img/q21/`)
| File | Subject | Suggested Wikimedia Commons source |
|---|---|---|
| `bundeswappen.svg` *(correct)* | Federal coat of arms | `Coat_of_arms_of_Germany.svg` |
| `reichswappen-weimar.svg` | Weimar Republic arms | `Reichswappen_Deutsches_Reich_(Weimarer_Republik).svg` |
| `wappen-kaiserreich.svg` | German Empire arms | `Wappen_Deutsches_Reich_(1889-1918).svg` |
| `wappen-preussen.svg` | Prussia arms | `Wappen_Preußen.svg` |

### Q209 — Wappen der DDR (`img/q209/`)
| File | Subject | Source |
|---|---|---|
| `emblem-ddr.svg` *(correct)* | GDR state emblem | `Coat_of_arms_of_East_Germany.svg` |
| `emblem-udssr.svg` | USSR state emblem | `State_Emblem_of_the_Soviet_Union.svg` |
| `emblem-polen.svg` | People's Republic of Poland | `Herb_PRL.svg` |
| `emblem-csssr.svg` | Czechoslovakia (ČSSR) | `Czechoslovakia_(1960–1990)_coat_of_arms.svg` |

### Q226 — Flagge der EU (`img/q226/`)
| File | Subject | Source |
|---|---|---|
| `flag-un.svg` | United Nations flag | `Flag_of_the_United_Nations.svg` |
| `flag-nato.svg` | NATO flag | `Flag_of_NATO.svg` |

### Q311 — Wappen Berlin (`img/q311/`)
| File | Subject | Source |
|---|---|---|
| `wappen-berlin.svg` *(correct)* | Berlin (bear) | `Coat_of_arms_of_Berlin.svg` |
| `wappen-hamburg.svg` | Hamburg | `Coat_of_arms_of_Hamburg.svg` |
| `wappen-bremen.svg` | Bremen | `Coat_of_arms_of_Bremen.svg` |
| `wappen-brandenburg.svg` | Brandenburg | `Coat_of_arms_of_Brandenburg.svg` |

### Q318 — Welches Bundesland ist Berlin? (`img/q318/`) — locator maps
| File | Subject | Source |
|---|---|---|
| `map-berlin.svg` *(correct)* | Germany, Berlin highlighted | `Germany_Laender_Berlin.svg` |
| `map-bayern.svg` | Bavaria highlighted | `Germany_Laender_Bayern.svg` |
| `map-nrw.svg` | NRW highlighted | `Germany_Laender_Nordrhein-Westfalen.svg` |
| `map-sachsen.svg` | Saxony highlighted | `Germany_Laender_Sachsen.svg` |

### Q55 — Reichstag (`img/q55-reichstag.webp`)
| File | Subject | Source |
|---|---|---|
| `q55-reichstag.webp` | Reichstag building, Berlin | Any CC-BY/PD Commons photo, e.g. `Reichstag_building_Berlin_view_from_west_before_sunset.jpg` (convert to WebP). **Record author + license here when added.** |

---

## Recommended fetch command (once egress allows Wikimedia)

```bash
UA="EIBQuizBot/1.0 (educational; contact thelivinsine@gmail.com)"
# Use Special:FilePath to resolve the current file URL, e.g.:
curl -L -A "$UA" -o img/q21/bundeswappen.svg \
  "https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_arms_of_Germany.svg"
# (optionally) optimize: svgo img/**/*.svg
```

When fetching, record each file's exact license and author above for CC-BY assets.
