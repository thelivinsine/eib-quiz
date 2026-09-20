# claude-context-kit

The transferable half of a previous project's working setup: the **method**, with that project's
subject matter taken out. Nothing here knows what the new project is about.

Drop the folder into a new repo, paste [`TRANSFER-PROMPT.md`](TRANSFER-PROMPT.md) into Claude, and
it does the wiring — moving files into place, writing the `CLAUDE.md` the skills and docs point at,
and filling the empty tables from what it finds in the tree.

---

## What is in it, and what state each file is in

**Ready to use as-is** — measured source material and procedures that do not name a project.

| File | What it is |
|---|---|
| `docs/reference/theme-light.md` | Light palettes measured out of pixels from two shipped desktop apps, with every contrast ratio computed. §7 sets both themes side by side. It makes no claim about any project. |
| `docs/reference/theme-dark.md` | The same for dark, same method. The pair is the most reusable thing here. |
| `docs/reference/type-and-space.md` | The same method on the OTHER axis: type scale, leading, tracking, control size and spacing, read out of the **live DOM** of four shipped design systems (Stripe Sail, GitHub Primer, Linear, Khan Wonder Blocks) — token layer and rendered layer separately. Its §3 (leading is a function of size) and §6 checklist are the parts that travel. It makes no claim about any project. |
| `.claude/skills/conclude-session/SKILL.md` | The minor / substantial / diff-review split, as a procedure that fires on "conclude", "wrap up", "finish up". |
| `.claude/skills/update-the-docs/SKILL.md` | *Sweep every markdown file against the tree, not just the ones this session touched.* |
| `.claude/commands/explain.md` | `/explain <thing>` — plain English, no coding background assumed. Seven lines. |
| `docs/decisions/process.md` | Fourteen entries, each learned by getting it wrong once. This is the file that carries the most and the one to read first. |

**A shape to fill in** — the structure travels, the content is the new project's.

| File | What to do with it |
|---|---|
| `docs/README.md` | Keep the three-question shape (*What am I allowed to do* / *Why is it built this way* / *What was this supposed to be*). Rewrite the rows. |
| `docs/decisions/README.md` | Keep the preamble — *the decision, the reason, and what it cost*, append don't rewrite, reversed entries go to archive, headings are load-bearing. Tables are empty. |
| `docs/plans/README.md` | Keep the preamble, especially *a plan is the only document that can be wrong on the record, and the wrong parts are the valuable ones*. Table is empty. |
| `docs/screenshots/README.md` | Keep the naming rule — `YYYY-MM-DD-what-it-shows.png`, one folder per body of work, raw drops kept as-is and placed by their folder. |
| `docs/glossary.md` | Arrives as an **empty habit**. Its own rule is the reusable part: ordinary English doing technical work gets an entry; a term any reader knows does not. |

**Code to adapt** — the method is the point, the token names are not.

| File | What to do with it |
|---|---|
| `scripts/links.test.mjs` | ~90 lines. Asserts every `file.md#anchor` pointer in the repo resolves to a real heading. Two constants at the top to set; nothing else. |
| `scripts/contrast.test.mjs` | Reads colour tokens out of the stylesheet — not out of a copy — and asserts WCAG AA. The `CONFIGURE` block and the `PAIRS` / `FILLS` / `EXEMPT` lists are this project's to write. Keep the header comment about what it *cannot* see: declared tokens, not painted pixels. |
| `scripts/motion.test.mjs` | Keep only if this project also settles on a small fixed set of durations and one curve. The last two tests — the overlay-animation traps and the reduced-motion floor — are worth keeping in any app with a dialog. |

**Conditional.**

| File | When to keep it |
|---|---|
| `docs/reference/nextjs.md` | Only if the new project is also on **Next.js 16**. It is a pinned index naming the official page per topic, and it is what stopped a previous project's drift. If the stack differs, **build the equivalent for that stack** — the transferable idea is the pinned index, not this file. Otherwise delete it. |

---

## What was deliberately left behind

The previous project's brand files, screenshots, plans, and the decision files that argue about its
subject matter. They are arguments about *that* product, not about working.

## The one thing the kit does not carry

**`CLAUDE.md` itself.** Both skills and both README shapes point at it, so the new project has to
have one — but its contents are the new project's rules, and copying another project's rules in is
how a rules file ends up asserting things the code does not do. The transfer prompt covers writing
it.
