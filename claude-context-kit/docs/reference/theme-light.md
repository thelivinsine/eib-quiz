# Light mode reference — colour, hover and edge treatment

Companion to [`theme-dark.md`](theme-dark.md), same method and same structure. Written from six
screenshots of the Claude desktop app and the Windows PowerToys settings app. **Every value was read
out of the pixels** — the images were decoded and sampled at named coordinates, and every ratio is
the standard relative-luminance formula.

**This is source material about two other applications.** It describes what they do; it makes no
claim about any project that reads it. Section 7 sets the two themes side by side, which is the
payoff.

---

## 1. The two palettes, as measured

### PowerToys (WinUI 3) — light

| Role | Hex | Contrast vs. its own ground |
|---|---|---|
| Page | `#f3f3f3` | — |
| Card | `#fbfbfb` | 1.07 on page |
| Card edge line — **darker than the page** | `#e5e5e5` | 1.14 on page, 1.22 under the card |
| Input fill | `#fefefe` | 1.03 on card |
| Accent | `#0067c0` | 5.48 on card |
| Text **on** an accent fill | `#ffffff` | 5.67 |
| Primary text | `#1a1a1a` | 15.68 |
| Secondary text | `#606060` | 6.08 |

### Claude desktop — light

| Role | Hex | Contrast vs. its own ground |
|---|---|---|
| Content surface | `#ffffff` | — |
| Docked chrome — sidebar, modal rail | `#fcfcfb` | 1.03 below content |
| Seam between chrome and content | `#e4e4e3` | 1.24 on chrome |
| Nav row hover | `#f0f0ef` | 1.11 below chrome |
| Nav row selected | `#e3e3e2` | 1.25 below chrome |
| Divider, menu hover, segmented track | `#f3f3f3` | 1.11 below white |
| Input fill | `#fefefd` | 1.02 **above** chrome |
| Input border | `#e5e5e4` | 1.23 on chrome |
| Popover / menu fill | `#ffffff` | — same as content |
| Popover rim | `#bcbdbb` | 2.24 on white |
| Focus ring | `#456bb9` | 5.04 on chrome, 4.03 on a selected row |
| Toggle On | `#4c77ca` | 4.38 on white |
| Toggle Off track | `#cecece` | 1.57 on white |
| Modal scrim | `#969795` | 2.93 over white |
| Tooltip fill | `#0b0b0b` | 19.68 inverted |
| Primary text | `#0b0b0b` | 19.68 |
| Secondary text | `#888782` | 3.60 |

---

## 2. Colour rules both apps follow

**Greys are near-neutral, with a faint warm cast in one of them.** One app is perfectly neutral,
R = G = B exactly, the same discipline as its dark theme. The other carries a **one-point warm
tint** in its off-white chrome — blue one step below red and green, **never more**. That is enough
to read as paper rather than plastic and small enough that it never turns beige.

**This is the one place light mode allows what dark mode does not**, because a tint at low
luminance goes muddy. **Near white there is room for a whisper of warmth, and one degree is the
whole budget.**

**The whole ramp is compressed.** Compare the first step off the page in each mode:

| | Light | Dark |
|---|---|---|
| Page → card | **1.07** | 1.15 |
| Content → chrome | **1.03** | 1.30 |

**Luminance is non-linear.** Between `#f3f3f3` and `#ffffff` there are twelve hex steps and almost
no perceptual distance; between `#000000` and `#212121` there are thirty-three and a full 1.30
ratio. **You cannot build a light theme out of fills alone.**

**Body text is 16–20:1, not 4.5:1**, and both apps use near-black rather than pure black. **Pure
black on pure white is avoided in both.**

| Tier | PowerToys | Claude |
|---|---|---|
| Primary | 15.68 | 19.68 |
| Secondary | 6.08 | **3.60** |

**One secondary tier fails the 4.5 floor at 3.60.** It is used for descriptions under labels at a
largish size, but it is a real miss and worth knowing before copying the value. The other app's 6.08
is the safer model.

**Nothing is dimmed with opacity.** Same as dark mode: every softer shade is a solid value.

---

## 3. The nesting ladder in light mode — and where it runs out

In the dark references every level of containment stepped **lighter**, monotonically. **Light mode
is not the mirror image of that, and the difference is the most useful thing in this document.**

### Containers still step towards white

| Depth | Light | Dark |
|---|---|---|
| 0 — page | `#f3f3f3` | `#202020` |
| 1 — card | `#fbfbfb` **1.07 lighter** | `#2b2b2b` **1.15 lighter** |
| 2 — input inside it | `#fefefe` **1.03 lighter** | `#383838` **1.17 lighter** |

