// Regen script: rebuild QUESTIONS array in HTML from questions-final-extended.json
// Preserves option_images SVG data from existing HTML (not stored in JSON)
const fs = require('fs');

const htmlPath = 'einbuergerungstest-berlin.html';
const jsonPath = 'questions-final-extended.json';

const htmlRaw = fs.readFileSync(htmlPath, 'utf8');
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// --- Step 1: Extract option_images arrays using balanced bracket counting ---
const IMAGE_IDS = [21, 130, 209, 226, 311, 318];
const optionImagesMap = {};

function extractOptionImages(html, qId) {
  // Find "option_images: [" after "id: <qId>,"
  const idMarker = 'id: ' + qId + ',';
  const idPos = html.indexOf(idMarker);
  if (idPos < 0) return null;
  const marker = 'option_images: [';
  const start = html.indexOf(marker, idPos);
  // Ensure this marker is before the next question
  const nextId = html.indexOf('id: ' + (qId + 1) + ',', idPos);
  if (start < 0 || (nextId > 0 && start > nextId)) return null;
  const arrayStart = start + marker.length - 1; // points to '['
  // Count brackets to find the matching ']'
  let depth = 0, inStr = false, escape = false;
  let i = arrayStart;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"' && !escape) { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) break; }
  }
  return html.substring(arrayStart, i + 1); // the full [...] literal
}

for (const id of IMAGE_IDS) {
  const extracted = extractOptionImages(htmlRaw, id);
  if (!extracted) { console.error('Could not find option_images for Q' + id); process.exit(1); }
  optionImagesMap[id] = extracted;
  console.log('Q' + id + ' option_images extracted, length=' + extracted.length);
}

// --- Step 2: Escape a string for use in a JS double-quoted string ---
function jsStr(s) {
  if (s === null || s === undefined) return 'null';
  return '"' + String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    + '"';
}

function jsStrArr(arr) {
  return '[' + arr.map(jsStr).join(', ') + ']';
}

function jsBool(v) { return v ? 'true' : 'false'; }

// --- Step 3: Serialize each question ---
function serializeQuestion(q) {
  const parts = [
    'id: ' + q.id,
    'de: ' + jsStr(q.de),
    'options: ' + jsStrArr(q.options),
    'correct: ' + q.correct,
    'berlin: ' + jsBool(q.berlin),
  ];
  if (q.appExtra) parts.push('appExtra: true');
  parts.push('image: ' + (q.image ? jsStr(q.image) : 'null'));
  if (optionImagesMap[q.id]) parts.push('option_images: ' + optionImagesMap[q.id]);
  parts.push('en: ' + jsStr(q.en));
  parts.push('options_en: ' + jsStrArr(q.options_en));
  parts.push('explanation_de: ' + jsStr(q.explanation_de));
  parts.push('explanation_en: ' + jsStr(q.explanation_en));
  return '            { ' + parts.join(', ') + ' }';
}

// --- Step 4: Build the new array string ---
const arrayStr = 'const QUESTIONS = [\n' +
  questions.map(serializeQuestion).join(',\n') +
  '\n        ];';

// --- Step 5: Replace in HTML using balanced bracket counting ---
const qMarker = 'const QUESTIONS = [';
const qStart = htmlRaw.indexOf(qMarker);
if (qStart < 0) { console.error('QUESTIONS marker not found'); process.exit(1); }
const arrayBracketStart = qStart + qMarker.length - 1;

// Find matching ] for the QUESTIONS array using balanced bracket counting
let depth = 0, inStr = false, escape = false;
let qEnd = arrayBracketStart;
for (let i = arrayBracketStart; i < htmlRaw.length; i++) {
  const ch = htmlRaw[i];
  if (escape) { escape = false; continue; }
  if (ch === '\\') { escape = true; continue; }
  if (ch === '"' && !escape) { inStr = !inStr; continue; }
  if (inStr) continue;
  if (ch === '[') depth++;
  else if (ch === ']') { depth--; if (depth === 0) { qEnd = i; break; } }
}
// qEnd points to closing ], next char should be ;
if (htmlRaw[qEnd + 1] !== ';') {
  console.error('Expected ; after ], found: ' + JSON.stringify(htmlRaw[qEnd + 1]));
  process.exit(1);
}

const before = htmlRaw.substring(0, qStart);
const after = htmlRaw.substring(qEnd + 2); // skip ];
const newHtml = before + arrayStr + after;

// --- Step 6: Validate ---
const newQCount = (newHtml.match(/\{ id: \d+,/g) || []).length;
if (newQCount !== questions.length) {
  console.error('Question count mismatch! Expected ' + questions.length + ', got ' + newQCount);
  process.exit(1);
}

fs.writeFileSync(htmlPath, newHtml, 'utf8');
console.log('Wrote ' + htmlPath + ' with ' + questions.length + ' questions');
