#!/usr/bin/env node
/*
 * validate.js — runs the CLAUDE.md validation checklist against questions.json.
 *
 * Hard failures (exit 1): wrong count, non-contiguous/duplicate IDs, malformed
 * questions, correct index out of range, image-question structure mismatch.
 *
 * Soft warnings (exit 0): referenced image assets not yet present on disk — these
 * are listed as a fetch manifest so the assets can be dropped in later.
 *
 * Usage: node tools/validate.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'questions.json'), 'utf8'));

const errors = [];
const missingAssets = [];

// 1. Count (310 general + 16 states x 10 = 470)
if (questions.length !== 470) errors.push(`Expected 470 questions, got ${questions.length}`);

// 1b. State coverage: every state has exactly 10 questions
const STATE_CODES = ['BW','BY','BE','BB','HB','HH','HE','MV','NI','NW','RP','SL','SN','ST','SH','TH'];
const byState = {};
questions.filter(q => q.state).forEach(q => { byState[q.state] = (byState[q.state] || 0) + 1; });
for (const code of STATE_CODES) {
  if (byState[code] !== 10) errors.push(`State ${code}: expected 10 questions, got ${byState[code] || 0}`);
}
const generalCount = questions.filter(q => !q.state).length;
if (generalCount !== 310) errors.push(`Expected 310 general questions, got ${generalCount}`);

// 2. Contiguous IDs 1..N, no duplicates
const ids = questions.map(q => q.id);
const seen = new Set();
ids.forEach((id, i) => {
  if (seen.has(id)) errors.push(`Duplicate id ${id}`);
  seen.add(id);
  if (id !== i + 1) errors.push(`Non-contiguous id at index ${i}: got ${id}, expected ${i + 1}`);
});

// 3. Per-question structure
for (const q of questions) {
  const where = `Q${q.id}`;
  if (typeof q.de !== 'string' || !q.de.trim()) errors.push(`${where}: missing de`);
  if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: options must have >= 2 entries`);
  if (typeof q.correct !== 'number' || q.correct < 0 || (q.options && q.correct >= q.options.length)) {
    errors.push(`${where}: correct index ${q.correct} out of range`);
  }
  if (typeof q.en !== 'string') errors.push(`${where}: missing en`);
  // Every question (general + state) must have both explanations.
  if (typeof q.explanation_de !== 'string' || !q.explanation_de.trim()) errors.push(`${where}: missing explanation_de`);
  if (typeof q.explanation_en !== 'string' || !q.explanation_en.trim()) errors.push(`${where}: missing explanation_en`);

  // Image option grids
  if (q.option_images) {
    if (!Array.isArray(q.option_images) || q.option_images.length !== q.options.length) {
      errors.push(`${where}: option_images length != options length`);
    } else {
      q.option_images.forEach(p => {
        if (typeof p !== 'string' || /^</.test(p)) errors.push(`${where}: option_images must be file paths, not inline markup`);
        else if (!fs.existsSync(path.join(ROOT, p))) missingAssets.push(p);
      });
    }
  }
  // Prompt image
  if (q.image) {
    if (!fs.existsSync(path.join(ROOT, q.image))) missingAssets.push(q.image);
  }
}

// 4. Spot-check previously corrupted questions still have intact data
const SPOT = [6, 7, 9, 10, 12, 15, 16, 28];
for (const id of SPOT) {
  const q = questions.find(x => x.id === id);
  if (!q) { errors.push(`Spot-check: Q${id} missing`); continue; }
  if (!q.de || !q.de.includes('?') && !q.de.includes('…')) {
    // most are questions; just ensure non-trivial text
    if (!q.de || q.de.length < 10) errors.push(`Spot-check Q${id}: suspicious de text`);
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Spot-check Q${id}: expected 4 options`);
}

// Report
if (errors.length) {
  console.error('VALIDATION FAILED:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log(`OK: ${questions.length} questions, contiguous IDs, no duplicates, structure valid.`);
console.log(`Spot-checked Q${SPOT.join(', Q')} — intact.`);

if (missingAssets.length) {
  const uniq = [...new Set(missingAssets)].sort();
  console.log(`\n⚠ ${uniq.length} image asset(s) referenced but not yet on disk (fetch manifest):`);
  uniq.forEach(p => console.log('  - ' + p));
}
