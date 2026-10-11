# Ten more languages — design

Status: **design approved 2026-10-11, not started.** The task list will be written as
`2026-10-11-languages-plan.md` once this spec is reviewed.

**Purpose.** Most people who take the citizenship test do not have English or German as their
first language. Today the app can show each question in English and its menus in English or
German. This change lets a learner pick their own language, so the menus and the translation
under each German question are in a language they read easily. The exam itself stays German,
as the real test is.

**Summary.**

- Ten languages, chosen from who actually gets naturalised in Germany: Arabic, Turkish,
  Russian, Persian, Ukrainian, Albanian, Bosnian/Croatian/Serbian, Romanian, Kurdish
  (Kurmanji) and Polish.
- One setting drives everything: pick Arabic and the menus are Arabic, and the translate
  toggle shows Arabic under each German question. Arabic and Persian lay the page out right
  to left.
- Each language is its own file, downloaded only when someone picks it, so nobody else's
  download grows.
- Translations are AI-generated, and **a language goes live only after a native speaker has
  reviewed it.** Until then it is in the repo but hidden, and reviewers reach it through a
  preview link.

## Intent

The user asked to "add other languages for the app" and to research which ten add the most
value besides English.

Success means:

- **a learner can study entirely in their own language**: every menu, button, topic name,
  glossary entry, state name and question translation, with German still the exam text;
- **Arabic reads right to left everywhere it should**, while the German exam text stays left
  to right;
- **nothing changes for anyone who does not pick a new language**: same download, same
  layout, same English/German behaviour;
- **no unreviewed translation is ever offered in the picker.**

### Decided by the user (2026-10-11)

| Question | Answer |
|---|---|
| What the new languages cover | **Questions and menus and buttons.** This brings in the right-to-left layout. |
| Which ten | **As ranked below**, unchanged. |
| Where translations come from | **AI-generated, released only after a native speaker has reviewed them.** |
| Rollout | **Arabic, Turkish and Russian first**, then the other seven. |
| Architecture | **One file per language, loaded on demand** (approach A below). |

### Assumed (not stated by the user, open to correction)

- **German menus keep English as their translation language.** Choosing German behaves
  exactly as today.
- **Numbers stay in Western digits (0-9)** in every language, including Arabic and Persian,
  because the exam prints them that way. Dates keep their current `de-DE` format.
- **Read-aloud stays German only.** It reads the exam text, which does not change.
- **The page's search and social metadata, the app manifest and the link-preview card stay
  English/German.** Per-language pages for search engines are out of scope.
- **A reviewer is someone the user finds.** This spec does not cover recruiting or paying
  them.

## Which ten, and why

The ranking follows Destatis's naturalisation figures by previous nationality, because that
counts the people who actually sit the test. A larger share of test-takers means more value
per translation. Full research and sources: the 2026-10-11 session that produced this spec.

| # | Language | Code | Script, direction | Main readers (naturalisations) |
|---|---|---|---|---|
| 1 | Arabic | `ar` | Arabic, RTL | Syria 65,600 (2025), Iraq 13,545 (2024), Morocco 2,520 (2023) |
| 2 | Turkish | `tr` | Latin, LTR | Turkey 34,100 (2025, +51%) |
| 3 | Russian | `ru` | Cyrillic, LTR | Russia 19,700 (2025, +51%), plus many from other ex-Soviet states |
| 4 | Persian | `fa` | Arabic, RTL | Iran 10,125 (2025), Afghanistan 10,085 (2024, Dari readers) |
| 5 | Ukrainian | `uk` | Cyrillic, LTR | Ukraine 10,582 (2025); ~1.3M residents, likely the largest group from 2027 |
| 6 | Albanian | `sq` | Latin, LTR | Kosovo 9,710 + Albania 6,100 (2025) |
| 7 | Bosnian/Croatian/Serbian | `bs` | Latin, LTR | Bosnia 8,800 (2025, +126%), Serbia, Croatia. One Latin-script text. |
| 8 | Romanian | `ro` | Latin, LTR | Romania 8,302 (2025) |
| 9 | Kurdish (Kurmanji) | `ku` | Latin, LTR | Kurdish Syrians, Iraqis and Turks. No official count by language. |
| 10 | Polish | `pl` | Latin, LTR | Poland 6,292 (2025) |

