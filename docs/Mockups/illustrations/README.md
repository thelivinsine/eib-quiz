# Generated illustrations — what's here and what not to ship

Eight images from ChatGPT, 21 September 2026, one illustration per canvas at
~1254 × 1254. Renamed from their `ChatGPT Image …` filenames.

Photographs and their licences are one folder over, in
[`../photos/`](../photos/ATTRIBUTIONS.md).

## Ready to use

| File | Use |
|---|---|
| `languages.png` | Bilingual block. Both `Hallo!` and `Hello!` spelled correctly. The strongest of the eight. |
| `study-man-dog.png` | Hero panel, onboarding, empty states. |
| `success-man.png` | Results screen, pass state. Same character as `study-man-dog` — these two are the only consistent pair. |

## Pick one, delete the rest

`study-woman-dog.png` and `study-woman-cat.png` are the same scene twice
(the pet and a picture frame differ), and neither has a matching female
success illustration. If you prefer the female character, regenerate the
success scene to match before shipping either. Otherwise use the male pair
above and delete all three.

## Do not ship — `map-decorative-a.png`, `map-decorative-b.png`

The borders are invented. Four faults, any one disqualifying on a site that
teaches the 16 federal states:

1. **Berlin, Hamburg and Bremen are missing.** All three are states, and all
   three are exam answers.
2. **The internal borders match no real state boundary** — they are
   decorative squiggles.
3. **The Brandenburg Gate and TV tower sit on the Baltic coast**, roughly in
   Mecklenburg-Vorpommern.
4. **The western outline bulges into the Netherlands.**

**Use [`../photos/germany-states-accurate.svg`](../photos/germany-states-accurate.svg)
instead** — all 16 states, correct borders, city-states as proper enclaves.
It is an SVG, which matters more than the accuracy alone: each state is its
own path, so it can be recoloured to the app's palette in CSS and made
clickable, and it is 92 KB against 1.3 MB for a PNG that is wrong.

> Credit: David Liuzzo / Wikimedia Commons — [CC BY-SA 2.0 DE](https://creativecommons.org/licenses/by-sa/2.0/de/deed.en)

Keep the generated maps only as decorative background texture, well away from
any screen where they could be mistaken for the real thing.

## Reference only — `icons-line-16.png`

Clean and consistent in itself, but these are **stroked outline** icons and
the app deliberately ships **solid** inline SVG — `CLAUDE.md` records that
`grep 'stroke="currentColor"' index.html` must come back empty. Using these
would either break that rule or leave two icon languages side by side.

Also, as a 4 × 4 grid this is ~300 px per icon: the same crop problem this
whole folder exists to avoid. The app's own set is vector and has neither
problem. `tools/icon-packs.mjs` renders it as a contact sheet.
