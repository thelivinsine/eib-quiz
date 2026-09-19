

I have dropped a folder called `claude-context-kit/` into the root of this repo. It is the
transferable half of a previous project's working setup — the method, with that project's subject
matter removed. Read `claude-context-kit/README.md` first: it says what every file is and which of
three states it is in (ready as-is / a shape to fill in / code to adapt).

Your job is to install it into this project. Work through the steps in order and do not skip ahead.

**Step 1 — read before you move anything.** Read every file in the kit, and then read this repo:
the source tree, `package.json` or its equivalent, any existing `CLAUDE.md`, `README.md` or docs
folder, and `git log --oneline -20`. You cannot fill in the empty tables from the kit; you can only
fill them in from this repo.

**Step 2 — move the files into place**, preserving paths relative to the repo root:
`claude-context-kit/.claude/**` → `.claude/`, `claude-context-kit/docs/**` → `docs/`,
`claude-context-kit/scripts/**` → `scripts/`. If a target file already exists, **stop and ask**
rather than overwriting. Delete the now-empty `claude-context-kit/` folder when the move is done,
except for its `README.md` and this file — move those to `docs/archive/` so the record of where all
this came from survives.

**Step 3 — decide the conditional.** Keep `docs/reference/nextjs.md` only if this project is on
Next.js 16. If the stack is different, delete it and tell me what the equivalent would be for the
stack we are actually on — a pinned index naming the official documentation page per topic. Do not
build it yet; that is a decision for me.

**Step 4 — write `CLAUDE.md`.** The kit deliberately does not carry one, because copying another
project's rules in is how a rules file ends up asserting things the code does not do. Write a short
one for *this* project, and keep it to rules with no reasoning attached — the reasoning goes in
`docs/decisions/`, which is the split `docs/decisions/process.md` argues for. It must contain, at
minimum:

- **Hard constraints**, including: *a browser window is not yours to open or close*, and *the
  user's own writing is read, never written*. For the second one you have to ask me **which file
  that is** in this project — a reflection, a journal, a submission write-up, or nothing yet. Name
  it explicitly; a rule with a condition on it is a rule an agent gets to interpret, and the whole
  point of this one is that there is nothing to interpret.
- **Working with me**, including the docs sweep and the plan/task-list split.
- **Concluding a session** — the three endings, with the rule that when it is not obvious which
  applies, you ask.
- A pointer to `docs/decisions/process.md` for why each of those exists.

 Write all documentation in this voice:

  - Every rule is a short declarative sentence in the imperative or the present tense,
    bolded, and it states the rule — never the reasoning. "The window never scrolls, at
    any width." "A plan document is never deleted."
  - Rules live in one rules-only file. The reasoning lives in a separate decisions file,
    one per topic, and the rules file links to the exact anchor. The test for where a
    line goes: is this a rule, or is this an argument for a rule?
  - Each decision entry is Decision / Why / Cost, a few tight paragraphs. The Why names
    the concrete thing that went wrong once, not an abstract principle. Say what was
    tried first and why it came off.
  - Prefer a rule with no conditions. A clause like "unless X" is the door a mistake
    walks through — say so when you remove one.
  - Name things in pairs that hold their shape: "origin" and "destination", never "from"
    and "to". Use the same word for the same idea everywhere.
  - Contrast is the workhorse sentence: "A chip states a fact; anything you would do
    about it is a control." Use em dashes and colons to carry the second half.
  - Write what was NOT verified as plainly as what was. A status document that only says
    what works is half a document.
  - Dates absolute, never relative. Link to commits, PRs and files by path.
  - No hedging, no marketing, no bullet lists of features. Second person to the reader is
    fine; first person is the project owner's alone.

**Step 5 — fill in the shapes.** `docs/README.md`, `docs/decisions/README.md`,
`docs/plans/README.md`, `docs/screenshots/README.md` and `docs/glossary.md` all arrive with their
structure intact and their tables empty. Fill them from what is actually in this repo today. An
empty row is better than an invented one: delete a row rather than have it point at a file that does
not exist. `docs/glossary.md` in particular should stay nearly empty — a word earns an entry the
first time a document has to explain it twice, not before.

**Step 6 — wire up the tests.** Add a test script that runs `scripts/*.test.mjs` under
`node --test`, then:

- `scripts/links.test.mjs` needs two constants set at the top — the skip list and the pointer floor.
  Run it, see the count it reports, and set `MIN_POINTERS` just under that.
- `scripts/contrast.test.mjs` needs its `CONFIGURE` block pointed at this project's stylesheet and
  its `PAIRS` / `FILLS` lists written from the tokens that actually exist. If this project has no
  colour tokens yet, **leave the file in place with its lists empty and say so** — do not invent
  pairs.
- `scripts/motion.test.mjs` only applies if this project settles on a small fixed set of durations
  and one curve. If it does not, keep only its last two tests (the overlay-animation traps and the
  reduced-motion floor) and delete the rest, or delete the file and tell me you did.

Make the suite pass, or tell me exactly which test does not apply yet and why.

**Step 7 — report.** Four short lists:

1. **Installed** — what moved where, verbatim.
2. **Adapted** — what you changed, and to what.
3. **Left empty** — every table, list or constant still waiting on this project, and what it is
   waiting for.
4. **Questions for me** — anything you could not decide without asking, with your recommendation.

Do not commit anything until I have read that report.
