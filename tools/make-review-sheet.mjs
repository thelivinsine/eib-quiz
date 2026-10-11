// Writes the review sheet a native speaker fills in before a language is released.
//
// A reviewer should not need to read code or JSON. This puts every translated string of one
// language in a spreadsheet beside its German original and the English, with empty columns
// for a correction and a comment. It opens in Excel or Google Sheets.
//
// One row per menu string, topic, state and glossary entry, and one row each for a
// question's text, every answer and its explanation, so a correction names exactly one
// string. The `key` column is how a returned correction finds its way back into the file.
//
// UTF-8 with a byte-order mark: without it Excel opens Arabic and Cyrillic as mojibake.
//
// Run:  node tools/make-review-sheet.mjs <code>   ->  docs/translations/<code>-review.csv

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { I18N, CATEGORIES, STATES, GLOSSARY, QUESTIONS, I18N_DIR } from "./i18n-source.mjs";

const code = process.argv[2];
if (!/^[a-z]{2,3}$/.test(code ?? "")) { console.error("usage: node tools/make-review-sheet.mjs <code>"); process.exit(1); }
const data = JSON.parse(readFileSync(join(I18N_DIR, `${code}.json`), "utf8"));

const rows = [["key", "German", "English", "translation", "correction", "comment"]];
const add = (key, de, en, tr) => rows.push([key, de ?? "", en ?? "", tr ?? "", "", ""]);

for (const [k, v] of Object.entries(I18N)) add(`ui.${k}`, v.de, v.en, data.ui[k]);
for (const [k, v] of Object.entries(CATEGORIES)) add(`category.${k}`, v.de, v.en, data.categories[k]);
// The app shows the German state names in English too, so they fill both columns.
for (const [k, v] of Object.entries(STATES)) add(`state.${k}`, v, v, data.states[k]);
for (const g of GLOSSARY) add(`glossary.${g.term}`, `${g.term}: ${g.de}`, g.en, data.glossary[g.term]);
for (const q of QUESTIONS) {
  const t = data.questions[q.id] ?? {};
  add(`q${q.id}.text`, q.de, q.en, t.q);
  q.options.forEach((o, i) => add(`q${q.id}.option${i + 1}`, o, q.options_en?.[i], t.options?.[i]));
  add(`q${q.id}.explanation`, q.explanation_de, q.explanation_en, t.explanation);
}

const cell = (s) => '"' + String(s).replace(/"/g, '""') + '"';
const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
const out = fileURLToPath(new URL(`../docs/translations/${code}-review.csv`, import.meta.url));
writeFileSync(out, csv);
console.log(`${code}: ${rows.length - 1} rows -> docs/translations/${code}-review.csv`);
