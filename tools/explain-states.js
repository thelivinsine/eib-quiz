#!/usr/bin/env node
/*
 * explain-states.js — adds bilingual explanations (explanation_de / explanation_en)
 * to the imported non-Berlin state questions, which the official source ships
 * without explanations. Explanations are generated from the (templated) question
 * stem plus its correct answer, so they are factual and self-consistent.
 *
 * Placeholders: {S} German state name, {Sen} English state name,
 *               {A} correct answer (German, trailing period stripped),
 *               {Aen} correct answer (English, trailing period stripped).
 *
 * Berlin (BE) already has explanations and is skipped. Re-runnable.
 *
 * Usage: node tools/explain-states.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const DE = { BW:'Baden-Württemberg', BY:'Bayern', BB:'Brandenburg', HB:'Bremen', HH:'Hamburg',
  HE:'Hessen', MV:'Mecklenburg-Vorpommern', NI:'Niedersachsen', NW:'Nordrhein-Westfalen',
  RP:'Rheinland-Pfalz', SL:'Saarland', SN:'Sachsen', ST:'Sachsen-Anhalt', SH:'Schleswig-Holstein', TH:'Thüringen' };
const EN = { BW:'Baden-Württemberg', BY:'Bavaria', BB:'Brandenburg', HB:'Bremen', HH:'Hamburg',
  HE:'Hesse', MV:'Mecklenburg-Western Pomerania', NI:'Lower Saxony', NW:'North Rhine-Westphalia',
  RP:'Rhineland-Palatinate', SL:'Saarland', SN:'Saxony', ST:'Saxony-Anhalt', SH:'Schleswig-Holstein', TH:'Thuringia' };

// normalized German stem ({S}) -> { de, en } explanation templates
const VOTE_DE = 'Bei Kommunalwahlen in {S} liegt das Mindestwahlalter bei {A} Jahren.';
const VOTE_EN = 'In local elections in {Sen}, the minimum voting age is {A}.';
const CAP_DE = 'Die Landeshauptstadt von {S} ist {A}.';
const CAP_EN = 'The state capital of {Sen} is {A}.';
const LANDTAG_DE = 'Der Landtag (das Landesparlament) von {S} wird für {A} Jahre gewählt.';
const LANDTAG_EN = 'The state parliament (Landtag) of {Sen} is elected for {A} years.';
const FLAG_DE = 'Die Landesflagge von {S} hat die Farben {A}.';
const FLAG_EN = 'The state flag of {Sen} has the colours {Aen}.';
const NICHT_DE = 'Außen- und Verteidigungspolitik sind Sache des Bundes — ein Bundesland wie {S} hat keinen {A}.';
const NICHT_EN = 'Foreign and defence policy are federal matters, so a state like {Sen} has no {Aen}.';
const WAPPEN_DE = 'Das abgebildete Wappen ist das offizielle Landeswappen von {S}.';
const WAPPEN_EN = 'The coat of arms shown is the official coat of arms of {Sen}.';
const KREIS_DE = '{A} ist ein Landkreis in {S}.';
const KREIS_EN = '{A} is a rural district (Landkreis) in {Sen}.';
const HEAD_DE = 'Der Regierungschef / die Regierungschefin von {S} trägt den Titel {A}.';
const HEAD_EN = 'The head of government of {Sen} holds the title {Aen}.';
const INFO_DE = 'In {S} können Sie sich über politische Themen {A} informieren.';
const INFO_EN = 'In {Sen} you can get information about political topics {Aen}.';
const MAP_DE = 'Das auf der Karte hervorgehobene Bundesland ist {S}.';
const MAP_EN = 'The federal state highlighted on the map is {Sen}.';
const CITYSTATE_DE = 'Die drei deutschen Stadtstaaten sind Berlin, Hamburg und Bremen; {A} gehört dazu.';
const CITYSTATE_EN = "Germany's three city-states are Berlin, Hamburg and Bremen; {Aen} is one of them.";

const EXP = {
  'Ab welchem Alter darf man im {S} bei Kommunalwahlen wählen?': { de: VOTE_DE, en: VOTE_EN },
  'Ab welchem Alter darf man in {S} bei Kommunalwahlen (Wahl der Bezirksversammlungen) wählen?': { de: VOTE_DE, en: VOTE_EN },
  'Ab welchem Alter darf man in {S} bei Kommunalwahlen wählen?': { de: VOTE_DE, en: VOTE_EN },
  'Ab welchem Alter darf man in {S} bei den Wahlen zur Bürgerschaft (Landtag) wählen?': {
    de: 'Bei den Wahlen zur Bürgerschaft (Landtag) in {S} liegt das Mindestwahlalter bei {A} Jahren.',
    en: 'In the elections to the Bürgerschaft (state parliament) in {Sen}, the minimum voting age is {A}.' },
  'Die Landeshauptstadt des {S}es heißt ...': { de: CAP_DE, en: CAP_EN },
  'Die Landeshauptstadt von {S} heißt ...': { de: CAP_DE, en: CAP_EN },
  'Für wie viele Jahre wird das Landesparlament in {S} gewählt?': { de: LANDTAG_DE, en: LANDTAG_EN },
  'Für wie viele Jahre wird der Landtag des {S}es gewählt?': { de: LANDTAG_DE, en: LANDTAG_EN },
  'Für wie viele Jahre wird der Landtag in {S} gewählt?': { de: LANDTAG_DE, en: LANDTAG_EN },
  'Was ist ein deutscher Stadtstaat?': { de: CITYSTATE_DE, en: CITYSTATE_EN },
  'Welche Farben hat die Landesflagge des {S}es?': { de: FLAG_DE, en: FLAG_EN },
  'Welche Farben hat die Landesflagge von {S}?': { de: FLAG_DE, en: FLAG_EN },
  'Welchen Minister / welche Ministerin hat das {S} nicht?': { de: NICHT_DE, en: NICHT_EN },
  'Welchen Minister / welche Ministerin hat {S} nicht?': { de: NICHT_DE, en: NICHT_EN },
  'Welchen Senator / welche Senatorin hat {S} nicht?': { de: NICHT_DE, en: NICHT_EN },
  'Welches Bundesland ist das {S}?': { de: MAP_DE, en: MAP_EN },
  'Welches Bundesland ist ein Stadtstaat?': { de: CITYSTATE_DE, en: CITYSTATE_EN },
  'Welches Bundesland ist {S}?': { de: MAP_DE, en: MAP_EN },
  'Welches Wappen gehört zum Bundesland {S}?': { de: WAPPEN_DE, en: WAPPEN_EN },
  'Welches Wappen gehört zum Freistaat {S}?': { de: WAPPEN_DE, en: WAPPEN_EN },
  'Welches Wappen gehört zur Freien Hansestadt {S}?': { de: WAPPEN_DE, en: WAPPEN_EN },
  'Welches Wappen gehört zur Freien und Hansestadt {S}?': { de: WAPPEN_DE, en: WAPPEN_EN },
  'Welches ist ein Bezirk von {S}?': { de: '{A} ist ein Bezirk von {S}.', en: '{A} is a borough of {Sen}.' },
  'Welches ist ein Landkreis im {S}?': { de: KREIS_DE, en: KREIS_EN },
  'Welches ist ein Landkreis in {S}?': { de: KREIS_DE, en: KREIS_EN },
  'Welches ist ein Stadtteil von {S}?': { de: '{A} ist ein Stadtteil von {S}.', en: '{A} is a district of {Sen}.' },
  'Wie nennt man den Regierungschef / die Regierungschefin des Stadtstaates {S}?': { de: HEAD_DE, en: HEAD_EN },
  'Wie nennt man den Regierungschef / die Regierungschefin des {S}es?': { de: HEAD_DE, en: HEAD_EN },
  'Wie nennt man den Regierungschef / die Regierungschefin in {S}?': { de: HEAD_DE, en: HEAD_EN },
  'Wo können Sie sich im {S} über politische Themen informieren?': { de: INFO_DE, en: INFO_EN },
  'Wo können Sie sich in {S} über politische Themen informieren?': { de: INFO_DE, en: INFO_EN },
};

const strip = s => String(s).replace(/\.\s*$/, '').trim();

const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'questions.json'), 'utf8'));
let n = 0; const missing = [];
for (const q of questions) {
  if (!q.state || q.state === 'BE') continue;
  const norm = q.de.split(DE[q.state]).join('{S}');
  const tpl = EXP[norm];
  if (!tpl) { missing.push(norm); continue; }
  const A = strip(q.options[q.correct]);
  const Aen = strip((q.options_en && q.options_en[q.correct]) || q.options[q.correct]);
  const fill = s => s.split('{S}').join(DE[q.state]).split('{Sen}').join(EN[q.state]).split('{Aen}').join(Aen).split('{A}').join(A);
  q.explanation_de = fill(tpl.de);
  q.explanation_en = fill(tpl.en);
  n++;
}

if (missing.length) {
  console.error('NO EXPLANATION TEMPLATE FOR:\n  ' + [...new Set(missing)].join('\n  '));
  process.exit(1);
}

const body = questions.map(q => '  ' + JSON.stringify(q)).join(',\n');
fs.writeFileSync(path.join(ROOT, 'questions.json'), '[\n' + body + '\n]\n');
console.log(`Added explanations to ${n} state questions.`);
