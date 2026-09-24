# Typography roles and tablet/phone layout — design

Status: **shipped 2026-09-23** — PR #104, squash-merged to `main` after a code review whose
fixes (`e867ec9`) changed a few details below; `docs/TODO.md` and `CLAUDE.md` hold the current
version (the nav's 400 weight, the ring stepping at 700, list rows at `--lh-ui`, `--panel`).

## Intent

The user asked for "a clear typography" across the app, and for the app to be adapted to
tablet and phone widths "by adjusting sizing and positioning of various components".

Success means:

- **the same job always looks the same.** Every piece of text is on exactly one named
  role, and a role looks identical on every screen;
- **the hierarchy is the right way up at every width.** The display headline outranks
  the numbers, the numbers outrank the headings, and the question outranks its answers,
  on a phone as much as on a desktop;
- **nothing on a tablet looks like a phone layout stretched out.** In particular, the quiz
  has no dead band between its answers and its buttons.

### Decided by the user

| Question | Answer |
|---|---|
| What "clear typography" means | **Consistent roles.** Keep Bricolage Grotesque + Inter and the existing `--fs-*` steps; no new typefaces, no general size increase. |
| The one small-label look | **Sentence case**, 13px, regular weight, muted. The quiz's CORRECT / WRONG / SCORE, the results labels and the footer's PRACTISE / SOURCES lose their uppercase and tracking. |
| Tablet-portrait quiz | **Buttons under the answers**, one column, the block centred in the height; readouts and the collapsed overview strip stay at the bottom. Phones keep the bottom-pinned row. |
| Header page selection | **No underline.** The current page is `--text`; the other link is `--muted` and goes `--text` on hover. |
| The dark-panel change left uncommitted earlier | Rides on this branch as its **own first commit** (`ff0284c`). |

### Assumed (not stated by the user, open to correction)

- Colours, spacing tokens, radii, the button standard (44px / 15px / 600) and the header's
  two toggles do not change.
- The three breakpoints stay where they are: phone < 620, tablet 620–940, laptop
  940–1160, desktop > 1160.

## Audit this is built on (measured 2026-09-23 in the pane and headless Chrome)

- **About 20 distinct text styles per screen**, several doing one job: card titles in two
  fonts (mode cards Bricolage 16/600, why items Inter 15/600); description copy at 13, 14
  and 15px; small labels in three treatments (quiz uppercase 12/600, results uppercase
  12/400, overview sentence case 13/400); a stray `line-height: 1.4` on the question, the
  options and the review question, off the three-leading scale.
- **Phone inversions:** Home's four numbers 36px against a 32px headline; section headings
  18px against 16px card titles; the quiz question 16px, the same as its options.
- **Tablet:** quiz at 768×1024 has ~430px of nothing between the last option and
  Previous/Next; the five mode cards fall 3 + 2 with the second row left-aligned and
  taller (213 vs 235px); the numbers band's script note wraps onto a line of its own; the
  CTA band's button wraps under the copy with the note and the gate beside it.
- **Not a bug:** at 1024×768 the question navigator shows no cells because it is collapsed
  by default above 940px. The chevron opens it.

## 1. The roles

Each role is one `font` shorthand token in `:root`, built only from `--fs-*`, `--lh-*` and
`--font-*`. Sizes below are px at desktop / tablet / phone.

| Token | Weight · family · leading | Desktop | Tablet | Phone |
|---|---|---|---|---|
| `--type-display` | 700 · head · tight | 56 | 40 | 32 (the existing `--fs-hero` clamp) |
| `--type-heading` | 600 · head · ui | 28 | 28 | **22** |
| `--type-subheading` | 600 · head · ui | 18 | 18 | 18 |
| `--type-title` | 600 · head · ui | 16 | 16 | 16 |
| `--type-option` | 400 · body · ui | 16 | 16 | 16 |
| `--type-body` | 400 · body · prose | 15 | 15 | 15 |
| `--type-small` | 400 · body · prose | 14 | 14 | 14 |
| `--type-label` | 400 · body · ui | 13 | 13 | 13 |
| `--type-caption` | 400 · body · ui | 12 | 12 | 12 |
| `--type-figure-lg` | 600 · head · tight | 36 | 36 | **28** |
| `--type-figure-md` | 600 · head · tight | 22 | 22 | 22 |
| `--type-figure-sm` | 600 · head · tight | 16 | 16 | 16 |
| `--type-script` | 400 · hand · ui | 22 | 22 | 22 |
| `--type-control` | 600 · body · ui | 15 | 15 | 15 |
| `--type-control-sm` | 600 · body · ui | 14 | 14 | 14 |
| `--type-chip` | 600 · body · ui | 12 | 12 | 12 |

Rules that come with them:

- **Head-family roles keep `letter-spacing: var(--ls-display)`** on the component (the
  `font` shorthand does not carry tracking). **No text is uppercase any more**: the shared
  label list, `.stat .stat-label`, `.rs-label`, `.footer-col-title` and the history
  badge (`.hist-badge`, "Passed" / "Not passed") all drop `text-transform` and `--ls-caps`.
  The two taglines keep `--ls-caps`: they are a wordmark's line, not a label.
  _(Reversed 2026-09-24, on request: both taglines dropped it to "match the other text",
  went to 10px, and `--ls-caps` was deleted with its last readers — see CLAUDE.md.)_
- **The `font` shorthand resets `font-variant-numeric`.** Every figure rule re-declares
  `tabular-nums` AFTER `font:`.
- **Phone type is two token overrides in a `max-width: 700px` block** (620 in the approved design; moved in the final review because the 5.2vw headline was under the 36px figure at 621-692): `--type-heading` to
  `--fs-xl` and `--type-figure-lg` to `--fs-2xl`. No component states a phone font size.
- **The stray 1.4 leading goes.** Question, options and review question take `--lh-ui`.

### Named exceptions (not roles, and the only `font-size` left outside `:root`)

- `body` — the inherited default (`400 --fs-md / --lh-ui` Inter).
- `.state-picker select` — `--fs-md`, iOS Safari's no-zoom floor; invisible, not a visual choice.
- `.brand-name`, `.footer-name` — the wordmark, part of the logo lockup.
- `.glossary-summary::after`, `.keyboard-hint-close` — a `+` and a `×` used as icons.
- `.lang-toggle` — `--type-chip` plus `font-weight: 700`, which the user asked for on the EN code.
- `.hist-mode`, `.hist-score`, `.qnav-group-count` — inline emphasis: a weight on a span
  inside a parent that already reads a role. They set no size or family.

## 2. Mapping

| Role | Selectors |
|---|---|
| display | `.hero-headline` |
| heading | `.section-head h2`, `.cta-copy h2`, `.end-screen > h1` (700 → 600) |
| subheading | `.question-text`, `.home-section--quiet .section-head h2`, `.review-section-header h2` |
| title | `.mode-title`, `.why-item h3`, `.dash-verdict strong`, `.resume-text strong`, `.topic-chip-name`, `.glossary-summary`, `.explanation-header`, `.review-q-text`, `.pass-fail` |
| option | `.option-btn` |
| body | `.hero-lead` (16 → 15), `.section-head p`, `.cta-lead`, `.explanation-text` (14 → 15) |
| small | `.mode-description`, `.why-item p`, `.dash-verdict p`, `.resume-text`, `.hist-row`, `.hist-exam-stats`, `.gloss-def`, `.footer-blurb`, `.question-english`, `.explanation-english`, `.review-answer`, `.review-explanation` |
| label | the shared micro-label list — `.stat-label`, `.breakdown-label`, `.review-q-num`, `.timer-label`, `.sidebar-title`, `.question-num` — with its uppercase and `--ls-caps` removed, `.ds-label`, `.ready-ring-sub`, `.dash-pass`, `.resume-text > span`, `.stats-label`, `.question-category`, `.rs-label`, `.score-number`, `.pass-threshold-note`, `.review-count`, `.img-zoom-caption`, `.opt-num`, `.footer-col-title`, `.footer-link`, `#timer .timer-label`, `#timer .pacing-info` |
| caption | `.brand-tagline`, `.footer-tagline`, `.mode-meta`, `.topic-chip-meta`, `.hist-date`, `.ds-of`, `.stat-of`, `.option-en-text`, `.img-zoom-hint`, the missing-image `::after`, `.keyboard-hint`, `.footer-bar` |
| figure-lg | `.stats-num` (700 → 600), `.score-ring-pct` |
| figure-md | `.ready-ring-pct` (700 → 600), `.rs-num` |
| figure-sm | `.ds-num`, `.stat-value`, `#timer .timer-display` |
| script | `.script-note` |
| control | `.btn-primary, .btn-secondary` |
| control-sm | `.nav-link`, `.session-back`, `.state-picker-value`, `.gloss-item > summary` |
| chip | `.seg-btn`, `.qnav-seg .seg-btn`, `.q-nav-btn`, `.qnav-group-head`, `.opt-letter`, `.speak-btn`, `.bilingual-toggle`, `.hist-badge`, `.mode-flag`, `kbd` (drops the system monospace), `.lang-toggle`, `.opt-img-hover` |

`.opt-img-hover` is chip, not caption: the same 12px, at the 600 the zoom veil's label needs over a photograph.

**Deleted component overrides** in the 620px block: `.section-head h2, .cta-copy h2`,
`.section-head p` (already hidden there), `.dash-verdict strong`,
`.mode-card .mode-description`, `.session-back`, `.brand-name` (hidden there), `.question-text`,
`.stat-value, .stat-of`, `.stat .stat-label`, `.score-ring-pct`, `.hist-row`. The < 400px
`.opt-num` step becomes `font: var(--type-caption)`.

Colour stays on the component: `.question-num` keeps its accent, the due counter its gold.

## 3. Layout by width

### Header (every width)

- `.nav-link` is `--muted`; `.nav-link--active` is `--text`; hover (inside
  `@media (hover: hover)`) is `--text`. The `text-decoration` underline and its offset and
  thickness are deleted. `aria-current="page"` stays.

### Home

- **≤ 940px:** `.stats-item--note` is hidden (as it already is ≤ 620), and so are the CTA
  band's `.script-note` and `.cta-art`. The band's copy and button then share one row
  (copy `flex: 1 1 280px`, button `flex: none` — they already are).
- **≤ 620px:** unchanged apart from type; the numbers fall to 28 through the role.

### Practise

- **620–1160px:** `.modes-grid` is a six-track grid, each card `span 2`, the fourth card at
  `grid-column: 2 / span 2`, so the last two centre under the first three; `grid-auto-rows:
  1fr` makes all five one height.
- **≤ 620px:** unchanged apart from type.

### Quiz

- **620–940px:** the question card is content-sized, as it is above 940. The question,
  its options and `.quiz-nav` form one block centred in the space above the readouts, and
  the readouts plus the collapsed overview strip sit at the bottom. The session height
  lock is kept.
- **≤ 620px:** unchanged: the card fills its area and Previous/Next stay pinned above the
  strip. The four readouts now render at figure-sm 16 + label 13 and must still hold ONE
  line in German at 360px (the answered readout keeps hiding its word).
- **> 940px:** unchanged.

### Results

Type only.

## 4. Tests

- **`tools/scale.test.mjs`**
  - Every `--type-*` token references only `--fs-*`, `--lh-*` and `--font-*`.
  - A new ratcheted metric, `fontSizesOutsideRoles`: `font-size` declarations outside
    `:root`, minus the named exceptions above. Target 0.
  - Hierarchy assertions, resolved per width from the tokens and the phone overrides:
    display > figure-lg > heading on a phone, and subheading (the question) > option at
    every width.
  - Existing type metrics that read `font-size` are taught to read the role tokens too,
    so the 12px floor and the rest are still enforced. A metric must not "pass" because
    its declarations moved somewhere it no longer looks.
- **`tools/contrast.test.mjs`:** `muted / canvas` already exists. Its description gains
  "the inactive header nav link".

## 5. Verification

Measured, not assumed, in the pane with `innerWidth` read first, and screenshotted in
headless Chrome at ≥ 768px only:

- at 375 / 768 / 1024 / 1280, in EN and DE, every text element's computed font matches its
  role;
- `scrollWidth == clientWidth` on Home and Practise at 320 / 375 / 768;
- on the quiz and results screens, `scrollHeight == innerHeight` at 375 / 620 / 940 / 1400,
  including a four-image question with the explanation open and the mobile navigator both
  collapsed and expanded;
- the four quiz readouts on one line at 360px in German;
- at 768 and 1024: the last two mode cards centred and all five one height;
- at 768×1024: `.quiz-nav` directly under the options (no dead band);
- the header row still fits at 320 / 360 / 375 with the seg collapsed and open;
- the CLAUDE.md validation checklist, all of it.

## Out of scope

Colours; spacing tokens; the button standard; the header toggles; the hero, why band and
results layouts beyond type; new typefaces; any size increase not listed above.

## Docs to update with the implementation

CLAUDE.md's type notes (the size system, the home-screen ladder, the quiz hierarchy, the
overview card's type, the nav underline, the label sentence-case history), plus a session
block in `docs/TODO.md`.