**A raised surface moves *towards white* whether the page is dark or light** — it is not "away from
the page", it is "towards the light".

### But interaction states step *down*

**This is the break.** In dark mode a hover and an elevation both went lighter, from one shared
budget. In light mode they point in **opposite** directions:

| | Value | Direction |
|---|---|---|
| Chrome | `#fcfcfb` | — |
| Nav row hover | `#f0f0ef` | **down** 1.11 |
| Nav row selected | `#e3e3e2` | **down** 1.25 |
| Segmented track | `#f3f3f3` | **down** 1.11 from white |
| Selected segment inside it | `#ffffff` | **back up** 1.11 |
| Toggle Off track | `#cecece` | **down** 1.57 |

**A light theme has almost nothing above its surface** — white is the ceiling and most surfaces are
already at or near it. So state has to be spent downward, into grey.

> **Rule: in dark mode, elevation and interaction point the same way. In light mode they point
> opposite ways.** A light theme built by naively inverting a dark one gets its hovers backwards.

### At white, the ladder stops entirely

A submenu floating over a menu, over the page — all three the same value:

```
page behind     #fcfcfb
menu            #ffffff
submenu on it   #ffffff     ← identical, no further step
```

**There is nowhere left to go.** Depth 2 is carried **entirely** by a rim and a soft shadow, with no
fill difference at all. In the dark reference the equivalent nesting was three distinct fills.

> **Rule: light mode gets roughly two fill levels, then hands off to borders and shadows. Dark mode
> gets four or five.** Plan the light theme around edges from the start rather than discovering
> halfway through that you have run out of greys.

### Direction summary

| Element | Light mode | Dark mode |
|---|---|---|
| Card, panel, raised container | **Up** towards white | **Up** towards white |
| Input fill | **Up** towards white | **Up** towards white |
| Hover / selected row | **Down** into grey | **Up** towards white |
| Recessed track, tray, well | **Down** into grey | **Down** towards black |
| Floating menu at the white ceiling | **No step** — rim + shadow | **Up** towards white |

---

## 4. Hover and state

| Transition | Ratio |
|---|---|
| Chrome → nav hover | 1.11 |
| Chrome → nav selected | 1.25 |
| Hover → selected | 1.13 |
| White → menu row hover | 1.11 |
| Segmented track → selected segment | 1.11 |

**a) The band is narrower and lower: roughly 1.10 to 1.25.** Dark mode ran 1.20 to 2.35 with an
icon-button hover at 2.33. Nothing here comes close — the loudest state change measured is 1.25.
**There is no room for a loud one, so light mode does not attempt it.**

**b) Hover and selected are separate values here**, where the dark reference used one value for
both — and this can afford it because the *selected* state also gets a focus ring and a bolder
label. **Splitting two states 1.13 apart is only safe when something non-colour also separates
them.**

**Neither app relies on hover alone.** Both put the affordance in the icon and the label first.
**That matters more here than in dark mode, because a 1.11 hover on a bright screen in daylight is
genuinely marginal.**

---

## 5. Edges, shadows and blur — the big divergence

**The dark references had no drop shadow anywhere. The light references have real ones.** This is
the single largest difference between the two modes, and it was checked by scanning across the edges
pixel by pixel.

A modal edge gives a smooth **30-pixel gradient**; a popover gives a **20-pixel falloff, then a hard
rim**. The dark equivalents went from panel to background in **one pixel**.

**A shadow is a darkening.** Darkening something already near-black does nothing; darkening
something near-white is highly visible. **Light mode can afford shadows, so it uses them; dark mode
cannot, so it uses lightness instead.**

### The three edge treatments

| Situation | Treatment | Ratio |
|---|---|---|
| Two surfaces nearly identical | **Darker hairline** | fills 1.07, line 1.14 |
| Docked chrome meets content | **Darker seam**, 2 px | fills 1.03, seam 1.24 |
| Something that genuinely floats | **Rim + soft gradient shadow** | rim 2.24 on white |

**The first row is exactly the dark-mode technique, unchanged** — a line darker than the page, in
both themes. **That rule does not flip.**

**What does flip is the *rim* on floating things.** In dark mode the rim was **lighter** than the
popover (1.20). In light mode it is **darker** and much louder (2.24). **Where dark mode says "this
floats" with lightness, light mode says it with a hard dark edge plus a blur.**

**Backdrops.** The modal scrim is a mid grey at **2.93** over white, faintly warm like the rest of
the palette. Two things to note: it is **much lighter than a naive 50% black**, and it is a *flat*
colour with the shadow gradient layered on top, not a blur. Neither app uses a backdrop filter in
either theme.

