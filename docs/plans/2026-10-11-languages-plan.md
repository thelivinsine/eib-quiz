# Ten more languages — task list

_Written 2026-10-11. The argument for every choice below is in
[2026-10-11-languages-design.md](2026-10-11-languages-design.md); nothing there is repeated here._

**Purpose.** The work, in order, that lets a learner pick one of ten new languages for the
menus and the question translations, with each language hidden until a native speaker has
reviewed it.

**Summary.** Not started. Tasks 1-12 are stage 1: the machinery plus Arabic, Turkish and
Russian, merged to `main` with all three still hidden. Tasks 13-14 release them as reviews
come back. Tasks 15-17 do the other seven.

> **For agentic workers:** use `sp-land-a-task` for each task, and
> `superpowers:subagent-driven-development` or `superpowers:executing-plans` to carry it out.

**Branches.** `plan/languages` off `main` (it already holds the design and this list). Each
task is `task/languages/<n>-<slug>` off `plan/languages`, merged back when its **Done when**
lines are all true. `plan/languages` reaches `main` through one PR at the end of stage 1
(task 12), and again for each release.

## Progress

| # | Task | Status | Landed | Not verified |
| --- | --- | --- | --- | --- |
| 1 | RTL-ready stylesheet | done | 2026-10-11 | Screens never shot: the image lightbox, the navigator's Topics view, hover and press states, a coarse pointer, and widths other than 375 and 1280. Their changes are the same one-for-one swaps, which are identical in left-to-right, but no screenshot proves it. Checked in Playwright's Chromium only. |
| 2 | The completeness check | done | 2026-10-11 | Nothing on screen to check. Proved against the deliberately broken fixture and a fake `LANGS` entry with no file (fails as it should). Not yet run against a real translation, so false alarms on real text are untested until task 4. |
| 3 | Terminology lists: ar, tr, ru | done | 2026-10-11 | Every rendering is AI-written and unreviewed: the lists are the first thing each reviewer should check. |
| 4 | Generate Arabic | done | 2026-10-11 | Unreviewed translation. I am not a native speaker; I spot-read 12 general and 10 state questions. Nothing seen in the app yet, and right-to-left rendering waits for task 9. Q1 answered without you. |
| 5 | Generate Turkish | done | 2026-10-11 | Unreviewed translation. I am not a native speaker; I spot-read 12 questions, every topic and two states. Nothing seen in the app yet. Q1, Q2 answered without you. |
| 6 | Generate Russian | done | 2026-10-11 | Unreviewed translation. Spot-read by me (not a native speaker): 12 questions, every topic and two states. Nothing seen in the app yet (task 7 loads it). Q1, Q2 answered without you. |
| 7 | Language list, loading and the picker | done | 2026-10-11 | **Not run in a browser at all (unattended run)**. Unverified: the picker lists only English/Deutsch; `?lang=ar` switches one tab without touching `eib_lang`; offline after one use; a blocked `i18n/ar.json` snaps the picker back with the alert; header row width at 320/375 in en/de/ar; picker box size against `main`; en/de screenshots against the baseline. Checked: all five node checks, and a read of the code. |
| 8 | Translations in the quiz, review and glossary | done | 2026-10-11 | **Not run in a browser (unattended run)**: none of the five sites, the fallback for a missing question, or the en/de byte-identical claim was seen on screen. Checked: the node checks and a read of the code. Q3 answered without you. |
| 9 | Right to left and fonts | done | 2026-10-11 | **Not run in a browser (unattended run)**: nothing about the mirrored layout, the German blocks staying left to right, the flipped arrows, the Arabic font or the line height of Arabic text was seen on screen, and en/de were not compared against the baseline. Checked: node checks, a read of the CSS specificity, and Google Fonts' coverage data for Bricolage. |
| 10 | Measure every language at every width | blocked by 5, 6, 9 | — | — |
| 11 | Review sheets | blocked by 4, 5, 6 | — | — |
| 12 | Docs, full validation, ship stage 1 | blocked by 10, 11 | — | — |
| 13 | Find reviewers and return the sheets | user's; blocked by 12 | — | — |
| 14 | Apply corrections and release ar, tr, ru | blocked by 13 | — | — |
| 15 | Terminology lists: the other seven | blocked by 12 | — | — |
| 16 | Generate the other seven | blocked by 15 | — | — |
| 17 | Measure, sheets and ship the seven hidden | blocked by 16 | — | — |

