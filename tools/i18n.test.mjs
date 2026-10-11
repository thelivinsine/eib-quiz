// Every language file is complete, as a test rather than as a review step.
//
// A learner who picks a language should never meet a blank, a broken placeholder, an answer
// missing from a question, or a line left in English. This test reads each `i18n/<code>.json`
// against what the app actually shows today, so a string added to the app and forgotten in a
// translation fails here rather than on someone's phone.
//
// It reads the reference data **out of index.html and questions.json**, not out of a copy:
// I18N, CATEGORIES, STATES, GLOSSARY and LANGS are evaluated from the script as they stand.
//
// What it checks, per file:
//   - every I18N key is translated, and no key is invented;
//   - every {placeholder} survives, and no new one appears;
//   - a translation carries exactly the HTML tags of its English source, attributes included,
//     so no translation can add markup or change a link (footer.legal is the one with a tag);
//   - every topic, state and glossary term is present;
//   - every question has its text, the same number of answers as the catalogue, and an
//     explanation, none of them empty;
//   - the text is in the language's script: an Arabic or Cyrillic string that is mostly Latin
//     letters, or any long string identical to its English source, came back untranslated;
//   - LANGS and the files agree, both ways.
//
// What it cannot do: judge whether a translation is RIGHT. That is the native-speaker review.
//
// Run:  node --test tools/i18n.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const HTML = readFileSync(here("../index.html"), "utf8");
const QUESTIONS = JSON.parse(readFileSync(here("../questions.json"), "utf8"));

/** Evaluate `const NAME = <literal>;` out of the app's script. The literals are pure data. */
function literal(name) {
  const start = HTML.indexOf(`const ${name} = `);
  if (start < 0) return undefined;
  let i = HTML.indexOf("=", start) + 1;
  while (/\s/.test(HTML[i])) i++;
  const open = HTML[i], close = open === "{" ? "}" : "]";
  let depth = 0, quote = null;
  for (let j = i; j < HTML.length; j++) {
    const c = HTML[j];
    if (quote) { if (c === "\\") j++; else if (c === quote) quote = null; continue; }
    if (c === "'" || c === '"' || c === "`") quote = c;
    else if (c === "/" && HTML[j + 1] === "/") j = HTML.indexOf("\n", j);
    else if (c === open) depth++;
    // Through JSON so the result belongs to this realm: a vm-made array fails deepStrictEqual.
    else if (c === close && --depth === 0) return JSON.parse(JSON.stringify(vm.runInNewContext("(" + HTML.slice(i, j + 1) + ")")));
  }
  throw new Error(`unterminated literal ${name}`);
}

const I18N = literal("I18N");
const CATEGORIES = literal("CATEGORIES");
const STATES = literal("STATES");
const GLOSSARY = literal("GLOSSARY");
const LANGS = literal("LANGS") ?? [{ code: "en" }, { code: "de" }];

/** The script each language is written in. Everything not listed is Latin. */
const SCRIPT = { ar: "Arabic", fa: "Arabic", ru: "Cyrillic", uk: "Cyrillic" };

const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const tags = (s) => [...String(s).matchAll(/<[^>]*>/g)].map((m) => m[0]).sort();
const letters = (s) => [...String(s).matchAll(/\p{L}/gu)].map((m) => m[0]);

/**
 * Every problem in one language file, as "<kind>: <where>" strings. Pure, so the fixture test
 * can feed it a deliberately broken file.
 */
export function problems(code, data) {
  const out = [];
  const script = SCRIPT[code] ?? "Latin";
  const scriptRe = new RegExp(`\\p{Script=${script}}`, "u");

  /** One translated string against its English source. */
  const check = (where, src, tr) => {
    if (typeof tr !== "string" || !tr.trim()) { out.push(`empty: ${where}`); return; }
    if (placeholders(src).join() !== placeholders(tr).join()) out.push(`placeholder: ${where}`);
    if (tags(src).join() !== tags(tr).join()) out.push(`tag: ${where}`);
    const ls = letters(tr.replace(/<[^>]*>/g, ""));
    if (ls.length >= 12 && script !== "Latin" && ls.filter((c) => scriptRe.test(c)).length / ls.length < 0.5)
      out.push(`script: ${where}`);
    if (letters(src).length >= 20 && tr.trim() === String(src).trim()) out.push(`untranslated: ${where}`);
  };

  const ui = data.ui ?? {};
  for (const key of Object.keys(I18N)) {
    if (!(key in ui)) out.push(`missing ui key: ${key}`);
    else check(`ui ${key}`, I18N[key].en, ui[key]);
  }
  for (const key of Object.keys(ui)) if (!(key in I18N)) out.push(`extra ui key: ${key}`);

  for (const key of Object.keys(CATEGORIES)) {
    if (!data.categories?.[key]) out.push(`missing category: ${key}`);
    else check(`category ${key}`, CATEGORIES[key].en, data.categories[key]);
  }
  for (const code2 of Object.keys(STATES)) {
    // A state name may legitimately stay as written (Berlin), so only emptiness and script count.
    if (!data.states?.[code2]) out.push(`missing state: ${code2}`);
    else check(`state ${code2}`, "", data.states[code2]);
  }
  for (const g of GLOSSARY) {
    if (!data.glossary?.[g.term]) out.push(`missing glossary: ${g.term}`);
    else check(`glossary ${g.term}`, g.en, data.glossary[g.term]);
  }

  for (const q of QUESTIONS) {
    const t = data.questions?.[q.id];
    if (!t) { out.push(`missing question: ${q.id}`); continue; }
    check(`question ${q.id} text`, q.en, t.q);
    if (!Array.isArray(t.options) || t.options.length !== q.options.length) {
      out.push(`options: question ${q.id} has ${t.options?.length ?? 0}, expected ${q.options.length}`);
    } else {
      t.options.forEach((o, i) => check(`question ${q.id} option ${i + 1}`, q.options_en?.[i] ?? "", o));
    }
    check(`question ${q.id} explanation`, q.explanation_en, t.explanation);
  }
  return out;
}

const FILES = readdirSync(here("../i18n")).filter((f) => f.endsWith(".json"));

test("every language in LANGS other than en/de has a file, and every file is in LANGS", () => {
  const listed = LANGS.map((l) => l.code).filter((c) => c !== "en" && c !== "de").sort();
  const files = FILES.map((f) => f.replace(/\.json$/, "")).sort();
  assert.deepEqual(files, listed);
});

for (const file of FILES) {
  const code = file.replace(/\.json$/, "");
  test(`${file} is complete and in its own script`, () => {
    const found = problems(code, JSON.parse(readFileSync(here(`../i18n/${file}`), "utf8")));
    assert.deepEqual(found, [], `${found.length} problems in ${file}:\n  ` + found.slice(0, 40).join("\n  "));
  });
}

test("the check catches each kind of fault (fixture)", () => {
  const broken = JSON.parse(readFileSync(here("fixtures/i18n-broken.json"), "utf8"));
  const found = problems("ar", broken);
  for (const kind of ["missing ui key", "placeholder: ui gloss.title", "options: question 1",
                      "script: question 2 text", "tag: ui nav.back"]) {
    assert.ok(found.some((p) => p.startsWith(kind)), `the fixture's fault "${kind}" was not reported`);
  }
});
