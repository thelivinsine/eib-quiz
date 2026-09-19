# Focused session view

**Branch** `ui/focused-session-view` · **Status** planned, not started · **Written** 2026-09-19

The home screen stays a page you scroll. Everything downstream of pressing Start becomes an
**app view**: one screenful, chrome that belongs to the session rather than to the site, and a
single scroll region where the content genuinely cannot fit.

Reference: `claude-context-kit/docs/reference/theme-{light,dark}.md` §2–§3 for the fill ladder
and the text tiers. The kit has no radius guidance — §6 below is this project's own call.

---

## 1. The page does not scroll outside the home screen

**Today.** `main` is a normal block with `padding-bottom: calc(96px + safe-area)`, the page
grows to its content, `#timer` and `.quiz-sidebar` are `position: sticky` because of it, and
four separate places call `window.scrollTo` to paper over the result.

**Change.** `showScreen()` is already the one door every screen change goes through
(CLAUDE.md), so it sets `document.body.classList.toggle('in-session', screenName !== 'home')`
and nothing else branches.

```css
body.in-session      { overflow: hidden; }
body.in-session main { height: calc(100vh - var(--header-h));   /* fallback first,        */
                       height: calc(100svh - var(--header-h));  /* same as .quiz-sidebar  */
                       padding-bottom: env(safe-area-inset-bottom);
                       overflow: hidden; display: flex; }
```

Then one unbroken `min-height: 0` chain, because a flex child defaults to `min-height: auto`
and a single missing link lets the whole column grow past the viewport again:

`main` → `.screen.active` → `.quiz-layout` → `.quiz-main` → `.question-card` → **`.question-body`**

`.question-body` is a new wrapper — the only element on the screen with `overflow-y: auto`. It
holds the question text, the English line, the image, the options, the answer hint, the
keyboard hint and the explanation. Outside it, pinned: `.question-meta` above, the nav bar
below. `overscroll-behavior: contain` so a flick past the end of the options does not
rubber-band the locked page.

On most questions it never scrolls. On a four-image question or a long explanation it does, and
the question number, the read-aloud/translate buttons and Back/Next stay put while it happens.

**Falls out of this:**

- `#timer` stops being `position: sticky` — there is no page scroll to stick against. Same for
  `.quiz-sidebar`; its `max-height` becomes `100%`, since its parent is bounded now.
- `.sidebar-body` keeps its own `overflow-y: auto`. Two scrollers, never nested.
- End screen: `.end-screen` is the flex column, the ring/score/breakdown are fixed, and
  `#reviewSection` is the scroller.
- The scroll calls at `index.html:2393`, `:2945` and the one inside `showScreen()` go away,
  replaced by `questionBody.scrollTop = 0` in `displayQuestion()`. `scrollRestoration = 'manual'`
  and `syncHeaderHeight()` stay — the header height is load-bearing now, not decorative.
- Below 940px the navigator is `order: -1` and static. In a locked viewport an expanded panel
  would eat the card, so `.sidebar-body.expanded` keeps a `max-height` and the card keeps
  `flex: 1; min-height: 0`.

**Done when:** with the quiz active, `document.documentElement.scrollHeight ===
window.innerHeight` at 375px, 620px, 940px and 1400px, in both themes, on a four-image question
with the explanation open.

---

## 2. The logo becomes a back button inside a session

The brand mark is a link home on a website. Inside a timed test it is a link that loses your
round, dressed as a logo.

- Add `#sessionBack` beside `.brand` in the header: `ICONS.arrowRight` flipped with
  `transform: scaleX(-1)` (no new icon) plus a label. `body.in-session` shows it and hides
  `.brand`; outside a session, the reverse. CSS only.
- Move the existing `#quitBtn` listener onto it. Behaviour is per-screen, one branch: from the
  quiz it keeps today's confirm ("resume later" vs "progress lost"); from the results screen it
  goes straight home, because there is nothing left to lose.
- New i18n keys `nav.back` / `nav.backAria`. `quiz.quit` is deleted with its button.
- 44px minimum, same as every other header control.

---

## 3. Below the question: two buttons, nothing else

`.btn-group` in the card holds Back, Next **and** Quit today, all three `display: none`-toggled,
so the row reflows under your thumb as you answer.

- Quit is gone (it moved to the header, §2).
- The row becomes `.quiz-nav`: Back on the left, Next on the right, `justify-content:
  space-between`, pinned to the card's bottom edge with a top hairline.
- Back is always rendered and `disabled` on question 1 rather than hidden. Next uses
  `visibility: hidden` rather than `display: none`. **Neither button ever changes the row's
  height** — that is the whole point of pinning it.

---

## 4. The navigator stops repeating itself

The right panel currently shows: a title, an answered-count, a progress bar, a progress
percentage, a shuffle button, a four-swatch legend, and the grid. Above the card there is
already a second progress bar, and above that a four-card stats bar.