## Global constraints

- **One file, no build step.** All app code stays in `index.html`; translations live in
  `i18n/<code>.json`. Nothing new outside Google Fonts.
- **The exam stays German.** No task translates `q.de`, `q.options` or `q.explanation_de`,
  and read-aloud stays `de-DE`.
- **English and German behave exactly as today** for anyone who never picks a new language.
  Each task that touches shared code proves this with a before/after comparison.
- **No unreviewed language is ever `released: true`.** Only tasks 14 and the release step
  after 17 flip that flag, and only for a language whose review has come back.
- **Translations are text, never markup.** A translation may contain only the HTML tags its
  English string contains (the hero headline's `<span>`), and the check in task 2 enforces
  it. Everywhere else a translation is written with `textContent` or escaped.
- **A string that overflows gets shortened, not a new breakpoint**, as `dash.due` was.
- **Search by selector or function name**, not by line number: line numbers drift.
- **Edit `questions.json` and the language files with Node**, never PowerShell's
  `ConvertTo-Json`, which mangles the data and adds a byte-order mark.

## Review focus

The places this is most likely to go wrong, and the task that pins each:

1. **The English/German app changing by accident.** Converting 35 left/right rules to
   start/end is meant to be invisible in left-to-right. Pinned by task 1's pixel comparison.
2. **Arabic text mixed with German exam text.** The German question and options must stay
   left to right inside a right-to-left page. Pinned in task 9.
3. **The header row overflowing.** It fits at 320px to within 15px today, and the picker
   has to keep the EN box's exact size. Pinned in tasks 7 and 10.
4. **A failed download leaving the app half-switched.** Pinned in task 7.
5. **An unreleased language leaking.** It must never appear in the picker, and the preview
   link must not survive into `localStorage`. Pinned in task 7.

## Shared verification tools

- **Server.** Use the `eib` config on port 8777 if it is free. If another session holds it,
  add a temporary second config to the main folder's `.claude/launch.json` on 8778 (with
  `--directory` if working in a worktree), never commit it, and revert the file before
  finishing.
- **Read `innerWidth` before trusting any measurement** in the preview pane. A tab with no
  layout viewport reports 0, and every number after that is the phone layout.
- **Finish animations before measuring**: `document.getAnimations().forEach(a => a.finish())`.
- **Screenshots and pixel comparisons in headless Chrome**, which paints when the pane does
  not. Widths that are the thing under test are measured in the pane with `resize_window`,
  not with headless `--window-size`.
- **The baseline for "unchanged"** is a set of headless screenshots taken on `main` before
  task 1: Home, Practise, a text question, a four-image question with the explanation open,
  and the results screen, at 375 and 1280, light and dark, English and German. Keep them in
  the scratchpad, not the repo.

---

### 1. RTL-ready stylesheet

Convert every physical left/right declaration in the `<style>` block, and in the inline
styles the script writes, to its logical start/end form, with no visible change.

- Count them exactly first (`margin-left/right`, `padding-left/right`, `left:`/`right:`,
  `border-left/right`, `text-align: left/right`, `translateX`, `background-position`, and
  `inset` written as four values). The design's figure of about 35 is a line grep.
- `translateX` on decorative ornaments (the mountain, the gate) may stay physical: they are
  pictures. Name each one kept in a comment.
- The scroll gutters (`padding-right` + matching negative `margin-right` on
  `.question-body` and `#endScreen`) become `-inline-end`, both halves together.

**Done when**
- a grep of the `<style>` block for physical left/right properties returns only the
  commented exemptions;
- the baseline screenshots, retaken on this branch, match `main` pixel for pixel, or each
  difference is listed and explained;
- `node --test tools/scale.test.mjs` and `tools/contrast.test.mjs` pass.

**Blocked by** nothing.