- **Runners-up**: Pashto, Tigrinya and Vietnamese are smaller groups. **Skipped**: Hindi,
  Spanish and Italian, because Indians and US citizens mostly read English already, and
  Italians are EU citizens who rarely naturalise.
- **Not verified**: there are no official 2025 figures for Iraq, Afghanistan or Morocco, and
  Kurdish's place in the list is an estimate.
- **`bs` is a deliberate simplification.** One text serves Bosnian, Croatian and Serbian
  readers. The picker label names all three: "Bosanski / Hrvatski / Srpski".

## Architecture: one file per language

Each language ships as a single JSON file the app fetches only when someone picks that
language. English and German stay inline, exactly as today.

Three approaches were considered:

| Approach | Verdict |
|---|---|
| **A. One file per language, loaded on demand** | **Chosen.** The default download stays at today's 320 KB `questions.json`. A file can sit in the repo unreleased. |
| B. Every language inline in `index.html` and `questions.json` | Rejected. Every visitor would download all twelve languages, roughly 2 MB. |
| C. Translate in the browser at run time through a service | Rejected. It breaks offline use, adds an outside dependency (Google Fonts is the only one allowed), and nothing could be reviewed. |

### The language file

`i18n/<code>.json` is a served folder beside `img/`. One file per language:

```json
{
  "ui":         { "nav.back": "…", "quiz.showEn": "…" },
  "categories": { "rights": "…", "politics": "…" },
  "states":     { "BW": "…", "BY": "…" },
  "glossary":   { "Grundgesetz": "…" },
  "questions":  { "1": { "q": "…", "options": ["…", "…", "…", "…"], "explanation": "…" } }
}
```

- **`ui`** holds every key in `I18N` (166 today). On load each value is merged into its entry
  as `I18N[key][code]`. `t()` already falls back to `en` when a key is missing, so a gap
  shows English rather than a blank.
- **`categories`** and **`states`** merge the same way into `CATEGORIES` and a new
  per-language state-name map. `catLabel()` already reads `CATEGORIES[key][lang]`.
- **`glossary`** is keyed by the German term, so reordering `GLOSSARY` cannot misalign it.
- **`questions`** is keyed by question id: all 460, including image questions, whose option
  labels are translated too.
- **Size**: about 108,000 characters of translated text per language. Arabic and Cyrillic
  take two bytes a character in UTF-8, so expect 200-300 KB per file. It is only fetched by
  someone who picks that language.

### The language list

A `LANGS` array in `index.html` is the one place that says which languages exist:

```js
const LANGS = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ar', name: 'العربية', dir: 'rtl', released: false },
  // …
];
```

- **The picker lists `en`, `de` and every entry with `released: true`.** Nothing else.
- **`dir: 'rtl'`** is the only per-language layout switch.

### Switching and loading

- **`setLang(code)`** fetches `i18n/<code>.json` once, merges it, then repaints as it does
  today. While the file loads, the old language stays on screen. If the fetch fails, the
  app stays on the previous language, the picker shows it again, and an `alert()` with a
  translated message (in the previous language) says why.
- **On boot** a saved non-English/German language is fetched in parallel with
  `questions.json`, and the chrome is painted once both arrive.
- **The pre-paint script in `<head>`** sets `dir` from the saved language, as it already
  sets the theme, so an Arabic reader never sees the layout flip after load.
- **`localStorage` key `eib_lang`** keeps its name and now holds any code in `LANGS`. An
  unknown value falls back to `en`, as today. Every access stays in a `try`.

### Which translation the toggle shows

The translation language is the menu language, except that German menus keep English.