| Cut | Why |
|---|---|
| `.progress-bar` + `.progress-fill` in the panel | Second copy of `.quiz-progress`, 40px higher up the same screen. `updateProgress()` drops to one target. |
| `.progress-text` (left / percent) | Third statement of the same number. |
| `.question-nav-legend` | Four swatches explaining four colours that are on screen, in a view whose vertical budget is now fixed. |
| Stats-bar "Question n/total" card | Restated by `#questionNum` and by `#navProgressSummary`. |

Kept: `#navProgressSummary` (the only summary visible when the panel is collapsed on mobile),
the shuffle control, the grouped grid.

`#questionNum` becomes `Question {n} / {total}` (new key `quiz.questionOf`) so cutting the stats
card loses nothing, and the stats bar goes to three columns — correct, wrong, score.

---

## 5. Contrast while answering

The token floors already pass (`node --test tools/contrast.test.mjs`, 10/10). Two real gaps sit
underneath that green tick:

**The option buttons have no fill of their own.** `.option-btn` is `background: var(--surface)`
inside `.question-card`, which is also `var(--surface)` — in light mode that is white on white,
separated by one `#E6E7EB` hairline. CLAUDE.md's own rule says `--surface2` is the well *inside*
a tile; the options are exactly that and were never moved onto it.

- `.option-btn` → `--surface2` (1.09 under the card in light, 1.12 in dark — the measured
  nesting step in both references).
- `.opt-letter` → `--surface3`, keeping the concentric ladder: card → option → chip.
- `:hover` and `:active` re-derive from the new base so the interaction step stays inside
  1.08–1.25 and does not collide with the answered/dimmed state, which also uses `--surface2`
  today and moves to `--surface` + `--muted`.

**Whole families of quiz text were never asserted.** Every tier that lands on the coloured
answer states is missing from `PAIRS`. Measured now, all clearing 4.5 — the work is locking
them in so they cannot drift:

| pair | dark | light |
|---|---|---|
| `text` on `green-dim` / `red-dim` | 12.56 / 13.64 | 16.14 / 15.87 |
| `sub-text` on `green-dim` / `red-dim` | 7.74 / 8.41 | 9.14 / 8.99 |
| `muted` on `green-dim` / `red-dim` | 5.60 / 6.09 | 5.46 / 5.37 |

Plus the new grounds this plan creates: `text` and `muted` on `--surface3`, and `--surface3`
against `--surface2` as a fill step.

**Done when:** `node --test tools/contrast.test.mjs` passes with the added pairs, and the light
theme's answer options are visibly distinct from the card behind them.

---

## 6. Rounding: one three-step scale

Eight radii are in play — `20 24 16 10 9 8 7 4 3 2px` — five of them written as literals a
token search never finds.

```
--radius-xs:   4px     bars, swatches, progress tracks, the image inside an image option
--radius-sm:  10px     wells, nav cells, letter chips, thumbnails, kbd
--radius:     16px     every tile and card
--radius-pill: 999px   anything that is a control
```

`--radius-lg` and `--radius-xl` are deleted; their ~15 uses are rewritten to `--radius` (tiles
go 20px → 16px). The literals map onto `--radius-sm` (9/8/7px) and `--radius-xs` (4/3/2px).

The rule for nested corners: **inner = outer − padding, snapped to the nearest step.** A card at
16px with 14px of padding gives an option at 10px (not 2px — snapped up, because the option is
a surface, not a hairline); an option at 10px with 10px of padding gives its image at 4px.
Parallel corners, and no more guessing a radius per element.

`:focus-visible` keeps its own 4px, which is now `--radius-xs` rather than a coincidence.

---

## Order of work

Each step ends green on `node --check` over the script block and
`node --test tools/contrast.test.mjs`.

1. **§6 rounding** — mechanical, touches no structure, gets the sed pass out of the way first.
2. **§4 navigator + stats bar** — deletions. Frees the vertical budget §1 has to fit into.
3. **§2 header back button** and **§3 nav bar** — the markup move, before anything depends on
   the card's new shape.
4. **§1 the locked viewport** — the structural change, against a card that is already its
   final shape.
5. **§5 contrast** — the fill ladder plus the test pairs, last, so it measures what shipped.

## Verification

The checklist in CLAUDE.md, in full, plus:

- `scrollHeight === innerHeight` on the quiz and results screens at 375 / 620 / 940 / 1400px.
- Exam mode: the timer is visible without scrolling on every question, at 375px.
- A four-image question with the explanation open: the card body scrolls, the page does not,
  Back/Next stay on screen.
- The header shows the logo on home and the back button in a session, and back from the quiz
  still prompts before discarding a round.
- DE/EN switch mid-question: no chrome string left in the other language, no new literal.

## Not doing

- No new radius or spacing system beyond the four values in §6.
- No change to how questions, progress or sessions are stored.
- The home screen keeps its page scroll and its hero, untouched.
