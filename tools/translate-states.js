#!/usr/bin/env node
/*
 * translate-states.js — adds English (en, options_en) to the imported
 * non-Berlin state questions, which the official source only provides in German.
 *
 * Translations are dictionary-based and reviewed: question stems are templated
 * (state name interpolated), options are translated where semantic (titles,
 * civic-info sources, flag colours, state-name options) and kept verbatim where
 * they are proper nouns (city/district names) or numbers. Berlin (BE) already
 * has English and is skipped. Re-runnable.
 *
 * Usage: node tools/translate-states.js
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

// Normalized German stem ({S} = state name) -> English ({S} = English state name)
const TEMPLATES = {
  'Ab welchem Alter darf man im {S} bei Kommunalwahlen wählen?': 'From what age may you vote in local elections in {S}?',
  'Ab welchem Alter darf man in {S} bei Kommunalwahlen (Wahl der Bezirksversammlungen) wählen?': 'From what age may you vote in local elections (election of the district assemblies) in {S}?',
  'Ab welchem Alter darf man in {S} bei Kommunalwahlen wählen?': 'From what age may you vote in local elections in {S}?',
  'Ab welchem Alter darf man in {S} bei den Wahlen zur Bürgerschaft (Landtag) wählen?': 'From what age may you vote in the elections to the Bürgerschaft (state parliament) in {S}?',
  'Die Landeshauptstadt des {S}es heißt ...': 'The state capital of {S} is called ...',
  'Die Landeshauptstadt von {S} heißt ...': 'The state capital of {S} is called ...',
  'Für wie viele Jahre wird das Landesparlament in {S} gewählt?': 'For how many years is the state parliament of {S} elected?',
  'Für wie viele Jahre wird der Landtag des {S}es gewählt?': 'For how many years is the state parliament (Landtag) of {S} elected?',
  'Für wie viele Jahre wird der Landtag in {S} gewählt?': 'For how many years is the state parliament (Landtag) of {S} elected?',
  'Was ist ein deutscher Stadtstaat?': 'What is a German city-state?',
  'Welche Farben hat die Landesflagge des {S}es?': 'What are the colours of the state flag of {S}?',
  'Welche Farben hat die Landesflagge von {S}?': 'What are the colours of the state flag of {S}?',
  'Welchen Minister / welche Ministerin hat das {S} nicht?': 'Which minister does {S} not have?',
  'Welchen Minister / welche Ministerin hat {S} nicht?': 'Which minister does {S} not have?',
  'Welchen Senator / welche Senatorin hat {S} nicht?': 'Which senator does {S} not have?',
  'Welches Bundesland ist das {S}?': 'Which federal state is {S}?',
  'Welches Bundesland ist ein Stadtstaat?': 'Which federal state is a city-state?',
  'Welches Bundesland ist {S}?': 'Which federal state is {S}?',
  'Welches Wappen gehört zum Bundesland {S}?': 'Which coat of arms belongs to the federal state of {S}?',
  'Welches Wappen gehört zum Freistaat {S}?': 'Which coat of arms belongs to the Free State of {S}?',
  'Welches Wappen gehört zur Freien Hansestadt {S}?': 'Which coat of arms belongs to the Free Hanseatic City of {S}?',
  'Welches Wappen gehört zur Freien und Hansestadt {S}?': 'Which coat of arms belongs to the Free and Hanseatic City of {S}?',
  'Welches ist ein Bezirk von {S}?': 'Which is a borough of {S}?',
  'Welches ist ein Landkreis im {S}?': 'Which is a rural district (Landkreis) in {S}?',
  'Welches ist ein Landkreis in {S}?': 'Which is a rural district (Landkreis) in {S}?',
  'Welches ist ein Stadtteil von {S}?': 'Which is a district of {S}?',
  'Wie nennt man den Regierungschef / die Regierungschefin des Stadtstaates {S}?': 'What is the head of government of the city-state of {S} called?',
  'Wie nennt man den Regierungschef / die Regierungschefin des {S}es?': 'What is the head of government of {S} called?',
  'Wie nennt man den Regierungschef / die Regierungschefin in {S}?': 'What is the head of government in {S} called?',
  'Wo können Sie sich im {S} über politische Themen informieren?': 'Where can you find information about political topics in {S}?',
  'Wo können Sie sich in {S} über politische Themen informieren?': 'Where can you find information about political topics in {S}?',
};

// Translatable options (titles, civic-info sources, flag colours, state-name options).
// Anything not listed (city/district proper nouns, numbers) is kept verbatim.
const OPT = {
  // government head / minister / senator titles
  'Außenminister/ Außenministerin':'Foreign Minister',
  'Bürgermeister/ Bürgermeisterin':'Mayor',
  'Erster Bürgermeister / Erste Bürgermeisterin':'First Mayor',
  'Erster Bürgermeister/ Erste Bürgermeisterin':'First Mayor',
  'Erster Minister/ Erste Ministerin':'First Minister',
  'Finanzminister/ Finanzministerin':'Finance Minister',
  'Finanzsenator / Finanzsenatorin':'Finance Senator',
  'Innenminister/ Innenministerin':'Interior Minister',
  'Innensenator / Innensenatorin':'Interior Senator',
  'Justizminister / Justizministerin':'Justice Minister',
  'Justizminister/ Justizministerin':'Justice Minister',
  'Justizsenator / Justizsenatorin':'Justice Senator',
  'Ministerpräsident / Ministerpräsidentin':'Minister-President',
  'Ministerpräsident/ Ministerpräsidentin':'Minister-President',
  'Oberbürgermeister / Oberbürgermeisterin':'Lord Mayor',
  'Premierminister/ Premierministerin':'Prime Minister',
  'Präsident/ Präsidentin des Senats':'President of the Senate',
  'Regierender Bürgermeister/ Regierende Bürgermeisterin':'Governing Mayor',
  'Regierender Senator / Regierende Senatorin':'Governing Senator',
  'Senator / Senatorin für Außenbeziehungen':'Senator for Foreign Relations',
  // civic-information sources
  'bei den Kirchen':'at the churches',
  'bei der Landeszentrale für politische Bildung':'at the State Agency for Civic Education',
  'bei der Verbraucherzentrale':'at the consumer advice centre',
  'beim Landesbeauftragten für politische Bildung':'at the State Commissioner for Civic Education',
  'beim Ordnungsamt der Gemeinde':"at the municipality's public order office",
  // flag colours
  'blau-weiß-gelb-rot':'blue-white-yellow-red',
  'blau-weiß-rot':'blue-white-red',
  'gelb-schwarz':'yellow-black',
  'grün-weiß-rot':'green-white-red',
  'rot-weiß':'red-white',
  'schwarz-gelb':'black-yellow',
  'schwarz-gold':'black-gold',
  'schwarz-rot-gold':'black-red-gold',
  'weiß-blau':'white-blue',
  'weiß-grün':'white-green',
  'weiß-rot':'white-red',
  // state-name options (exonyms; keep trailing period if present)
  'Bayern':'Bavaria', 'Brandenburg.':'Brandenburg.', 'Bremen':'Bremen', 'Hamburg':'Hamburg',
  'Sachsen':'Saxony', 'Thüringen':'Thuringia',
};

const questions = JSON.parse(fs.readFileSync(path.join(ROOT, 'questions.json'), 'utf8'));
let nq = 0, missing = [];
for (const q of questions) {
  if (!q.state || q.state === 'BE') continue;
  const norm = q.de.split(DE[q.state]).join('{S}');
  const tpl = TEMPLATES[norm];
  if (!tpl) { missing.push(norm); continue; }
  q.en = tpl.split('{S}').join(EN[q.state]);
  q.options_en = q.options.map(o => (OPT[o] !== undefined ? OPT[o] : o));
  nq++;
}

if (missing.length) {
  console.error('UNTRANSLATED TEMPLATES:\n  ' + [...new Set(missing)].join('\n  '));
  process.exit(1);
}

const body = questions.map(q => '  ' + JSON.stringify(q)).join(',\n');
fs.writeFileSync(path.join(ROOT, 'questions.json'), '[\n' + body + '\n]\n');
console.log(`Translated ${nq} state questions to English.`);