**Landed 2026-10-11.**
- **41 flagged declarations, not ~35.** 31 became their start/end form. The other 10
  stay physical on purpose. Two were never left/right at all: a vertical `translate`,
  and a radius on both top corners. Five need nothing in right to left, each with a
  comment: the state picker's down caret, the mountain ornament's `left` +
  `translateX` (a picture), and the wrong-answer shake's two `translateX` (symmetric).
  **Three must be flipped by task 9**, also commented: the mode-card arrow's hover nudge
  (`translateX(3px)`), the progress bar tip's `90deg` gradient, and the navigator group
  caret, which points right when closed.
- The script writes no left/right inline style, so nothing changed there.
- **`tools/scale.test.mjs` was blind to the start/end longhands.** `SPACING_PROPS` listed
  `padding-inline` but not `padding-inline-end`, so a literal written that way would have
  passed. The eight longhands are in the list now; every budget held.
- **Pixel check**: 40 screenshots (Home, Practise, a text question, Q21 answered, results;
  375 and 1280; light and dark; EN and DE) taken before and after in Playwright with
  reduced motion. Every difference also appears between two runs of the unchanged
  build: 149px in the results ring's count-up and 1px on Home at 1280.

### 2. The completeness check

`tools/i18n.test.mjs`, run with `node --test`, checks every `i18n/*.json` against the
current `index.html`, as the design's "The automated check" section lists.

- Add `LANGS` to `index.html` beside `LANG_KEY`, holding only `en` and `de` for now. No
  code reads it until task 7; it exists here so the check and the generation tasks have
  one list to read and write.
- Parse `I18N`, `CATEGORIES`, `STATES`, `GLOSSARY` and `LANGS` out of `index.html` the way
  `contrast.test.mjs` parses tokens.
- Add the tag rule from the global constraints: a translation's HTML tags must equal its
  English string's.
- Prove the test bites: one fixture under `tools/fixtures/` with a missing key, a dropped
  `{placeholder}`, three options instead of four, English left in an Arabic string and a
  stray `<b>` must fail on each.
- Create `i18n/README.md` with the per-language table (code, generated, reviewed, notes).

**Done when**
- the test passes with no language files present;
- each fault in the fixture is reported by name;
- `i18n/README.md` exists with an empty table.

**Blocked by** nothing.

### 3. Terminology lists: Arabic, Turkish, Russian

One list per language at `docs/translations/<code>-terms.md`: the 30-40 civic terms the
catalogue repeats (Grundgesetz, Bundestag, Bundesrat, Bundesverfassungsgericht, Rechtsstaat,
Sozialstaat, the parties, the federal states, the Länder institutions), each with its German
original and the one translation every batch must use.

**Done when**
- the three lists exist and every term in `GLOSSARY` appears in each;
- a scan of `questions.json` for the 40 most frequent capitalised German nouns finds none
  missing that occurs in 5 or more questions.

**Blocked by** nothing.

