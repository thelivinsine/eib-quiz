# EIB Quiz Project Memory

## Workflow Preference

- **Ship via PR + merge.** When changes are ready, open a pull request into `main`
  and merge it (squash) — don't leave finished work sitting on a feature branch.
  Merging `main` publishes to production (GitHub Pages), so only merge work that's
  been validated.

## Current Production

- Live site is GitHub Pages from the `main` branch root.
- Production entry point is `index.html`.
- On 2026-05-29 production was rolled back to the May 9 app version in commit `d2b1527`.
- PWA is intentionally re-enabled (2026-06-20): `sw.js` is now a real offline cache (NOT
  the old kill switch) and `index.html` registers it and links `manifest.json`. The SW is
  network-first for HTML + `questions.json` (so updates always win online) and cleans up all
  old caches — including the May-28 `eib-quiz*` caches — on activate, which subsumes the old
  kill switch. Bump `CACHE` in `sw.js` to invalidate cached static assets.
- **A network-first worker is only half of "the update arrives"; the REGISTRATION is the
  other half** (2026-09-21). Three lines in `index.html`, each fixing a different way a
  tab stays on an old build:
  - **`register('sw.js', { updateViaCache: 'none' })`** — the worker SCRIPT must never be
    served from the HTTP cache, or the browser byte-compares a stale `sw.js` against
    itself, finds no difference and installs nothing. This is the `cache: 'reload'` trap
    one level up, and it is why a fixed fetch handler can sit in the repo without ever
    reaching anyone.
  - **`reg.update()` on load AND on `visibilitychange`** — a left-open tab can go days
    without a navigation, and a navigation is the only thing that checks on its own.
  - **`controllerchange` -> `location.reload()`** — `sw.js` calls `skipWaiting()` +
    `clients.claim()`, so a new worker takes over an open tab at once, but the tab keeps
    rendering the page it already parsed. Without this the user needs a SECOND reload.
    Three guards, all load-bearing: only when the tab already had a controller (a
    first-ever install claims too, and there is nothing stale to replace), never while
    `body.in-session` (the round is in `localStorage` and the next natural load picks the
    build up — yanking the page out from under a question is a worse trade), and **at
    most once per tab, stamped in `sessionStorage` under `eib_sw_reloaded`** so the bound
    survives the reload itself. A reload loop is a far worse bug than a stale tab.
  - **A reload does not touch `localStorage`**, so progress, the resumable session and the
    history all survive the swap. That is what makes the auto-reload safe at all.
  - **All of it is VERIFIED in a real browser** (2026-09-21, headed Chrome driven over
    CDP): a controlled tab reloads itself exactly once on a new `sw.js`, keeps
    `localStorage`, evicts the old cache, does NOT reload on the next deploy (the
    sessionStorage bound holds), and does not reload at all while `body.in-session`. An
    ordinary reload of a controlled tab serves freshly edited HTML, and with the network
    emulated offline the app still renders all five mode cards from cache.
  - **To test this yourself, the profile must NOT live under `%TEMP%`.** A throwaway
    profile there had CacheStorage fail outright — `caches.open()` threw
    "Unexpected internal error" with 10GB of quota free and IndexedDB healthy — while the
    same Chrome with a profile under the repo worked first time. The in-app preview pane
    will not register a worker either. Both look like an app bug and are not one.
  - **A CacheStorage failure must never cost the REGISTRATION** (2026-09-21). That broken
    profile is what exposed it: `caches.open()` rejecting inside `install` rejected
    `event.waitUntil`, the worker went redundant, and the registration was discarded — so
    there was no worker at all, and with it no network-first. `safeOpen`/`safeMatch`/
    `safePut` in `sw.js` swallow it everywhere, `activate`'s sweep is wrapped, and the
    network-first path writes through `safePut` so a broken cache cannot turn a GOOD
    network response into a failed navigation. **No cache means no offline; it must not
    mean no app.**
    - **That write goes through `event.waitUntil()`, NOT `await`** (2026-09-21). Awaiting
      it held every navigation and every `questions.json` response until the cache write
      landed — a disk write on the critical path, on exactly the slow and contended
      profiles `safePut` exists for. `safePut` can no longer reject, so the `await` was
      buying nothing the unawaited `cache.put` did not already give; `waitUntil` keeps the
      write alive past the handler without the response waiting on it.
