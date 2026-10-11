# Language files

**Purpose.** Each file here holds one language: its menus and buttons, topic and state names,
glossary and the translation of every question. The app downloads a file only when someone
picks that language, and offers a language only after a native speaker has reviewed it.

**Summary.**

- One file per language, named by its code: `ar.json`, `tr.json` and so on.
- A file can sit here unreleased. The `LANGS` list in `index.html` decides what the picker
  offers, through each entry's `released` flag.
- `node --test tools/i18n.test.mjs` checks every file is complete and in the right script.
  It cannot check that a translation is right; the review does that.

## Status

One row per language: when it was generated, when its review came back, and anything still
open. A language is released only when its **Reviewed** cell holds a date.

| Code | Language | Generated | Reviewed | Notes |
| --- | --- | --- | --- | --- |
| ar | العربية | 2026-10-11 | — | Modern Standard Arabic, names transliterated, Western digits. Q329/Q449: "رئيس وزراء الولاية" (right) beside "رئيس الوزراء" (wrong), distinct but close. |
| tr | Türkçe | 2026-10-11 | — | "siz" forms. Bundeskanzler is Şansölye, Premierminister Başbakan. Q140/141/150 keep "Schöffe" in German: a Turkish gloss gives the answer away. Q190/Q224 (what DDR and EU stand for) keep the German expansion with the Turkish in brackets. Q185 reorders the sentence round the "…", as Turkish word order needs. |
| ru | Русский | 2026-10-11 | — | Counts read "Вопросов: {n}" so plural endings never go wrong. Q449: "премьер-министр земли" (right) sits beside "премьер-министр" (wrong), distinct but close. "Landtag" is sometimes glossed "(парламент земли)", sometimes not. |

## Why the details are this way

- **The German exam text is never in these files.** The test is in German, so the question,
  its answers and the German explanation stay as `questions.json` has them.
- **Questions are keyed by id, the glossary by its German term.** Reordering either list in
  the app cannot misalign a translation.
- **Edit these files with Node, never PowerShell's `ConvertTo-Json`**, which mangles the data
  and adds a byte-order mark.
- The design and the plan behind them: `docs/plans/2026-10-11-languages-design.md`.