**Landed 2026-10-11.** 58 terms per language, all 18 glossary terms included. Of the 40
most frequent capitalised words found in 5+ questions, the 15 not listed are all generic:
question words (Welche, Welches), years and age (Jahre, Alter), colours, ordinals, forms of
Deutschland, and state names (which come from each language file's state list instead).
One rule went beyond the plan: titles the catalogue sets side by side as wrong answers
(Bundeskanzler, Premierminister, Ministerpräsident, Regierungschef) each get a distinct
rendering, or two answer options would read the same.

### 4. Generate Arabic

Write `i18n/ar.json` in the design's format: `ui`, `categories`, `states`, `glossary`, then
all 460 questions in batches of about 60, each batch given `docs/translations/ar-terms.md`.
Translate from the German, with the English as a reference. Keep names, dates and numbers
as they are, in Western digits.

- Batches can run as parallel subagents. Each returns JSON for its id range; a Node script
  merges them, so no agent edits the shared file.
- Add the `LANGS` entry `{ code: 'ar', name: 'العربية', dir: 'rtl', released: false }`.
- Add the row to `i18n/README.md`: generated 2026-mm-dd, not reviewed.

**Done when**
- `node --test tools/i18n.test.mjs` passes with `ar.json` present;
- a spot read of 10 questions spread across the five topics and two states finds the terms
  from the list used every time.

**Blocked by** 2, 3.

### 5. Generate Turkish

As task 4, for `tr` (`Türkçe`, left to right).

**Done when** as task 4, for `tr`.

**Blocked by** 2, 3.

### 6. Generate Russian

As task 4, for `ru` (`Русский`, left to right).

**Done when** as task 4, for `ru`.

**Blocked by** 2, 3.

**Landed 2026-10-11**, ahead of 4 and 5 because its batches finished first. The questions came
back in four batches of 115; the two state-question batches were built by script from the
catalogue's fixed patterns, and read fine. The completeness check learned one rule here: a
string identical in the German and the English is a name, not an untranslated sentence (Q2).

### 7. Language list, loading and the picker

The machinery from the design's "Architecture" and "The language picker" sections.

- **`lang`'s initial read** accepts any code in `LANGS` (added in task 2), else `en`.
- **`setLang(code)`** becomes async: fetch `i18n/<code>.json` once (memoised), merge `ui`
  into `I18N[key][code]`, `categories` into `CATEGORIES`, `states` and `glossary` into new
  per-language maps, keep `questions` for task 8, then paint as today. On failure: stay on
  the previous language, put the picker back, and `alert(t('err.langLoad'))`.
- **Boot**: a saved non-`en`/`de` language is fetched alongside `questions.json`;
  `initLang()` paints once it arrives.
- **Pre-paint script** in `<head>`: also set `dir="rtl"` when the saved code is `ar` or
  `fa`. This duplicates the RTL codes from `LANGS`; say so in a comment at both sites.
- **The picker**: `#langToggle` keeps its class, box and face, wrapped as the state
  picker is, with a transparent `<select>` over it listing `en`, `de` and every released
  entry by its native `name`. The `<select>` keeps 16px so iOS does not zoom. The face
  stays the upper-case code. The accessible name is the code plus `nav.language`.
- **Preview link**: `?lang=<code>` for an unreleased entry adds it to the picker for that
  tab through `sessionStorage` (`eib_lang_preview`), and switches to it without writing
  `eib_lang`. An unknown code is ignored.
- **Delete** `toggleLang()`, `nav.switchToDe` and `nav.switchToEn`. Add `nav.language` and
  `err.langLoad` (en/de).
- **`sw.js`**: `i18n/*.json` joins the network-first branch. When offline with no cached
  copy it returns `Response.error()`, never `index.html`. Bump `CACHE`.
- **The Smart Review alert** (added 2026-10-11, on request): `startMode()` alerted a
  hard-coded German "Noch nichts zu wiederholen…" whatever the menu language. It becomes
  `t('err.reviewEmpty')`, translated like every other string.

**Done when**
- with `ar` unreleased, the picker lists only English and Deutsch, and `?lang=ar` makes
  the menus Arabic for that tab while `localStorage.eib_lang` keeps its old value;
- temporarily releasing `ar` locally, picking it, reloading and going offline (pane network
  emulation) still shows Arabic menus;
- blocking `i18n/ar.json` in the pane makes the picker snap back to the previous language
  with the alert, and nothing on screen is half-switched;
- the header row's `scrollWidth` equals its box at 320 and 375 in English, German and
  Arabic, and the picker box measures the same as the EN box on `main` (28px with a mouse,
  36px on a coarse pointer);
- English and German still match the baseline screenshots;
- `node --check sw.js` passes.

**Blocked by** 4. Tasks 5 and 6 can land before or after this one.

**Landed 2026-10-11.** `paintLangControls()` also sets `<html dir>` from `LANGS` here rather
than in task 9: without it, switching away from a previewed Arabic left the page right to left until
a reload. The `<select>` reads `--type-option` (16px) instead of a literal `font-size`, so it
needs no exemption in the size test. `setLang()` is async and keeps only the last of two quick
picks. New strings: `nav.language`, `err.langLoad`, `err.reviewEmpty`, written into all three
language files by hand; `nav.switchToDe` / `nav.switchToEn` are gone from the app and the files.
`CACHE` is `eib-cache-2026-10-11-languages`.

### 8. Translations in the quiz, review and glossary

The design's "Which translation the toggle shows" section.

- One helper picks the translation language (`lang`, except `de` → `en`) and returns a
  question's translated `q`, `options` and `explanation`, falling back to `q.en` /
  `q.options_en` / `q.explanation_en` per missing field.
- The five sites: `#questionEnglish`, each `.option-en-text`, `#explanationEnglish`, both
  `.review-explanation-en` blocks in the results review, and `.gloss-en`. Each sets `lang`
  (and `dir` for RTL) from the translation language, and writes text, not HTML.
- The glossary's third line reads the language file's `glossary` by `term`.
- State names: the state picker, the question meta and the results read the translated
  state map, falling back to `STATES`.
- Rename the strings, not the keys: `quiz.showEn` / `quiz.hideEn` read "Show translation" /
  "Hide translation" in English and "Übersetzung anzeigen" / "Übersetzung ausblenden" in
  German. `state.showEnglish` keeps its name.

**Done when**
- in Turkish and Russian (via `?lang=`), each of the five sites shows that language with
  the matching `lang` attribute, on a text question, an image question, a state question,
  the results review of a practice round and of an exam;
- deleting one question from a local copy of `tr.json` shows English for that question
  only;
- in English and German every site is byte-identical to `main`.

**Blocked by** 5, 6, 7.

**Landed 2026-10-11.** `translationOf(q)` falls back to the English for a whole question
rather than field by field, so a block's `lang`/`dir` always match its text (the check makes
a partial entry impossible anyway). Translations reach markup through `escapeHtml()`, and the
question's own translation through `textContent`. `stateName()` serves the state picker, the
mode cards, the resume banner, the results and the question meta. **The four landing-page
lines that say "German or English" were left alone** (Q3): true until a language is released.

