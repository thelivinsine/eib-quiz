---
name: conclude-session
description: End a working session in this repo — classify the work as minor, substantial or a diff review, sweep the docs, put the code on a dedicated branch, and take the one ending of three that its size requires. Use this whenever the user says "conclude the session", "conclude", "finish up", "finish the session", "wrap up", "close this out", "we're done for today", or otherwise signals the session is over, even when they mention nothing about branches, commits or PRs — deciding which of the three endings applies is the whole reason this skill exists, and getting it wrong either queues a pointless PR or squashes a waiting one behind its own back.
---

# Concluding a session

The size of what was built decides what happens to it. Every branch ending the same way —
pushed, PR opened, waiting — was the cost this split was written to remove: a PR per tweak
is a review ritual with nothing in it to review, and three open at once is how a sibling
session inherits a conflict it did not earn.

The rule is in `CLAUDE.md` → *Concluding a session*; the argument is in
`../../../docs/decisions/process.md#concluding-a-session-splits-by-size`.

## Step 1 — classify, and ask when it is not obvious

This is a judgement call, and it is the one decision here that cannot be recovered from
cheaply. Read the session's own diff before deciding rather than going on how the session
*felt*.

| Ending | What it was | What it gets |
|---|---|---|
| **Minor** | A UI tweak, routine maintenance, a diff that explains itself — nothing needing a second opinion | Commit on a branch, review the diff in this session, squash-merge to `main`, push. **No PR.** |
| **Substantial** | A refactor, a redesign, a new page — anything that changes the shape of the app | Commit, push, open the PR, and **stop**. |
| **Diff review** | The session's whole content was reviewing an open PR's diff, and every issue it found is resolved | **Merge that PR.** No new branch, no second PR. |

The diff review is the ending that gets missed, because the other two assume the session
*wrote* something that now needs a home. A session that only read a PR's diff and fixed
what it found has no such thing: the fixes are already on that PR's branch, and the PR is
waiting for exactly the review that just happened. Treating it as substantial asks for a
second review of a twice-reviewed diff; treating it as minor squashes the PR's branch onto
`main` behind the PR's back.

**When it is not obvious which of the three, ask the user.** State which two you are
between and why, and wait. A wrong call here is more expensive than the question.

## Step 2 — sweep the docs first

Invoke the **update-the-docs** skill and complete it before any commit. Sweeping after the
merge means the commit that claims the docs are current is the commit where they were not.

If this repo keeps a document that is **the user's own writing** — a reflection, a journal,
a submission write-up — the sweep's constraint on it holds here in full: read it, report
staleness, type nothing into it. Concluding a session is not an occasion that unlocks it.

## Step 3 — put the code on a dedicated branch

Code never lands on `main` without a branch of its own. Docs are the exception in all
three endings — they may be committed and merged straight to `main` and pushed.

Check `git branch --show-current` **at commit time**, not at branch time. A checkout may be
shared, it has one HEAD, and another session may have moved it since.
→ `../../../docs/decisions/process.md#a-shared-checkout-has-one-head`

**Stage the files you changed, never `git add -A`.** Other sessions' uncommitted work may
sit in this tree and `-A` sweeps it into your commit.

Use the commit and PR attribution lines this session was given rather than copying them
from an example — they vary per session.

## Step 4 — write down what you did not verify

The half of the summary that gets read before merging is the second half. Name what was
built, then name what was *not* checked: anything unmeasured in a browser, anything whose
test run was assumed, anything left partial. On a substantial ending this text is the PR
body, and it is what the reviewer is actually being asked to read.

A browser measurement is only valid against a **fresh production build served by a
throwaway server**, never a long-running development server, and its server and browser are
torn down **by PID**. If the session did not do that, the number is not verified — say so.
→ `../../../docs/decisions/process.md#a-browser-number-is-only-as-fresh-as-the-server-under-it`

## Step 5 — take the ending

Follow the row you chose in step 1, and note the two places it is easy to overreach:

- On **substantial**, stop at the PR. Never merge it yourself — that ending exists so
  someone else reads the *did not verify* half before it lands.
- Never open or close a browser window or tab to check the result unless the user asked.
  → `CLAUDE.md` → *Hard constraints*.

## Step 6 — the status document, same day

Update it as part of concluding, not as a tidy-up afterwards, and record the live commit
the ending produced. A status file written the next day is written from memory.

## Report

Close with four short lines, in this order:

1. **Ending taken** — minor, substantial or diff review, and the one-line reason.
2. **Where it is** — branch name, commit or PR link, merged or waiting.
3. **Docs** — what the sweep corrected, and anything stale it deliberately left.
4. **Not verified** — carried forward from step 4, in full.
