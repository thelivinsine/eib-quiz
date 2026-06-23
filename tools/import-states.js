#!/usr/bin/env node
/*
 * import-states.js — adds the 15 non-Berlin Bundesland question sets to
 * questions.json from the official BAMF catalogue snapshot.
 *
 * Source: tools/data/official-catalogue-bamf-2026-02.json
 *   (BAMF "Leben in Deutschland" catalogue, via the open
 *    adalbero/LebenInDeutschland dataset, run 2026-02-15).
 *
 * Behaviour (idempotent):
 *  - Migrates the existing Berlin questions (berlin:true) to the generic
 *    state model: state:"BE", stateName:"Berlin" (keeps their bilingual data).
 *  - Drops any previously-imported non-BE state questions, then regenerates
 *    them with deterministic ids, so re-running is safe.
 *  - State image questions (Wappen; options 1..4) get placeholder option_images
 *    so they render the "Bild fehlt" fallback (assets pending, see ATTRIBUTIONS).
 *
 * Imported state questions are German-only (the official source has no English).
 *
 * Usage: node tools/import-states.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// code -> { name, prefix } in display order (Berlin handled separately, kept from app data)
const STATES = [
  ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'], ['BB', 'Brandenburg'],
  ['HB', 'Bremen'], ['HH', 'Hamburg'], ['HE', 'Hessen'], ['MV', 'Mecklenburg-Vorpommern'],
  ['NI', 'Niedersachsen'], ['NW', 'Nordrhein-Westfalen'], ['RP', 'Rheinland-Pfalz'],
  ['SL', 'Saarland'], ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'],
  ['SH', 'Schleswig-Holstein'], ['TH', 'Thüringen'],
];

const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'questions.json'), 'utf8'));
const official = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/data/official-catalogue-bamf-2026-02.json'), 'utf8'));

// 1) Migrate Berlin to the generic state model.
for (const q of questions) {
  if (q.berlin && !q.state) { q.state = 'BE'; q.stateName = 'Berlin'; delete q.berlin; }
}

// 2) Keep general (no state) + Berlin; drop other imported states (for idempotency).
const kept = questions.filter(q => !q.state || q.state === 'BE');
let nextId = Math.max(...kept.map(q => q.id)) + 1;

// 3) Build the 15 non-BE state sets from the official catalogue.
const letterToIdx = { a: 0, b: 1, c: 2, d: 3 };
const imported = [];
for (const [code, name] of STATES) {
  if (code === 'BE') continue; // keep app's bilingual Berlin
  const set = official.filter(o => o.num.startsWith(code + '-'))
    .sort((a, b) => parseInt(a.num.split('-')[1]) - parseInt(b.num.split('-')[1]));
  if (set.length !== 10) throw new Error(`${code}: expected 10 questions, got ${set.length}`);
  for (const o of set) {
    const options = [o.a, o.b, o.c, o.d];
    const correct = letterToIdx[o.solution];
    if (correct === undefined) throw new Error(`${o.num}: bad solution ${o.solution}`);
    const isImage = options.every(x => /^[1-4]$/.test(String(x).trim()));
    const q = {
      id: nextId++,
      de: o.question,
      options,
      correct,
      en: '', options_en: [],
      explanation_de: '', explanation_en: '',
      image: null,
      category: 'state',
      state: code,
      stateName: name,
    };
    if (isImage) {
      q.option_images = options.map((_, i) => `img/states/${code}/${o.num}-${i + 1}.svg`);
    }
    imported.push(q);
  }
}

const out = [...kept, ...imported];
const body = out.map(q => '  ' + JSON.stringify(q)).join(',\n');
fs.writeFileSync(path.join(ROOT, 'questions.json'), '[\n' + body + '\n]\n');

const byState = {};
out.filter(q => q.state).forEach(q => { byState[q.state] = (byState[q.state] || 0) + 1; });
console.log(`Total questions: ${out.length} (general ${out.filter(q => !q.state).length}, state ${out.filter(q => q.state).length}).`);
console.log('Per state:', Object.entries(byState).map(([k, v]) => `${k}:${v}`).join(' '));
console.log(`Image (Wappen) state questions: ${imported.filter(q => q.option_images).length}`);
