#!/usr/bin/env node
/*
 * categorize.js — assigns a `category` to every question in questions.json.
 *
 * Categories are coarse, robust civic-test themes (keyword rules, first match
 * wins). Berlin questions are categorized by their `berlin` flag. Re-runnable.
 *
 * Usage: node tools/categorize.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'questions.json');
const questions = JSON.parse(fs.readFileSync(file, 'utf8'));

// Category metadata (key -> bilingual labels), surfaced by the UI.
const CATEGORIES = {
  rights:   { de: 'Grundrechte & Verfassung', en: 'Fundamental Rights & Constitution' },
  politics: { de: 'Demokratie, Wahlen & Staat', en: 'Democracy, Elections & State' },
  history:  { de: 'Geschichte', en: 'History' },
  society:  { de: 'Gesellschaft, Soziales & Wirtschaft', en: 'Society, Welfare & Economy' },
  symbols:  { de: 'Symbole, Geografie & Europa', en: 'Symbols, Geography & Europe' },
  berlin:   { de: 'Berlin', en: 'Berlin' },
};

const has = (s, words) => words.some(w => s.includes(w));

function classify(q) {
  if (q.berlin) return 'berlin';
  // Classify on the QUESTION text + the CORRECT answer. Many items state the topic
  // only in the correct option; the wrong distractors (e.g. "Einheit", "Weimar" in
  // image answers) are excluded to avoid false matches.
  const t = (q.de + ' ' + (q.options[q.correct] || '')).toLowerCase();

  // Symbols, geography, Europe (check first so "Wappen der DDR" lands here, not history)
  if (has(t, ['wappen', 'flagge', 'adler', 'hymne', 'farben', 'europäische union', 'europa',
      'wie viele bundesländer', 'stadtstaat', 'hauptstadt', 'landkarte', 'wappentier', 'nationalhymne',
      'europäisch', 'nachbarland', 'grenzt', 'welches bundesland ist']))
    return 'symbols';

  // History: era/date/regime specific
  if (has(t, ['nationalsozial', 'hitler', 'weltkrieg', ' ddr', 'ddr ', 'ddr?', 'mauer',
      'wiedervereinig', '1945', '1949', '1933', '1939', '1989', '1990', '1953', '1961', '1848', '1933',
      'jüdisch', 'juden', 'judentum', 'holocaust', ' sed', 'stunde null', 'montagsdemonstration',
      'besatzung', 'alliiert', 'geschichte', 'jahrhundert', 'nationalsozialisten', 'drittes reich',
      'widerstand', 'stasi', 'vor wie vielen jahren', 'vor etwa', 'weimarer republik', 'kaiserreich']))
    return 'history';

  // Fundamental rights & constitution
  if (has(t, ['grundrecht', 'grundgesetz', 'verfassung', 'meinungsfreiheit', 'religionsfreiheit', 'menschenwürde',
      'rechtsstaat', 'artikel', 'pressefreiheit', 'versammlung', 'glaubens', 'gewissens', 'asyl',
      'gleichheit', 'gleichberechtigung', 'freizügigkeit', 'grundordnung', 'menschenrecht', 'unantastbar',
      'zensur', 'recht auf', 'grundrechte']))
    return 'rights';

  // Democracy, elections, parties, parliament, government, federal structure
  if (has(t, ['wahl', 'wählen', 'partei', 'bundestag', 'bundesrat', 'abgeordnete', 'regierung', 'kanzler',
      'opposition', 'koalition', 'demokratie', 'parlament', 'bundespräsident', 'minister', 'gewaltenteilung',
      'volkssouveränität', 'legislative', 'exekutive', 'judikative', 'bundesland', 'bundesländer',
      'föderal', 'ministerpräsident', 'landtag', 'gemeinde', 'kommune', 'verwaltung', 'staatsgewalt',
      'verfassungsgericht', 'fraktion', 'bundesstaat', 'wahlrecht', 'schöffe', 'staatsform', 'politik']))
    return 'politics';

  // Everything else: society, welfare, economy, religion, work, education, family
  return 'society';
}

let counts = {};
for (const q of questions) {
  q.category = classify(q);
  counts[q.category] = (counts[q.category] || 0) + 1;
}

// Keep `category` adjacent to other metadata by rewriting one-line-per-question.
const body = questions.map(q => '  ' + JSON.stringify(q)).join(',\n');
fs.writeFileSync(file, '[\n' + body + '\n]\n');

console.log('Categories written. Distribution:');
for (const k of Object.keys(CATEGORIES)) console.log(`  ${k.padEnd(9)} ${counts[k] || 0}  (${CATEGORIES[k].de})`);
console.log('\nCATEGORIES (for reference):');
console.log(JSON.stringify(CATEGORIES));