- The question, its options and both explanation sites (the quiz and the results review)
  read from the language file instead of `q.en` / `q.options_en` / `q.explanation_en`. They
  fall back to English for any missing entry.
- The `lang="en"` attributes hard-coded on those elements today (`#questionEnglish`,
  `#explanationEnglish`, `.option-en-text`, `.review-explanation-en`, `.gloss-en`) become
  the translation language's code, with `dir` set alongside.
- **`state.showEnglish` keeps its name** (it is persisted in the session); only the strings
  change. `quiz.showEn` / `quiz.hideEn` become "Show translation" / "Hide translation" in
  English.
- **The glossary** shows the German term and German definition, then the definition in the
  translation language, in place of today's English line.

### Offline

`sw.js` treats `i18n/*.json` like `questions.json`: network-first with `cache: 'reload'`,
written through `safePut`. A fixed translation therefore reaches readers at once, and a
language someone has used works offline. The files are not precached: most visitors never
need them.

## The language picker

The EN box in the header becomes a picker of exactly the same size, still showing a
two-letter code. Tapping it opens the phone's or browser's own list, each language written
in its own script.

- **It reuses the state picker's pattern**: a visible face (`#langToggle`'s current box)
  with a transparent native `<select>` laid over it. A native list gives keyboard, screen
  reader and phone-picker support at no extra cost, and the header row's measured widths do
  not move.
- **Its accessible name still starts with the visible code** (WCAG 2.5.3), now followed by
  "Language" / "Sprache" in the current language, rather than "switch to German".
- **`toggleLang()` and the `nav.switchToDe` / `nav.switchToEn` strings are deleted**: a
  flip only works for two languages.

## Right to left

Arabic and Persian set `<html dir="rtl">`. Kurdish (Kurmanji) is Latin script and stays
left to right.

- **The stylesheet moves to logical properties.** There are about 35 physical left/right
  declarations (counted by a line grep, so an exact count comes in the first task) in the `<style>` block today (margins, paddings, `left`/`right` offsets,
  `text-align`, borders, `translateX`). Each becomes its start/end form (`margin-inline-start`,
  `inset-inline-end`, `text-align: start` and so on), so the layout mirrors on its own. 14
  rules already use logical forms. **Inline styles written by the script** are checked the
  same way.
- **Directional glyphs flip**: the back chevron, the mode cards' arrow, the scroll arrows and
  the navigator chevron, through one `[dir="rtl"]` rule that mirrors the SVG, never its disc
  or button (those carry the hover-lift transform).
- **Not mirrored**: the score and accuracy rings, the brand mark, the photograph and the
  ornaments. They are pictures, not reading order.
- **The German exam content stays left to right.** The question, each option button (letter
  chip included), the German explanation, glossary terms and the results review's German
  text carry `dir="ltr"` beside their existing `lang="de"`. The translation lines inside
  them carry `dir="rtl"`.
- **The progress bar fills from the start edge**, so in RTL it grows right to left, and its
  lit tip moves with it.

### Fonts

- **Arabic script**: Noto Sans Arabic joins the existing Google Fonts `<link>`, which stays
  one request. Google's CSS splits fonts by character range, so the Arabic file only
  downloads when Arabic text appears on screen.
- **Stacks**: `--font-body` becomes `Inter, 'Noto Sans Arabic', …` and `--font-head`
  becomes `'Bricolage Grotesque', Inter, 'Noto Sans Arabic', …`, so a missing glyph falls
  through to a font that has it.
- **Cyrillic and the Latin extras** (Turkish ş/ğ, Kurmanji ê/î/û, Romanian ș/ț, Polish
  ą/ł): Inter covers them. **Not verified**: whether Bricolage Grotesque has Cyrillic. The
  assumption is that it does not, which is why Inter is second in the heading stack.

### Layout checks

Long words are what broke layouts before (German set the 1160px mode-grid breakpoint). For
every new language, measure, do not assume:

