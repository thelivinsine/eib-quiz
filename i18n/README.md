# Language Audited 2026-10-16: 37 strings (0 critical, 6 major). Q183 writes the decades as 1940 etc., because "دهه 40" reads as the solar calendar. Schöffe is "شوفه (Schöffe)" where a German-only string fails the script check. Audited 2026-10-16: 55 strings (5 critical, 19 major). Brackets that explained the answer were removed from Q85, Q124, Q129, Q224 and Q56; Q327 is in Cyrillic like every other capital. Audited 2026-10-16: 23 strings (0 critical, 2 major): the Q224 "(BE)" gloss and the Q131 stem echo removed; feedback strings moved to "ju". Audited 2026-10-16: 56 strings (5 critical, all Q194, whose stem fitted only the right answer, 2 major). "Šta" throughout; "krst" for Kreuz. Audited 2026-10-16: 27 strings (0 critical, 10 major). Zweitstimme is "al doilea vot" everywhere (Q93 called it the minor vote); Q38's stem fits every option. Audited 2026-10-16: 51 strings (1 critical, Q62, 1 major). Berlin is "Berlîn" everywhere; feedback strings moved to "hûn". Audited 2026-10-16: 29 strings (1 critical, Q190, 6 major). Q190 keeps the German expansion with the Polish in brackets, as Turkish does. |||||||files

**Purpose.** Each file here holds one language: its menus and buttons, topic and state names,
glossary and the translation of every question. The app downloads a file only when someone
picks that language, and offers a language only after a native speaker has reviewed it
(all ten are the exception: released unreviewed, see Status).

**Summary.**

- One file per language, named by its code: `ar.json`, `tr.json` and so on.
- A file can sit here unreleased. The `LANGS` list in `index.html` decides what the picker
  offers, through each entry's `released` flag.
- `node --test tools/i18n.test.mjs` checks every file is complete and in the right script.
  It cannot check that a translation is right; the review does that.

## Status

One row per language: when it was generated, when its review came back, and anything still
open. A language is meant to be released only when its **Reviewed** cell holds a date, but
**all ten were released UNREVIEWED, on request**: ar, tr and ru on 2026-10-12, the other
seven on 2026-10-16. Their Reviewed cells stay empty until a native speaker's review comes
back.

**The seven were audited by AI before release (2026-10-16)**: two auditors per language read
every string against the German and the right answer, then a script checked all ten files for
answer leaks. Counts below are strings changed. No right answer was found made wrong; the
critical fixes were all answer leaks, where the translation gave the answer away. One leak is
left open, in every language, pending a decision: Ministerpräsident is rendered "premier of the
state" (the terms lists), so in Q37 and the state questions the right option echoes the
question. Changing it means changing ten terms lists.

| Code | Language | Generated | Reviewed | Notes |
| --- | --- | --- | --- | --- |
| ar | العربية | 2026-10-11 | — | Modern Standard Arabic, names transliterated, Western digits. Q329/Q449: "رئيس وزراء الولاية" (right) beside "رئيس الوزراء" (wrong), distinct but close. |
| tr | Türkçe | 2026-10-11 | — | "siz" forms. Bundeskanzler is Şansölye, Premierminister Başbakan. Q140/141/150 keep "Schöffe" in German: a Turkish gloss gives the answer away. Q190/Q224 (what DDR and EU stand for) keep the German expansion with the Turkish in brackets. Q185 reorders the sentence round the "…", as Turkish word order needs. `dash.answered` shortened to "Toplam yanıt" (was "Toplam yanıtlanan"): the overview row wrapped at 360-375px (task 10). |
| ru | Русский | 2026-10-11 | — | Counts read "Вопросов: {n}" so plural endings never go wrong. Q449: "премьер-министр земли" (right) sits beside "премьер-министр" (wrong), distinct but close. "Landtag" is sometimes glossed "(парламент земли)", sometimes not. |
| fa | فارسی | 2026-10-12 | — | Iranian Persian, "شما", Western digits, zero-width non-joiners. Names in Persian script as Arabic does; state names follow the German (بایرن, نیدرزاکسن). Schöffe stays German. Nine strings rewritten by hand to pass the script check (questions file, Q10). |
| uk | Українська | 2026-10-12 | — | "ви". Counts read "Питань: {n}". Place names in Cyrillic, spelled after Russian (Q10). Q37/Q449: "прем’єр-міністр землі" (right) beside "прем’єр-міністр" (wrong), distinct but close. Shortened in task 17, as Russian's are: `dash.answered` to "Усі відповіді", the quiz readouts to "Вірно" / "Невірно" / "Бал" (the overview row and the 360px quiz row wrapped). |
| sq | Shqip | 2026-10-12 | — | "ju". Bundesland is "land federal"; Gemeinde "komunë" (Kosovo) rather than "bashki" (Albania). State names are never declined: sentences read "në landin Bavaria". `dash.answered` shortened to "Gjithsej" ("in total"; was "Gjithsej të përgjigjura"): the overview row wrapped at 1280 and on phones (task 17). |
| bs | Bosanski / Hrvatski / Srpski | 2026-10-12 | — | One Latin, ijekavian text with Bosnian words where the three differ (Q8): historija, tačno, porodica. Hessen, Saarland, Mecklenburg-Vorpommern and Schleswig-Holstein keep their German names. Ministerpräsident "premijer pokrajine" sits close to Premierminister "premijer". The language menu shows "Bosnian" under the native name, kept as is, decided 2026-10-12. `dash.answered` shortened to "Svi odgovori" (was "Ukupno odgovoreno"), for the same reason as Albanian (task 17). |
| ro | Română | 2026-10-12 | — | "dumneavoastră", ș ț with the comma below. Counts rewritten as "Întrebări: {n}" after generation: Romanian needs "de" from 20 up, which a placeholder cannot switch. |
| ku | Kurdî (Kurmancî) | 2026-10-12 | — | Hawar alphabet, "hûn". The least settled: Ordnungsamt and the city-state titles are coined. State names take no case endings; Hessen, Thüringen and Nordrhein-Westfalen stay German. |
| pl | Polski | 2026-10-12 | — | "ty" or no direct address (Q7). Saarland is "Kraj Saary". Place names are Polish wherever Polish has an established name (Monachium, Kolonia, Poczdam), declined in running text, and German where it has none (Stuttgart, Karlsruhe), decided 2026-10-12. `dash.answered` shortened to "Łącznie" ("in total"; was "Odpowiedzi łącznie"), for the same reason as Albanian (task 17). |

## Why the details are this way

- **The German exam text is never in these files.** The test is in German, so the question,
  its answers and the German explanation stay as `questions.json` has them.
- **Questions are keyed by id, the glossary by its German term.** Reordering either list in
  the app cannot misalign a translation.
- **Edit these files with Node, never PowerShell's `ConvertTo-Json`**, which mangles the data
  and adds a byte-order mark.
- The design and the plan behind them: `docs/plans/2026-10-11-languages-design.md`.
