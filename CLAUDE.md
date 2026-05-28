# Einbürgerungstest Quiz App

Single-file vanilla HTML + CSS + JS quiz for the German citizenship test (Einbürgerungstest), Berlin variant. Bilingual DE/EN, three modes, dark/light theme, no build step, works offline.

## Files

- `einbuergerungstest-berlin.html` (~350 KB) — the deliverable. Embeds 320 question objects in `const QUESTIONS = [...]`, plus all CSS/JS.
- `questions-final-extended.json` (~272 KB) — canonical source data, kept in sync with the HTML's QUESTIONS array.

## Dataset

IDs run contiguously **Q1–Q320**:

- **Q1–Q310** — general (`berlin: false`). Q301–Q310 carry `appExtra: true` (beyond the official BAMF 300-question pool).
- **Q311–Q320** — Berlin-specific (`berlin: true`).

Six questions carry an `option_images` field with 4 inline SVGs each, rendered as a 2×2 image-button grid:

- **Q21** Wappen BRD · **Q130** Stimmzettel · **Q209** Wappen DDR · **Q226** EU flag · **Q311** Wappen Berlin · **Q318** Berlin auf Deutschlandkarte

## Question data shape

```json
{
  "id": 31, "de": "...", "options": ["A","B","C","D"], "correct": 0,
  "berlin": false, "appExtra": false, "image": null,
  "option_images": ["<svg>...</svg>", "..."],
  "en": "...", "options_en": ["A","B","C","D"],
  "explanation_de": "...", "explanation_en": "..."
}
```

JS field refs: `q.en`, `q.options_en`, `q.explanation_de`, `q.explanation_en`, `q.option_images`.

`displayQuestion()` switches layout when `Array.isArray(q.option_images) && q.option_images.length === q.options.length`: adds `options--image` class (2-col grid), each button gets `option-btn--image` with `<span class="opt-num">` + `<span class="opt-img">`.

## Quiz modes

| Mode | Filter | Count | Timer | Navigator |
|------|--------|-------|-------|-----------|
| Alle Fragen | `!q.berlin && !q.appExtra` | 310 | — | ✓ |
| Berlin-Modus | `q.berlin` | 10 | — | ✓ |
| Prüfungssimulation | 30 random general + 3 random Berlin | 33 | 60 min | ✓ |

Exam draw uses `!q.berlin && !q.appExtra` so it pulls only from the official 300. "Alle Fragen" shows all 310 (Q1–Q310). Navigator sidebar is visible in all three modes.

## Design system — Neon Velocity (applied 2026-05-09)

**Fonts:** `Plus Jakarta Sans` (headings 800wt, body) · `Geist Mono` (labels, numbers, badges)

**Dark mode tokens (default):**
```
--bg: #050505          --surface: rgba(255,255,255,0.03)   --surface2: rgba(255,255,255,0.06)
--border: rgba(255,255,255,0.08)                           --border-hover: rgba(191,255,0,0.35)
--lime: #BFFF00        --lime-glow: rgba(191,255,0,0.25)   --lime-dim: rgba(191,255,0,0.08)
--red: #ff4d4d         --green: #39d98a
--text: #ffffff        --muted: rgba(255,255,255,0.4)      --sub-text: rgba(255,255,255,0.65)
--gold: #BFFF00        --blue: #BFFF00   ← aliases kept so JS inline-style refs resolve
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)
```

**Light mode:** off-white `#f0f0eb` bg, muted forest-green `#3d8c00` accent.

**Key visual techniques:**
- `body::before` — fixed SVG fractal noise at 3% opacity (grain texture)
- `body::after` — fixed radial lime bloom (ambient glow)
- Glassmorphism on question card, stat cards, timer: `backdrop-filter: blur(12px)` + semi-transparent bg
- Laser Button (`.btn-primary`): lime bg, sweeping `::before` highlight on hover, glow box-shadow
- Luminosity Cards (`.mode-card`): radial top-left glow, lime border + bg on hover
- Hero border box (`.hero-border-box`): 6px sharp-cornered border, mono overline label

## Application state shape