- `scrollWidth === innerWidth` on Home and Practise at 320 / 375 / 1280;
- the header row fits at 320 and 375 (the row is measured to within 15px today);
- `scrollHeight === innerHeight` on the quiz and results screens at 375 / 620 / 940 / 1400,
  per the validation checklist;
- the mode-card titles and the overview readouts in their narrowest boxes.

**A language that overflows gets a shorter string, not a new breakpoint.** That is the rule
`dash.due` and `dash.accuracyShort` already follow.

## Translation and review

Translations are generated by AI from the German original, with the English as a reference,
then checked by a native speaker before release.

### Generating

1. **A terminology list comes first**, one per language: the 30-40 recurring civic terms
   (Grundgesetz, Bundestag, Bundesrat, Rechtsstaat, the parties, the states). Every later
   batch uses it, so one term is never translated three ways.
2. **Then the menus, topic names, states and glossary**, translated in one batch so the
   chrome reads consistently.
3. **Then the questions in batches of about 60**, each batch given the terminology list.
   Proper nouns, names, dates and numbers stay as they are.
4. **The automated check runs on the result** before anything is committed.

### The automated check: `tools/i18n.test.mjs`

`node --test tools/i18n.test.mjs` joins the validation checklist. For every file in `i18n/`:

- every `I18N` key in `index.html` is present in `ui`, and no extra keys;
- every `{placeholder}` in the English string appears in the translation, and no others;
- all 460 question ids are present, each with a non-empty `q`, exactly four non-empty
  `options` and a non-empty `explanation`;
- every `CATEGORIES` key, `STATES` code and `GLOSSARY` term is present;
- **the text is in the right script**: mostly Arabic letters for `ar`/`fa`, mostly Cyrillic
  for `ru`/`uk`, mostly Latin for the rest. This catches a batch that came back in English;
- every `LANGS` entry other than `en`/`de` has a file, and every file has a `LANGS` entry.

### Reviewing

- **A review sheet per language**: `tools/make-review-sheet.mjs <code>` writes
  `docs/translations/<code>-review.csv` with the columns `key`, `German`, `English`,
  `translation`, `correction`, `comment`. Every row is a string or one part of a question.
  It opens in Excel or Google Sheets, so a reviewer needs no code.
- **A preview link for the real app**: `?lang=<code>` unlocks one unreleased language for
  that tab (held in `sessionStorage`, never in `localStorage`), so the reviewer can use the
  live site or a local server as a learner would. An unknown code is ignored.
- **Corrections are applied back into `i18n/<code>.json`** from the returned sheet, and the
  check runs again.
- **Release** is flipping `released: true` for that language in `LANGS`, with the review
  date recorded in `i18n/README.md`, which lists each language's generation date, review
  date and open notes.

## Rollout

1. **Stage 1: the machinery plus three languages.** The picker, file loading, the logical
   stylesheet and right-to-left support, the fonts, the service worker rule, the check, the
   review-sheet tool, and Arabic, Turkish and Russian generated with their sheets. This can
   merge to `main` with all three unreleased: nothing a visitor sees changes, and reviewers
   use the live site through the preview link.
2. **Stage 2: release each of the three** as its review comes back. One small change each.
3. **Stage 3: the other seven**, generated, checked and reviewed the same way. Persian
   exercises right-to-left a second time, so it is generated first of the seven.

## Non-goals

- Translating the exam itself. Questions, options and the German explanation stay German.
- Read-aloud in any language but German.
- Per-language URLs, metadata or link-preview cards.
- Machine translation in the browser.
- Translating `docs/`, `CLAUDE.md` or anything not served.

## What this changes in the project's own rules

These go into `CLAUDE.md` in the same change that ships stage 1:

- the UI-language section: `LANGS`, the file-per-language rule, `released`, the preview
  link, and the translation language;
- validation checklist step 5: walk the picker instead of pressing EN twice, and check one
  RTL language;
- a new step: `node --test tools/i18n.test.mjs`;
- the repo layout: `i18n/` as a served folder, `docs/translations/` for review sheets.
