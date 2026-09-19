/* Every `file.md#anchor` pointer in the repo resolves to a heading that exists.
 *
 * The decisions files get pointed at from code comments, so renaming a heading breaks arrows
 * that nothing else would catch: the comment stays in the file looking perfectly confident and
 * leads the next reader nowhere. Six pointers were already dead the first time this was run on
 * the repo it was written for.
 *   → ../docs/decisions/process.md#a-spoken-workflow-is-a-skill-and-claudemd-keeps-its-rules
 *
 * PORTED FROM ANOTHER PROJECT. Two things to set, both marked CONFIGURE below: the folders to
 * skip, and the minimum pointer count. Everything else is repo-agnostic.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

/* CONFIGURE: paths this repo does not own — vendored skills, generated decks, third-party
 * folders. A path prefix, matched against `git ls-files` output. */
const SKIP_PREFIXES = [];

/* CONFIGURE: the floor under the number of pointers found. It exists so that a refactor which
 * silently stops matching anything fails loudly instead of passing with zero checks. Set it just
 * under the count the first green run reports, and raise it when the docs grow. */
const MIN_POINTERS = 1;

/* GitHub's anchor rule: lowercase, drop punctuation, then replace EACH space with a hyphen.
 * The last step is why a heading like "The + New project" keeps a double hyphen where the "+"
 * was — collapsing runs of spaces here is a bug that reports live anchors as dead. */
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/ /g, "-");

const SKIP = (f) => SKIP_PREFIXES.some((p) => f.startsWith(p));

/* The tracked list is also the existence check, because the filesystem is not a case-sensitive
 * one on Windows: `existsSync` answers true for `docs/Readme.md` when the file is `README.md`,
 * so a mis-cased pointer would pass here, 404 on GitHub, and fail on Linux CI. */
const tracked = new Set(execSync("git ls-files", { cwd: root, encoding: "utf8" }).split("\n"));

const files = [...tracked]
  .filter((f) => /\.(md|ts|tsx|js|jsx|mjs|mts|css|py)$/.test(f))
  .filter((f) => !SKIP(f));

const headings = new Map();
function headingsOf(f) {
  if (headings.has(f)) return headings.get(f);
  const set = new Set();
  const abs = path.join(root, f);
  if (existsSync(abs)) {
    for (const line of readFileSync(abs, "utf8").replace(/\r/g, "").split("\n")) {
      const m = line.match(/^#{1,6}\s+(.*)$/);
      if (m) set.add(slug(m[1]));
    }
  }
  headings.set(f, set);
  return set;
}

test("every file.md#anchor pointer resolves to a heading that exists", () => {
  const broken = [];
  let checked = 0;

  for (const f of files) {
    const text = readFileSync(path.join(root, f), "utf8");
    for (const m of text.matchAll(/([A-Za-z0-9_./-]*\.md)#([a-zA-Z0-9_-]+)/g)) {
      const [, target, anchor] = m;
      /* "file.md#anchor" as prose, not as a pointer — the docs use it to talk about the shape. */
      if (target === "file.md" || target === ".md") continue;
      checked++;

      /* Relative to the referring file. A bare name also resolves from the repo root — that is
       * how the `CLAUDE.md#…` pointers are written — but a pointer carrying a path does not get
       * that second chance, so one file has one spelling and Ctrl-click behaves the same way
       * on every line of it. */
      const candidates = [path.join(path.dirname(f), target).split(path.sep).join("/")];
      if (!target.includes("/")) candidates.push(target);
      const hit = candidates.find((c) => tracked.has(c));

      if (!hit) broken.push(`${f} -> ${target}#${anchor}  (no such file)`);
      else if (!headingsOf(hit).has(anchor.toLowerCase()))
        broken.push(`${f} -> ${hit}#${anchor}  (no such heading)`);
    }
  }

  assert.ok(
    checked >= MIN_POINTERS,
    `expected to find the repo's pointers, saw only ${checked} (MIN_POINTERS is ${MIN_POINTERS})`,
  );
  assert.deepEqual(broken, [], `\n  ${broken.join("\n  ")}\n`);
});