### 9. Right to left and fonts

The design's "Right to left" and "Fonts" sections.

- `paintLangControls()` sets `<html dir>` from the `LANGS` entry.
- `dir="ltr"` beside every `lang="de"` on exam content: the question text, the option
  buttons (letter chip included), `#explanationText`, glossary terms and German
  definitions, and the results review's German text. Translation lines inside them carry
  the translation's `dir`.
- One `[dir="rtl"]` rule mirrors the directional glyphs' SVGs: back chevron, mode-card
  arrow, scroll arrows, navigator chevron. Not their discs or buttons.
- The progress bar's lit tip follows the fill's leading edge (its `90deg` gradient is
  physical), the mode-card arrow's hover nudge goes the way the flipped arrow points, and
  the navigator group caret points left when closed. Task 1 left all three physical.
- Fonts: add `Noto Sans Arabic` (400, 600, 700) to the existing Google Fonts link, still
  one request; extend `--font-body` and `--font-head` as the design gives them.
- Check whether Bricolage Grotesque has Cyrillic, from the pane: render a Russian heading
  and read `document.fonts` for which face drew it. Record the answer in the design's
  open questions.

**Done when**
- in Arabic, on Home, Practise, a text question, a four-image question, the exam and the
  results screen, at 375 and 1280: the layout is mirrored, the German exam text reads left
  to right with its letter chips on the left, the Arabic translations read right to left,
  and no Latin fallback font draws Arabic text;
- the ring, the brand mark, the photo and the ornaments are not mirrored;
- English and German still match the baseline screenshots;
- `tools/contrast.test.mjs` and `tools/scale.test.mjs` pass, with any new font stack value
  allowed by the scale test's rules rather than exempted.

**Blocked by** 1, 8.

**Landed 2026-10-11.** `dir="ltr"` sits beside every `lang="de"` on exam content (question,
options container, German explanation, glossary term and definition, both review lists). The
back arrow un-flips, the forward arrows on mode cards and topic chips flip on their SVG only, the
mode-card nudge reverses, the closed navigator caret points left (the `[open]` rule still wins on
specificity), and the progress tip's gradient turns to `270deg`. Translation lines in a
right-to-left script drop the italic, which Arabic does not have. **Bricolage Grotesque has no
Cyrillic** (Google Fonts metadata: latin, latin-ext, vietnamese), so Inter draws Russian headings.

