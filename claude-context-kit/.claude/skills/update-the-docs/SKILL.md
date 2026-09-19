---
name: update-the-docs
description: Sweep every tracked markdown file in this repo against the current state of the tree, correct what has gone stale, and report what was left alone. Use this whenever the user says "update the docs", "update docs", "sweep the docs", "doc sweep", "are the docs stale", or asks for documentation brought up to date — and always as step 2 of conclude-session. Use it even when only one document looks wrong, because the sweep is every file rather than the ones this session happened to touch, and use it before any commit that claims the docs are current.
---

# Update the docs

A sweep is **every** markdown file against the current state of the tree. Sweeping only
the files a session touched is how three other documents quietly drift, and drift in a
rules file is worse than silence: a stale rule gets followed.

The rule lives in `CLAUDE.md` → *Working with me*. Its story is in
`../../../docs/decisions/process.md#the-users-own-writing-is-off-limits`.

## The one thing that is not negotiable

**A document that is the user's own writing is read, never written.** A reflection, a
journal, a submission write-up — whichever this repo keeps, and `CLAUDE.md` names it. Not a
typo, not a stale fact, not a heading, not a blank line, not a draft offered for the user to
rewrite. It is their own account of their own project and it is theirs to write.

When the sweep finds it stale, **say so and leave it** — saying so is the entire
deliverable for that file. This skill does not override that constraint; no skill does.
→ `CLAUDE.md` → *Hard constraints*.

## Establish the present before correcting the past

Documents go stale against a tree, so read the tree first. Never take a claim in a doc as
the baseline — that claim is the thing under test. This is the step that gets skipped, and
skipping it produces a sweep that confirms whatever the docs already said.

```
git ls-files '*.md'          # the sweep's scope: nothing outside it, nothing skipped
git log --oneline -8         # what actually landed
git branch --show-current    # a shared checkout may hold other sessions' work
git status
```

Enumerate with `git ls-files` rather than from memory or from a list in this skill; a
hardcoded inventory is one more thing to go stale.

Where a document states a test count, a clean typecheck, or a browser measurement, either
re-run it or move the claim into *Not verified*. A number nobody re-ran is a stale number
wearing a fresh date. Browser numbers in particular are only as fresh as the server under
them → `../../../docs/decisions/process.md#a-browser-number-is-only-as-fresh-as-the-server-under-it`.

## The order, and why it is this order

1. **The status document first.** Every other document is checked *against* reality, but
   the status file *is* the repo's claim about reality — live commit, open work, what isn't
   verified. Fix it first and the rest have something true to agree with. It keeps the
   present; the record moves to an archive beside it.
2. **`CLAUDE.md`** — rules only. A rule that has grown reasoning is a signal, not a style
   problem: move the reasoning to the decision entry and leave the rule.
3. **`docs/decisions/`** — one file per topic, indexed in its own `README.md`. A session's
   learnings go here, in the shape every entry uses: the decision, the reason, the cost. A
   **reversed** rule leaves a short note naming what replaced it, and its argument moves to
   `docs/archive/decisions.md`, so the live files do not fill up with dead entries.
4. **`docs/plans/`** — mark shipped, **never delete**, not when it ships and not ever.
   A rule that came out of a plan is *copied* into `docs/decisions/`, never moved.
   → `../../../docs/decisions/process.md#a-plan-document-is-never-deleted`
5. **The READMEs** — one per folder that has one. Each describes a folder, so check it
   against what that folder now holds rather than against what it claimed last time.
   `docs/glossary.md` belongs with them: it describes how words are used across all of these.
6. **`docs/reference/`** — pinned framework docs and any measured source material. Stale
   here is the expensive kind, because these are what get trusted instead of checked.
7. **The user's own document** — read it, report on it, type nothing into it.

## Anchors are load-bearing

`CLAUDE.md`, the decision files themselves **and every code comment that points into
`docs/decisions/` by `#anchor`** break silently when a heading is renamed. **Rewrite a body
freely; rename a heading only on purpose** — and when you do, grep the old anchor across the
repo's markdown and source extensions and fix its callers in the same sweep.
`scripts/links.test.mjs` fails on any pointer that resolves to no heading; run the test suite
rather than trusting the grep.

## What the sweep hands back

Report three short lists. The last two are the ones worth reading:

- **Corrected** — file, and the fact that was wrong.
- **Stale and left** — anything deliberately untouched, with the reason. The user's own
  document belongs here whenever it has drifted.
- **Not verified** — claims unresolvable from the tree alone: browser measurements,
  anything needing a build or a running app.

An empty *Corrected* list is a good result. A sweep that found nothing is still a sweep —
say so plainly rather than inventing an edit to justify the pass.

## Committing the sweep

Docs may go straight to `main`; they are the one exception to the branch rule.

**Stage the files you changed, never `git add -A`** — a shared tree holds other sessions'
uncommitted work, and `-A` takes it with you. Check `git branch --show-current` at commit
time rather than at branch time, because a shared checkout has one HEAD and it may have
moved. → `../../../docs/decisions/process.md#a-shared-checkout-has-one-head`

Use the commit attribution lines this session was given; they vary per session, so read
them rather than copying an example.