```js
let state = {
    currentScreen, currentMode, currentQuestionIndex, currentQuestions,
    answered: {},      // keyed by question index; use answered[idx] !== undefined to check
    correct, incorrect,
    showEnglish, showExplanation,
    timerInterval, timeLeft,
    themeDark,
    missedQuestions,   // [{q, userAnswerIdx}]
    examStartTime,     // Date.now() at exam start
    generalCorrect, berlinCorrect   // exam sub-scores
}
```

## UX features

- **Home screen:** brutalist hero border box → mode cards (Luminosity Cards, staggered reveal) → collapsed study plan accordion.
- **Question navigator:** permanent vertical sidebar (`.quiz-sidebar`, 196px, `id="questionNavWrapper"`) to the right of the question card. Contains: lime mono title, answered counter (`id="navProgressSummary"`), progress bar (`id="progressFill"`), 2×2 legend grid, scrollable question number grid (`id="questionNavGrid"`). Visible in all modes including exam. Always rendered via `renderQuestionNav()` on every question change — no toggle. Sidebar height is synced to `.quiz-main` height via `requestAnimationFrame` in `displayQuestion()`.
- **Quiz layout:** `.quiz-layout { display: block; position: relative }` — `.quiz-main` fills width with `margin-right: calc(196px + spacing-lg)`; `.quiz-sidebar` is `position: absolute; top:0; bottom:0; right:0`.
- **English inline options:** when bilingual toggle is ON, each text option button shows the English translation on a second line (`.option-en-text`, italic, `var(--sub-text)`, separated by `border-top`). Rendered inside `.opt-text-wrap` (column flex). `#questionEnglish` block shows only the English question text, not per-option lines.
- **Bilingual toggle:** lime ghost pill; toggles `#questionEnglish`, `.option-en-text` elements, and `#explanationEnglish` simultaneously.
- **End screen:** score number (lime), pass/fail pill badge, wrong-answer review, exam sub-scores + elapsed time (pass threshold 17/33).
- **Keyboard hint:** dismissible glass pill on first question of each session.
- **Exam pacing:** timer shows avg min/question in green/amber/red.
- **Theme toggle:** lime laser pill; `localStorage` key `theme`; dark is default.
- **Header logo:** "EIB" — clicking calls `showScreen('home')`.

## Constraints

- Single-file HTML, no build step. Google Fonts is the only permitted external dep.
- localStorage for theme only; quiz state is stateless per session by design.
- Re-scrape: WebFetch blocked on the source site — use Claude-in-Chrome JS extraction. `window.__pN` does not exist; scrape via DOM: `.questions-question-text` (question + id), `.question-answers-list li` (options), `li .question-answer-right` span marks the correct option. General pages: `/fragen?page=N` (1–11). Berlin: `/fragen/be`. Store results in `window.__scraped` and retrieve in chunks to avoid MCP truncation.
- `pip install` and outbound HTTP to Anthropic API blocked by network proxy.

## Regen pattern

Run `node regen_questions.js` from the project root. The script reads `questions-final-extended.json`, extracts the six `option_images` SVG arrays from the existing HTML using balanced bracket counting (naive regex truncates when SVG content contains `]`), serialises all 320 questions as JS object literals, and replaces the `QUESTIONS` array in-place. After running: validate with `node --check` on the extracted `<script>` block, confirm 320 questions / IDs 1–320 / no duplicates, then `cp einbuergerungstest-berlin.html index.html`.

## Hosting

- **Repo:** `thelivinsine/eib-quiz` (public) — [github.com/thelivinsine/eib-quiz](https://github.com/thelivinsine/eib-quiz)
- **Live:** [thelivinsine.github.io/eib-quiz/](https://thelivinsine.github.io/eib-quiz/) — GitHub Pages from `main` branch root
- **Publish workflow:** edit `einbuergerungstest-berlin.html` → `cp einbuergerungstest-berlin.html index.html` → `git add index.html && git commit -m "..." && git push`

## CSS gotchas

- Global `button { font-family: var(--font-mono); font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em }` applies to ALL buttons. Override explicitly in any button variant that needs different styling (e.g. `.option-btn` needs `text-transform: none; letter-spacing: normal; font-family: var(--font-body); font-weight: 500`).

## Style preferences

- Concise responses; minimal formatting unless structure helps.
- Verify before asserting — open the file, grep, run `node --check`.
- Single-file, vanilla — no build steps, frameworks, or new deps unless explicitly requested.