### 10. Measure every language at every width

The design's "Layout checks", for `ar`, `tr` and `ru`.

- `scrollWidth === innerWidth` on Home and Practise at 320, 375 and 1280.
- `scrollHeight === innerHeight` on the quiz and results screens at 375, 620, 940 and 1400,
  on a four-image question with the explanation open and with the mobile navigator both
  collapsed and expanded.
- The mode-card titles, the overview readouts, the quiz readouts (one line at 360) and the
  header row in their narrowest boxes.
- Any overflow is fixed by a shorter string in that language's file, noted in
  `i18n/README.md`.

**Done when** every measurement above passes in all three languages and is recorded in the
task's progress row, with the strings that had to be shortened.

**Blocked by** 5, 6, 9.

### 11. Review sheets

`tools/make-review-sheet.mjs <code>` writes `docs/translations/<code>-review.csv` with the
columns `key`, `German`, `English`, `translation`, `correction`, `comment`: one row per UI
string, category, state, glossary entry, and each question's text, four options and
explanation as separate rows. UTF-8 with a byte-order mark, so Excel opens Arabic and
Cyrillic correctly.

**Done when**
- the three sheets exist and open in Excel and Google Sheets with every script readable;
- the row count equals UI keys + 5 + 16 + glossary terms + 460 × 6 for each.

**Blocked by** 4, 5, 6.

### 12. Docs, full validation, ship stage 1

- `CLAUDE.md`: the changes the design's last section lists (the UI-language section,
  validation step 5, the new check, the repo layout). Coordinate with any busy peer
  session before editing it.
- `docs/TODO.md`: stage 1 shipped hidden; stages 2 and 3 open.
- The full validation checklist in `CLAUDE.md`, including the new check.
- Open the PR from `plan/languages` into `main`, with the review focus above as its test
  plan.

**Done when**
- every checklist step passes and the PR body says which were run;
- after merge, the live site's picker lists only English and Deutsch, and
  `?lang=ar` on the live site shows Arabic, measured from the pane as `CLAUDE.md`
  describes (build, origin, then edge).

**Blocked by** 10, 11.

### 13. Find reviewers and return the sheets

**This one is the user's.** Find one native speaker each for Arabic, Turkish and Russian,
send them their sheet and the live `?lang=<code>` link, and hand the filled sheets back.

**Done when** each returned sheet is in `docs/translations/` with its `correction` column
filled or explicitly empty.

**Blocked by** 12.

### 14. Apply corrections and release Arabic, Turkish, Russian

One branch per language, so each releases as soon as its sheet is back.

- Apply every `correction` into `i18n/<code>.json` with a Node script, never by hand edit
  of the JSON.
- Run the check, re-measure task 10's narrowest boxes for any changed string.
- Flip `released: true`, record the review date in `i18n/README.md`, merge to `main`.

**Done when** for each language: the check passes, every correction is in the file (the
script reports zero unapplied rows), and the live picker lists it.

**Blocked by** 13.

### 15. Terminology lists: the other seven

As task 3, for `fa`, `uk`, `sq`, `bs`, `ro`, `ku`, `pl`.

**Done when** as task 3, for all seven.

**Blocked by** 12.

### 16. Generate the other seven

As task 4, for each language, Persian first because it exercises right to left a second
time. `LANGS` names: `فارسی` (`dir: 'rtl'`), `Українська`, `Shqip`,
`Bosanski / Hrvatski / Srpski`, `Română`, `Kurdî (Kurmancî)`, `Polski`. All unreleased.

**Done when** the check passes with all ten files present.

**Blocked by** 15.

### 17. Measure, sheets and ship the seven hidden

Task 10's measurements and task 11's sheets for the seven, then a PR to `main` with all
seven still unreleased. Their reviews and releases then follow tasks 13 and 14, one
language at a time.

**Done when** every measurement passes for all seven, the seven sheets exist, and the live
picker still lists only the released languages.

**Blocked by** 16.
