# docs

**Start with [`status.md`](status.md)** — the live commit, what is open, and what is not verified.

Everything else is here to answer one question in one hop. Find your question below.

> **This file is a shape, not content.** The three questions and their tables are the part that
> travels between projects; every row is this project's to fill in. Delete a row rather than leave
> it pointing at a file that does not exist — a README that lies is worse than a short one.

## "What am I allowed to do?"

| | |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | **The rules, stated as rules.** No reasoning, no exceptions buried in prose. |
| [`decisions/`](decisions/) | **Why each rule exists** — the decision, the reason, and what it cost. One file per topic, [indexed here](decisions/README.md). |
| [`glossary.md`](glossary.md) | The words this project uses in a particular way. |

## "Why is this built this way?"

The files in [`decisions/`](decisions/), grouped. One row per file; the right-hand column names
what is in it, in this project's own words rather than in categories.

| Looking for | File |
|---|---|
| How sessions work, what gets written down, what is never touched | [`decisions/process.md`](decisions/process.md) |
| *(add a row per decision file as they are written)* | |

## "What was this work supposed to be?"

| | |
|---|---|
| [`plans/`](plans/) | One body of work per plan, written **before** it was built — **two documents**, the plan and its `-tasks.md` task list. **A plan is never deleted** — it is the only record that can be wrong, and the wrong parts are the valuable ones. |
| *(a decisions-taken-without-the-user file belongs here if this project keeps one: what was asked, which way it went, and how to undo it)* | |

## "What happened before?"

| | |
|---|---|
| [`archive/status.md`](archive/status.md) | Past sessions, newest first — what each shipped and what it left unmeasured. |
| [`archive/decisions.md`](archive/decisions.md) | Decisions a later one reversed, kept for the argument. |
| [`archive/measurements.md`](archive/measurements.md) | The browser passes behind the numbers the live files quote. |

**Nothing in `archive/` is current.** Read it for the argument, not for the rule.

## "What does it actually look like?"

| | |
|---|---|
| [`screenshots/`](screenshots/) | The app as built, one folder per body of work. **The design is judged against these, not against the mockups.** |

## "Where does this number come from?"

| | |
|---|---|
| [`reference/theme-light.md`](reference/theme-light.md), [`reference/theme-dark.md`](reference/theme-dark.md) | Two real applications sampled pixel by pixel, and the rules that fall out. **Source material about other apps — it makes no claim about this one.** |
| [`reference/type-and-space.md`](reference/type-and-space.md) | Four design systems read out of their live DOM — type scale, leading, tracking, control size, spacing. Same disclaimer: **source material about other apps.** |
| [`reference/nextjs.md`](reference/nextjs.md) | The pinned framework docs index. Names the official page for each topic. *(Keep only if this project is on that framework version; otherwise build the equivalent for the stack in use and delete this row.)* |
| `reference/` (the rest) | Received material — mockups, specs, example data. **The code never touches it.** |

---

## Two rules about this folder

**A document that is the user's own writing is read in a sweep like any other, and written to in
none.** Name it in `CLAUDE.md` so there is no guessing which file that is.
→ [`decisions/process.md#the-users-own-writing-is-off-limits`](decisions/process.md#the-users-own-writing-is-off-limits)

**Headings are load-bearing.** Code comments point into `decisions/` by heading name. Rewrite a body
freely; rename a heading only on purpose. `npm test` runs `scripts/links.test.mjs`, which fails on
any pointer that resolves to no heading.