- **Network-first only works with `cache: 'reload'`, and both fetch paths need it**
  (fixed 2026-09-19). A plain `fetch(req)` consults the **browser's HTTP cache** first;
  GitHub Pages serves `index.html` with `max-age=600`, so the worker's "network" fetch was
  answered out of that cache without touching the network — and then stored the stale copy
  as the offline fallback. Caught on the live site right after a deploy: the CDN had the new
  build, `fetch(url, {cache:'reload'})` got it, and the same URL through the worker returned
  the old one. A reload did not help, because the reload hit the same HTTP cache. `addAll()`
  in `install` has the identical default, so a fresh install could seed itself from the very
  copies it exists to replace. **If a deploy looks like it did not ship, check this before
  suspecting Pages.**
  - **There is a THIRD cache under those two: Fastly's edge, and `cache: 'reload'` does
    not touch it** (2026-09-22). `cache: 'reload'` bypasses the BROWSER's HTTP cache, so
    it proves what the edge holds — not what the origin built. Verified minutes after a
    deploy whose Pages build already reported `built`: the bare URL returned the previous
    object (byte-identical to the old build, old comment present) while the SAME URL with
    a `?cb=<timestamp>` returned the new one, 298 bytes longer, `age: 0`, and a
    `last-modified` matching the new build. A distinct cache key forces an origin fetch;
    the bare URL waits out its `max-age=600`. **So a "did not ship" reading within ten
    minutes of a deploy is not evidence.** Check `gh api repos/<o>/<r>/pages/builds`
    for the build, then a cache-busted URL for the origin, then the bare URL for the edge
    — and say which of the three you measured.
    **`curl` cannot do it: the Bash tool has no network egress** ("Recv failure:
    Connection was reset", verified 2026-09-22). Load the live site in the browser pane
    and run both fetches from inside the page — same-origin, so `fetch(path + '?cb=' +
    Date.now(), {cache:'reload'})` gives the origin and a plain `fetch(path)` the edge,
    with `age` and `last-modified` off the response headers. Comparing bytes against the
    local file needs `.replace(/
/g, '
')` first: the working tree is CRLF and the
    served file is LF, which is one byte per line (5,559 of them) of pure noise.

## App Shape

Vanilla HTML/CSS/JS quiz for the German citizenship test, all 16 Bundesländer.

- No framework or build step.
- Visual styling: a **quiet bento** design system (redesigned 2026-07-16, minimalised 2026-09-19
  against `claude-context-kit/docs/reference/theme-{light,dark}.md`). One cohesive `<style>` block
  in `index.html` (no layered overrides — the whole block IS the system). POV: white/charcoal tiles
  on a flat canvas, **rounded-[16px]** (`--radius`), **8px** buttons (`--radius-ctl`, the logo
  kit's, and the header's two toggles), **pill** chips, and a
  **DISCIPLINED accent duo**: one **blue** primary + one warm **amber** pop. Two themes
  share the palette — DEFAULT = **light**, canvas **`#FFFFFF`** (ink `#0F1929`);
  `.light` is the default look; dark = **neutral charcoal** (canvas `#1A1A1A`).
  - **Light's canvas is WHITE and light nests DOWN from it** (2026-09-21, on request,
    against the mockup, whose page measures `#FEFEFE`). This reverses the direction of
    the old paper-grey system, and the whole light ramp was re-derived NUMERICALLY before
    any CSS was written: `--surface` `#FFFFFF`, `--surface2` `#E9F0F8` (1.15 below),
    `--surface3` `#DAE3F0`, `--hover` `#EEF3FA`, `--band` `#F5F8FC` (1.065 below the page,
    with a white card 1.065 back up out of it), `--border` `#E0E7F1` (1.245 on a tile AND
    on the page). The four tints deepened a rung with it — a `#EFF4FE` wash is 1.04 on
    white, i.e. invisible as a plate. **If the canvas moves again, re-derive the ramp with
    a script and check every value against the test's floors BEFORE writing a rule**: that
    is how these were picked, and it caught four failures on the first pass.
  - **At the top of the ramp a tile CANNOT step up, so the HAIRLINE carries it.**
    `--surface` IS `--canvas` in light, and `["surface", "canvas", NEST]` is the one FILL
    pair `contrast.test.mjs` deliberately no longer asserts — the reason is written into
    the list. This is the argument `theme-dark.md` §5 makes for dark being out of fill
    room at the BOTTOM, applied to light being out of room at the TOP. `border / canvas`
    is what holds it, at 1.245 against a 1.10 floor.
  - **The COLOURED palette is the landing-page mockup's; the dark GREYS are the
    reference's** (2026-09-21). The hues — blue, amber, green, rose, violet — come from the
    mockup and are shared by both themes. The dark neutrals do NOT: the mockup is
    light-only, and an earlier pass derived them from it by holding each measured
    luminance and changing only hue (slate, H 218). `theme-dark.md` §2 is explicit that
    this is the wrong move — "**greys are perfectly neutral**, R = G = B *exactly* ... no
    fashionable dark navy. A tinted dark grey photographs well in a mockup and goes muddy
    on a real monitor" — so **every dark surface, border and text tier is a true grey now**
    (spread 0 per channel, against 11-21 before). **If dark is ever re-tinted, that
    sentence is the answer.**
  - **The dark ladder is calibrated against `theme-dark.md` §1/§3/§4/§7, not eyeballed,
    and the PAGE SHADE is part of the calibration** (re-derived 2026-09-21). The page was
    `#10151D`, near-black, with `--band` recessed *beneath* it. **THE PAGE IS NOW THE
    DARKEST THING ON SCREEN AND NOTHING GOES BELOW IT** — see the ladder below. The rungs:
    `--canvas` `#1A1A1A` → `--band` `#262626` (1.15) → `--surface` `#323232` (1.18 on the
    band) → `--surface2` `#3B3B3B` (1.14) → `--surface3` `#434343` (1.13), the step
    shrinking with depth exactly as §3.a describes. **The band → surface rung is how the
    value was DERIVED and has had no instance on screen since the practise panel went**
    (2026-09-21): a tile's only ground is the page, at **1.36**, and `--band` now carries
    text alone. **`--hover` was the
    other failure and the more expensive one**: 1.182 on a tile, under §4's flat "**1.20 is
    the floor for a state change**", and `contrast.test.mjs` cannot catch it because
    `FILLS` asserts `STATE` at 1.08. It is 1.22. The tiers read 12.82 / 8.40 / 6.11 / 5.02
    on a tile (§2 warns that four greys at 9/8/7/6 read as one mushy grey), and
    `--muted`'s real floor is its LIGHTEST ground, `--surface3`, where it reads 4.72. Light was measured
    against its own reference too, and since its canvas went white (2026-09-21) a light
    card no longer clears it by FILL at all — see the hairline note above. Light's tiers
    read 17.6 / 10.1 / 6.2 / 5.2 on white.
  - **A tinted `--*-dim` plate is a FILL and has to behave like one.** The seven of them
    (`--accent-soft`, `--teal-tint`, `--gold-dim`, `--green-dim`, `--red-dim`,
    `--violet-dim`, `--blue-dim` — `--violet-dim` was deleted on 2026-09-21 when the
    icon plates went neutral and took its only consumer) sat **1.01-1.15** on a tile — invisible as fills, with
    the hue doing all the work — and came up with the page to **1.20** each, hue and
    saturation held, luminance moved. `--red`/`--red-text` and `--violet` lightened a hair
    with them (`#F87171` -> `#F98989`, `#A78BFA` -> `#B39CFA`) so their own text still
    clears AA on the risen ground, which is §6's "lighten it until it clears".
  - **A mode card's body copy is `--sub-text`, its meta and time are `--muted`.** They were
    `--muted` and `--faint`: `theme-dark.md` §2 puts a description in the SECONDARY band
    (7.3-10.2) and reserves ~4.7 for placeholder/disabled text, so the cards were painted almost
    entirely in the two quietest tiers. The icon and arrow chips' glyphs are `--sub-text` for the
    same reason.
  - **`--surface2` is a well INSIDE a tile, never a tile on the canvas.** The results screen's
    two breakdown tiles had overridden the shared tile rule back down to `--surface2` /
    `--border-soft` while sitting on the page: in light that is 1.03 fill and 1.04 hairline
    against the canvas, under `theme-light.md`'s 1.05 nesting and 1.10 hairline floors, and
    invisible beside the 1.11 every other tile manages. Dark hid it (1.30) because the dark ramp
    has the room. A tile on the page takes a
    top-of-ramp fill + `--border`: `--surface` everywhere, `--band` on the practise
    page since 2026-09-21. Never `--surface2`.
  - **Rounding is a three-step scale, one BUTTON value, and a pill — and nothing else.**
    `--radius-xs: 4px` (bars, tracks, swatches, the image inside an image option),
    `--radius-sm: 10px` (wells, nav cells, letter chips, thumbnails, `kbd`), `--radius: 16px`
    (every tile and card), `--radius-pill` (chips, badges, discs, the state picker).
    **`--radius-ctl: 8px` is the fourth value, minted 2026-09-23 on request against
    `docs/Mockups/ui/logo-kit.png`**: its Start Now / Learn More measure **7.8px on a 48px
    body** (anti-aliased coverage, all four corners). `.btn-primary`, `.btn-secondary`,
    `.session-back` and the header's EN box and scheme seg read it; buttons were full
    pills before that. It sits between two steps on purpose — snapping 7.2 (the 44px
    equivalent) to 10 would be 39% rounder than the mockup. `--radius-lg` and `--radius-xl` were deleted, and
    eight radii — five of them literals a token search never finds — collapsed into these.
    Nested corners follow **inner = outer − padding, snapped to the nearest step**: a 16px card
    with 14px of padding holds a 10px option, a 10px option with 10px of padding holds its
    image at 4px. A radius written as a literal is a bug, not a special case.
  - **In dark mode the HAIRLINE carries the app, because the fills cannot** (2026-09-20).
    `theme-dark.md` §5: "below ~1.20 between two touching surfaces, stop pushing the fills
    apart and draw the edge instead" — a tile sits **1.15** off this canvas, under that
    line — and the same section measures real dividers at **1.59-1.60 ON the panel they sit
    on**, "deliberately more contrasty than the panel-to-page step: it has to survive being
    one pixel tall". `--border` was **1.375** on a tile, well under that band, and that is
    the whole of why dark read flat while light did not. It is `#505050` now (1.59 on a
    tile, 2.16 on the page), with `--border-soft` 1.30 and `--border-hover` 2.00. The
    2026-09-21 neutralisation kept all three ratios and moved only the hue.
    **Raising the EDGE costs the text tiers nothing; raising the FILLS would have cost
    `--faint` its AA on `--surface2`** (measured 4.35). Light was left alone: its own
    reference says light "simply cannot make a 1.6 divider without it reading as a heavy
    rule", and a rendered audit found light clean.
  - **A home screen's type ladder is hero > section heading > card title > readout > body,
    and only ONE thing is biggest in a section** (2026-09-20). Four different things had
    all landed on `--fs-xl`: a section heading, the featured card's title, the overview
    counters and the ring's percentage — the scale colliding where it needs distinction,
    which is the exact fault the `--fs-*` ramp exists to remove, reproduced a level up.
    `.ds-num` and the featured card's title moved to `--fs-lg` (the card itself is gone as
    of 2026-09-21). A counter is a
    READOUT: it reports on its section and does not outrank the heading above it or the
    card you are meant to press — the same move `.stat-value` made on the quiz screen.
    **`.ds-num` went BACK UP to `--fs-xl` on 2026-09-22 and came down twice the same
    day, on request** — it is `--fs-md`. (The ring's percentage went to `--fs-xl` with the
    bigger ring on 2026-09-23 — see THE RING IS THE CARD'S HEADLINE.) The
    mockup measures a 23px digit, but the mockup's figure is one of three things inside
    a bordered tile with a plate and a sub-line to balance it; bare on the card the same
    22px read as heavy rather than as a readout ("cheap" was the word).
    The featured card kept its emphasis in hue, width and a solid Start pill, never size —
    and is retired; the five mode cards are peers.
  - **No drop shadows on a TILE, in either theme.** A tile is a fill plus a hairline, and
    there are still no `--shadow-*` tokens; do not reintroduce one for a tile. This rule
    always carried a condition — "light would only earn a shadow under something that
    genuinely floats, and nothing in this app does" — and for one day (2026-09-21 to
    2026-09-22) the second clause was false: `#prefsMenu`'s panel was an overlay above
    unrelated content, so `html.light .hmenu-panel` was **the app's one shadow**, scoped
    to light because dark's `--surface` is already 1.15 above its canvas and the fill
    separates it. **THE PANEL IS GONE and so is the shadow** — the language is a toggle
    pill now — so the rule is back to being absolute: **there is no shadow anywhere in
    this app.** The condition still stands if something genuinely floats again (and that
    literal would again be outside `LITERAL_PAIRS`, for the same reason `.brand-mark`'s
    flag is: a shadow carries no text, so there is no pair to assert) — but a tile that
    would like more presence is not that thing.
  - **In light EVERYTHING steps down; in dark everything steps up.** Light's page is
    white, so there is no "up": a tile is the page colour plus a hairline, `--surface2` is
    a well inset below it, and hover steps further down (`--hover`). In dark all of it
    goes up. Hover is a fill change, never a lift. (Until 2026-09-21 light raised
    surfaces UP towards white off a paper-grey page; the white canvas replaced that rule.)
  - **An answer option is a WELL on the canvas — `--surface2` in BOTH themes**
    (2026-09-21), with its letter chip and its hover and `:active` fills one rung up at
    `--surface3`. Light used to override this to `--surface`, on the argument that
    `--surface2` was #F4F7FA on a #F1F3F8 page — a 1.03 step, and the whole "washed out"
    look. **On a white canvas that argument inverts**: `--surface` IS the page and
    `--surface2` is a clear 1.15 step below it. Hover is NOT `--hover` here — that token
    steps DOWN from `--surface` in light, which from `--surface2` is both the wrong
    direction and a 1.03 step. The dimmed-after-answering state is a **text tier only**.
  - **Every text tier is a solid hex value, never opacity** — `--text` / `--sub-text` / `--muted` /
    `--faint`, all clearing 4.5:1 on both `--surface` and `--canvas` in both themes.
    `node --test tools/contrast.test.mjs` reads the tokens out of `index.html` and asserts it.
  - The theme wiring: the JS toggles the `.light` class and DEFAULTS to light (`initTheme` only
    goes dark if `localStorage.theme==='dark'`); an inline pre-paint `<script>` in `<head>` adds
    `.light` before first paint to avoid FOUC, and `setTheme` also updates `#themeColorMeta`.
  - Palette → legacy token names (JS writes these into inline styles, DON'T rename — the
    `--teal-*` and `--lime-*` names carry BLUE values now, and renaming them breaks the JS):
    **blue** = `--accent`/`--lime` (`#2563EB` light / `#70ADFA` dark; plus `--accent-text`,
    `--teal-deep`, `--teal-tint`, `--accent-fill`, `--accent-grad`, `--on-accent`); **amber** =
    `--gold` (`#B45309` light so it reads as text / `#F59E0B` dark; `--apricot`,
    `--apricot-deep`); `--blue` = info/time; semantic `--green` (correct, `#047857` / `#10C185`)
    / `--red`+`--red-text` (wrong, `#CC2020` / `#F98989`).
    **The four DARK hues are a rung lighter than the mockup's** (2026-09-21): dark's
    surfaces rose when the ladder was made monotonic, so `#60A5FA`, `#10B981`, `#F87171`
    and `#A78BFA` each gained a little lightness to keep AA on their own risen
    `--*-dim` plate — §6's "lighten it until it clears". Light is the mockup's exactly.
    **Light needs darker greens, ambers and reds than the mockup draws**, because the mockup
    only ever puts those colours on FILLS and this app uses them as TEXT tiers: `#10B981` is
    2.54 on white, `#F59E0B` is 2.15, `#EF4444` is 3.76. The accent itself needs no such
    correction — `#2563EB` is 5.17 on white, so it ships exactly as drawn.
    **`--accent-hover` is GONE too** (2026-09-21): it was the FEATURED exam card's hover
    fill and nothing else read it, so it went out with that card, along with the three
    `contrast.test.mjs` pairs that asserted the hovered tiers. `--accent-soft` stays — the
    resume banner, an exam-mode picked option and a navigator cell all sit on it. If a
    tinted fill ever needs a hover step again, mint it fresh; do NOT reach for
    `--accent-line`, which is a border value, and as a fill was a 1.27x jump in light and a
    saturated mid-blue in dark that put the tinted card's own description and meta under AA
    the moment you pointed at it.
    **A PRIMARY BUTTON IS `--btn-fill`, NOT `--accent-fill`** (2026-09-21): the mockup
    paints every CTA near-black navy (`#132338`, measured on Start Now, Start Practice and
    the CTA band alike) and reserves blue for tints, links and small discs. Light
    `--btn-fill` is that navy with `--on-btn` white; **dark holds the accent blue**,
    because a near-black button on charcoal is not a button. `--accent-fill` still exists
    and is still asserted — it is a picked option's letter chip and the mastery tile.
    **A SECONDARY button is the logo kit's Learn More** (2026-09-23): `--text` label, and
    in light a `--faint` slate edge (`--muted` on hover) rather than the 1.245 tile
    hairline — a white button on a white page has only its edge. Dark keeps `--border`.
    Both are the `--btn-edge` / `--btn-edge-hover` tokens, not `html.light` overrides.
    **The resume banner is the ONE exception** (2026-09-22, measured): its mockup paints
    Resume in accent blue (`#3474F8`, against light's `#2563EB`), because the banner is
    already an `--accent-soft` tint and a near-black slab in the middle of it reads as a
    hole rather than a button. `.resume-banner .btn-primary` overrides the fill there and
    nowhere else.
    **`--ink-tile` and `--on-dark` are GONE** (2026-09-21): they existed only for the header's
    charcoal `E` tile, the brand mark was the German flag (and is the logo kit's E since
    2026-09-23), and nothing else read them. The
    two token pairs and the `#fff` literal that asserted the old mark went from
    `contrast.test.mjs` with them.
  - Type: **Bricolage Grotesque** (`--font-head`, display + big numbers) + **Inter**
    (`--font-body`) + **Caveat** (`--font-hand`, added 2026-09-21 for the landing page's three
    script margin-notes — read by `.script-note` alone and NEVER inherited by body copy); `--font-mono` is
    aliased to Inter (kept only so JS refs resolve). All three arrive in **one** Google Fonts
    `<link>`; keep it one request when adding a face. Display
    weights top out at 700. Uppercase micro-labels take `--ls-caps` (0.06em) and share one rule (`.stat-label` and its list; `.eyebrow` is GONE — see the landing page
    + shared list).
  - **There is a SIZE system now, and it is measured** (2026-09-20), against
    `claude-context-kit/docs/reference/type-and-space.md` — four shipping design systems
    (Stripe Sail, GitHub Primer, Linear, Khan Wonder Blocks) read out of their live DOM, token
    layer and rendered layer both. `node --test tools/scale.test.mjs` enforces it as a ratchet.
    `docs/plans/sizing-system.md` is the phased plan; **all six phases are done**.
    - **Compare the LINE BOX, not the ratio.** All four references land their dominant UI line
      at 19.5-21px whatever ratio gets them there. This app was `16px x 1.6 = 25.6px`, ~25%
      taller than any of them, paid once per line everywhere. `body` is `--lh-ui` (1.3) = 20.8px.
      Three leadings: `--lh-tight` (1.15, display numerals and the hero), `--lh-ui` (the
      default), `--lh-prose` (1.55, and ONLY running text — `.hero-lead`, `.mode-description`,
      `.section-head p`, `.explanation-text`, `.review-explanation`, `.question-english`).
      Unitless on purpose: a length would be inherited verbatim by a 12px label.
    - **`--fs-2xs` (12px) is the FLOOR, and NOTHING is exempt.** Of the four references
      three render nothing below 12px and the fourth stops at 13; the 11px tokens that exist
      went unused on every page measured. `TYPE_EXEMPT` existed twice in one day, both times
      for the overview card's names (`.ready-ring-sub` at 9px, then it plus `.ds-label` at
      11px), and **what retired it was FORMAT, not size**: those four are the verdict
      paragraph's rule now — `--fs-xs`, 400, no uppercase, no tracking — which is quieter
      AND narrower than 11px uppercase was, on a scale step. A tracked capital is wide.
      **If one is ever needed again it is a NAMED SELECTOR, never a budget of 1** — a
      budget says "one is tolerated" and invites a second where a selector says which and
      why (`ICON_EXEMPT` keeps the shape). NINE steps, 12/13/14/15/16/18/22/28/36, plus one `--fs-hero` clamp —
      `--fs-3xl` (36px) was minted for the score ring and the landing page's four
      headline numbers are its second consumer.
      **A font-size written as a literal is a bug**, exactly as a literal radius is.
    - **`--space-*` gained its missing rungs** (2, 4, 12 — it jumped 6 -> 8 -> 16, which is
      *why* half the sheet reached for a literal). The old `--spacing-*` aliases are GONE —
      nothing reads them. In the references ONE value carries 86-88% of a page's gaps; a flat
      gap histogram means the scale is not being used.
      **`--space-3xl` (56px) was minted on 2026-09-22, on request, and it is PAGE rhythm**:
      the gap between two titled sections (`.home-section`, up from `--space-xl`) and the
      run-out under the last one before the footer (`main`'s `padding-bottom`, up from
      `--space-2xl`). Nothing inside a card may reach for it — a component's rungs stop at
      40. `SPACE_SCALE` in `tools/scale.test.mjs` gained 56 in the same commit, which is
      what keeps `offScaleSpacing` at 0 rather than hiding a literal.
      **The end of the page is a BIGGER break than the one between two sections**: at 40/40
      the last card sat as close to the footer as the sections sat to each other, which
      reads as one more section rather than as the end.
    - **`--ctl-md: 44px` is a token, not just a media query.** Primer and Linear both publish
      their touch target as one. Four heights: 28 / 36 / 44 / 52.
    - **An icon size is `--icon-*`, a hit target is `--ctl-*`, and neither is a literal**
      (2026-09-20). Nine glyph sizes (14/15/16/17/18/20/22/24/28) were doing five jobs;
      the scale is `--icon-xs` 14 / `-sm` 16 / `-md` 18 / `-lg` 22 / `-xl` 28, mapped
      nearest-with-ties-down so nothing moved more than 2px. Four sizes
      render now. A glyph box with no plate is the same size as its glyph, so one token
      serves both. **Not icons, and deliberately still literals**: the two ring diameters
      (layout), the 6px scrollbar, the 7px caret, `.sr-only`'s 1px and `.opt-letter`'s 26px
      well — `literalIconSizes` in the test exempts exactly those.
    - **Two gap rungs should carry the page.** The references measure one value at 86-88%
      of all rendered gaps (Khan: 8px, 1470 of 1661). This app merged its two near-invisible
      rungs away — 2px into 4px and 6px into 8px — taking rendered gaps from six rungs at
      67% to **five at 74%**. It stops there on purpose: the remaining distance to 80% is
      the 4px-vs-8px distinction, and collapsing that would loosen every tight label/value
      pair in the app to buy a number. **Compare rendered instances, not declared rules** —
      the reference's 88% counts elements, and an early attempt to score it off the
      stylesheet was measuring something else entirely.
    - **Tracking is assigned by TIER, never per component** — per-component is how this
      reached eleven values. `--ls-caps` / `--ls-normal` / `--ls-display`.
    - **Phase 1's leading fix bought only 3% of the page height** (2.46 -> 2.38 screens
      desktop). Height here is dominated by explicit padding, margins and fixed heights, not
      inherited leading — `.dash` and `.topic-chip` did not move a pixel. The density work was
      phases 3 and 5; do not expect type changes to shorten the page.
    - **The ramp is fully applied (phases 2-5 done 2026-09-20).** Every budget in
      `tools/scale.test.mjs` is at target: 0 literal font-sizes, 0 tiers under 12px, 0
      off-scale spacing, 2 tracking values, 1 remaining `min-height` literal (the 120px
      placeholder under a MISSING option image, which is a box and not a control).
    - **The quiz screen's hierarchy is the right way up now.** `.question-text` is 18px and
      the largest text on the screen; `.stat-value` came DOWN from 20.8 to 16 and the answer
      options went UP from 14.4 to 16. Emphasis is made by lowering chrome, never by
      inflating content.
    - **A label that has to break the type scale to fit its container does not belong inside
      it.** The accuracy ring's caption was 9.6px because "Trefferquote" sets 106px at 12px
      inside an 88px dial. The percentage stays; the NAME moved to the wrapper's
      `aria-label`/`title`, where the longest German compound costs nothing. `.ready-ring-sub`
      is gone. **It came back on 2026-09-21** when the overview card was rebuilt against
      its mockup — and this measurement is exactly what it cost: a 104px dial, a
      separate `dash.accuracyShort` whose
      German is "Quote". It was 9px, then 12px, then 11px in a single day, and it is the
      **verdict paragraph's rule** now — `--fs-xs`, 400, sentence case — shared with
      `.ds-label`, so the dial's caption and the three readout names are one declaration.
      Dropping the uppercase is what made the fit a non-question: "Accuracy" sets **58.2 in
      an 83.7px chord** and "Quote" 37.1. The wrapper is still
      `role="img"` with `aria-label="0% Accuracy"`, so a
      screen reader gets the whole word whatever the caption says. A label with something
      to say still moves out; this one has nothing.
    - **On a phone the answered readout shows its figure and hides its word**
      (`.stats-bar .stat:last-child .stat-label`). Once the labels cleared the 12px floor the
      four readouts no longer fitted one 360px line in German — and the LABEL is what is wide,
      not the number ("Beantwortet" alone is ~100px). `n / total` is the one readout that
      names itself beside Richtig / Falsch / Score, so it is the one that can give the word up.
    - **A token must never be minted larger than the value it replaces IN SILENCE.**
      `--fs-hero` was first written as `clamp(1.75rem, 3.2vw, 2.5rem)` and undid the phase-5
      headline cut it was supposed to carry — the hero measured 283px on a phone while the
      plan and the commit both claimed 249. Phase 5's own value was
      `clamp(1.6rem, 3.6vw, 2.4rem)`.
    - **The display tier above 22px was raised back up on 2026-09-21, on request, against
      the mockup.** Measured at 1.14x (the mockup's 928px column against this app's 1060px)
      the landing page came back 1.3-1.5x short of it everywhere above the body tier: the
      hero at 38px against 59, the three section headings at 22 against 30, the four
      headline numbers at 28 against 39. So `--fs-hero` is `clamp(2rem, 5.2vw, 3.5rem)`
      (56px desktop, 32 on a phone), `.section-head h2` and `.cta-copy h2` take `--fs-2xl`,
      and `.stats-num` takes `--fs-3xl`. The BODY tier did not move — phases 1-5 were about
      line boxes and padding, and none of that was reopened. The page grew 1564 -> 1753px
      desktop (+12%) and 3.31 screens at 375px **as measured that day**. It has moved
      several times since (the why band's air, the footer, the hero crop); the landing
      tier measures **1926px / 2.14 screens at 1280x900 and 3328px / 4.10 screens at
      375x812** today. Re-measure rather than quoting either number.
    - **A coarse-pointer override must be a RUNG ABOVE its base, or it does nothing.** Mapping
      `.option-btn`'s 48px coarse height onto `--ctl-md` gave it the 44px its base already had,
      so the rule set the value it already carried and the documented thumb bump vanished in
      silence. It is `--ctl-lg` now. Check any `@media (pointer: coarse)` rule against the base
      it is meant to raise.
    - **`offScaleSpacing: 0` does not mean spacing is tokenised**, which is why
      `literalSpacing` exists beside it: an on-scale literal like `gap: 8px` clears the
      off-scale check and still bypasses the tokens. Two literals are left by design — the
      results band's 1px separator gap, a hairline with no rung to snap to.
    - **A snapped value's ties go DOWN**, toward density. Genuine functional clearance is NOT
      snapped — the state picker's caret room is
      `calc(var(--space-xl) + var(--space-sm))`, which keeps the value and still kills the
      literal.
    - **The hero is a headline, a sentence and one button.** Its badge and its four-item
      trust row both restated that sentence and cost 83px between them; `hero.badge` and
      `hero.trust1`-`4` are gone from `I18N`. The hero is 350 -> 227px.
    - **`.dash`'s height IS the accuracy ring plus padding** — nothing else in the band is
      taller — so the ring is the only thing that can shorten it (112 -> 88px; on a phone it
      was 128px, *larger* than the desktop's, and is now 96). **Superseded 2026-09-21**: the
      card is four tiles with its own heading now, the ring is 104px at every width (152
      since 2026-09-23), and
      the verdict beside it is as tall as the ring.
    - **A topic chip is a chip, not a row.** `.topic-grid` is
      `repeat(auto-fit, minmax(230px, 1fr))`: five topics took three rows of 526px-wide
      "chips" in two columns, and now take two rows of four.
  - Icons stay **inline SVG** via `ICONS`/`_svg()`, solid fills (NOT Phosphor/Iconify — offline-first, Google
    Fonts is the only external dep). Catalogue images always show in **true colours**.
  - NOTE: ring/score geometry (`.ready-ring*` r=50→C=314, `.score-ring*` r=60→C=377) is preserved
    so the JS ring animations still work — keep the `stroke-dasharray` values.
    **The WINDOW onto that geometry is what you move, not the geometry** (2026-09-22):
    the viewBox is cropped to the ink so the drawn circle fills its box. It is
    `1 1 118 118` since 2026-09-23, because the pass-mark tick and the knob reach r = 58;
    r, C and the dasharray are untouched.
- **EVERY TEXT BUTTON IS ONE SIZE: 44px tall, a 15px/600 label, 28px a side, a 16px
  glyph, 8px corners** (2026-09-23, on request: "determine an ideal text size and button
  size ... set a standard rule ... apply it across the app"). That is `--ctl-md`,
  `--fs-base`, `--space-xl`, `--icon-sm`, `--radius-ctl`, all on the base
  `.btn-primary, .btn-secondary` rule. **There is no `.btn-sm` and no `.btn-lg` any more**,
  and every per-context size override went with them: the hero pair's 12px label, the
  quiz nav's and the results actions' 36px/13px, the resume banner's 13px, the CTA
  button's 18px glyph, and the two coarse-pointer bumps that existed only to undo those.
  **The reasoning, reconciled rather than picked:**
  - both mockups (`landing-page.png`, `logo-kit.png`) draw every button 48px tall with
    a label whose cap height is 11px — **15px** — and ~33px of side padding (0.69 of the
    height; 30 at 44, and `--space-xl` is the rung under it);
  - `type-and-space.md` puts the chrome tier at 13-15px, names 44px as the touch target
    in two of four systems, and Khan — the one learning app among them — renders its
    buttons at 40/44 with a 16px label;
  - 44 is this app's touch floor, so ONE size needs no coarse bump and puts nothing a
    thumb presses at 36px, and 15px stays under the 16px answer options and the 18px
    question, so a button never outranks the content it acts on.
  **Only the side padding responds to width**: `--space-md` below 620px and
  `--space-sm` below 360px (the nested block), because "Jetzt starten" and its arrow
  are 118px against 108 of room at 320. The height and the label never shrink.
  **The header's `.session-back` is NOT a text button in this sense** — it is header
  chrome at `--ctl-sm` beside the brand and the toggles, and it kept its size.
  - **Buttons stay SIDE BY SIDE on a phone** (2026-09-23, on request). The hero pair
    used to go `flex-direction: column` at full width below 620px; it is one row now,
    split evenly with `flex: 1 1 0`. Measured one line, 44px each, in both languages at
    375 and 320. The results screen's three actions put two on the first line and wrap
    the third — three cannot share 343px at 15px, and that is what `flex-wrap` is for.
    **`.btn-group` is deleted**: its phone rule stacked buttons full width, and nothing
    in the markup used it.
  - **`.cta-btn` carries only `flex: none`** (and its 620px `width: 100%`, which is a
    single button, not a pair). Its dead `min-height` / `padding` / `font-size` were
    found by MEASURING — they lost to `.btn-lg` on source order at equal specificity,
    and `scale.test.mjs` cannot see a cross-scope duplicate. With `.btn-lg` gone the
    lesson stands: size a button on the base rule, never on a context selector.
- **In a session the page keeps wider side gutters** than Home or Practise: `--space-xl`
  (28px) rather than `--space-lg`, because the question is the only thing on screen and
  should not run to the edges. Below 620px it drops back to `--space-md`.
- **Mobile is a first-class layout, not a fallback.** Every control is at least 44px tall
  **on a coarse pointer** (`.btn-*` are 44 on every pointer since 2026-09-23, `.state-picker` — which
  is `--ctl-sm` with a mouse since 2026-09-22 and `--ctl-md` under
  `@media (pointer: coarse)`; the header's two toggles are the `--ctl-sm` exception, see
  below); `#stateSelect` is `font-size: 16px` so iOS Safari
  does not zoom on focus, and that is NOT a visual choice to be scaled down with the rest
  of the pill; the keyboard hint is hidden under `@media (hover: none)`; `main` and the
  header respect `env(safe-area-inset-*)`. Under 620px the mode cards become a single-column list
  (icon beside the title), the three overview readouts **stay in ONE ROW**
  (**re-reversed 2026-09-22, on request** — they were three columns, then a column of
  rows from 2026-09-21 because at 12px/600 `BEANTWORTET` set 109 in an 85px box, and
  they are a row again now that the labels are the verdict paragraph's `--fs-xs`/400
  sentence case: the widest German one, `Wiederholung`, measures **86.1** (97.4 while it
  was 11px uppercase) and the card's 311px holds all three with room over — **at 320px
  too**, measured. **They are CENTRED rather than `space-between`** (2026-09-22, on
  request): pinned to the edges they read as a table rule across the card, and centred
  they keep room either side — 22px in English, 12.3 in German, with a `--space-xl`
  column gap between them (2026-09-22, raised from `--space-lg` on request, so they read
  as three separated figures rather than one run of text). **That gap costs the 320px
  case**: 284.3px of content and gap in a 256px card, so down there the third wraps to
  its own line, which is what `flex-wrap` is for. At 375 all three hold one row in both
  languages. **And the summary STACKS**: side by side the ring and its
  sentence measured 104 + 16 + 189 = 309 inside a 311px card, which is not centred in any
  meaningful sense, it is edge to edge. Stacked and centred, both sit on the card's axis
  and the sentence gets the full width, which puts it on ONE line in both languages.
  **It is a FLEX row, and a grid cannot do it**: `.dash-summary` spans `1 / -1`, and a
  spanning item distributes its size across every track it spans EQUALLY, so all three
  columns came out 97.7 whatever the track sizing said — 0.3px round the German word,
  which is luck rather than clearance. Flex sizes each readout to its content,
  `space-between` puts the leftover between them, and `flex-wrap` is the 320px escape:
  there the third takes its own line instead of a German word breaking mid-word), and the exam timer goes
  to one line. The quiz readouts drop their hairlines and tighten to a `--space-sm` gap so all four stay
  on ONE line in both languages at 360px — they are the one thing on that row worth reading, so
  the numbers went UP rather than down (they are `--fs-2xs` today). The header goes the other way: it is a strip
  you glance at, so `.header-controls .seg-btn` is `--ctl-xs`, `.session-back` `--ctl-sm` and the
  brand mark `--ctl-xs` — stated in the 620px block, after the coarse-pointer floor, so source order decides.
  **There is no `.header-cta` any more** (2026-09-21, on request). The header used to end
  in a "Start practising" pill beside the controls; the hero's own Start sits ten pixels
  below it, so it only ever repeated something already on screen. `nav.startPractice`
  went with it; `cta.button` is a different string and stays. The nav's Practise link
  is not its return: it goes to another PAGE rather than restating a button on this one.
  - **The header nav is TWO REAL LINKS: Home and Practise** (2026-09-21). They are the
    app's two pages, they carry `data-screen`, and `showScreen()` calls `syncNav()`, which
    moves `.nav-link--active` and `aria-current="page"` between them. **`.header-content`
    is a `1fr auto 1fr` GRID** (2026-09-23): brand / back button in column 1, the nav in
    column 2, the controls in column 3 (`justify-self: end`), so the nav is centred on
    the PAGE and the scheme seg sliding open cannot push it (measured: 565-700 closed and
    open at 1280). It replaced `margin-inline: auto` in a flex row, which centred the nav
    between its neighbours and would have walked it 36px on every hover. On a phone the
    `1fr` columns are too narrow for the open seg, so there the controls column grows and
    the nav slides over with it — tap-triggered, and animated by the same transition. It
    is hidden by `body.in-session`.
  - **About and FAQs are GONE** (2026-09-21, on request), and with them `.nav-soon`, the
    `.nav-link[aria-disabled="true"]` state rule and `nav.navAbout` / `nav.navFaqs` /
    `nav.soon` / `nav.soonTitle`. They were `aria-disabled` buttons wearing a "Soon" chip
    for pages that do not exist. **If either is built it comes back as an ordinary
    `.nav-link` with a `data-screen` and a screen behind it** — not as a promise.
  - **BOTH NAV LINKS ARE `--text`, and the underline alone marks the page**
    (2026-09-23, on request: Practise "should also be in black"). `.nav-link--cta` is
    **gone** — the accent, its `brightness()` hovers and the active override with it. It
    had drawn Practise louder than Home in `--accent-text` since 2026-09-21. Hover steps
    the label back to `--sub-text`; with both links already the darkest tier there is no
    darker state to step to. It is inside `@media (hover: hover)`: on a touch screen a tap
    leaves `:hover` stuck on the link just made active, which would grey the current page. **The old `brightness()` lesson still holds anywhere it is
    tried again**: a filter on TEXT is a contrast change `contrast.test.mjs` cannot see
    (`brightness(1.12)` put `#2563EB` at 4.36 on white) — change a token instead.
    `accent-text / canvas` is still asserted, for any accent word straight on the page.
  - **The active nav link carries `aria-current="page"`.** The underline is the only other
    thing that says which page you are on, and it is not available to a screen reader.
  - **THE UNDERLINE BELONGS TO THE WORD, NOT TO THE BOX** (2026-09-22, on request:
    "the underline ... should stay closer to the text"). It was `box-shadow: inset 0 -2px
    0`, which draws along the bottom edge of the control — and the control is a 36px hit
    target around a 14px label, so the rule sat ~9px under the word. It is
    `text-decoration: underline` with `text-decoration-thickness: 2px` and
    `text-underline-offset: 5px`: native, it tracks the text at any size, it skips
    descenders, and — the reason the box-shadow was chosen in the first place — it still
    adds nothing to the control's height. It takes `currentColor`.
  - **The nav and the toggles sit on the strip's CENTRE line** (2026-09-23, on request:
    "quite close to the border"). This reverses 2026-09-22's "a bit closer to the header
    border line downwards", which put them 8px low with `align-self: flex-end` plus a
    `-4px` margin and left the nav box 4px off the hairline. Plain `align-items: center`
    now: brand, nav and controls share one centre (30 at 1280, 34 at 375, measured) and
    the nav box ends 12px above the hairline.
  - **THE TWO TOGGLES ARE THE USER'S REFERENCE** (2026-09-23, from a screenshot, after a
    first attempt was reverted). Read this before touching them — the first attempt
    misread "remove the colour" as removing the ACCENT, and it meant the FILLS:
    - two hairline boxes (`--border`), **no background and no chip**, `--radius-ctl`
      corners, both 36px tall (`--ctl-sm`): EN is a SQUARE box, the seg is three
      36px-wide cells with no padding (34 tall inside the seg's own hairline),
      `--space-md` between the two (the reference's
      gap, ~0.46 of the box). The coarse-pointer rule for the seg is gone — the base is
      already 36 — and the nested 360px block still narrows the cells to 28.
    - **GREY ONLY — NO BLUE ON EITHER TOGGLE** (2026-09-23, on request: "the toggle icons
      should not have any blue accent colors, just grey"). EN is `--text` at 700, and
      the chosen mode is `--text` in a BOLDER line; **the other two are `--muted`
      LINES**. Darker and bolder against lighter and thin is the whole selection
      signal — the same answer to "darker and bolder" the brief asked for at the start.
      (The accent was on both for part of the day; `#schemeSeg .seg-btn.active`'s accent
      rule is deleted.)
    - **THE THREE GLYPHS ARE LINE ICONS, TAKEN FROM THE REFERENCE** (2026-09-23, on
      request: "the toggle icons should be directly taken from the screenshot"). A ring
      with eight separate short rays, a rounded screen on a neck and base, a crescent —
      drawn as geometry only, wrapped by `_line()` (`fill="none"`, `class="icon-line"`)
      rather than the solid `_svg()`, and stroked by the global `.icon-line` rule
      (`stroke: currentColor; stroke-width: 2`, round caps and joins), so no markup
      carries `stroke="currentColor"` and that grep still comes back empty. Global, not
      scoped to the seg (2026-09-23, from the review of #103): under `_svg()` and a
      seg-only stroke, the same glyph anywhere else rendered as a lone disc or a slab.
      **The chosen glyph is BOLDED, not filled** (2026-09-23, on request): `.active svg`
      takes `stroke-width: 2.75` against the resting 2. **Only the SUN also fills** —
      `#lightBtn.active svg > :first-child`, its r 4 disc, which is too small to read
      as bold. A filled screen or crescent read as a solid blob, and the user asked for
      an outline there; do not restore the fill for those two. They live
      in `tools/icon-packs.mjs`'s `line` pack now, and the shipped strings were
      checked against the generator's output.
      **Redrawn to the reference's proportions the same day** ("replicate exactly as I
      showed"): rays from r 10 to 8 round an r 4 ring, a wide 20x14 screen on a neck and
      base, and a full crescent — outer disc r 9, bitten by the circle through its top
      and right points (r 6.36), so the inner edge passes through the icon's centre.
      The reference was never on disk, so this is drawn to its proportions by eye, not
      traced from its pixels.
    - 16px glyphs (`--icon-sm`) and a 12px code: the sun draws 20 of its 24 units, so
      it is 13.3px in the 36px box — the reference's 0.37 — and the code is its 0.33.
    - **They sit ON THE NAV'S LINE**: `.header-controls` carries the nav's own
      `min-height` and both are centred in the row, so in a session (no nav) they are
      on the back button's line with no override.
    - **THE SEG SHOWS ONLY THE CHOSEN MODE, and slides open** (2026-09-23, on request).
      The other two cells are `max-width: 0; opacity: 0` and transition to
      `--ctl-sm` (max-width, not width, so the 360px block's 28px cells still win).
      It opens on `:hover` (inside `@media (hover: hover)`), on keyboard focus
      (`:has(:focus-visible)` — the hidden cells stay in the tab order, and focusing one
      is what opens it), and on a TAP: the first tap on the
      collapsed seg adds `.open` (the button's own listener just re-applies the same
      mode), a second tap chooses and closes, and a `pointerdown` outside closes it.
      **A "tap" is decided by the `pointerType` of the seg's own `pointerdown`** — touch,
      pen, or a mouse where `(hover: hover)` is off — **never by the media query alone**:
      a touchscreen laptop reports hover, so its finger taps could never open the seg
      (2026-09-23, from the review of #103). A keyboard click has no pointerdown and is
      always a choice.
      **`.picked` closes it straight after a choice** while the pointer or focus is still
      on it; `mouseleave` and `focusout` clear it. Not `:focus-within` — Chrome focuses a
      clicked button, so the seg would stay open after the mouse left.
      **The chosen cell is `order: 1`, i.e. LAST.** The controls are right-aligned, so
      the seg opens leftward; with the sun first, opening slid it 72px away and put the
      moon under the cursor, and a quick click picked dark. Last, the chosen cell stays
      put. The cost: the open order depends on the mode, and it no longer matches the
      Tab order. EN still slides left when the seg opens.
      **`.open` and the `:has()` rule are TWO rules, not one list**: a browser without
      `:has()` drops a whole selector list, which took `.open` with it and left a touch
      reader on old Safari unable to change the theme at all.
      **`initTheme()` runs BEFORE the first `syncHeaderHeight()`**: that `offsetHeight`
      forces a style pass, and if it saw the markup's default (light) the collapse
      transition played on every load for a dark or system reader.
      Measured fit, open: 375 and 320 in both languages with no overflow (the nav clears
      the brand by 10.9 at 320 in English).
  - **TWO CONTROLS, BOTH IN THE ROW AT EVERY WIDTH: an EN code and a sun/monitor/moon
    seg** (2026-09-22, on request, against a reference UI). The globe `<details>` that
    held the language — and, on a phone, the theme seg as well — is **gone**, and with it
    `.hmenu-*`, `#langBadge`, `#schemeLabel`, `syncThemeControlPlacement()`, the two
    listeners that closed it on an outside click or Escape, the app's one shadow, and the
    `nav.language` / `nav.preferences` strings.
    - **A disclosure to choose between TWO things spends a click.** `#langToggle` shows
      the current code and flips on press (`toggleLang()`); it is `--text` at 700 (the
      accent until 2026-09-23), a readout of what you are reading IN, not an offer.
      `paintLangControls()` still owns its face — a language CODE is identical in both
      languages, so `applyStaticStrings()` must not — and it also writes the
      `aria-label`, which DOES translate ("EN – Switch to German" / "DE – Auf Englisch
      umschalten"): a box already showing "EN" has to say what pressing it does.
      **The name STARTS with the visible code** (2026-09-23, from the review of
      #98-#102): WCAG 2.5.3 needs the accessible name to contain the visible label, or
      a voice-control user's "click EN" matches nothing.
    - **THE SCHEME HAS THREE MODES NOW — light / system / dark.** `system` follows
      `prefers-color-scheme` and keeps following it: the OS can flip while the tab is
      open, so `_schemeMql` is LISTENED to and not just read, and the listener acts only
      while the mode in force is `system` — `_themeMode`, held in memory, so the
      listener never reads storage. **Every theme access to `localStorage` is
      try-guarded**, like every other key: `initTheme()` runs at the top level before
      `loadQuestions()`, so one unguarded throw in a storage-blocked browser killed the
      whole boot. **The listener falls back to `addListener`**, for the same reason:
      `MediaQueryList.addEventListener` is Safari 14+, and Safari 13.1 parses this script
      and would then throw at the top level. **The DEFAULT did not change**: nothing stored
      is still light, so a first visit looks exactly as it did. **The pre-paint script in
      `<head>` has to agree with `initTheme()`** or a system-dark reader gets a white
      flash before the JS runs. *The change EVENT cannot be verified in the preview
      pane* — a `matchMedia` change listener does not fire under its emulation (the same
      gotcha that made `syncNavHeaderRole` use `resize`), so `matches` flips and nothing
      is delivered; `setTheme('system')` was called by hand against a dark
      `prefers-color-scheme` to prove the body of it.
    - **Icon-only buttons carry their names in `aria-label`** (`nav.light` /
      `nav.system` / `nav.dark`). The seg is 110px open (86 below 360px) and 38
      collapsed, and EN 36, where the globe summary was 92 — that is what buys the
      phone's two nav links.
  **Its rules sit AFTER `.btn-primary` in the sheet**; both are single classes, so above it
  the rule lost every declaration to the base below and the button rendered at 44px.
  The **brand mark is the logo kit's E** (2026-09-23; it was the flat German flag in a
  rounded square before that) in a `--ctl-sm` box, beside a
  `.brand-lockup` of `EIB Quiz` over the `nav.tagline` line. The name is markup, not `I18N`:
  a product name is not translated. The tagline is hidden below 620px, and since 2026-09-22
  **so is the NAME** — the mark alone stands for the brand on a phone, and the 62px
  that frees is part of what pays for two nav links down there. `html { overflow-x: clip }` is the backstop, not the plan — check `scrollWidth` at
  375px after any layout change.
- **HOME AND PRACTISE ARE TWO SCREENS** (2026-09-21, on request — this replaces the
  two-tier home screen that `docs/plans/landing-page-refactor.md` describes).
  `#homeScreen` is the marketing landing page, for everyone, always. `#practiseScreen` is
  the app: **Where you stand · the mode band · the topic reveal · Past rounds & glossary**.
  Both are `.screen` elements and `showScreen()` swaps them like any other.
  - **`hasProgress()` and every `data-tier` are GONE.** The switch existed to choose which
    half of one screen to show; with a page each there is nothing to choose, and the
    marketing no longer disappears for a returning learner — they navigate past it. The
    rule that "it is one list, not two" retires with it: there are two parents now, and
    the mode band lives in exactly one of them.
  - **`PAGE_SCREENS` is what `body.in-session` is computed from**, not
    `screenName !== 'home'`. A page scrolls, keeps the footer and keeps the nav; a session
    is locked to the viewport with a back button where the logo is. The old test would
    have locked the Practise page to the viewport and hidden the very nav you arrived by.
    **Add a third page, add it to that set.**
  - **Leaving a round returns you to Practise, not Home.** Both `#sessionBack` branches
    call `showScreen('practise')`: you came from the app, and the sales pitch is not where
    a finished round belongs.
  - **Both landing CTAs NAVIGATE now.** The hero's Start now and the CTA band's button
    call `showScreen('practise')`; they used to `scrollToId('homeMain')`, and `#homeMain`
    is gone with them. **"Learn more" is the one `scrollToId()` left**, so the rule is
    `#whyBand { scroll-margin-top: var(--header-h) }` — the token, because
    `syncHeaderHeight()` measures the real strip and a phone's is 65px against the
    desktop's 76. A new scroll target still has to join that selector or it lands behind
    the header.
  - **A load failure is not a tier either.** `initHomeScreen()` hides every
    `#practiseScreen [data-needs-data]` section when `loadFailed` and puts the error in
    the mode grid. Those sections all read the question pool, so with no catalogue they
    are empty headings stacked over an error message.
    - **And the error has to be on the screen the reader is LOOKING at** (2026-09-21).
      The mode grid is on `#practiseScreen`, and a failed load happens while they are on
      Home — so the landing page rendered hero, why, numbers and CTA as if nothing were
      wrong, with a working Start button and the error on a page they had no reason to
      visit. Before the split the grid WAS the screen they were on, which is why this
      was invisible. `initHomeScreen()` now calls `showScreen('practise')` when
      `loadFailed` and the reader is on Home.
    - **`startMode()` carries the guard, because the FOOTER calls it directly.** Its four
      Practise links sit under the landing page and bypass the mode grid entirely; with
      an empty pool they started a quiz screen with no question, no explanation and no
      error — verified, and it throws nothing, which is what made it quiet. One
      `if (loadFailed) { showScreen('practise'); return; }` at the top of `startMode()`
      covers the footer, the cards and every other caller.
  - **`[hidden] { display: none !important }` is in the reset, and it is still
    load-bearing** — the sections set their own `display`, which beats the UA's rule.
  - **`renderHomeStatus()` still early-returns on `el.closest('[hidden]')`**, which now
    covers the load-failure case, and covers `onStateChange()` as well as the door.
  - **`initHomeScreen()` is still the one door that repaints Practise.** Callers do not
    call the individual renderers. The NAME is unchanged deliberately: a dozen call sites,
    one screen split.
  - **ON A PHONE THE NAV SHOWS BOTH PAGES, exactly as the desktop does** (2026-09-22, on
    request). This is the third answer here and every one of them was a WIDTH problem, so
    read the ledger before changing anything in that row:
    1. hidden outright, while the row carried brand + globe menu + a two-word theme seg;
    2. ONE item — the page you are NOT on, via
       `.header-nav .nav-link--active { display: none }` — once the seg moved into the
       menu;
    3. both, now that the menu is a 46px EN pill and the seg is three icons.
    **WHAT PAYS FOR IT, measured at 375px**: the globe summary (92) became the EN pill
    (46), the theme seg came back into the row (+92 against the menu it was hidden in),
    the nav's own gaps and padding tightened, and **the BRAND NAME went the way of the
    tagline** (-62) — the mark alone is still the way home from anywhere. The row
    ends at 359 in a 359px box with 14.8px of slack between the nav and the pill, and
    German is narrower than English here ("Start"/"Üben" against "Home"/"Practise").
    **Below 360px it needs three more trims** and gets them in a nested
    `@media (max-width: 360px)`: half the side gutter, a tighter gap between the three
    groups, and `--ctl-xs`-wide scheme buttons (28x36, still over the 24px WCAG 2.5.8
    floor). The row needs 361.5px as it stands, which is where that number comes from —
    at 320 it then ends at 296.7 in a 304px box. Measured at 320 / 360 / 375 in both
    languages, with nothing clipped at any of them.
    **Do not add a fourth item to this row without taking one out.**
    `body.in-session .header-nav { display: none }` still wins in a round.
- **The LANDING PAGE is a hero, why, four numbers and one last call.** (The mode band left
  it for `#practiseScreen`; the notes below still describe the same components.)
  - **NO GREY LABEL SITS ABOVE A HEADING ON THE LANDING PAGE** (2026-09-23, on request).
    The hero's "Your step towards a brighter tomorrow", the why band's "Why EIB Quiz?"
    and the CTA band's "Ready to get started?" are deleted, with `hero.eyebrow` /
    `why.eyebrow` / `cta.eyebrow` and the four `.eyebrow` context rules. They were the
    last `.eyebrow` elements in the app, so the class left the shared micro-label list
    too. A heading states its section; an uppercase line over it restated the page.
  - **The hero is two columns**: headline / lead / two buttons on the left,
    the Reichstag on the right. Below 940px it stacks with the **photo first**.
  - **THE FOUR FACT CHIPS ARE GONE** (2026-09-21, on request). `.hero-chips` /
    `.hero-chip*` and `hero.chip1`-`4` — 300 official questions, All 16 federal states,
    German & English, 60-minute test — were four tinted discs restating what
    `hero.lead` says in a sentence one line above them and what the numbers band states
    again further down. `ICONS.clock` went with them: it was an alias
    (`= ICONS.history`) with exactly one reader.
  - **The two columns are centred against each other, and nothing had to be added to do
    it.** `.hero-landing` already carries `align-items: center`; with the chips gone the
    text column is 283px against the photo's 309 and the two centres measure identically
    (263.5px at 1280x900), so the pair reads as one horizontal band. **If the left
    column grows past the photo again, that is the rule that keeps them level** — do
    not reach for a margin.
  - **The photograph is `img/hero-reichstag.webp`: a 1:1 FILE shown 16/10 at EVERY
    width** (2026-09-21, on request). The file is still square and no asset was
    recropped; `object-fit: cover` on a wider box drops the top and bottom, and the
    centred band it keeps is the good one — full pediment, the whole
    `DEM DEUTSCHEN VOLKE` inscription and both flags, losing only sky and pavement.
    One aspect is one rule: the 620px override is gone. 495x309 on desktop, 343x214 on
    a phone.
  - **THE PHOTO CARRIES NO OVERLAYS AT ALL, and the crop is why.** Both are gone:
    - `.hero-quote`, the corner card, was removed on request — it covered 31% of the
      photo's height on a phone.
    - `.hero-note`, the handwritten margin note, was removed **because a cropped frame
      has nowhere to put it.** Its ink was a literal measured against the one patch of
      clean sky in the image (`#16233A` on a worst case of `#D0D3D8`, once in
      `LITERAL_PAIRS`), and a 16/10 crop drops the top 206 source rows — which is
      where all of the sky is. Scanned at note size across the entire cropped band,
      the BRIGHTEST darkest-pixel available was luminance **15**: the flag's black band
      moves into that corner. There is no position that reads, so the note went rather
      than the crop. **If the photo is ever shown 1:1 again and the note comes back, it
      needs re-measuring, not restoring from git.**
  - `--font-hand` survives both: **`.script-note` is still the only rule that reads it**
    and it still carries the numbers band's note and the CTA band's. The hero's was the
    third of three.
  - It is CC BY-SA 4.0, and **the credit lives in the footer's legal bar**
    (`footer.legal`, with the Commons page linked from `footer.photo`). BY-SA asks for
    the credit where the work is used, and the footer of the page carrying the photo
    satisfies that. That line is the licence, not decoration — do not drop it while the
    photo is on the page. `img/ATTRIBUTIONS.md` has the recrop command for the FILE.
  - **THE PANELS ON THIS PAGE ARE THE WHY BAND, THE CTA BAND AND THE FOOTER** — `--band`
    plus a `--border` hairline. The numbers band was one of them until 2026-09-22 and the
    why band was not; they SWAPPED, on request — see the swap note below. The fill was
    `--surface` until 2026-09-21, which on a white canvas is the page itself; `--band` is
    the token the footer shares, and is what the mockup draws (`#F4F8FB` measured). This is NOT the `--surface2` reading the note
    above rejects: `--surface2` is a well inside a tile, and still never a panel on the
    page. (The practise page's own tiles took `--band` later the same day — see the
    practise-tile note below — which is a tile ON the page, not a panel around a set
    of them.)
  - **ONE BLOCK SETS THE GAP TO THE NEXT, AND IT IS `.home-section`'s MARGIN**
    (2026-09-22, on request: "optimize the space within the bands"). `#whyBand` carried
    `padding-block: var(--space-2xl)` of its own, written when it was the BARE section
    between two panels; once it became the panel that padding just paid the 40px section
    gap a second time — **measured 80px between the panel's edge and the numbers under
    it against 40 everywhere else**, which is the doubling the screenshot was pointing
    at. It is deleted, the rhythm is a uniform 40 (28 below 620px), and the page came
    down 1439 -> **1339px** at 1280 with nothing inside a band touched.
    - **Its ONE consumer that was not a gap is `scroll-margin-top`**: "Learn more" jumps
      to `#whyBand`, and that padding was the air between the sticky header and the
      heading after the jump. The rule is `calc(var(--header-h) + var(--space-lg))` now.
      A scroll target that loses its top padding needs its scroll margin re-derived.
    - **The hero needs no rule for this**: it is not a `.home-section` and never took one
      from that margin — its own `padding-block` ends with 40px, so the ink gap above
      the why heading measures 44, in line with the 40s below it.
  - **The why band's remaining air is in MARGINS and PADDING, never in the grid's `gap`**
    (2026-09-21). Its section head takes `margin-bottom: var(--space-lg)` (scoped — the
    global one is 12px and shared; it was `--space-2xl` until 2026-09-22, when the panel's
    own edge took over half the separating that 40px of whitespace had been doing alone,
    and `.modes-band`'s head is the same value for the same shape), `.why-grid` a
    `--space-xl` panel inset, `.why-item` a `--space-md` icon-to-text gap, and
    `.why-item p` a `--space-xs` top margin. **The four columns stay 28px apart on
    purpose**: the next rung up is `--space-2xl`, which is not a gap anywhere in this
    sheet, so using it would take `gapRungs` from 7 to 8 and bust the budget the ratchet
    holds. The cramping was vertical anyway. **`.why-item`'s own `padding-block` is GONE**
    (2026-09-22): it was the item's only vertical air while these sat straight on the
    page, and the panel's inset is that now, on all four sides, with the grid's `gap`
    separating a wrapped row. `padding-inline` on the ITEM is still out — inside a panel
    it would simply double the inset, and before the panel it broke the first and last
    items' alignment with every other section.
  - **THE WHY BAND AND THE NUMBERS BAND SWAPPED TREATMENTS** (2026-09-22, on request,
    against a screenshot: "invert the ... formatting for the sections"). This reverses
    what stood here for a day, so read both halves before touching either:
    - **The WHY band is the PANEL**: `--band`, a `--border` hairline, the 16px radius and
      a `--space-xl` inset — **and no vertical separators**, which is the half of the old
      argument that survives. Hairlines between four CLAIMS turn them into a table; a
      frame around the SET does not, it groups them.
    - **The NUMBERS band is DISSOLVED to the page**: no fill, no hairline, no 1px
      separator gap. `.stats-grid` left the shared `.result-stats` rule to do it and
      carries its own `--space-xl` gap — an existing rung, so `gapRungs` stays at 7 —
      and `.stats-item` traded `padding: var(--space-md)` plus a `--band` fill for
      `padding-block: var(--space-sm)`, which is the shape `.why-item` carried while IT
      was the one on the page.
    - **The old argument ran the other way** and is worth keeping in view: "a row of four
      FIGURES is a readout, it wants a frame". It was overruled, not disproved.
    - **The page still alternates**, which is why neither band wanting a frame would be
      right: hero (bare) → why (panel) → numbers (bare) → CTA (panel) → footer (panel).
    - **No contrast pair had to be minted**, because every one already existed — but four
      DESCRIPTIONS in `contrast.test.mjs` did, since `text/band` and `muted/band` now
      name the why band's title and body, and `text/canvas` and `muted/canvas` the
      numbers'. A pair whose description names the wrong consumer is the stale-ground bug
      that file keeps catching.
  - **THE CTA BAND READS copy · note · ornament · action** (2026-09-22, on request).
    The button used to sit straight after the copy with the gate and the note to its
    right; the note and the button traded places, so the primary action closes the row.
    **Swapped in the MARKUP, not with CSS `order`**: there is only one focusable thing in
    the band so focus order could not have gone wrong either way, but a screen reader
    reads the DOM, and the order it hears should be the order on screen.
  - **THE TWO SCRIPT NOTES SWAPPED BANDS** in the same pass, also on request: the numbers
    row carries "Citizenship opens new paths." and the CTA band "A small step. A bigger
    future." **The KEYS did not move with the values** — `stats.annotation` and
    `cta.annotation` each still name the band they are rendered in — so look for one of
    these lines by its VALUE, not by its key. Both are hidden below 620px, with
    `.cta-art`, so this is a desktop-only arrangement.
  - **`.result-stats` is the ONLY hairline-separated band left**, and its `gap: 1px` is
    the only such literal in the sheet. Writing a second one takes `literalSpacing` to 3
    and `gapRungs` to 8, both over budget — so a band that wants hairlines JOINS that
    selector rather than restating it. It had three selectors once: `.why-grid` left on
    2026-09-21 (it stopped being a panel) and `.stats-grid` on 2026-09-22 (it stopped
    being one too). Neither departure cost the budgets anything — narrowing a selector
    adds no declaration.
  - **A colour written as a literal must be added to LITERAL_PAIRS in `tools/contrast.test.mjs`.**
    The test parses the two token blocks; a hex in a rule is invisible to it otherwise. Six
    entries are listed today, three per theme: the letter on the correct and the wrong answer
    chip, and the zoom veil's label. (The hero's margin note was a fourth until its crop
    removed the sky it was measured against.) The veil's shares a shape worth
    copying — their ground is an IMAGE rather than a token, so the entry names the measured
    worst case. Prefer a token; if a literal is unavoidable it goes in the list the same day.
    **A literal GROUND has to move when its token moves**: both dark entries named
    `#10B981` / `#F87171` for two commits after `--green` / `--red` were re-derived to
    `#10C185` / `#F98989`, so the test asserted a colour the app no longer had and
    passed on luck — both grounds happened to get lighter.
    The E in `.brand-mark` is the deliberate exception: its colours are written inside the
    SVG, not in a rule, and a graphic carrying no text has no pair to assert.
    **It carries both of the kit's variants in one drawing** (2026-09-23): the DARK one
    underneath — the navy bar 0.75 units smaller over a `#64748B` rim, so it does not
    vanish into the charcoal canvas — and `.brand-mark-top`, the light variant's full
    navy bar, on top, shown only under `html.light`. The CSS only toggles `display`,
    so no colour literal reaches a rule. Its geometry is `tools/make-logo-kit.mjs`'s;
    change it there and copy the paths across, as with `ICONS`.
  - **There are FIVE equal mode cards and no featured one** (2026-09-21). Exam, All
    questions, Your state, Smart review, By topic. The exam's full-width accent-tinted
    treatment is gone, and with it `.mode-card--featured`, `.mode-start-btn` and
    `.msb-arrow`. **Five, not the mockup's four**: the mockup sells Practice / Exam /
    Topic / State, and dropping Smart Review so a grid matches a picture is a product
    decision — it was put to the user and answered no. No card names its action in words
    since 2026-09-23 — see the mockup's card below.
  - **The grid's column counts are spelled out, not `auto-fit`.** With five cards, four
    columns strand the fifth on a row of its own and two columns strand it on a third. Only
    5, 3 and 1 divide the set cleanly: five above **1160px**, three to 620px, one below.
  - **1160px is a breakpoint that German set.** At five columns the title box is ~135px
    whatever the viewport (it was ~167 before the band's padding came off the grid), because
    `main` caps the content long before the screen does, and `Prüfungssimulation` is one
    18-character word setting ~152px. **The breakpoint does not make that word fit on one
    line and cannot** — five columns inside a 1060px cap can never give it the room. What
    the break buys is three columns below it; what saves the word above it is `hyphens: auto`
    and `overflow-wrap: anywhere` on `.mode-title` — the root already carries `lang="de"` when
    the UI is German, and the same pair is what `.opt-num` uses for `Christusmonogramm`.
  - **THE MODE CARD IS THE PRACTISE-MODE MOCKUP'S** (2026-09-23, on request: "adapting
    the tile's shade, making them minimalistic", against
    `docs/Mockups/ui/practise-modes.png`). Disc, title and
    description centred; then ONE `.mode-foot` row — the facts (`.mode-meta`, joined by a
    `.mode-sep` middot) on the left and a bare `.mode-go` arrow disc on the right.
    **Gone: the action LABEL (`.mode-start`, `mode.*.start`) and the clock glyph
    (`.mode-time`, `ICONS.clock`).** The mockup names neither; the disc is the action and
    the middot says the second fact is a duration. This reverses 2026-09-21's "a named
    action", which was itself against an earlier mockup — the newer mockup wins.
    - **Measured at equal scale** (the mockup's card 362px -> this one's 205.6): its card
      is 249px tall against 263 here, its disc 47px against 44, its side padding 20px =
      `--space-lg` (all four sides now; the sides were `--space-md`).
    - **THE ONE DEPARTURE: at five across the facts STACK.** The content box is ~163px and
      "300 questions · 60–90 min" is 155px at the 12px floor, before the 28px disc and its
      gap; the mockup's own facts scale to ~10px, which this sheet never goes below. So
      `.mode-card` is a size container (`container: mode-card / inline-size`) and
      `@container mode-card (max-width: 195px)` stacks the two facts and hides the middot.
      **A container query measures the CONTENT box**, so the threshold is the one-line
      foot itself (155 + 8 + 28 = ~192). It was 240 until 2026-09-23, derived by adding
      the card's padding and border as if the query measured the border box — which
      stacked the facts at 820px, where the content box is 208 and one line fits. Measured
      after the fix: one line at 820, stacked at 1280 with all five arrows on one line.
    - **The foot CENTRES, and bottom-aligns only when stacked.** Centred is the mockup's
      one-line look (measured: facts and disc share a centre, offset 0.0, at 1024). When
      stacked, a two-line pair and Smart Review's single line centre at different heights,
      so the five arrows would not share a line; `flex-end` in the container query puts
      all five on one (measured y 709.1 in English, 724 in German, at 1280).
    - **Smart Review with work due** shows `.mode-flag` ("2 due") on its OWN centred line
      above the foot and drops its count from the facts, leaving only the time — the
      mockup's "2 due" over "10–15 min". `.mode-flag + .mode-foot` cancels the foot's
      `margin-top: auto` so the flag takes it instead.
    - The facts are `--sub-text`, not `--muted`: the mockup's facts measure as bright as
      its description. Both discs carry a `--text` glyph.
    - **On a phone** the card is a flex column like the tile, flush left, the disc beside
      the name. It is NOT a grid any more — the grid areas existed only so the meta and a
      separate action row could share the last row, and the foot row does that itself.
  - **"By topic" is a CARD, not a home section.** `renderTopics()` is untouched; only its
    mount moved, to `#topicSection` **below** the grid, so opening it cannot reflow the
    cards. The card is a `<button>` with `aria-expanded`/`aria-controls`, not the
    `<details>` the history and glossary sections use — a `<details>` needs its summary and
    body in one element, and here the summary is a card inside a five-column grid.
    `renderModes()` reads the panel's `hidden` to redraw `aria-expanded`, because it runs
    again on every language switch and would otherwise reset the button while the topics
    were still showing.
  - **EVERY PRACTISE-PAGE TILE IS ONE SHADE, AND IT IS A TOKEN: `--tile` on
    `--tile-edge`** (2026-09-23, from the practise-mode mockup; the one-shade rule itself is
    2026-09-22, on request). The overview card, the mode cards, the topic chips and the
    history/glossary lists all read it, in BOTH themes, with no `html.light` override.
    - **Dark is the mockup's, measured**: `--tile` `#202020` is **1.068** on the page (the
      mockup's tile 1.064), `--tile-edge` `#2F2F2F` is **1.300** on the page and 1.217 on
      the tile (mockup 1.300 / 1.222). It was `--band` (1.15) on the heavy `--border`
      (2.16 on the page) — the loudest outline in the section, round every card. This is
      `theme-dark.md` §5 exactly: below ~1.20 stop pushing the fills apart and let the
      edge separate.
    - **Light did not move**: `--tile` is white and `--tile-edge` is `--border`'s value, so
      a tile is still the page plus its hairline.
    - **Hover steps the fill a rung and the EDGE carries the state**: `--tile-hover`
      (`#282828` dark, `#EEF3FA` light) and `--tile-edge-hover` (`#505050` / `#C8D2E2`).
      `--hover` would have been a 1.6 slab on the new dark tile. `--surface3` is still the
      press fill. **The glossary / history `<summary>` rows are the exception and keep
      `--hover`**: they sit INSIDE a tile and have no edge to change, so the fill is the
      whole state, and `--tile-hover` is 1.105 on a dark tile — under dark's 1.20 floor.
    - **`.hist-exam` is the one exception**, a well inside the history tile: dark keeps its
      `--surface2`, and `html.light .hist-exam { background: var(--surface) }` keeps the
      white it had.
    - **A session screen never moved** — `.quiz-sidebar` and `.review-item` keep
      `--surface`.
    - `contrast.test.mjs` asserts `text`/`sub-text`/`muted`/`faint`/`green`/`gold` on
      `--tile`, and `tile-edge` on the canvas, on the tile and on `--band` (the picker's
      rim), `tile-hover`/`tile`, `hover`/`tile` (the summary rows), `surface3`/`tile` and
      `surface2`/`tile`. **`tile / canvas`
      is deliberately NOT asserted**, for the reason `surface / canvas` is not: in light a
      tile IS the page. The `faint`/`band`, `green`/`band` and `surface3`/`band` pairs went,
      because no practise tile sits on `--band` any more.
  - **A mode card's disc, title and description are CENTRED; its foot row is not.** The
    foot is facts left, arrow right, as the mockup draws it. `text-align: center` on the
    card and `text-align: left` on `.mode-foot`; the 620px block puts the whole card left,
    where it is a list row.
  - **THERE IS NO PANEL BEHIND THE FIVE CARDS** (2026-09-21, on request). `.modes-band`
    was the mockup's pale `--band` plate — a hairline, a 16px radius and
    `--space-xl`/`--space-md` of padding — and it is gone; the cards sit straight on the
    canvas, as the why band's four items do. Five bordered tiles are already five boxes,
    and a sixth around them is the containers-inside-containers look this sheet keeps
    taking out. The class survives ONLY as the hook for `.modes-band .section-head`.
    - **The cards separate BETTER without it.** In dark a `#323232` tile is **1.36** off
      the `#1A1A1A` page against 1.18 off the panel; in light the hairline carries a
      white tile on white either way (1.245). Removing the plate cost the ladder nothing
      because the plate was the shallowest rung on it.
    - **It bought the meta row 7.3px**, measured in English at 1280x900 (worst case
      "All questions": 164.7 in a 172px box, against 164.7 in 164.7 with the panel).
      The panel's 16px of side padding came straight off the five cards, and that row
      had **zero** slack — so the box that was most short of width is the one the
      deletion paid. `white-space: nowrap` and `overflow: hidden` on `.mode-meta` stay:
      they are the guarantee, not the fit.
    - **The two `html.light .modes-band` state rules went with it, and only ONE of them
      was ever real.** The hover rule raised a light card to `--surface2` because
      `--hover` landed 1.067 from `--band`, under the 1.05 nesting floor. **The `:active`
      rule was a no-op**: it set `--surface3`, which is exactly what `.mode-card:active`
      already sets, so it never painted a pixel — and the 1.039 this file quoted for the
      light press fill was `--hover`'s number, a fill the press never used (it was 1.215
      off the band). **Do not restore it.** On the canvas the base rules stand unaided:
      press is `--surface3`, 1.294 below white. `contrast.test.mjs` lost `surface`/`band`,
      `surface2`/`band` and `surface3`/`band` in the same commit: **no `--surface` tile
      sits on `--band` any more**, resting, hovered or pressed, and a pair with no
      consumer is the stale-ground bug in the LITERAL_PAIRS note one level up.
    - **Light's card hover is 1.115 and that is the LIGHT reference's number, not a
      regression.** It was 1.149 on the band, so the deletion made it quieter, and §4's
      flat "1.20 is the floor for a state change" — quoted in the dark-ladder bullet
      above — looks like it condemns this. **That floor is `theme-dark.md`'s.**
      `theme-light.md` §4 measures light's whole state band at "roughly 1.10 to 1.25",
      puts real nav and menu hovers at **1.11**, and says the loudest state change it
      found anywhere is 1.25; it also warns that a light hover is nearly invisible in
      daylight whatever value you pick, which is why "**neither app relies on hover
      alone**". Reading dark's floor onto light is the same category error as reading
      the light-only mockup onto dark, which is what the 2026-09-21 re-derivation
      existed to undo. Every other hoverable tile in light is 1.115 too; the band's
      1.149 was compensation for a ground that no longer exists.
    - **`--band` itself stays** — the numbers band, the CTA band and the footer are still
      pale panels, and `canvas`/`band` is still asserted for them. The direction remains
      the theme's: a recess in light (the mockup's, 1.065 below its white page), a raised
      panel in dark (`#262626`, 1.15 ABOVE the page, per `theme-dark.md` §3 — nothing goes
      below the page there). **If a panel is ever put back round these cards, that §3
      argument is the one to re-read**, along with the two it cost: reading `--surface2`
      as a panel is wrong in both themes, and bleeding the panel out through `main`'s
      gutter was tried and reverted (`main` is only capped above ~1140px, so below that it
      ran flush to the window with its corners cut off).
    - **Its heading is centred and the state picker sits UNDER it**, not opposite. The
      picker still belongs to the section it changes; a centred heading simply leaves
      nothing for it to sit across from.
    - **The heading is the ONLY line in that head** (2026-09-21, on request). The
      `home.practice.eyebrow` ("Practise your way") and `home.practice.lead` ("Five
      ways in — one goal: passing.") strings are gone: both restated what "Choose
      your practice mode" plus five visibly different cards already say, and three
      stacked lines of chrome pushed the cards down for nothing. The head takes
      `--space-lg` beneath it (`.modes-band .section-head`) rather than the global
      `--space-ms`, because one line needs to read as a heading. That rule is now the
      only reason the class exists.
  - **The mode cards' discs are CIRCLES, one rung off the tile, and NEUTRAL** (2026-09-23;
    neutral since 2026-09-21, on request — **no icon in this app is painted in an accent
    or a semantic hue**). The icon disc is `--surface` in dark (1.271 on `--tile`, the
    mockup's 1.294) and `--surface2` in light, where there is no rung above a white tile;
    the arrow disc is `--surface2` in both (dark 1.455, the mockup's 1.435). Both glyphs
    are `--text`. They were a `--radius-sm` rounded square and a solid `--sub-text` disc,
    both read through `[data-hue]`; **mode cards no longer carry `data-hue` at all.**
    `.mode-flag` is still the apricot chip shown when Smart Review has work due.
  - **ICON PLATES: one neutral pair, and no hues at all** (2026-09-21, on request).
    `[data-hue]` is a single rule now — `--hue-tint: var(--surface2)`,
    `--hue-ink: var(--sub-text)` — read by the why marks ALONE since 2026-09-23 (the mode
    cards took the mockup's own discs), and **there is no longer any exception**: the overview card
    took the mockup's blue / green / amber plates back on 2026-09-21 and lost them
    again on 2026-09-22 when its readouts were reduced to a figure over a name, so
    `.dash-stat--blue` / `--green` / `--amber` are deleted. **`--on-hue` is GONE**
    (2026-09-23): it was the glyph on the solid start disc, its only consumer, and its
    `on-hue / sub-text` pair went from `contrast.test.mjs` with it.
    The five `[data-hue="..."]` rules that mapped blue/green/amber/rose/violet onto
    `--accent-soft`, `--green-dim`, `--gold-dim`, `--red-dim` and `--violet-dim` are
    deleted, and **`--violet` / `--violet-dim` went out of the palette with them** —
    those plates were the pair's only consumer, and a token with no consumer is the
    stale-ground fault `contrast.test.mjs` keeps catching. The test lost seven pairs
    and gained one (`on-hue / sub-text`).
    The attribute and the token NAMES stay: the why list still writes `data-hue`, and
    renaming the tokens to say "neutral" is churn. **It is
    `--hue-ink`, NOT `--ink`** — as a short name it shadowed the palette's own legacy
    border alias (`--ink`, #505050 dark / #E0E7F1 light) for every descendant of a
    plate element, so a later `border: 1px solid var(--ink)` inside a mode card would
    have drawn a solid accent edge while the palette definition still looked right.
    **Do not write a per-component tint literal**; a plate that wants colour again
    restores the five deleted rules.
  - **The state picker's pill hugs the selected state.** A native `<select>` is as wide as its
    longest option, so binding the pill to it sized every state to "Mecklenburg-Vorpommern" and
    left "Berlin" with a 165px gap before the caret. The visible value is a `.state-picker-value`
    span and the `<select>` is a transparent overlay across the pill; `onStateChange` updates the
    span rather than re-rendering the control, which would drop focus mid-interaction.
  - **The overview card is ONE CARD AND FOUR BARE BLOCKS** (2026-09-22, on request —
    **the tiles are dissolved**). It was four bordered tiles from 2026-09-21, drawn that
    way in `docs/Mockups/ui/where-you-stand.png`, which had itself reversed "one band,
    not four boxes". The mockup still wins on everything else in this card; on this it
    does not. Five boxes to say one thing is the containers-inside-containers look this
    sheet keeps taking out, and each readout already has a coloured plate anchoring it,
    so the frame was saying nothing the plate did not.
    `.dash-grid` is `3fr 1fr 1fr 1fr` (1.7, then 2, then 3 across 2026-09-22 — the
    verdict's type went back up and needed the width, then the readouts were asked to
    sit closer. **The COLUMN WIDTH is what sets the distance between them**, because
    each is centred in its own column and the 28px gap barely registers: 3fr pulled
    their centres from 211.6px apart to 181, and the verdict GAINED width doing it,
    339px): a wide `.dash-summary` holding the ring and a
    VERDICT (a headline and a line of advice), then three `.dash-stat` readouts, each a
    figure over its name. `.dash-body`
    and `.dash-stats` went with the old single row; **`.dash-tile` went with the
    borders, and `.dash-tile--ring` lost the prefix with it**.
    - **A READOUT IS CENTRED IN ITS COLUMN, and its `/310` is a label tier**
      (2026-09-22, on request). ~100px of content in a 195px column, left-aligned,
      pooled every pixel of slack on its right: three ragged blocks trailing off into
      nothing, which is what "adjust the spacing so the four blocks look well
      positioned" was pointing at. The mockup left-aligns these, and the mockup is
      right for the mockup — its readout is a TILE whose fill occupies the column. With
      the tiles gone there is nothing to occupy it, so the air is split either side of
      the figure instead. `.ds-of` came down to `--fs-2xs` with the figure: at 13px
      against an 18px numeral the denominator read as part of the number.
      **At EVERY width** — the phone was left-aligned for an hour on 2026-09-21's
      one-column reasoning, and that override went with the one-column layout
      (2026-09-22, on request). **The summary block is the exception and stays LEFT**:
      it is a ring followed by a sentence, and a sentence is read from a left edge.
    - **A READOUT IS A FIGURE OVER ITS NAME, and nothing else** (2026-09-22, on
      request). The hued plate and the `.ds-sub` line under the name both went, one
      day after the mockup put them there. The sub-line said what the name already
      said — "Answered" over "Questions you've attempted", "Mastered" over "Questions
      you've mastered" — so the card stated each of its three numbers twice and drew a
      box beside each one to do it. `.dash-stat-top`, `.dash-stat-icon`,
      `.dash-stat-fig`, `.ds-sub`, the three `dash.*Sub` strings and the three
      `.dash-stat--*` hue rules are all deleted; `.dash-stat` IS what
      `.dash-stat-fig` was, a `--space-2xs` column of `.ds-num` over `.ds-label`.
      `ICONS.file` and `ICONS.checkCircle` lost their only reader and went with it,
      from `tools/icon-packs.mjs` as well as from `index.html`. `--accent-soft`,
      `--green-dim` and `--gold-dim` all keep other consumers, so the palette and
      `contrast.test.mjs` are untouched.
    - **THE RING IS THE CARD'S HEADLINE** (2026-09-23, on request: the section "looks
      bland and empty without the continue-where-you-left-off box"; make the ring
      "bigger and with more engaging UI"). **152px at every width**, up from 104, with:
      - a plain **`--accent` arc** — a gradient (`--accent-fill` into `--teal`) shipped
        for one commit and went in review: a linear gradient cannot follow a circle, light's
        two blues were near-identical, and dark's `--accent-fill` end was ~1.9:1 on the
        track. A real along-the-arc gradient needs a conic gradient, which SVG lacks;
      - a **knob** on the arc's leading end — `#readyRingKnob`, a group rotated about the
        centre on the SAME transition as the dash, so the two stay in step. At 0% it sits
        at 12 o'clock and is the start mark, which retired the old 10-unit stub floor
        (`MIN_ARC`): stub plus knob read as a toggle switch;
      - the **pass mark as a tick** across the track at `PASS_PCT` (52, the exam's 17 of
        33), in `--text`, so the ring shows where you are AND where you need to be.
        `PASS_PCT` is derived from the top-level `EXAM_PASS` / `EXAM_SIZE`, which the
        results screen's pass check and `end.threshold` read too, and the verdict tiers
        read it. `EXAM_SIZE` is itself `EXAM_GENERAL + EXAM_STATE` (30 + 3), which
        `startMode()` draws the paper from, and the copy that names the shape
        (`mode.exam.desc` / `.badge`, `end.general`, `end.stateOf3`,
        `dash.verdict.buildingSub`) takes them as placeholders — change the exam there,
        in one place. `.dash-pass` under the verdict is its key: the same bar, "Pass mark 52%"
        (`dash.passMark`);
      - the percentage at **`--fs-xl`/700**, the card's one large figure and still a rung
        under the section heading's `--fs-2xl`.
      Measured: arc and knob land exactly (67% -> dashoffset 103.6, knob 241.2deg); the
      summary pair centres at 1000px; at 375 the reset glyph (308-352) clears the ring
      (ends 264); no overflow at 375 or 320 in either language.
    - **"Small steps make big progress." is GONE** (2026-09-23, on request), with
      `.dash-pill`, `dash.pill`, the leaf glyph (its only reader — deleted from
      `ICONS` and from `tools/icon-packs.mjs`), the card's short 16px foot (the inset is
      `--space-xl` on all four sides again) and `green / tile` in `contrast.test.mjs`.
      `.progress-reset` still sits absolutely in the card's top-right corner and needs
      no room reserved for it.
    - **FOUR ACROSS IS A WIDE-SCREEN LAYOUT, and it breaks at 1160 — the mode grid's own
      number** (2026-09-22). It was the LABEL that set this break: a ~150px column less
      the 44px plate and its 20px gap left 86px for `Due for review` (111.7) and
      `WIEDERHOLUNG` (107), both of which wrapped and, under `align-items: center`,
      dropped their plate 8px below the other two — **the row stopped reading as a row,
      which is the exact fault the centring and the shortened `dash.due` string exist
      to prevent**. **The plate went the same day** and the label has the whole column
      now, so what the break buys is the VERDICT's width: **narrowing the columns to
      `1fr` each is still NOT the fix** — it starves the verdict to ~40px instead. `.dash-summary` takes `grid-column: 1 / -1` below 1160 and the three
      readouts share the full width (244px each at 900px). Measured in BOTH languages at
      1400 / 1200 / 1159 / 1024 / 900 / 760, and single-column at 375.
      **The summary CENTRES once it owns the row** (2026-09-22, on request): a row-wide
      `auto 1fr` pinned the ring to the left edge with the sentence beside it, which at
      1000px is a pair in the corner of an empty row. Both tracks go content-sized and
      `justify-content: center` does the rest (measured: pair centre 492.5 = the row's,
      both languages). **That rule lives in a SECOND `@media (max-width: 1160px)` block
      placed AFTER the base `.dash-summary`** — they are both single-class selectors, so
      the later one wins, and stating it in the first 1160 block above the base did
      nothing at all. Same trap as `.cta-btn`'s dead sizing under `.btn-lg`: **when a
      media rule appears to do nothing, look for what states the same property below
      it.**
    - **WHAT REPLACES THE BORDERS IS AIR AND ALIGNMENT, and both had to GROW.** The
      card's inset went `--space-lg` -> `--space-xl` and the grid's gap `--space-md` ->
      `--space-xl`, so the card now runs on one rhythm: 28px inset, 28 between the head
      and the row, 28 between the row and the resume banner, 28 between columns. A
      tile's own padding used to do the separating; with the tiles gone the gap is all
      there is, so it has to be BIGGER than the padding it replaced, not the same.
      `--space-2xl` (40) is not available — it is not a gap rung anywhere in this sheet
      and using it would take `gapRungs` from 7 to 8.
    - **`align-items: center` on the grid is what makes four bare blocks read as a
      row.** The ring block is 152px tall (104 until 2026-09-23) and a readout is
      **41.6** (it was 68 while each carried a plate and a sub-line), so stretched — the
      default — the readouts hang from the top with ~110px of nothing under them.
    - **The plate-vs-ring-axis question is CLOSED, because the plate is gone**
      (2026-09-22). It was real while a readout was a plate with a sub-line hanging
      below it: the block was not symmetric about its own plate, so centring it left
      every plate ~12px above the ring's centre, and a padded variant that forced them
      onto the axis was built, rendered beside this one and rejected for pushing the
      three readouts low in their columns. A figure over a name has nothing hanging
      below it, so plain `align-items: center` puts all four blocks on one line —
      **measured at 261.6 for the ring and all three readouts**. Do not reintroduce a
      spacer here.
    - **`dash.due` is `Wiederholung`, and the constraint that forced it is GONE.**
      It was picked because the longer `Zur Wiederholung` sets 137.5px at the 12px
      floor against the 131px the label had left once the plate and its gap were taken
      off the column — it wrapped, and dropped that readout out of line with the other
      two. **With the plate gone the column is 195.3px and 137.5 would fit** (measured
      2026-09-22 at 1280px). The short form stays because nobody asked for it back, not
      because it has to; if the longer one is ever wanted, re-measure at the 1160
      breakpoint rather than assuming, and the sub-line that used to read "Fragen zur
      Wiederholung" beneath it no longer exists.
    - **The section's HEADING sits ABOVE the card and centred**, like every other
      section on the page (2026-09-22, on request). It lived INSIDE the card from
      2026-09-21 because the mockup draws one panel that opens with its own title — but
      the mockup's panel also held four bordered tiles, those dissolved, and the title
      was then the last thing inside a single-ground card still behaving like chrome. It
      is a `.section-head.section-head--centred` now, so it matches the practise heading
      below it and inherits the 620px rule that hides a section's lead. `.dash-head` is
      **deleted** — it existed to put the heading and the encouragement line on one row,
      and neither is there any more. `#homeStatus` holds everything the card shows, all of it painted by
      `renderHomeStatus()`.
    - **THE CARD IS ONE GROUND: `--surface` in light, `--band` in dark.** It used to
      hold tiles at a second shade — the mockup's near-white card (#FBFCFE) with a
      `--band` summary tile (#F5F8FD) and white readouts (#FEFEFE) in light, and the
      inverse in dark because nothing goes below the page there (`theme-dark.md` §3).
      Those shades went with the tiles on 2026-09-22, and **`surface / band` went out of
      `contrast.test.mjs` with them**: nothing in the app puts a `--surface` fill on a
      `--band` ground any more, and a pair with no consumer is the stale-ground bug that
      file keeps catching. `faint / band` was ADDED in the same commit — the `/310`
      denominator used to sit on a `--surface` readout tile and now sits on the card.
      The only fill left inside the card is the resume banner's tint.
    - **THE THREE READOUT PLATES ARE GONE, and with them the app's last hued icons**
      (2026-09-22, on request — they lasted one day). The card still carries the
      mockup's hue in two places, both of them text or a stroke rather than a plate: the
      ring's `--accent` arc and the resume banner's `--accent-text` book.
      **If the plates ever come back it is three `--hue-tint` / `--hue-ink`
      declarations here**, scoped to this card — never by re-tinting `[data-hue]`,
      which stays neutral for the mode cards and the why marks.
    - **The verdict has four tiers**, picked in `renderHomeStatus()` from the answered
      count and the accuracy: nothing answered, then below / above **52%**, which is
      the exam's own 17-of-33 pass mark, then 80%+. That is why "on track" can say
      something the app can point at.
    - **THE FOUR BLOCKS ARE ONE TREATMENT: an `--fs-md` figure over an 11px label**
      (2026-09-22, on request — "harmonize the typography and sizing", then "lower the
      size of the numbers ... but keep the size of 310 intact", then "not bold and
      reduced"). The figures went 22 -> 18 -> **16** across three passes that day and
      `.ds-of` stayed at `--fs-2xs` through all of them, which is the point: the
      denominator is a SCALE, not part of the number, and it now reads a rung under its
      figure rather than three. The ring's
      percentage and the three readouts' figures are the same rule bar the selector
      (Bricolage 600, `--ls-display`, tabular numerals), and `.ready-ring-sub` simply
      JOINED the shared eyebrow list beside `.ds-label`, so the dial's caption and the
      three names are one declaration. That is what retired the 9px exemption: it was
      only ever needed because a 22px percentage pushed the caption down the dial into a
      78px chord, where a tracked ACCURACY grazed the stroke on both sides. At 18px the
      stack is 4px shorter, the chord is 83.2 and the same word measures 74.
      The mockup does it the other way — a ~23px figure over a ~9.5px caption in an 89px
      dial — and this is a deliberate departure from it: bare blocks on a card have no
      tile to balance a big figure, so the row is harmonised against ITSELF instead.
      **The four labels ARE the verdict's paragraph** (2026-09-22, on request): the
      same `--fs-xs` / 400 / `--muted` / `--lh-prose`, and — the point — **no uppercase
      and no `--ls-caps`**. They are sentence case now ("Answered", "Due for review"),
      which is how the strings were always written; the shouting was CSS. This is the
      third answer to "not bold and reduced" and the only one that needed no exemption:
      the first two went UNDER the floor (9px, then 11px). It also bought WIDTH — a
      tracked capital is wide, so the widest German name went 97.4 -> 86.1 while gaining
      2px of size, which is what lets the phone row fit a 320px screen.
      German still needs a shorter word, so **`dash.accuracyShort`** is a separate key:
      `Accuracy` / **`Quote`**. The full "Trefferquote" stays on the wrapper's
      `title`/`aria-label`, where its length costs nothing. Verified in both languages —
      rendered, not reasoned about; the first attempt printed TREFFERQUOTE straight
      across the dial.
    - **THERE IS NO RULE BETWEEN THE RING AND THE VERDICT** (2026-09-22, on request).
      The mockup draws one and it was removed anyway: the ring is already a shape with
      its own edge, and a hairline two tokens away from it is a divider inside a tile
      inside a card — the containers-in-containers move this sheet keeps undoing.
      **Nor any padding** (2026-09-22, on request: "closer to the ring"). The
      `padding-left` was standing in for the deleted rule at 32px total, and with nothing
      drawn in it that read as a gap rather than as a pair. `.dash-summary`'s `--space-md`
      gap is the whole separation now — and 16px off a CIRCLE is a true 16px only at the
      text's own vertical band, where the ring is at its widest.
    - **The mountain ornament is TRACED, not sketched** (`MOUNTAIN_ART`, beside
      `GATE_ART`; redrawn 2026-09-22 off the mockup's own pixels). Three peaks and a
      flag on the right-hand one, cropped by the banner's bottom edge.
      - **They are BELL CURVES with straight flanks, not triangles.** The mockup's
        silhouette was read out column by column: each flank is near-linear over most
        of its run and rounds only at the apex, so each path is a cubic whose first
        control point sits ON the base-to-apex line at t=0.72 and whose second sits
        0.16 of the way back from the apex. Three passes missed this in three different
        directions — plain triangles, then Gaussian humps, then spikes — and only the
        column read settled it.
      - **The peaks are BROAD**: 120-225 viewBox units wide against 20-46 tall, which is
        roughly what the extrapolated flanks measure. The viewBox is `0 0 420 80` with
        `aspect-ratio: 5.25 / 1`, which under `translateX(-35%)` puts the field at
        ~36-75% across the banner — the mockup's own 35-74%.
      - **THE THREE ARE DELIBERATELY DIFFERENT SIZES, AND THE RANGE SITS LOW**
        (2026-09-22, on request). Apexes at **60 / 48 / 34** of 80, so the peaks stand
        20 / 32 / 46 units — a 1 : 1.6 : 2.3 step. The traced version had two of them at
        the same height (39 / 30 / 30) and read as one ridge, and its tallest reached 29,
        which left the flag's knob 5.5 units off the top edge. The tallest peak now tops
        out at 57% of the banner and the knob at 10.5, so there is a clear band of air
        above the whole illustration. **This is the one place the ornament leaves the
        mockup on purpose** — everything else about it is traced.
      - **It is sized FROM the banner** — `top: 0; bottom: 0` with `height: 100%` on
        the SVG — because at a fixed 250px it stood 83px tall in a 68px banner and
        `overflow: hidden` cropped the peaks and the flag with them.
      - **The flag has to clear the apex, and it needs its OWN colours.** Drawn in
        `currentColor` it is the same pale blue as the peaks, so the first version
        shipped three peaks and no flag anyone could see. The pole and its knob are
        `--text` and the pennant is `--accent`, written as `style="fill:var(--...)"` on
        the paths. The mockup's pole is `#234291`; `--text` is used instead because a
        dark literal vanishes on a dark banner and `--text` flips with the theme. Like
        `.brand-mark`'s E these carry no text, so `contrast.test.mjs` asserts
        nothing about them.
      - **`--accent-line`, not `.cta-art`'s `--border-hover`**: the mockup's peaks are
        a desaturated blue (#C9D7F5 measured) on the banner's blue wash, and light's
        `--accent-line` is #BFD4FA. A grey ornament on a tinted ground reads as dirt.
        The three layers are **0.15 / 0.5 / 1**, derived from the mockup's measured
        fills (#EAF0FC, #DCE7FC, #C5D8FB over its #EFF4FD banner = 5, 19 and 42 points
        of red below the ground, against `--accent-line`'s 40 at full strength). At the
        old 0.55/0.75/1 the two back layers were four times too strong.
      - Hidden below 620px with `.cta-art`, where the banner stacks and there is no
        room behind the row.
    - **On a phone the banner's BUTTONS are centred** (2026-09-22, on request).
      `.resume-banner` is a `space-between` row, so once the text block takes the full
      width the two buttons become the only item on the second line and `space-between`
      parks them hard left — under the book plate rather than under the sentence they
      belong to. `.resume-actions` takes `width: 100%` in the 620px block so
      `justify-content: center` has a line to centre them in (measured: the pair's
      centre and the banner's are both 187.5 at 375px).
    - **The banner has NO HAIRLINE, and its buttons are `--ctl-md`** (2026-09-22). The
      mockup draws it as a tint edge to edge with no border anywhere on it, and an
      `--accent-line` rule round a fill already 1.09 off the card reads as a box inside
      a box. `--space-md var(--space-lg)` of padding, and the two buttons keep
      the standard button (44px, 15px) since 2026-09-23.
    - **THE RING SHOWS A START MARK AT 0%** — the knob, since 2026-09-23 (a 10-unit stub
      before that). It once set `opacity = pct >= 2 ? 1 : 0`, which hid exactly the state
      a new learner spends the whole of their first visit looking at: an empty dial reads
      as a broken one.
    - **Both count-ups (this ring and the results screen's score ring) time from the
      FIRST FRAME's own timestamp**, not `performance.now()` (2026-09-23), through one
      `countUp()` helper. A frame's
      timestamp can precede a `now()` read just before it, so `k` started below 0 and
      the first frame painted a negative percentage — a one-frame "-1%" in a browser, and
      "-11087%" frozen in headless Chrome's virtual time, which is how it was found.
    - **THE FIGURE-TO-NAME GAP IS `--space-2xs`**, which is what `.dash-stat-fig`
      already used inside the plate's row. Not `--space-3xs`: 2px is not a gap rung in
      this sheet and minting one busts the ratchet's `gapRungs` budget. (The
      plate-to-figure gap this replaces was `--space-lg`, and the width argument that
      set it — "DUE FOR REVIEW" at 111.6px against a 104.4px box — is what the plate's
      removal settled: the label has the whole 131px column now.)
    - **The VERDICT is 15/13px** (`--fs-base` / `--fs-xs`), and **14/13 below 620px**.
      It went 15/13 -> 13/12 -> 12/12 -> back to 15/13 in one day (2026-09-22), the last
      move on request: at 12/12 it was the smallest thing in the card and read as a
      caption on the ring rather than as the card's own sentence. What makes 15 safe is
      the grid, not luck — `.dash-summary` went to `2fr`, so the verdict box is 247px and
      the worst headline ("You're just getting started", 188.0) clears it by 59.
      **On a phone that box is 189px and the same string sets 188**, one pixel, which is
      not clearance — hence the rung down to `--fs-sm` (175.4 in 189) in the 620px block.
      All four tiers measured in both languages at both widths: every headline is ONE
      line, which is what keeps this block shorter than the ring beside it (152px since
      2026-09-23; the verdict with its pass-mark key measures 70 at 1280).
    - **The card's padding and every gap inside it are `--space-xl`** (2026-09-22). The
      mockup measures ~20 and ~14, but its content is tiles with their own padding; bare
      blocks sit right on the card's inset, so 20px put the ring's stroke that far from
      the border and read as a crop. `.dash-summary`'s own asymmetric padding
      (`var(--space-sm) var(--space-md)`, which existed so the tile's height could BE
      the ring) went with the tiles — it has no fill to inset any more.
    - There is no `OVERVIEW` eyebrow — the card's own heading says it, and the
      `dash.eyebrow` key is gone. `Reset progress` is still a **corner glyph**
      (`.progress-reset`, `ICONS.reset`, absolutely positioned top-right of `.dash`,
      `--ctl-md` square so it keeps its touch target, `title` + `aria-label` for its
      name). Nothing reserves room for it since `.dash-head` went — the card's first row
      is the readouts, and the glyph clears them (measured 308-352 against a ring ending
      at 239.5 at 375px, 25px clear of the third readout's ink at 1280).
      **The glyph was REDRAWN on 2026-09-22, on request** ("ugly and big"). Its arrowhead
      was `flare 3.2 / adv 52` — 8.8 units of base on a 2.4-unit band, 3.7x, a spear that
      stood proud of the ring's own left edge and was the only reason the icon needed
      `--icon-lg`. At `1.6 / 40` the base is 5.4 on a 2.2 band (2.45x, the ordinary ratio)
      and it reads at **`--icon-md`**. `RESET_ARC` in `tools/icon-packs.mjs` was changed in
      the same commit and the shipped string was diffed against the generator's output —
      **identical**, which is the check that pack exists for.
  - The counter for questions due is the one stat allowed to draw attention
    (`.dash-stat--due`): **a coloured numeral only**. It was an apricot-tinted slab, which on
    charcoal reads as brown mud and buys no more attention than the colour alone. The others are
    neutral.
  - Gone with the bento: `.bento-top`, `.cta-tile`, `#bundeslandTile`, `#statTile`, `MAP_SVG`,
    `renderBundeslandTile()`, `renderStatTile()` and `stateLocalTime()`. Mastery is one of the
    overview card's three counters.
  - **The state picker is a RUNG DOWN the ladder** (2026-09-22, on request): `--ctl-sm`
    with a `--fs-sm` value, an `--icon-xs` pin, `--space-sm` of left padding and
    `calc(--space-md + --space-sm)` of caret room, the caret itself at `--space-sm`. It is
    a setting you touch once a session sitting between a `--fs-2xl` heading and five cards,
    and at `--ctl-md` with a `--fs-base` value it read as a primary control (91.2px wide
    now against 116). **`@media (pointer: coarse)` puts `--ctl-md` back**, because a
    deliberate size-down without the touch floor is an accessibility regression on the
    device most people use — the fault the quiz's Previous/Next pair shipped with.
    Measured 36px with a mouse, 44 on a thumb. The slot's `margin-bottom` came down with it
    (`--space-lg` -> `--space-md`): the row belongs to the heading above it and the cards
    below, and 20px under it read as a gap of its own.
    **It has NO visible label** (2026-09-23): the practise-mode mockup draws the pill
    alone, the pin and the state's name say what it is, and the `<select>` keeps
    `dash.statePick` as its `aria-label` ("Choose your state" / "Bundesland wählen"), so a
    screen reader loses nothing. `.state-picker-label` and the `dash.state` string are
    deleted. **The pill is FILLED**: `--band` on a `--tile-edge` rim, the mockup's (1.17 off
    its page; `--band` is 1.15). It was a `--surface` pill on the heavy `--border`.
  - **The pill centres under the heading at EVERY width, with
    NO phone override at all** (the override went 2026-09-22, on request). It was a
    column beside a left-aligned heading; since the band's heading was centred
    (2026-09-21) the base rule is the row. The 620px rule used to take the pair full
    width with the label hard left and the pill hard right — and **`flex: 1` on the pill
    is what stretched it**, so "Berlin" sat in a ~250px capsule with a gap before the
    caret. Without it the pill is `inline-flex`, i.e. as wide as the state it shows
    (116px for Berlin at 375), and the pair centres on the page (measured: pair centre
    187.5 = the slot's). A long name cannot overflow — `max-width: 100%` on the pill and
    `min-width: 0` + `text-overflow: ellipsis` on the value make it shrink instead, which
    is what "Mecklenburg-Vorpommern" does at 375 in both languages, exactly as it did
    under the old full-width rule. Stacked, a two-word eyebrow over a full-width pill
    spent a whole band of the section head on four characters.
  - **A control belongs to the section it changes.** The state picker (`#statePickerSlot` /
    `renderStatePicker()`) sits in the Practise section, under its centred heading, beside
    the exam and state modes it governs — not in the overview card, which only reports.
    `.section-head--row` is **gone**: it existed only to put this picker opposite a
    left-aligned heading, and nothing else ever used it.
  - **On a phone a section shows its HEADING and not its description** (2026-09-20).
    `.section-head p { display: none }` under 620px. Each one wraps to two lines down
    there and the four together cost ~150px — 7% of the page — while "Where you stand",
    "Practise" and the rest already name the section. Desktop keeps them.
  - **The topic grid stays ONE column on a phone, and two-up was tried and reverted.**
    At 175px the long labels ("Fundamental Rights & Constitution") wrap to four lines, so
    a chip went 55px -> 114px and the section got TALLER (314 -> 340). **The label decides
    this grid, not the icon** — the same reason the desktop rule is `minmax(230px, 1fr)`.
  - **Past rounds is COLLAPSED behind a `<details>`** (2026-09-20). It was the single biggest
    block left on the home page (480px) and unlike the hero or the dash it is not padding —
    it is a real list that GROWS with every round played, so no amount of sizing shortens it.
    `renderHistory()` reuses the glossary's exact structure (`details.glossary-wrap` +
    `summary.glossary-summary`) rather than inventing a second collapsing idiom, and the
    summary carries the count: `hist.title` is now `Past rounds ({n})` / `Frühere Runden ({n})`.
    That was also the "History" collision the section rename already worried about — History
    is one of the five TOPICS. Closed: 480px -> 46px, and the home page 2.06 -> **1.58
    screens** at the time. It lives on `#practiseScreen` now, which measures **1217px /
    1.35 screens** at 1280x900 with no progress recorded.
  - `initHomeScreen()` is the one door that repaints the Practise page. Callers do not call
    the individual renderers. (The name predates the screen split and is kept: a dozen call
    sites, one move.)
- **The page has a FOOTER: three columns over a legal bar** (2026-09-21).
  `.site-footer` sits after `</main>` — a `--band` panel with a `--border` top hairline.
  `.footer-inner` holds the brand mark, lockup and a one-sentence blurb
  (`.footer-col--brand`, capped at 34ch because it is the only column with prose), then
  **Practise** and **Sources**. `.footer-bar` below it carries the copyright and the
  legal line.
  - **The Practise links are the REAL `startMode()` calls**, the same ones the mode
    cards make — not decoration. The footer is hidden in-session, so they can only ever
    fire from a PAGE (Home or Practise). They reuse the `mode.*.title` strings.
  - **Every Sources link resolves, and all three were checked with `curl` before
    shipping** (200 each): the catalogue PDF that actually ships in this repo
    (`img/gesamtfragenkatalog-lebenindeutschland.pdf` — a source link that resolves to
    the source beats one that resolves to a landing page), the BAMF naturalisation page,
    and the photo's Commons page. **A source link nobody verified is worse than none.**
  - **The copyright covers the APP; the legal line names what it does not own.**
    `footer.copyright` is "(c) 2026 EIB Quiz. All rights reserved." and `footer.legal`
    says the questions are the official BAMF catalogue, credits the photograph under
    CC BY-SA, and states this is not an official BAMF service. **Do not merge the two:**
    a blanket "all rights reserved" spanning official catalogue text and a CC BY-SA
    photograph would simply be false.
  - `.footer-link` is one rule for the `<button>`s and the `<a>`s alike, so a mode
    action and an external source read identically. Underline on **hover only**: four
    stacked permanently-underlined lines read as a wall.
  - **It is hidden by `body.in-session`, and that is not cosmetic.** A session screen is
    pinned to `calc(100svh - var(--header-h))` and the page must not scroll there;
    anything after `<main>` adds to the document height and breaks
    `scrollHeight == innerHeight`. Verified 812/812 at 375px on the quiz screen and
    900/900 at 1280px on the results screen.
  - **`main`'s bottom padding came down from a literal 96px to `--space-2xl`** with it.
    That padding was the home screen's only bottom breathing room (`body.in-session main`
    overrides it outright), and 96 + the footer's own 40 read as a band of nothing.
  - The mark is the header's SVG **repeated**, not shared: its colours are the logo kit's,
    written inside the SVG rather than in a rule, so there is no token to share and one
    duplicated line beats a JS filler for it.
  - **`sub-text / band` is asserted in `contrast.test.mjs`** for the footer's copy; that
    ground was unasserted for this tier until the footer shipped. (`.footer-meta`, the
    single right-aligned column of small print this replaced, is gone — it was 76ch of
    `--fs-xs`, and before that 52ch of `--fs-2xs`, which wrapped every sentence.)
  - **On a phone the brand column goes full width and the two link columns sit side by
    side**, which they do on their own: flex columns size to their longest link, and
    118 + 28 + 147 fits 343px even in German, where `Prüfungssimulation` and
    `BAMF zur Einbürgerung` are the two widest labels. Measured, not assumed.
  - **`.footer-link` takes `--ctl-sm` under `@media (pointer: coarse)`.** It is 17px of
    text with 8px between lines, a 25px pitch that scrapes past WCAG 2.5.8 on spacing
    alone — and four of these START A ROUND. `--ctl-sm` rather than `--ctl-md` because
    they are a list of links, not the card's own buttons, and 44px x 4 would make the
    footer taller than the content above it.
- **The navigator offers three views, and the reader picks one** (2026-09-19). `#navActions`
  holds a `.seg.qnav-seg` — the same segmented control as the header switches — with **Linear /
  Shuffle / Topics**. `state.navView` (`'linear' | 'shuffle' | 'categories'`) is what the
  navigator draws; `state.shuffled` stays the ORDER, so `setNavView()` calls `shuffleRound()`
  only when the order actually has to change and otherwise just repaints. Both are persisted in
  the session and both reset on every entry into a round. Grouping is no longer inferred from
  the round's length — it happens when the reader asks for it.
- **A shuffled round wears its ORIGINAL numbers** (2026-09-20). `roundNumber(i)` is the
  question's place in the round as BUILT (its index in `state.baseOrder`), so the cells — which
  are always in the round's CURRENT order — read 48, 263, 123 once shuffled, and a shuffle is
  visible instead of invisible. `#questionNum` reads the same helper, so the card and the cell
  you clicked always agree. Unshuffled it is just `i + 1`.
  - **`showCurrentCell()` runs in both branches.** The scroll-into-view lived only in the
    grouped branch, so in a 300-cell flat list — and in shuffle, where the numbers give you no
    way to guess where you are — the current cell was routinely off screen.
  - **The view switcher does not scroll with the list.** `.sidebar-body` is a flex column,
    `#navActions` is fixed at its top and **`#questionNavGrid` is the scroller** (the rule is
    written against the id, because the renderer swaps the element's class between
    `.question-nav-grid` and `.question-nav-groups`). The mobile `.expanded` panel is
    `display: flex` for the same reason, and the grid needs **`align-content: start`**: a grid
    defaults to `stretch`, so as a flex child that FILLS the panel its auto rows stretched and
    every cell came out a tall rounded slab with the row gap swallowed. Extra room belongs at
    the bottom of the list.
  - **The collapse control is a drawn chevron** (`ICONS.chevron` in a `--ctl-xs` round hit target,
    filled at boot beside `.session-back-icon`), not a `▼` dingbat — the glyph rendered at a
    different weight and baseline in every font stack. CSS rotates it on `.open`.
- **The navigator groups a round by category when asked.** `renderQuestionNav()` builds
  `<details class="qnav-group">` per `q.category` (state questions group under the state name).
  The group holding the current question is always open; a group the reader opened by hand stays
  open, and the *previously* active one collapses — otherwise a lap of the round leaves every
  category expanded. Open state is carried across re-renders by reading the DOM about to be
  replaced, plus `navLastActiveKey`; there is no separate store to keep in sync.
  - **Topics is offered only when there is more than one.** A round that is all one category
    drops the button and renders the flat grid — one `<details>` over the whole list is a lid,
    not a grouping.
  - `.question-nav-grid` is `repeat(auto-fill, minmax(30px, 1fr))` with a 4px gap and a 30px
    `min-height` — **one size for both layouts**; the sidebar's cells used to be a third bigger
    than the strip's for no reason but history. Measured 32x32, six across in the 248px
    sidebar, more on the full-width strip. It clears the 24px WCAG 2.5.8 target and still holds
    the three-digit number a shuffled round shows.
- **`NAV_COLLAPSE_AT` is the one number for the navigator's collapse.** The stylesheet's 940px
  breakpoint and the JS guards must agree: they read 720 against a 940 breakpoint once, and
  between those widths the CSS hid the panel while the toggle refused to open it.
  - **The sidebar header carries button semantics only where it is a button.** Above the
    breakpoint the panel is simply open, so `syncNavHeaderRole()` strips `role`, `tabindex` and
    `aria-expanded`; below it, it sets all three and the header answers Enter and Space. It had
    announced itself as a collapsed button on a 1400px screen, over an open panel, doing
    nothing. It runs on boot, on resize, and on every navigator render so a missed resize
    event cannot leave it lying.
- **`state.shuffled` re-orders a round, and `state.answered` moves with it.** `shuffleRound()`
  captures the round's own order into `state.baseOrder` before the first shuffle and restores
  exactly that — sorting by id was only right for rounds built from the catalogue, and turned a
  mistakes round (built in the order you missed them) into an order it never had. It remaps
  every answer by question id
  (answers are keyed by POSITION, so a re-order silently reassigns them otherwise), and keeps the
  reader on the question they were looking at. Every entry into a round resets the flag; the flag
  is persisted in the session so a resume renders the navigator the right way. It is reached
  through `setNavView()`, not from a button of its own.
- **The question navigator is bounded by the viewport, never by its contents.** 300 cells in five
  columns is a 2700px column: the sidebar grew to match, `position: sticky` stopped meaning
  anything, and the numbers painted down the page outside the card. `.quiz-sidebar` caps at
  `calc(100svh - var(--header-h) - 24px)`, preceded by the same value in `vh` so a browser that
  does not know `svh` keeps a cap instead of dropping the declaration, and `.sidebar-body`
  scrolls inside it. Nothing sets the sidebar's height from JS.
- **`showScreen()` is the one door, and it carries `body.in-session`.** It is computed from
  `PAGE_SCREENS` (`home`, `practise`) rather than from `screenName !== 'home'` (2026-09-21):
  a PAGE scrolls and keeps its nav and footer, a SESSION is locked to the viewport. The
  class is what makes a screen an app view, and nothing else branches on the screen name to
  do it.
- **The page does not scroll inside a SESSION** (2026-09-19; it read "outside the home
  screen" until Practise became a page of its own). `body.in-session main` is
  pinned to `calc(100svh - var(--header-h))` (the `vh` fallback stated first, as with
  `.quiz-sidebar`), and exactly one region inside it scrolls: `.question-body` on the quiz
  screen, `#endScreen` itself on the results screen. `.question-meta` and `.quiz-nav` are
  pinned either side of the card's scroller.
  - **The `min-height: 0` chain is load-bearing**: `main` → `.screen.active` → `.quiz-layout`
    → `.quiz-main` → `.question-card` → `.question-body`. A flex child defaults to
    `min-height: auto`, and one missing link lets the column grow past the viewport again.
  - **`.quiz-layout` needs `grid-template-rows: minmax(0, 1fr)`.** An auto row sizes to its
    tallest item, so the card pushed the nav bar off the bottom of a locked screen while the
    grid itself sat comfortably inside it.
  - **Both scrollers are `overflow: hidden auto`, not `overflow-y: auto`.** Setting one axis
    makes the other `auto` too, and the pick animation's 1.015 scale flashed a horizontal
    scrollbar on every answer.
  - **Below 940px an expanded navigator covers the card, it does not push it down**
    (`:has(.sidebar-body.expanded)` → `position: absolute; inset: 0`). At 45vh above a locked
    card it left about 130px for the question. A browser without `:has` gets the old
    push-down behaviour, which is a degradation rather than a break.
  - **Below `max-height: 640px` the lock is released, deliberately.** The chrome above the
    card is fixed-height, so on a short viewport the card collapsed below its own pinned
    parts: at 740x380 — any phone in landscape — `.question-body` measured 0px and
    `.quiz-nav` sat at 485px, clipped away by `main`'s `overflow: hidden` with no way to
    scroll to it. Readable content wins over the no-scroll rule, and only where the rule
    cannot be kept.
  - **Both scrollers keep a gutter**: `padding-right: var(--spacing-sm)` with a matching
    negative `margin-right`, so the bar sits in the container's own padding instead of
    against the last word of the question or the last nav cell. `padding-right` alone just
    narrows the content and leaves the bar where it was.
  - **The results screen's bar sits at the WINDOW's edge** (2026-09-20). `#endScreen` is the
    scroller, and inside `main`'s 28px gutter its bar was drawn 28px in from the right, which
    on a full-height page reads as a stray line down the middle of nothing. It takes
    `margin-inline: calc(-1 * var(--spacing-xl))` and re-states the same value as its own
    `padding-inline` (`--space-md` under 620px, where the gutter narrows), so the content
    does not move and only the bar does. Negative margins rather than `:has()` on `main` —
    a browser without `:has` would double-pad the content instead of merely misplacing a bar.
  - No caller scrolls the page. The four `window.scrollTo` calls that used to paper over the
    page scroll are gone; `displayQuestion()` resets `#questionBody.scrollTop` instead, and
    `#timer` (`top: var(--header-h)`) and `.quiz-sidebar` (`top: calc(var(--header-h) + 8px)`)
    ARE still `position: sticky` — an earlier version of this line claimed they were not,
    which was false against the tree for months. Verified 2026-09-20.
- **Inside a session the header shows a back button, not the logo**, and the only buttons under
  the question are Previous (left) and Next (right) — the row maps to the direction each
  button moves you. `#quitBtn` is gone; `#sessionBack` carries it, with one
  branch — from the quiz it confirms first, from the results screen it goes straight home.
  Both buttons are driven by **`disabled`, never `display`**, so the pinned row cannot change
  height as you answer, and the Enter shortcut reads the same property the button does.
  `#sessionBack`'s accessible name is `nav.backAria` ("Back to the start page"), **not** the
  `nav.back` on its face: one of the two buttons on screen abandons the round. The aria label
  still contains the visible word, so WCAG 2.5.3 holds. `#backBtn` says **`quiz.prev`**
  (Previous / Vorherige), not "Back"/"Zurück" — two buttons reading "Zurück" in German, one of
  which leaves the round, is the collision this key exists to avoid. Leaving a session cancels speech on **both** branches — the results-screen path
  silently did not, while the Home button beside it did.
- **The quiz stats bar's SCORE is accuracy so far; the results screen's is the whole round.**
  They are different numbers on purpose and neither should be "fixed" to match the other.
  `updateStats()` divides by `state.correct + state.incorrect` — one right answer out of 300
  used to read 0% and stayed near zero for most of a long set. `endQuiz()` keeps dividing by
  the round's length, because a round you left 260 questions blank in is not 75%.
- **The navigator states progress once.** It used to carry a second copy of `.quiz-progress`,
  the same percentage in words, and a four-swatch legend; the stats bar restated the question
  number a fourth time. `updateProgress()` writes to one element and `#questionNum` carries its
  own total (`quiz.questionOf`).
- **The progress bar is a track with quarters, not a hairline** (2026-09-20). It carries
  `--space-2xl` beneath it, so the readouts, the question and the navigator all start a clear
  step below it rather than crowding the top of the screen. 8px, pill,
  `--surface3`, with the fill's leading edge lit by a 12px gradient tip so it is findable on a
  300-question round, and `::after` drawing quarter marks in `--canvas` **over** the fill — so
  a three-quarters-full bar reads as three quarters rather than as "mostly".
- **The quiz chrome above the card is a progress bar, then one line of readouts** (2026-09-19).
  `.quiz-progress` is the first child of `#quizScreen`, above `#statsBar`, and spans the card
  and the navigator. The four readouts — correct, wrong, score, **answered `n / total`** — are
  **not tiles and carry no separators**: a value and a label on one line, 22px of whitespace
  apart. Four boxed cards cost a whole row of height the question card needed, and four numbers
  divided by three hairlines is six things to look at. The labels sit in `--muted` at `--fs-2xs` so
  the numbers carry the row, and **a zero gets no colour** — green and red arrive with the first
  right or wrong answer rather than lighting a traffic light that is reporting nothing. The answered count came from the navigator's header (`.sidebar-count` /
  `qnav.answered` are gone), so it is stated once, above the fold, on every screen width.
  - **The phone's chrome was re-spaced around the question** (2026-09-20). Under 620px
    `.header-content` takes `padding: 16px/12px` — flush to the top edge the switch row read
    as part of the status bar, and the safe-area inset is ADDED to this, not replaced by it.
    `body.in-session .quiz-progress` then drops `10px` clear of that row. The room comes back
    from BELOW the bar: its `--space-2xl` is a desktop rhythm, and at `--space-lg` down
    here the four options of an ordinary question still fit without a scroller at 375x667
    (measured: it scrolled with the gap left at 40px). The tally shrank one step with it —
    `.stat-value` and its label both sit at `--fs-2xs` — because at the bottom of the column
    it no longer has to carry the row the way it did at the top.
  - **On a phone the bar and the button row take the QUESTION's width** (2026-09-20).
    Below 620px `.question-card` carries `--space-md` of padding, which insets the
    question and its options; `.quiz-progress` hangs off `#quizScreen` and `.quiz-nav`
    off `.quiz-main`, so neither inherited it and both ran 16px wider at each edge
    (measured at 390px: question 32-358, bar and buttons 16-374). Both take the same
    `margin-inline` now, so the bar starts where the question starts and Previous sits
    under the first option. Only below 620px — above it the card has no padding and the
    three already agree, and on desktop the bar still spans the card AND the navigator
    by design.
  - **On a phone the readouts sit BELOW Previous and Next** (2026-09-20). `.quiz-topbar`
    takes `order: 1` inside `.quiz-main` under 940px, so the column reads question ->
    buttons -> tally -> overview strip. At the top they were the first thing on the screen,
    competing with the question, and they are a running tally you glance at rather than
    something to lead with. `order` moves them without touching the DOM, so reading and
    focus order stay question-first. The gap above is `--space-2xl` (`--space-xl` under
    620px): the buttons belong to the question, the tally and the strip below do not, and
    that distance is what says so. **Desktop is unchanged** — the readouts stay over the
    question column.
  - **The quiz view's quiet tiers were one rung too quiet** (2026-09-20), measured against
    `theme-{light,dark}.md` §2. `.opt-letter`'s glyph was `--muted`, which put A/B/C/D at
    **4.68 on the chip in dark** — the PLACEHOLDER tier (§2 measures 4.67 there) on a label
    that names the answer you are picking; it is `--sub-text` now, 6.46 dark / 9.29 light.
    `.stat-label`, `.stat-of` and `.question-category` moved `--faint` -> `--muted`
    (4.52 -> 5.41 light, 5.67 -> 7.01 dark): at 0.63rem uppercase they were the smallest
    type on screen in the quietest tier, and on a phone the tally now has to read in one
    glance from the bottom of the column. `.option-en-text` is `--sub-text` — for a reader
    using the translation that line IS the answer. **`--faint` is for placeholder and
    disabled, not for a label you read.**
  - **There is no "Pick an answer" line.** Four buttons under a question are self-evident, and
    the string only existed to fill the gap the pinned footer left. `quiz.pick` and `#answerHint`
    are gone.
  - **The question is NOT a box** (2026-09-20). `.question-card` left the tile list: no fill,
    no hairline, no padding, so the question's left edge is the column's left edge and the
    **options are the only boxes**. A card around a card around four cards is the
    containers-in-containers look, and the outer one carried no information.
  - **`.quiz-layout` is two columns and one row** (2026-09-20): the question column
    (`.quiz-main` — readouts, question, then `.quiz-nav`) beside the navigator. The column gap
    is `--space-xl`; below 940px it is one column and the strip takes a 10px `margin-top`,
    or it sits flush against Previous.
  - **The navigator's height is FIXED, and the question's is not.** `clamp(300px, 56svh, 680px)`
    with `align-self: start` and `max-height: 100%` (a `vh` line first, as everywhere). Sized
    against the question's own content it held a different height on every question, which is
    movement with nothing behind it. Below 940px the rule is undone — down there the navigator
    is a collapsed strip, and a 450px strip is 450px of nothing.
  - **The question column is content-sized, capped by its grid area.** `.question-card` is
    `flex: 0 1 auto` so Previous and Next sit under the answers rather than at the foot of a
    half-empty column, and `body.in-session .quiz-main { max-height: 100% }` is what makes the
    card SHRINK instead of spilling out of a locked screen — that is the cap
    `.question-body`'s scroller hangs off.
  - **The footer row has a resting position**: `body.in-session .question-body` carries a
    `50svh` floor (a `vh` line first), so Previous and Next land in the same place on every
    ordinary question — measured 622/623 of an 800px viewport, 78% down, with 177px beneath
    them — and a longer question pushes them further down from there until the column hits the
    viewport and the body starts scrolling. Below 940px the floor is dropped and the card fills
    its area instead, which pins the buttons 10px above the overview strip; that needs
    `align-self: stretch` on `.quiz-main`, because the grid places items at the start and a
    content-sized column gives `flex: 1` nothing to grow into.
  - **The block below the progress bar sits low, and BOTH gaps yield to content**
    (2026-09-20). `body.in-session .quiz-layout` is `flex: 0 1 auto` with
    `margin-block: auto`: the block is content-sized, the leftover splits above and
    below it, and as the question grows the split shrinks on both sides — only then does
    `.question-body` scroll. Measured at 1280x900: a short question rests with 150px
    above / 126px below; a four-image question collapses those to 40 / 16 and the body
    grows 450 -> 670 BEFORE any scrollbar.
    - It replaced a rigid `margin-top: min(15svh, 50svh - 260px)`, which held its 120px
      open at the top of an 800px screen while the reader scrolled a question that had
      nowhere to go. The resting position is the same to within a couple of pixels
      (135px of gap at 900 against a 133px even split), so this is the same look with
      the stiffness taken out — and the 260px magic number, which had to be re-derived
      per mode, is gone with it.
    - **The exam needs no special case any more.** It used to (a `min-height: 780px`
      block that dropped the floor and filled the card) because its clock was a bordered
      tile costing ~135px the practice screen did not have. Flattened to a 36px line it
      is close enough to practice that the auto margins balance both: exam at 900 rests
      124/100 and collapses to 40/16, exactly like practice. `body.in-exam` is still set
      in `showScreen()`, but no layout rule reads it.
    - Below 940px and below `max-height: 640px` the layout goes back to `flex: 1` with
      no auto margins — down there it fills its row and there is no slack to split.
  - **The question block is TOP-aligned under the readouts, not centred.** Centring it opened a
    gap between the readouts and the question they report on, and pushed the question away from
    the panel's top edge; the readouts now sit `--space-md` above the question (measured
    16px) and the slack falls below the answers, where the panel's own bottom edge already is.
  - Below 940px the card goes back to filling its area, so the two buttons hold one position
    on every question, directly above the overview strip where a thumb can learn them.
  - **There is no rule above Previous and Next**, and the buttons are the one standard
    button (44px, 15px — they were 36px / 13px until 2026-09-23); 15px is still under the
    18px question and the 16px options, so they do not outweigh what they move you through. **The keyboard hint rides between them**, inside
    `.quiz-nav`: out of the reading path, on a row that already exists, costing the question no
    height. It is still hidden below 940px and under `@media (hover: none)`.
  - **The question view's spacing says what matters.** The status band is tight to itself
    (a 3px bar, 14px above the readouts) and a full `--space-xl` away from the question;
    inside the card the label row gives the question `--space-md`, the question gives the
    options `--space-lg`, and options are 8px apart. Chrome crowds itself; the question and
    its answers get the room.
  - **The label row above the question is plain text, and it travels WITH the question.**
    `.question-category` is `--muted` after a `·`, not a bordered pill. The row lives inside
    `.question-body`, so it is part of the centred block rather than pinned at the top with the
    slack under it.
  - **A glyph ON THE CANVAS has no plate; a glyph that MARKS something does**
    (2026-09-21, and this is the THIRD version of this rule — read it before reaching for
    either extreme). Speak, translate, the lightbox close, the home card's reset, the
    navigator's chevron and a topic chip's glyph carry no pill or chip: a solid glyph is
    heavy enough to read as a control on its own, and a box round a control is a
    container inside a container. But the **why marks and a mode card's
    icon** each take a disc, because the mockup draws them that way — and the
    disc is **NEUTRAL** (`--surface2` + `--sub-text`) since 2026-09-21, on request: the
    five per-card hues went. **There is no coloured plate left anywhere** — the
    overview card's three were the last, restored on 2026-09-21 and removed on
    2026-09-22 with the readouts' whole plate — see ICON PLATES above before reaching
    for colour anywhere else.
    **A topic chip's glyph is grey at rest and `--text` on hover** — it was the accent
    until the same pass; a hover on a plateless glyph is still a COLOUR change, never a
    fill that draws the box back on. The hit target stays (34/44px, and the coarse-pointer floor is untouched),
    and where there is no plate hover is a COLOUR change, never a fill that draws the
    box back on.
  - **The question block is CENTRED in the room it has.** `.question-body` is a flex column
    with `justify-content: safe center`, and above 940px the content-sized card adds
    `margin-block: auto`. `safe` is load-bearing: plain `center` in a scroller clips content
    that outgrows the box at the TOP, with no way to scroll back up; a browser that does not
    know the keyword drops the declaration and gets top alignment, which is a degradation
    rather than a break.
  - **Every scroller the app owns gets one thin bar** — `scrollbar-width: thin` plus a 6px
    `::-webkit-scrollbar` with a `--border-hover` thumb on a transparent track, sitting in the
    gutter each scroller already reserves.
  - **The explanation is a tinted box with a hairline, not a slab.** The 3px left accent said
    right-or-wrong a third time, after the tint and the green/red header; the hairline takes
    the hue instead.
  - **Expanded below 940px the panel takes a SHARE of the screen, not all of it.**
    `.sidebar-body.expanded` caps at `26svh` (with a `vh` line first), which puts the WHOLE
    panel — header and padding included — just under **35%** of the screen, and the numbers
    scroll inside it, so the question stays on screen above and the card shrinks into what is
    left.
    It used to cover the card outright (`position: absolute; inset: 0`), which was right when
    the strip was at the top of the screen and wrong now that it is at the bottom — you lost
    the question you were answering the moment you opened the overview.
  - **Below 940px the navigator sits UNDER the question, not above it.** As the first thing on
    a phone screen the strip competed with the question for the reader's first look; at the
    bottom it is also where a thumb already is. `.quiz-layout`'s rows are
    `minmax(0, 1fr) auto` there, and `.quiz-sidebar` no longer carries `order: -1`.
  - **The readouts and the navigator are ONE block, and its middle lines up with the
    question's middle** (2026-09-20). Above 940px `.quiz-layout` is
    `grid-template-rows: minmax(0, 1fr) auto minmax(0, auto) minmax(0, 1fr)` over
    `"main ." "main stats" "main nav" "main ."`: a 1fr SPACER row either side of the
    stats/nav pair takes whatever the question column has spare. Like the head/tail
    spacers they have a zero basis and only grow, so when the pair is the taller of the
    two they collapse and nothing moves.
    - **`.quiz-main` takes `align-self: center`, and that is the other half of it.**
      The spacers centre the pair against the question while the QUESTION is taller;
      open the navigator and the pair becomes taller (a 504px pane against a ~500px
      column at 900px), and without this the question stayed pinned to the top and the
      centres drifted 36px apart. Measured at delta 0 — closed and open, text and image
      questions — at 1600x1000, 1280x900, 1024x768 and 980x700.
    - **The nav row is `minmax(0, auto)`, not `auto`.** The pane carries a fixed
      `height: clamp(300px, 56svh, 680px)`, and an auto row refuses to go below it —
      which pushes it out of a locked screen the moment the grid has to shrink.
    - Below 940px none of this applies: the layout is one column (`"main" "stats" "nav"`)
      and `.quiz-main` goes back to `align-self: stretch`.
    The progress bar stays at screen level, above everything, spanning the card and the
    navigator.
  - **The card is compact so the scrollbar is the exception, not the default.**
    The meta row and `.quiz-nav` take `--space-sm`, and `.options` 12px. The question
    is `--fs-lg`, an option is `--fs-md` in a `--ctl-md` row (`--ctl-lg` under
    `@media (pointer: coarse)` — a thumb gets the height back, a mouse does not need it) with a
    26px letter chip, and the explanation is `--fs-sm`. At 994x734 a four-option text question
    fits with no scroller at all; a four-IMAGE question or an open explanation still scrolls
    `.question-body`, which is what it is for.
- **The sizing scale was tightened for a page of sections** (2026-09-20). `--space-lg`
  24 -> **20**, `--space-xl` 32 -> **28**, `--space-2xl` 48 -> **40**; `.home-section`
  56px -> 40px. **The section gap went back UP on 2026-09-22, on request**: `--space-2xl`
  (40) on desktop and `--space-xl` (28) under 620px, with the run-out to the footer at
  `--space-3xl` (56) and `--space-2xl` (40) — the phone keeps the same ratio between the
  two that the desktop has. The steps were set when the home screen was a wall of bento tiles. `--space-xs`
  / `-sm` / `-md` are the rhythm INSIDE a control and did not move. (The `--spacing-*` names
  are gone — everything reads `--space-*`.) Display numbers came down
  one step each (ready ring 1.9 -> 1.6rem and 132 -> 112px, `.ds-num` 1.75 -> 1.5, timer
  1.7 -> 1.45, score ring 2.7 -> 2.3, breakdown 1.8 -> 1.5), as did `.option-btn`
  and the page-level button (both `--ctl-md` today) and the glossary rows. Two of those numbers are
  history rather than current state: the ready ring is 152px (104 was re-derived from
  `ui/where-you-stand.png`), and `.ds-num` is `--fs-md`.
  - **The header's two toggles are glance-only chrome**, in a strip with the nav, which is
    what the `--ctl-sm` exception is for: 36px-wide cells (34 tall inside the seg's
    hairline) at EVERY pointer since 2026-09-23, so no coarse rule is needed. **The `>` in `.header-controls > .seg` is
    load-bearing**: it keeps those rules off the navigator's `.qnav-seg`, which has its own.
    The 620px rule that used to pin every header seg to 28px is **deleted**: stated later
    in the sheet it won on source order and silently undid the thumb floor. The ONE place
    28px is deliberate is the nested 360px block above, where the alternative is a
    clipped button. `.brand` / `.session-back` are `--ctl-sm` (`--ctl-md` on coarse). They are chrome you touch rarely, in a row with nothing else to hit;
    everything that is CONTENT — options, nav cells, the card's own buttons — keeps 44px
    **on a coarse pointer**. WCAG 2.5.8 AA asks 24px, and 2.5.5 AAA's 44px is what the
    rest of the app holds to.
    - **That sentence was FALSE until 2026-09-21, and a mobile pass caught it.**
      `.quiz-nav`'s Previous/Next and `.end-actions`' three buttons were sized down to
      `--ctl-sm` / `--fs-xs` with no coarse bump, so the app's **most-pressed control
      sat at 36px on a thumb**. A coarse rule patched it then; since 2026-09-23 every
      text button is 44px on every pointer, so the patch and the size-down are both gone.
    - **A deliberate size-down still needs the touch floor.** If a control is shrunk for
      visual weight, add it to the coarse block in the same change, or the decision
      silently becomes an accessibility regression on the device most people use.
  - **In a session the header drops its bottom hairline** (`body.in-session header`). The page
    does not scroll there, so there is nothing to separate the header from — the rule was just
    a line drawn across a locked screen.
- **UI language: English by default, German optional** (added 2026-09-19). The switch is the
  left segmented control in the header (`#langEn` / `#langDe`), persisted under `localStorage`
  key `eib_lang`, defaulting to `en`.
  - **Only the chrome is translated.** Question text, options and `explanation_de` stay German —
    that is the exam. The per-question translate toggle (`#bilingualToggle`) still reveals each
    question's `en` / `options_en` / `explanation_en`.
  - Every chrome string lives in the `I18N` dictionary as `{ en, de }` and is read through
    `t(key, vars)`, which fills `{placeholders}`. Topic labels go through `catLabel(key)`, which
    reads `CATEGORIES[key][lang]`.
  - Static markup carries `data-i18n` (textContent), `data-i18n-html` (innerHTML, for the hero
    headline's `<span>`) or `data-i18n-aria`. `applyStaticStrings()` fills them; `initLang()`
    runs on boot and `setLang()` on a switch. **A new visible string goes in `I18N`, never
    inline** — an untranslated literal is a string that silently stays German.
  - `setLang()` repaints the screen that is on. `endQuiz()` records the round once and
    `renderEndScreen()` paints it from `state`, so switching language on the results screen
    repaints without recording the round a second time.
- **The results screen carries a scroll cue** (2026-09-20). `.scroll-cue` / `#endScrollCue`
  is the same pill as the hero's "Start practising", pinned to the bottom of the viewport,
  and `scrollEndDown()` moves the screen on by 85% of its height — a 33-question exam review
  is walked, not jumped.
  - **It is `position: fixed`, NOT a child of `#endScreen`.** The results screen is the
    scroller; inside it the cue would scroll away with the content it is advertising.
  - **It is centred by `left: 0; right: 0; margin-inline: auto`, never `translateX(-50%)`.**
    It borrows the `fadeUp` animation, which ends on `transform: none` — that wiped the
    centring the instant the animation finished and left the pill half a width to the right.
  - `syncEndScrollCue()` shows it only while there IS more below (>24px) and retires it at
    the bottom, where a scroll-down button would do nothing. It runs from `showScreen()`
    (behind a `requestAnimationFrame`, since it measures a layout that has not happened
    yet), from the screen's own scroll, on resize, and on the language switch's repaint.
    While it is up, `#endScreen.has-cue` reserves a matching strip of bottom padding so the
    last review item never ends underneath it.
- **The results page is a hero, one band and a list** (2026-09-20) — five boxes fewer.
  - **The score is not in a card.** `.score-hero` puts the ring, the verdict pill and the
    pass-mark note straight on the page, the way the question does. A box round a ring
    says nothing the ring does not. The ring is **190px** (160 under 620px) and the three
    actions below it are the standard button: the ring is the result, the
    buttons are only what you do next, and with no card around either the ring has to
    carry the screen on its own.
  - **`.result-stats` is ONE band**, the same move the home overview card makes: correct,
    wrong and — in the exam — general, state and the clock, each a label and a figure,
    hairline-separated. It replaces two wells plus three more cards.
    - **The separators are a 1px `gap` over the band's own background colour, not a
      `border-left` on each cell.** A border lands on the first cell of a WRAPPED row too
      and draws a stray line down the middle of the band on a phone, where five figures
      wrap to two rows. A gap separates in both directions and cannot do that.
  - **`.end-actions` is IN THE FLOW, under the band** — the restart, **Retry the wrong
    ones** and **Your answers**, and no Back.
    - **The restart names the mode it restarts**: `end.retry` ("Retake the test") in the
      exam, `end.retryPractice` ("Practise again") everywhere else — the exam is a test you
      retake, every other mode is practice you repeat. It carries **no `data-i18n`**:
      `applyStaticStrings()` would stamp the exam's label back over it on every language
      switch. `renderEndScreen()` owns that text, and `setLang()` re-runs it. All three actions the results screen
    offers live in that one row; Retry used to sit in the review-section header, a second
    home for the same button.
    - Retry is **`hidden` unless `state.missedQuestions` has something**, which is what
      `startMistakeMode()` reads — a paper left entirely blank has no wrong answers to
      retry. It is set BEFORE the exam branch's early `return`, or the exam never reaches
      it.
    - `.review-section-header--solo` centres the exam's `33 questions`: with the heading
      gone and Retry moved up, it is the only thing in that row and had nothing to sit
      opposite. It was briefly a fixed bar across the bottom, which kept the controls on screen
    long past the point of being useful: once you are in the review list there is nothing
    left for "Your answers" to point at. In the flow they sit with the result they belong
    to, are above the fold at every size the app supports (measured bottom 571 at 1280x900,
    620 at 390x667), and scroll away behind you.
    - **There is no Back here.** The header already carries one, and on the results screen
      `#sessionBack` goes straight home — a second one said the same thing twice.
    - The button is named **`Your answers`**, and it is the ONLY place those words
      appear: the exam review's `<h2>` said them again a line later, so the heading is
      gone and `end.examReviewTitle` with it. The section is still headed in every other
      mode, where "Review your wrong answers" says something the button does not.
    - It is **`disabled` when there is nothing below**, not hidden: a control that silently
      does nothing is worse than one that says so.
- **(superseded) The score card is a ROW, and the counters live inside it** (2026-09-20). It was a
  680px-wide card holding a 150px ring centred above a pill — 286px tall and empty either
  side of the ring — with the CORRECT/WRONG pair as a second 84px band below it. The ring
  now sits beside what it reports (verdict, then the two counters), so the card is **192px
  against the old 386** for card + gap + breakdown, and the review list starts that much
  higher. Under 620px it stacks again, ring 132px, but the counters stay INSIDE the card:
  315px against 386.
  - `.breakdown-item` is a WELL now (`--surface2`, `--radius-sm`), not a tile — it sits
    inside the score card rather than on the canvas, which is the rung `--surface2` is for.
  - `.pass-fail` takes `align-self: center` so the pill stays as wide as its words inside a
    stretch column.
- **The results card states each number once** (2026-09-20). The score ring's centre already
  carries the percentage AND `n/total`, so the `.score-text` line under it — "22 of 33 correct
  (67%)" — was a pure restatement; it is gone, with `#scoreMessage`, `end.scoreExam` and
  `end.scoreOther`. The breakdown tiles read **Correct / Wrong** (`Richtig` / `Falsch`), not
  "Answered correctly" / "Answered wrongly" — the second is not English, and the quiz readouts
  already use the short pair. `.pass-fail:empty { display: none }` because only an exam has a
  pass mark and an empty inline-block still spent its margin and padding as a blank band.
- **The exam timer is a LINE, not a tile** (2026-09-20). **`startTimer()` must set
  `display: 'flex'`, not `'block'`** — the stylesheet lays the clock out as a one-line flex
  row, and an inline `display: block` beats it: the label and the figure stacked again with
  the row's padding around both, which on a phone read as a band of empty space above the
  question. The markup's own inline `margin-bottom` went with it, so the row's spacing now
  lives in the stylesheet where the rest of it is. `#timer` is a flex row — label,
  figure and pacing note all at `--fs-sm` — with no fill, hairline or radius. Boxed it cost
  ~135px, which is a row the question needed, and it made the exam the one mode whose
  layout had to be special-cased. The danger state pulses opacity, because there is no
  border left to pulse.
- **The exam withholds every mark until the end** (2026-09-20), as the real test does.
  `selectAnswer()` and the revisit branch of `displayQuestion()` both check
  `state.currentMode === 'exam'`: the chosen option takes a neutral **`.picked`** (accent,
  not green or red), no `.correct`/`.incorrect` is set, and `showExplanation()` is not
  called. Scoring, `recordAnswer()` and `saveSession()` are untouched — only the display
  changes.
  - **The navigator leaks it if you let it.** `renderQuestionNav()`'s cell would paint
    `qnav-correct` / `qnav-incorrect` from `state.answered`, which hands you your score
    before you have finished the paper. In exam mode a cell takes **`qnav-answered`** —
    it says answered and nothing more.
  - **The navigator IS shown in the exam now**, because you need to see what you have
    done and jump back; what it loses is the view switcher. `#navActions` renders empty
    in exam mode (`#navActions:empty` collapses the row): shuffling or grouping the paper
    mid-exam is not a thing the real test does.
  - **The results screen shows the WHOLE paper, not just the mistakes.** Every other mode
    marks as you go, so its list is the ones you got wrong; the exam marked nothing, so
    `renderEndScreen()` builds its list from `state.currentQuestions` + `state.answered` —
    each question with what you put down, the right answer, and the explanation, including
    the ones you left **blank**, which `state.missedQuestions` cannot know about (it only
    collects wrong ANSWERS). Verified: 2 right, 2 wrong, 29 blank over 33.
- **The exam does not name the topic.** `displayQuestion()` leaves `#questionCategory`
  empty in exam mode (`:empty` hides it and its `·`): telling you a question is about
  "Rights & Freedoms" narrows four answers to two, and the real test does not.
- **The progress bar is ONE track** (2026-09-20). It carried quarter marks drawn in
  `--canvas`; nothing on the screen explained them, a bar cut into four reads as four
  somethings, and the readouts already state the count exactly.
- **The mode icons are filled glyphs on the title's line** (2026-09-20; the cards live on
  the Practise page).
  They are plain `ICONS` entries like every other glyph — the duotone `ICONS_FILL`/`_svgFill`
  pair is gone now that the whole set is solid. The 36px rounded chip behind them is gone
  too (a container inside a container), and `.mode-head` puts the icon beside the title so a
  card opens with one row that names it rather than two.
- **Image options are square frames you can open** (2026-09-20). `.opt-img` is
  `aspect-ratio: 1 / 1`, not 4/3: the catalogue's crests run 0.78-1.0 in aspect, so in a
  landscape box every one was height-limited and they came out 136-174px wide inside an
  identical 235px box — same height, visibly different sizes. `object-fit: contain`
  stays, because these images ARE the answer and cropping one can remove the detail that
  distinguishes it.
  - **The grid's columns are `minmax(0, 1fr)`, and the labels wrap anywhere.** Plain
    `1fr` means `minmax(auto, 1fr)`, so the column holding the longest unbreakable word —
    `Christusmonogramm`, 17 characters — claimed the extra width, and A/C came out
    visibly smaller than B/D at narrow widths. `overflow-wrap: anywhere` on `.opt-num`
    stops the label pushing from the inside. All four tiles now measure identically
    (245px tiles / 223px frames at 780px wide).
  - **The whole picture is the zoom target, and the click must not answer.** The option
    is a `<button>`, so `openZoom()` calls `stopPropagation()` — otherwise looking at an
    image chooses it. Selecting is the label row beneath. On a pointer device the
    invitation is a hover veil over the picture (`quiz.zoomHover`); where there is no
    hover, one quiet line sits under the question and above the grid (`quiz.zoomHint`).
    A keyboard cannot click a picture, so **`z` opens the focused option's image**.
  - The lightbox (`#imgZoom`) is **before the script in the source** — it was after, and
    the boot wiring ran against `null`, so Close and the backdrop silently did nothing.
    Its close button sits in the OVERLAY's corner, off the picture; Escape, the backdrop
    and the button all close it, and closing drops the `src` and restores focus.
- **SVG icon system:** 26 glyphs — 25 drawings plus one alias — every UI glyph is an inline SVG from the `ICONS` const + `_svg()`
  helper in the `<script>` block (not emoji, not an external SVG). Since 2026-09-20 the
  shipping set is **`tools/icon-packs.mjs`'s "solid" pack** — one-tone silhouettes with their
  detail knocked out by `fill-rule="evenodd"`, so `_svg()` wraps them in
  `fill="currentColor" stroke="none"` and a glyph still takes the colour of the text tier
  around it. **No stroked icon is left in the app except the header's three scheme
  glyphs** (line icons since 2026-09-23, from the user's reference; wrapped by `_line()`
  and stroked by the `.icon-line` rule, not markup): the hero's tick bullets and the two
  scroll arrows are inline solid paths for the same reason
  (`grep 'stroke="currentColor"' index.html` must come back empty). Add a new icon to the
  pack's `solid` object first, then copy it across, so the contact sheet keeps documenting
  production — **and a glyph that loses its last reader is DELETED from both**, which is
  what `file` and `checkCircle` did on 2026-09-22 when the overview card's readouts
  dropped their plates one day after those two were drawn for them — and what `globe`
  did the same day, when the menu that was its only reader became a text pill
  (`ICONS.symbols` is the same drawing if it is ever wanted back). `sun`, `monitor` and
  `moon` were drawn in that commit for the header's three scheme modes and REDRAWN as line
  icons on 2026-09-23 (they moved to the pack's `line` object); the sun's eight rays are
  ONE line rotated about the centre in the generator, and the shipped strings were diffed
  against the generator's output, which is the check that pack exists for. `leaf` is GONE with
  the overview card's closing line (2026-09-23). The `line` and `duotone` objects do
  NOT carry every glyph, which is true of
  `book`, `shield`, `star` and `topic`: only `solid` ships, bar the three scheme glyphs in `line`.
  **One of them is an ALIAS, not a drawing**: `ICONS.community = ICONS.society` — a group
  IS the society glyph, so there is one definition to maintain rather than two.
  `ICONS.clock = ICONS.history` was the second, and has now been deleted TWICE: once with
  the hero's fact chips (2026-09-21), and again on 2026-09-23 with the mode cards' clock,
  after coming back for it in between.
  **An alias with no reader is dead code** — delete it with its last consumer, and mint
  it again the moment something needs the name. `GATE_ART` sits
  beside `ICONS`: a Brandenburg Gate ornament for the landing page's CTA band, filled shapes
  only, purely decorative.
- **Animated results:** the results screen shows an SVG score ring with a percentage count-up
  animation (green=pass, red=fail). The quiz has a slim animated progress bar and per-question
  entrance transitions. All motion respects `prefers-reduced-motion`.

- `index.html` loads question data at runtime from `questions.json` via `fetch`
  (so the app must be served over http/https, not opened via `file://`).
- Google Fonts is the only intended external network dependency.
- The colour scheme uses `localStorage` key `theme`, and it holds one of THREE values
  since 2026-09-22 — `light` | `system` | `dark`. Nothing stored still means light.
  UI language uses `eib_lang` (default `en`).
- Learning progress IS persisted (reintroduced 2026-06-20): spaced-repetition records
  under `localStorage` key `eib_progress_v1`, a resumable in-progress session under
  `eib_session_v1`, and a results history under `eib_history_v1`. A "Fortschritt
  zurücksetzen" control clears all three.
- Each question has a `category`; the Practise page offers topic practice, a results-history
  trend, and a bilingual glossary. Questions can be read aloud via the Web Speech API (TTS).
- SEO/meta, Open Graph/Twitter cards (`og-image.png`), `favicon.svg` and JSON-LD
  (LearningResource) are in `<head>`. The app is an installable PWA with offline support
  (`manifest.json` + `sw.js`); icons live in `img/icons/`.
- The former 10 `appExtra` questions (Q301-310) were removed (2026-06-26) — they were not
  part of the official BAMF catalogue PDF (which has exactly 300 general questions).
- All 16 Bundesländer are supported: 300 general + 16×10 state = 460 questions. The user picks
  a state on the Practise page (`localStorage` key `eib_state`, default `BE`); the active pool is
  300 general + the selected state's 10. State questions carry `state` (code) + `stateName` and
  are bilingual (DE/EN). `tools/import-states.js` (re)generates the 15 non-BE state sets from
  `tools/data/official-catalogue-bamf-2026-02.json`; `tools/translate-states.js` adds the
  English `en`/`options_en` (the official source is German-only); `tools/explain-states.js`
  adds bilingual `explanation_de`/`explanation_en` (generated from the templated stem + correct
  answer). Every question now has both explanations.

## Gotchas

Rules that cost real bugs. Reasoning is in the 2026-09-19 session block of `docs/TODO.md`.

- **Never shuffle with `.sort(() => Math.random() - 0.5)`.** It is heavily biased — it made
  early catalogue questions ~7x likelier to be drawn into an exam than late ones. Use the
  `sample()` Fisher-Yates helper next to `activePool()`.
- **Don't shadow browser globals in the one big `<script>` scope.** It is a single top-level
  scope, so a `let history` silently shadowed `window.history` and killed the
  `scrollRestoration` fix for months. The results array is named `resultsHistory` for this
  reason; keep it that way.
- **Mode keys are `allQuestions` / `bundesland` / `exam` / `review` / `topic` / `mistakes`.**
  There is no `berlin` mode — two label maps kept a stale `berlin` key and silently fell
  through. When renaming a mode, grep every lookup map.
- **Only the exam has a clock, and `startMode()` is what enforces it.** `startTimer()` shows
  `#timer`; nothing on the practice path hid it again, so a round started straight after an
  exam ran with the exam's timer counting down above the question. `startMode()` now clears the
  interval and hides the element for every non-exam mode.
- **An option image is never `loading="lazy"`.** It IS the answer you are choosing, so it is
  always above the fold and deferring it buys nothing — and the deferred load raced the rest
  of the round's requests and came back `net::ERR_FAILED` often enough to paint "Bild fehlt"
  over a file that was sitting right there (reproducible against `python -m http.server`; the
  same `<img>` loaded on the spot once its `src` was re-set without the attribute).
- **Finish the animations before reading a computed style in the preview pane.** The pane
  does not always paint, and a tab that is not painting leaves CSS transitions at
  `currentTime: 0, playState: "running"` **forever** — so `getComputedStyle()` returns the
  transition's START value, not the settled one. This produced four separate phantom
  contrast failures in one session: the A/B/C/D chips on an answered option measured 1.01
  and 1.77 (they are really 5.5-8.7), and a whole screen of mode-card text measured 1.12
  because `--text` was still the dark theme's `#ECEDEF` mid-switch. A fresh element
  inserted with the same classes computed correctly, which is how it was caught. Call
  `document.getAnimations().forEach(a => a.finish())` before any measurement, and be
  suspicious of a ratio that a screenshot plainly contradicts.
- **To verify a `:hover` / `:active` rule, read the PARSED stylesheet, not a screenshot.**
  The preview pane will not synthesise a hover or paint a screenshot while the app window is
  hidden or minimised — a sibling of the animation gotcha above. Headless Chrome answers
  instead: `--headless=new --dump-dom` on a copy of the page with a probe script appended,
  reading `document.styleSheets`. **The walk has one trap**: since nested CSS,
  `CSSStyleRule.cssRules` EXISTS and is empty, so `if (r.cssRules) { recurse; continue; }`
  skips every style rule in the sheet and finds nothing. Handle `r.selectorText` FIRST, then
  recurse only when `r.cssRules.length`. A walk that reports 0 matches over 556 rules is
  this bug, not an absent rule.
- **A hidden pane does not run ResizeObserver either, so `--header-h` goes STALE and the
  session screens measure ~7px too tall** (2026-09-21). `syncHeaderHeight()` is wired to a
  `ResizeObserver` on the header, and observer callbacks are delivered by the rendering
  loop — the same loop that does not run while the pane is hidden, which is why
  `requestAnimationFrame` hangs there too. Resize the pane to 375 after loading at desktop
  width and the header really is 68px while the variable still says 61, so
  `main`'s `calc(100svh - var(--header-h))` overshoots and `scrollHeight` reads 819 against
  an 812 viewport. It looks exactly like a broken height lock. Call `syncHeaderHeight()`
  by hand before measuring, or measure in a real browser over CDP: there the same build
  reads 812/812 at 375, and 900/900 at 620 / 940 / 1400, with `--header-h` correctly 65 on
  a phone and 61 on the desktop.
- **Headless Chrome's `--window-size` is NOT a layout viewport, so never check a mobile
  width with it.** `--window-size=375,1900` renders a **511px** page into a 375px image, so
  the result is a correct desktop-ish layout with its right-hand side cropped off — which
  looks exactly like horizontal overflow and was diagnosed as exactly that. The real numbers
  came from the in-app pane with `resize_window {preset: "mobile"}`: `scrollWidth ==
  clientWidth == 375`, zero overflowing elements. Headless is still the right tool for a
  full-page SCREENSHOT and for reading the parsed stylesheet; for anything where the
  VIEWPORT WIDTH is the thing under test, use real device emulation. A corollary worth
  keeping: the pane will not reliably paint a screenshot, but a LAID-OUT pane's JS
  measurement is sound, so measure there and screenshot in headless. **"Laid out" is a
  real precondition, not a formality** — see the next gotcha, which is how that sentence
  came to be qualified.
- **A pane tab with NO layout viewport reports `innerWidth === 0`, and every number you
  compute from it is garbage** (2026-09-22). A freshly opened tab — `tabs_create` then
  `navigate`, before anything pins a size — can have no layout viewport at all. Nothing
  errors: `getBoundingClientRect()` returns numbers, `getComputedStyle()` returns values,
  and every `max-width` media query matches, so the page is measured in its NARROWEST
  branch while you believe you are at desktop width. On the live site this read the
  overview card's chip at 215.5 against a reset glyph at 118.2 and the three readouts
  200px apart — **an exact description of the phone layout, reported as a broken desktop
  one**, and it was very nearly filed as a regression in a change that had just been
  verified locally. `resize_window` with an explicit width fixed it, and the same build
  then measured 118.0 / 118.0 with all four blocks on one centre.
  **Read `innerWidth` before trusting any geometry from a tab you did not size**, and
  treat 0 as "no measurement" rather than as a small number. Same family as the two
  gotchas above it — the `--window-size` trap and the hidden-pane `ResizeObserver` —
  and in all three the pane answers confidently with a layout that is not the one under
  test.
- **A `margin-top` on a section's FIRST CHILD paints nothing** (2026-09-22). It collapses
  through the parent — which has no top padding or border to stop it — and then adjoins the
  previous section's `margin-bottom`, so the gap is `max(28, 8)`, not 28 + 8. Nudging the
  practise heading down on a phone was written as `.modes-band .section-head { margin-top }`
  first and measured at exactly the 28px it started from; `padding-top` on `.modes-band`
  did it (28 -> 36, measured), and was deleted on 2026-09-23 with the green line it was
  clearing. **Measure a spacing change, or a collapsed margin will read as "the rule didn't
  apply".**
- **Tag the language of any text that is not the chrome's.** `<html lang>` now follows the UI
  language switch, so it may be `en` or `de` and neither direction can be inherited safely:
  English strings carry `lang="en"` and the German exam text — question, options,
  `explanation_de`, the review list, glossary terms — carries `lang="de"`. Untagged text is
  read aloud in the wrong voice.

## Repo Layout

Root holds exactly what GitHub Pages serves; everything else is foldered.

```
/                 live site (served from main root)
  index.html      production app; loads questions.json at runtime
  questions.json  question data, source of truth
  sw.js           service worker (offline; network-first for HTML/questions.json)
  manifest.json   PWA manifest (name, icons, theme); linked from index.html
  favicon.svg, og-image.png (+ og-image.svg source)
  .nojekyll       stops Pages running Jekyll
  .gitignore      ignores local/ scratch dir
  CLAUDE.md       this file
img/              image-question assets, the hero photo, ATTRIBUTIONS.md, icons/, states/
tools/            data-generation + validation scripts (not served)
docs/             project notes (TODO.md, BUG_AUDIT_MEMORY.md), plans/, research/
  Mockups/        design boards, generated illustrations, licensed photography
legacy/           May 28 build; not production, do NOT publish from it
claude-context-kit/  vendored method kit (skills + the theme/type references this
                  file cites); deliberately knows nothing about this project — read
                  it, do not rewrite it
```

Nothing at root may move: `sw.js` precaches `./`, `./index.html`, `./questions.json`,
`./favicon.svg`, `./manifest.json`, `./img/icons/icon-{192,512}.png` by path.

## Tracked Files

- `index.html` - production app served by GitHub Pages; loads `questions.json` at runtime.
- `questions.json` - question data, source of truth. Generated from the good `QUESTIONS`
  data via `tools/extract-questions.js` (NOT from `legacy/questions-final-extended.json`).
  Each question carries a `category` (see `tools/categorize.js`).
- `img/` - image-question assets extracted from the official BAMF catalogue PDF (43 image
  questions, all present), plus `img/hero-reichstag.webp`, the landing page's only
  photograph. `img/ATTRIBUTIONS.md` has sources, credits and the hero's recrop command.
- `docs/TODO.md` - current project status + open TODOs. Check/update this when picking
  up or finishing work.
- `docs/plans/landing-page-refactor.md` - the plan for rebuilding the home screen against
  `docs/Mockups/ui/landing-page.png`. **All eight phases shipped 2026-09-21** (`aa52d34`
  phase 0, `19c6da8` phases 1-7), and its header records the three of its own rejections
  that were reversed later the same day. Read the per-phase "what phase N decided that the
  plan did not" blocks before touching the home screen.
- `docs/Mockups/` - design boards (`ui/`), generated illustrations (`illustrations/`),
  Wikimedia photography + the 16-state map (`photos/`, with `ATTRIBUTIONS.md` carrying the
  exact credit wording two photographers mandate), and superseded material (`archive/`).
  Each folder has a README. **Not served** — nothing in the app links it.
- `docs/BUG_AUDIT_MEMORY.md` - concise audit/rollback memory.
- `tools/extract-questions.js` - regenerates `questions.json` from index.html's data + wires
  image questions to real asset paths and descriptive labels.
- `tools/validate.js` - runs the validation checklist (count/IDs/structure/spot-checks/assets).
- `tools/contrast.test.mjs` - reads the colour tokens out of `index.html` and asserts the WCAG
  floors for both themes (`node --test tools/contrast.test.mjs`). Adapted from
  `claude-context-kit/scripts/contrast.test.mjs`; the PAIRS/FILLS lists are this project's.
  LITERAL_PAIRS covers colours written as hex in a rule rather than as tokens, which the block
  parser cannot see — six today, three per theme (the letter on the correct and the wrong
  answer chip, and the zoom veil's label), matching the rule stated
  under the home-screen section.
- `tools/scale.test.mjs` - the size system as a test: the type/space/control/tracking scales,
  asserted against `index.html` (`node --test tools/scale.test.mjs`). It is a RATCHET — each
  metric has a budget in `BUDGETS`, and the test fails both when a number rises and when it
  falls without the budget being lowered in the same commit. Two checks are hard rather than
  budgeted: no property declared twice for one selector in one scope (the `.stat { gap }` bug
  class, which shipped three times), and no literal `border-radius`. The `vh`-then-`svh`
  fallback is the one allowed duplicate. **`ICON_EXEMPT` is the only named exemption**;
  `TYPE_EXEMPT` existed twice on 2026-09-22 (the overview card's names at 9px, then at
  11px) and both times FORMAT retired it — sentence case with no tracking is quieter and
  narrower than tracked capitals, on a scale step. An exemption is a selector rather than a
  budget number, so the sheet cannot drift into a second one unnoticed.
- `tools/import-states.js` - (re)generates the 15 non-Berlin state question sets from
  `tools/data/official-catalogue-bamf-2026-02.json` (BAMF catalogue; see img/ATTRIBUTIONS.md).
- `tools/translate-states.js` - adds English `en`/`options_en` to the imported state questions
  (dictionary-based: templated stems + translated semantic options, verbatim proper nouns).
- `tools/explain-states.js` - adds bilingual `explanation_de`/`explanation_en` to the 150
  non-Berlin state questions (template-based from question stem + correct answer).
- `tools/icon-packs.mjs` - renders the whole icon set as a contact sheet in three styles
  (line = the old stroked set; duotone = a 22% ground plus a solid figure; **solid = what
  `ICONS` ships today**). `node tools/icon-packs.mjs <dir>`
  writes three HTML sheets; the header comment has the headless-Chrome line that turns each
  into `docs/icon-pack-<style>.png`. A design reference, not part of the build — nothing in
  `index.html` reads it, **so a redraw has to be copied across by hand**: `RESET_ARC` and
  `ICONS.reset` were diffed after the 2026-09-22 redraw to confirm the generator and the
  shipped string still agree.
- `tools/categorize.js` - assigns a `category` to every question (rights/politics/history/
  society/symbols) using question text + correct answer keyword matching.
- `tools/extract-catalogue-images.py` - parses the official BAMF PDF to enumerate all image
  questions and extract/crop image assets.
- `tools/wire-catalogue-images.py` - wires extracted images into `questions.json` (sets
  `option_images`, `image`, `image_credit` fields).
- `sw.js` - production service worker (offline cache; network-first for HTML/questions.json).
- `manifest.json` - PWA manifest (name, icons, theme); linked from `index.html`.
- `favicon.svg`, `og-image.png` + `og-image.svg`, `img/icons/icon-{192,512}.png`,
  `icon-maskable-512.png`, `apple-touch-icon.png` - icons & social card. The favicon and all
  four icons are WRITTEN by `tools/make-logo-kit.mjs`; do not edit them by hand.
- `tools/make-og-image.py` - emits `og-image.svg` AND `og-image.png` from one set of
  constants. **Run for production 2026-09-21**, at the end of the landing-page refactor: the
  card carries the logo kit's E in its dark variant (since 2026-09-23; the flat flag before
  that, a drawn tick before that), READ from `docs/brand/` — so run
  `tools/make-logo-kit.mjs` first when the mark changes — over
  "Einbürgerungstest / Alle 16 Bundesländer / 300 FRAGEN · DE / EN · KOSTENLOS". Never
  hand-edit one of the two files — that drift is why this script exists; change a constant,
  re-run, commit both.
- `docs/brand/` + `tools/make-logo-kit.mjs` - the logo kit (2026-09-23), drawn from
  `docs/Mockups/ui/logo-kit.png`: horizontal / stacked / mark lockups in four variants,
  app icon and favicon, as outlined SVG + PNG + `.ico`. **Generated — never hand-edit**;
  change a constant and re-run `node tools/make-logo-kit.mjs` (needs Chrome with network:
  it outlines the fonts via opentype.js). **Wired in 2026-09-23**: the same run writes
  `/favicon.svg` and the four `img/icons/*.png` (rounded tile for `any`, full-bleed square
  for `maskable` and Apple), the OG card reads its mark from here, and the header/footer
  mark is the same geometry inline. **Changing the mark means: re-run it, re-run
  `tools/make-og-image.py`, copy the paths into `.brand-mark`, and bump `CACHE` in
  `sw.js`.** `docs/brand/README.md` has usage, construction and the deliberate departures
  from the mockup.
- `legacy/` - May 28 build (standalone HTML, corrupted JSON, old regen tool). See
  `legacy/README.md`. Do NOT publish from it.

## Image Questions

**43 image questions**, all extracted from the official BAMF catalogue PDF. Every asset is
present (`node tools/validate.js` reports 0 missing).

- **A four-image grid is ONE ROW above 620px, and 2x2 below it** (2026-09-20). Four pictures
  you are choosing between are four things to COMPARE, and a 2x2 makes you compare them in
  two passes. Side by side they read in one — and one row is half the height, which is what
  pays for the extra width. On a phone the comparison is not worth it: four across a 375px
  row is an 80px frame under a three-line label, so `@media (max-width: 620px)` puts
  `grid-template-columns` back to `repeat(2, minmax(0, 1fr))`.
- **It is capped by the VIEWPORT as well as the column, because the frames are SQUARE.**
  The column width sets the frame width and the frame width sets the height, so an uncapped
  row pushes the labels off the bottom of a wide screen. `max-width: min(100%, 72svh)`;
  `min(92%, 33svh)` under 620px and `min(92%, 26svh)` under 400px (the phone values are what
  the old 2x2 base rule already computed to, so nothing moved down there). A prompt image is
  294px. The thumbnail only has to be recognisable now that any of them opens full size on a
  tap, so the cap buys the whole question fitting on screen instead. Measured with no
  `.question-body` scroller and no page overflow for Q21/Q209/Q226 at 1600x1000, 1280x900,
  1024x768, 980x700, 700x820 and 390x844. Under 400px `.opt-num` also drops to 0.72rem — the
  label is what tips a 2x2 over, since "Christusmonogramm (Chi-Rho)" sets in three lines.
- **Option-image questions (19)** — 4-image grids, rendered as `<img>` from
  `option_images: ["img/…", …]` with descriptive `options` labels (never "Option 1"):
  general Q21, Q209, Q226, plus each state's Wappen question (Q301, Q311, Q321, … every `*1`).
- **Prompt-image questions (24)** — a single photo above text answers, from `image: "img/…"`:
  general Q55, Q70, Q130, Q176, Q181, Q187, Q216, Q235, plus each state's map/flag question
  (Q308, Q318, Q328, … every `*8`).
- **`image_credit`** (on 5 questions) renders as a small caption under the image.

Assets live in `img/` — per-question folders (`img/q21/`, `img/states/<CODE>/`) or standalone
files (`img/q55-reichstag.webp`). Sources and credits are in `img/ATTRIBUTIONS.md`. Keep the
`correct` index pointing at the correct asset.

## Known May 28 Regression

The May 28 build introduced PWA/persistence features and a JSON-to-HTML regen flow. The major bug was corrupted question data in `questions-final-extended.json`, which was then copied into HTML by `regen_questions.js`.

Examples of corrupted May 28 questions: Q6, Q7, Q9, Q10, Q12, Q15, Q16, Q28.

Do not publish from `questions-final-extended.json` until it has been repaired and validated.

## Validation Checklist

Before publishing any app change:

1. Question data lives in `questions.json` (source of truth) — edit it directly.
   (`tools/extract-questions.js` was the one-time migration from index.html; it no-ops now.)
2. Run `node tools/validate.js` (460 questions, contiguous IDs 1-460, no duplicates,
   16 states × 10 + 300 general,
   structure valid, spot-checks Q6/7/9/10/12/15/16/28, lists any missing image assets).
3. Extract the final `<script>` block from `index.html` and run `node --check` on it.
4. Run `node --test tools/contrast.test.mjs` — it reads the colour tokens out of `index.html`
   and asserts the text and fill floors in both themes.
4b. Run `node --test tools/scale.test.mjs` — the size-system ratchet. If a budget FALLS,
   lower it in the same commit; the test says so explicitly. If one RISES, that is a
   regression.
5. Press the header's EN box, and again: no chrome string may stay in the other
   language, the question text must stay German in both, and the pill's own face AND its
   `aria-label` must follow the switch. Then walk the three scheme buttons — light,
   system, dark — and reload on each: the seg's `aria-pressed` and the painted theme must
   both come back, and `system` must match `prefers-color-scheme` with no flash.
6. Serve over http (`python3 -m http.server`) and confirm `questions.json` loads, the 43
   image questions render, progress persists across reload, and Smart Review surfaces
   due/weak questions. Check **both pages** — Home and Practise — at 375px wide:
   `document.documentElement.scrollWidth` must equal the viewport width on each, and the
   nav's active mark must follow `showScreen()`. **On the quiz and results screens `scrollHeight` must also
   equal `innerHeight`** — check it at 375 / 620 / 940 / 1400px, on a four-image question with
   the explanation open, and with the mobile navigator both collapsed and expanded.
7. PWA: `node --check sw.js`; confirm `manifest.json` is valid JSON and the icon paths exist.
   **If the change touches `favicon.svg`, `manifest.json` or either `img/icons/icon-*.png`,
   bump `CACHE` in `sw.js`** — those are the cache-first entries in `PRECACHE`, and
   `activate()` evicts only caches whose key differs from `CACHE`, so without the bump a
   returning visitor keeps being served the old file. (`index.html` and `questions.json` are
   in `PRECACHE` too but are network-first, so they need no bump.) Missed once, on the
   2026-09-21 repaint: "cached static assets" read as images, not as the favicon and the
   manifest. A stale service worker will also serve the old page during local testing —
   clear it before judging a change.
8. Exam simulation: 30 general + 3 state = 33 questions, 60-minute timer, pass at 17/33.

## Future Repair Order

If reviving the May 28 architecture:

1. Repair `legacy/questions-final-extended.json` first.
2. Confirm image questions keep valid `option_images`/`image` paths (43 total; see Image Questions).
3. Run `node legacy/regen_questions.js`.
4. Copy the regenerated source to `index.html`.
5. Re-run the validation checklist.
6. Decide explicitly whether PWA, bookmarks, focus mode, dashboard, TTS, and tooltips belong in production.
