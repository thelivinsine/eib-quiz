// The app's own translatable data, read straight out of index.html and questions.json.
//
// The completeness check and the review-sheet tool both need the strings, topics, states,
// glossary and language list exactly as the app has them. Reading them from the source,
// rather than from a copy, is what keeps a new string from slipping past either tool.
//
// The literals in index.html are pure data, so they are evaluated in a sandbox and passed
// through JSON, which also makes them ordinary objects of this realm.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const HTML = readFileSync(here("../index.html"), "utf8");

/** Evaluate `const NAME = <literal>;` out of the app's script, or undefined if absent. */
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

export const I18N = literal("I18N");
export const CATEGORIES = literal("CATEGORIES");
export const STATES = literal("STATES");
export const GLOSSARY = literal("GLOSSARY");
export const LANGS = literal("LANGS") ?? [{ code: "en" }, { code: "de" }];
export const QUESTIONS = JSON.parse(readFileSync(here("../questions.json"), "utf8"));
export const I18N_DIR = here("../i18n");
