#!/usr/bin/env node
/*
 * extract-questions.js
 *
 * Generates questions.json from the KNOWN-GOOD `QUESTIONS` array embedded in
 * index.html. This is deliberate: index.html is the validated production data.
 * Do NOT generate from questions-final-extended.json (known corrupted) and do
 * NOT run regen_questions.js.
 *
 * It also rewires the image-based questions away from the old hand-drawn inline
 * SVG doodles toward real asset file paths under /img, and replaces the
 * meaningless "Option 1" / "1" placeholder labels with descriptive labels that
 * are used for the answer-review screen and image alt text.
 *
 * Usage: node tools/extract-questions.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// Isolate the `const QUESTIONS = [ ... ];` literal.
// NOTE: this is a one-time MIGRATION tool. After migration, index.html no longer
// embeds the array (it fetches questions.json), so the literal is gone and
// questions.json is the source of truth — edit it directly. We exit 0 in that case.
const start = html.indexOf('const QUESTIONS = [');
if (start === -1) {
  console.log('Migration already complete: no inline QUESTIONS literal in index.html.');
  console.log('questions.json is now the source of truth — edit it directly, then run tools/validate.js.');
  process.exit(0);
}
const arrStart = html.indexOf('[', start);
// Find the matching closing bracket for the array.
let depth = 0, end = -1, inStr = false, strCh = '', prev = '';
for (let i = arrStart; i < html.length; i++) {
  const c = html[i];
  if (inStr) {
    if (c === strCh && prev !== '\\') inStr = false;
  } else if (c === '"' || c === "'" || c === '`') {
    inStr = true; strCh = c;
  } else if (c === '[') depth++;
  else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
  prev = c;
}
if (end === -1) throw new Error('Could not find end of QUESTIONS array');

const literal = html.slice(arrStart, end + 1);
const questions = vm.runInNewContext('(' + literal + ')');

if (!Array.isArray(questions)) throw new Error('Parsed QUESTIONS is not an array');

// ---------------------------------------------------------------------------
// Image-question rewiring. Keyed by question id. `correct` is preserved from
// the source data; we only assign real asset paths + descriptive labels so the
// correct asset lands on the existing correct index.
// ---------------------------------------------------------------------------
const IMAGE_TRANSFORMS = {
  21: { // correct: 1 -> Bundeswappen
    images: ['img/q21/reichswappen-weimar.svg', 'img/q21/bundeswappen.svg', 'img/q21/wappen-kaiserreich.svg', 'img/q21/wappen-preussen.svg'],
    de: ['Reichswappen (Weimarer Republik)', 'Bundeswappen (Deutschland)', 'Wappen des Deutschen Kaiserreichs', 'Preußisches Wappen'],
    en: ['Reich coat of arms (Weimar Republic)', 'Federal coat of arms (Germany)', 'Coat of arms of the German Empire', 'Prussian coat of arms'],
  },
  130: { // correct: 0 -> valid ballot
    images: ['img/q130/ballot-valid.svg', 'img/q130/ballot-two-marks.svg', 'img/q130/ballot-defaced.svg', 'img/q130/ballot-empty.svg'],
    de: ['Stimmzettel mit je einem Kreuz', 'Stimmzettel mit zwei Kreuzen', 'Durchgestrichener Stimmzettel', 'Leerer Stimmzettel'],
    en: ['Ballot with one cross each', 'Ballot with two crosses', 'Crossed-out ballot', 'Empty ballot'],
  },
  209: { // correct: 3 -> DDR emblem
    images: ['img/q209/emblem-udssr.svg', 'img/q209/emblem-polen.svg', 'img/q209/emblem-csssr.svg', 'img/q209/emblem-ddr.svg'],
    de: ['Staatswappen der UdSSR', 'Wappen der Volksrepublik Polen', 'Wappen der Tschechoslowakei', 'Staatswappen der DDR'],
    en: ['State emblem of the USSR', 'Emblem of the People’s Republic of Poland', 'Emblem of Czechoslovakia', 'State emblem of the GDR'],
  },
  226: { // correct: 1 -> EU flag
    images: ['img/q226/flag-un.svg', 'img/q226/flag-eu.svg', 'img/q226/flag-nato.svg', 'img/q226/flag-eu-wrong.svg'],
    de: ['Flagge der Vereinten Nationen', 'Flagge der Europäischen Union', 'Flagge der NATO', 'Sternenkranz (falsche Anzahl)'],
    en: ['Flag of the United Nations', 'Flag of the European Union', 'Flag of NATO', 'Star circle (wrong number)'],
  },
  311: { // correct: 3 -> Berlin arms
    images: ['img/q311/wappen-hamburg.svg', 'img/q311/wappen-bremen.svg', 'img/q311/wappen-brandenburg.svg', 'img/q311/wappen-berlin.svg'],
    de: ['Wappen von Hamburg', 'Wappen von Bremen', 'Wappen von Brandenburg', 'Wappen von Berlin (Bär)'],
    en: ['Coat of arms of Hamburg', 'Coat of arms of Bremen', 'Coat of arms of Brandenburg', 'Coat of arms of Berlin (bear)'],
  },
  318: { // correct: 3 -> Berlin highlighted on map
    images: ['img/q318/map-bayern.svg', 'img/q318/map-nrw.svg', 'img/q318/map-sachsen.svg', 'img/q318/map-berlin.svg'],
    de: ['Bayern hervorgehoben', 'Nordrhein-Westfalen hervorgehoben', 'Sachsen hervorgehoben', 'Berlin hervorgehoben'],
    en: ['Bavaria highlighted', 'North Rhine-Westphalia highlighted', 'Saxony highlighted', 'Berlin highlighted'],
  },
};

// Q55 is a question-prompt image (not an option grid): it already has textual
// options, it was just missing the picture it asks about.
const QUESTION_IMAGES = {
  55: 'img/q55-reichstag.webp',
};

let imgCount = 0;
for (const q of questions) {
  if (IMAGE_TRANSFORMS[q.id]) {
    const t = IMAGE_TRANSFORMS[q.id];
    if (t.images.length !== q.options.length) {
      throw new Error(`Q${q.id}: transform image count != options count`);
    }
    q.option_images = t.images;
    q.options = t.de;
    q.options_en = t.en;
    imgCount++;
  }
  if (QUESTION_IMAGES[q.id]) {
    q.image = QUESTION_IMAGES[q.id];
    imgCount++;
  }
}

// Serialize one question per line for readable diffs.
const body = questions.map(q => '  ' + JSON.stringify(q)).join(',\n');
const out = '[\n' + body + '\n]\n';
fs.writeFileSync(path.join(ROOT, 'questions.json'), out);

console.log(`Wrote questions.json: ${questions.length} questions, ${imgCount} image bindings updated.`);
