# Process and the record

How a session works, what gets written down, and what is never touched. **Every entry below was
learned by getting it wrong once**, on a previous project, and each is carried here because the
mistake was about *working*, not about that project's subject matter. The rules themselves belong in
[`../../CLAUDE.md`](../../CLAUDE.md) → *Working with me*, *Hard constraints* and *Concluding a
session*; this file is the argument behind them.

Every entry is the same three things: **the decision, the reason, and what it cost.** Append new
ones as this project learns its own.

---

## The user's own writing is off limits

**Decision.** A document that is the user's own account of their own work — a reflection, a journal,
a submission write-up — is **read, never written**. Not a typo, not a stale fact, not a heading, not
a blank line, not a draft offered for the user to rewrite. When a sweep finds it stale, saying so is
the entire deliverable. `CLAUDE.md` names which file this is.

**Why.** An agent asked to "update docs and include the learnings" appended a section to such a file
in the user's first person, marked as a draft for them to rewrite. Marking it did not make it right.
The learnings had somewhere to go already: these files and the status document.

**The repair is the interesting part.** The first fix kept a clause — *unless the request names it*
— and **that clause is the door the mistake walked through**: "update docs and include the
learnings" is a request an agent can read as naming the file, and one did. A rule with a condition
on it is a rule an agent gets to interpret, and the whole point of this one is that there is nothing
to interpret. So it moved into *Hard constraints*, phrased like the browser rule and for the same
reason: **some rules are not worth being clever about.** No mode, skill, agent, sweep or instruction
overrides it, including a later instruction in the same session.

**One footnote, which stands harder than the original entry.** The `git add -A` half: it exists
because staging a whole directory swept this file into a commit on day one, and where parallel
sessions work one tree, a directory-wide stage picks up a *peer's* uncommitted work. **Stage the
files you changed.**

## A browser window is not yours to close

**Decision.** Never open or close a browser window or tab without being asked — not one you did not
open yourself, and not as a tidy-up at the end of a run. Headless verification runs its own instance
on its own profile and port, and is torn down **by process id**.

**Why.** A session closed browser windows the user was working in. Nothing in the repo broke; what
broke was the tabs, and a tab is not in version control. There is no undo and no way to know what
was in it.

**The cause generalises**, which is why the rule is absolute: **a cleanup step that identifies its
target by what it *looks like* instead of by what it *started*.** A pattern-matched kill, a "close
all tabs" tidy-up, an extension driving whatever window is in front — each reaches past the thing
the session opened. A lazy-mode instinct, a browser-automation skill's default cleanup and a
subagent's own judgement all lose to this rule.

**Cost.** The cost of asking is one sentence. The cost of guessing wrong is somebody's afternoon.

## A subagent gets a timer, not an open end

**Decision.** Every dispatched subagent gets a stated ceiling, armed at the same moment and said out
loud. Check in at each interval — alive or not, and on what — and at the ceiling, stop it and report
what it produced, partial and labelled as partial.

**Why.** A review was handed to a background agent and simply left there. The harness notifies on
completion, but completion is the one outcome that needs no watching. The failure modes are the
others — an agent that loops, stalls on a tool it cannot use, or waits for input nobody will see —
and **from the outside all three look exactly like an agent that is still thinking.**

**Cost.** The timer is a ceiling, not a poll: tight polling of work the harness already tracks is
waste. The interval exists so a hang surfaces as a sentence instead of as silence. **A half-finished
review that arrives is worth more than a whole one that never does.**

## A plan document is never deleted

**Decision.** Plan documents accumulate. Mark one shipped and leave it — not when it ships, not
ever. A rule that came out of a plan is **copied** into these files, never moved.

**Why.** The old rule deleted each plan on shipping, for tidiness. That optimised the wrong thing.
What a plan holds that nothing else does is the ***before*** — what the work was expected to be, in
the order it was expected to happen. Every other document here is written afterwards and is
therefore correct by construction. **The plan is the only one that can be wrong on the record, and
the wrong parts are the valuable parts.** One plan predicted a responsive sub-line would simply
return under the name at a narrow width; the branch then spent three rounds discovering it truncates
earlier and wraps instead. Delete the plan and that reads as a decision someone made. Keep it and it
reads as a prediction that failed, which is the only form of it anyone can learn from.

**Cost.** The tidiness worry was mostly imagined. A plan is stale the moment it ships, but it is not
*misleading* as long as it is marked shipped, because nobody reads a plan for the current state.

## A plan and its task list are two documents