**Dividers** are drawn at **1.11** on white, barely there, where the dark references drew theirs at
1.59–1.60. **This is the compression from section 2 showing up again: light mode simply cannot make
a 1.6 divider without it reading as a heavy rule.**

---

## 6. Accent, focus and inversion

### The accent flips, the usage does not

| | Light | Dark |
|---|---|---|
| Accent | `#0067c0` — deep blue | `#4cc2ff` — pale blue |
| Text on the accent fill | `#ffffff`, 5.67 | near-black, 10.47 |
| Accent on its card | 5.48 | 7.06 |

**Same role in both themes — a solid fill with maximum-contrast text on it.** But the hue is
**re-picked per theme, not reused**: a deep blue on a dark ground would fail its floor, and a pale
blue on a light ground would too. **The two values are not tints of one another; they are two
separate answers to "what clears 4.5 here".**

One toggle's on-state measures 4.38 on white — under the text floor, though it is a non-text
component where 3.0 applies.

### Focus rings exist in light mode and were absent from the dark set

A **4 px ring, offset by a gap** from the selected row it surrounds, measuring 5.04 against the
chrome behind it and 4.03 against the row inside it — **deliberately readable against *both*
sides**, which is the same rule that governs a hairline between two planes.

**Nothing in the dark screenshots showed a focus ring. That is a gap in the dark reference set, not
evidence that dark mode does without one.**

### Inversion is a legitimate fourth move

A tooltip is near-black with white text — **19.68**, fully inverted against the light interface
around it. **It is not a step on the ladder; it steps off the ladder entirely.**

> **Rule: when a small transient element must be unmissable and the ramp has no room left, invert it
> rather than trying to find one more grey.** Tooltips, toasts and badges are the candidates.
> Anything persistent is not.

---

## 7. Light and dark, side by side

### Stays the same

| Rule | Evidence |
|---|---|
| Raised surfaces move **towards white** | the card is lighter than its page in *both* themes |
| The separating line is **darker than the page** | `#e5e5e5` light, `#1d1d1d` dark — same technique |
| Accent = solid fill + max-contrast text | both themes, both apps |
| Three text tiers, all solid, never opacity | both themes, both apps |
| Text at 15–20:1, not at the 4.5 floor | both themes, both apps |

### Flips

| | Light | Dark |
|---|---|---|
| Hover / selected direction | **down** into grey | **up** towards white |
| Rim on a floating surface | **darker** (2.24) | **lighter** (1.20) |
| Drop shadows | **real gradient blur** | **none at all** |
| Warm tint allowed | yes, one point | no, strictly neutral |
| Extreme text colour | near-black, not `#000` | pure `#ffffff` |

### Has no counterpart

| | |
|---|---|
| Available fill levels | light ~2, dark ~5 |
| State-change band | light 1.10–1.25, dark 1.20–2.35 |
| Divider strength | light 1.11, dark 1.59 |
| First step off the page | light 1.03–1.07, dark 1.15–1.30 |

**The one-sentence version: dark mode has range and spends it on fills; light mode has almost none
and spends borders and shadows instead.** Inverting one theme's numbers to make the other produces
backwards hovers, invisible shadows, and a ramp that runs out.

---

## 8. Checklist for a light theme

1. Near-neutral greys; at most a one-point warm tint on the off-white chrome. **Never more.**
2. Page below white if cards need to sit *above* it; page at white only if everything nests
   downward.
3. Expect about **two** usable fill levels, then plan on borders and shadows. **Do not try to build
   a light theme the way you would build a dark one.**
4. Raised containers and input fills go **towards white**; hover, selected, tracks and trays go
   **down into grey**. These are opposite directions and both are correct.
5. State changes land in **1.10–1.25**. If two states must sit 1.13 apart, something non-colour — a
   ring, a bolder label, an icon — has to separate them too.
6. Text in three tiers, roughly 16 / 6 / 4.5, all solid values, never opacity. Near-black, not pure
   black. **Check the secondary tier** — the reference misses it at 3.60.
7. Separating hairlines are **darker than the page** in light mode exactly as in dark mode.
8. Floating surfaces get a **dark rim plus a soft gradient shadow**; docked ones get a flat 2 px
   seam and no shadow.
9. Scrims are a mid grey around 2.9 over white, not a heavy black — **and measure before assuming a
   scrim is heavy.** A 50%-black scrim that looked far too dark composited to 3.7 in practice; the
   correction was real but much smaller than the wording suggests.
10. One accent, **re-picked for this theme** rather than reused from the dark one: a solid fill with
    white text on it.
11. Give focus its own ring, offset from the control, measured against **both** the control and the
    surface behind it.
12. When something small and transient must be unmissable, **invert it** rather than hunting for one
    more grey.
13. **Measure both directions with a script.** Every number in this document came from one.