**Decision.** A plan is `docs/plans/<name>.md` **and** `docs/plans/<name>-tasks.md`. The plan holds
the argument — what the work is for, the order, what is deliberately out, the open questions. The
task list holds the work — numbered items, what *done* means for each, and what has to land first.
Neither holds the other's half; each links to the other.

**Why.** Early plans carried both, and the two halves have opposite lifetimes. **A task list is
finished the day the work ships and is noise from then on; the argument beside it is the part that
is still read a fortnight later** — and that argument ends up buried under checklists nobody needs
again. The two also have different readers: the task list is read *while building*, one item at a
time, and the plan is read *before* building and *after*, to ask what the work was supposed to be.
One document served the second reader badly to serve the first at all.

**And it has a second job.** A task list with numbered items is what the branch rule below branches
off — one sub-branch per item — so the split is no longer only about reading.

**Cost.** Two files per plan, and two places for the same work to be described. The rule against
restating is what keeps that cheap: the task list says *what and when done*, never *why*. Plans
written before this rule are **not** retrofitted — they are the record of how they were written, and
splitting them later is editing history for tidiness.
→ [`#a-plan-document-is-never-deleted`](#a-plan-document-is-never-deleted)

## A plan gets a branch, and each task a sub-branch

**Decision.** `plan/<name>` branches off `main`. Every task in that plan's task list gets
`task/<name>/<n>-<slug>` off the **plan branch**, and merges back into it when the task is done. The
plan branch ends by its size like any other branch.

**Why.** Before this, every session opened one branch off `main` and everything went on it. That is
right for a tweak and wrong for a plan: a seven-item plan on one branch is one diff of seven
unrelated changes, which is the diff nobody can review and the diff nobody can revert half of.
Per-task branches make each task a small merge into the plan branch, and the plan branch is then a
single reviewable body of work against `main`. It also matches how the work is actually paused — a
task is where a session stops, not a plan.

**The naming is not decoration.** `plan/v2` and `plan/v2/1-some-task` **cannot both exist**: git
stores a branch as a file under `refs/heads/`, so `plan/v2` being a file means `plan/v2/` cannot
also be a folder. Tried and confirmed — *cannot lock ref … `refs/heads/plan/v2` exists*. The `task/`
prefix keeps the two out of each other's way and still groups a plan's tasks under one name.

**Cost.** More branches, and a merge per task. Both are cheap, and the cost that matters is
attention: a task branch left unmerged is invisible in a way a dirty working tree is not, so the
task list is where that is tracked — an item is done when its branch is **merged**, not when its
code is written.

## Concluding a session splits by size

**Decision.** Three endings. **Minor** work — a tweak, maintenance, a diff that explains itself — is
reviewed in the session that wrote it and squash-merged there. **Substantial** work — a refactor, a
redesign, a page — stops at the pull request. **A diff review**, where the whole session was reading
an open request's diff and fixing what it found, merges that request.

**Why.** Every branch used to end the same way: pushed, request opened, waiting. That queue was the
cost — a pull request per tweak is a review ritual with nothing in it to review, and three open at
once is how a sibling session gets a conflict it did not earn. Substantial work stops because that
is where *what I did not verify* is worth someone else reading, and big changes are the ones that
hurt to unpick. A diff review is its own case because the fixes already went onto that request's
branch: ending it as substantial asks for a second review of a diff reviewed twice, and ending it as
minor would squash that branch onto the main line behind the request's back.

**Cost.** The split is a judgement, not a rule that decides itself. When it is not obvious, ask.
What did not change: code never lands on the main line without a branch of its own, and docs go
straight to it.

## A browser number is only as fresh as the server under it

**Decision.** A browser measurement is taken against a fresh production build, served by a throwaway
static server on its own port, with both it and the browser torn down by process id. Never against a
long-running development server.

**Why.** Learned the expensive way. A development server had been running for two days. It survived
a theme rewrite, two branch switches and a merge, and by the time anything was measured against it,
it was serving a stylesheet with the new type sizes and the old label widths — **partially
recompiled, which is far worse than fully stale, because the page it renders is plausible enough to
reason about and wrong enough to act on.** What that looked like: 170px navigation icons, no padding
anywhere, and a results table 666px down a 900px window against a true figure of 188px. It was
reported to the user as a regression from the merge. **It was not a regression** — one of those
figures was **478px** out.

**Cost.** A minute per measurement. And there is no test that can cover this: the suite, the
typechecker and the linter all pass against a tree whose served stylesheet is a day and a half out
of date, because none of them reads compiled output. The gap is between the source and a running
process, and the only instrument that sees it is the browser pass — which is the thing being fooled.

### The grep that confirmed the wrong thing

**Decision.** A search against generated output must first be run against a known-good build, to see
whether the pattern can match at all, before its absence is read as information.

**Why.** The stale server was diagnosed by comparing class names in the source against the compiled
stylesheet, and the first pass reported six present in one and absent from the other. **Four of the
six were false** — the build escapes special characters in class names, so a plain search finds none
of them and reports absent for present. Two were real and the conclusion happened to survive, which
is the uncomfortable part: **the evidence was mostly wrong and the answer was still right, which is
exactly the shape of a result nobody re-checks.**

### A shared checkout has one HEAD

**Decision.** Check which branch you are on **at commit time, not at branch time**. Stage by hunk
when the tree holds another session's work.

**Why.** Two sessions wrote one tree at once. One committed to the branch it had created and the
commit landed on the other session's branch, because the current branch had moved underneath it in
between. Nothing was lost, but the branch a commit lands on is not a thing to assume in a shared
tree.

### What the pair of sessions got right

Both faults above were caught by the *other* session, and both because the sessions told each other
what they had measured **and how**. Neither is visible in a diff. **Two sessions exchanging
conclusions would have agreed with each other** — each had a number the other could not have
questioned without the method beside it, and in both cases the method was where the fault was.

## `CLAUDE.md` is rules; this folder is the reasoning

**Decision.** `CLAUDE.md` states rules with no argument attached. The reasoning — why the rule
exists, what it cost, what was tried first — lives here, one file per topic.

**Why.** A previous rules file reached **583 lines**, 428 of them one section where each rule carried
a paragraph of sizes, component names and what was tried first. Its own test is not line count but
*"is this a rule or is it reasoning"* — and by that test most of those paragraphs were neither. They
were rules *with their working shown*. The reasoning came out and the rules stayed; it ended that
session at **252 lines**.

**The part that was wrong, and is corrected here.** The detail first went to a *separate conventions
file* rather than into the decision entries, on the argument that they are different kinds of
writing: a decision says *why*, in the past tense; a convention says *what to do*, in the present.
That held for ten days and then stopped: **three files stating one rule is three places for it to
drift**, and the drift showed up in a review as documentation asserting things the code did not do.
Detail belongs with the decision that produced it — two files, not three.

## A spoken workflow is a skill, and `CLAUDE.md` keeps its rules

**Decision.** *"Update the docs"* and *concluding a session* are procedures, not rules, and live as
skills under `.claude/skills/`. **Every rule stays in `CLAUDE.md`** — the three endings, the docs
exception, *ask when it isn't obvious*.

**Why.** Neither fits the line-or-two-and-a-pointer shape a rules file wants, and both are triggered
by something **said out loud**. A slash command fires when it is typed; a skill is matched against
what was actually said. Skills also nest: concluding a session invokes the sweep as its own step.

**The point is *when* text is in context.** `CLAUDE.md` loads in every session whether it is needed
or not, and a skill body loads only when its description matches. **A skill that fails to fire must
not take a rule with it** — so the rule stays in the file that always loads.

**Cost.** A second place for the same words to drift. The skills point at anchors here rather than
restating them, and the one constraint they do repeat — the user's own document is read, never
written — is repeated deliberately, because it is the rule most likely to get reasoned around
mid-sweep and the cheapest to over-state.

**Two things learned writing them.** A skill description has to be **pushy**, listing the literal
phrases, because the failure mode is a skill that does not fire rather than one that fires wrongly.
And the commit attribution line is **read from the session, never written into the skill** — the
first draft hard-coded it, which would have signed every future commit with one session's model.

**And: a rules file that delegates to a skill ships the skill in the same commit.** The first pass
edited `CLAUDE.md` to point at both and left the skills untracked. A fresh clone would have loaded a
rules file naming two procedures whose 195 lines do not exist, with the fallback text deleted in the
same breath. **The pointer and the thing it points at are one commit, never two.**

## An ignore that lives in a comment is not an ignore

**Decision.** State ignores as path rules, not as prose above a rule that does something else.

**Why.** An ignore file *said* a vendored folder was "untracked on purpose" from the day it arrived,
and the sentence sat directly above a rule that ignored the bytecode those scripts drop and not the
scripts. True as intent, false as fact, and its **56 files were reported as pending in every
session**.

**Cost of having left it** was not the noise. **56 permanently-pending files are indistinguishable
from real uncommitted work**, which is exactly the signal a session is told to read before staging
anything. A status line that is always dirty cannot warn anyone.
