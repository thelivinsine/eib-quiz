# Dark mode reference — colour, hover and edge treatment

Written from eight screenshots of the ChatGPT desktop app and the Windows PowerToys settings app.
**Every value here was read out of the pixels**, not eyeballed: the images were decoded and sampled
at named coordinates, and every ratio is the standard relative-luminance formula.

Scope: colour values, state changes, and how edges between components are drawn. **Layout is out of
scope on purpose.** The companion is [`theme-light.md`](theme-light.md), whose section 7 sets the two
themes side by side.

**This is source material about two other applications.** It describes what they do; it makes no
claim about any project that reads it.

---

## 1. The two palettes, as measured

### ChatGPT desktop — dark

| Role | Hex | Contrast vs. its own ground |
|---|---|---|
| Canvas — page **and** sidebar, one shade, no seam | `#000000` | — |
| Sidebar row, hover **and** active | `#1a1a1a` | 1.21 on canvas |
| Panel / modal sheet / composer pill | `#212121` | 1.30 on canvas |
| Control fill in a panel — icon button rest, selected nav row | `#303030` | 1.22 on panel |
| Nav row hover | `#383838` | 1.37 on panel |
| Hairline / divider / input stroke | `#424242` | 1.60 on panel |
| Icon button **hover** | `#676767` | **2.33 on its own rest fill** |
| Floating popover fill | `#353535` | 1.71 on canvas |
| Popover rim, 1 px | `#414141` | 1.20 on popover |
| Popover selected row | `#4a4a4a` | 1.38 on popover |
| Popover divider | `#535353` | 1.59 on popover |
| Sunk text-entry well inside a panel | `#000000` | 1.30 **below** panel |
| Primary text | `#ffffff` | 16.10 |
| Secondary text | `#afafaf` | 7.34 |
| Placeholder | `#828c8d` | 4.67 |

### PowerToys (WinUI 3) — dark

| Role | Hex | Contrast vs. its own ground |
|---|---|---|
| Page | `#202020` | — |
| Card | `#2b2b2b` | 1.15 on page |
| Card edge line — **darker than the page** | `#1d1d1d` | 1.03 on page, 1.19 under the card |
| Sub-row inside a card | `#2d2d2d` | 1.03 on card |
| Control stroke / input fill | `#383838` | 1.21 on card |
| Accent | `#4cc2ff` | 7.06 on card, 8.12 on page |
| Text **on** an accent fill | near-black | 10.47 |
| Primary text | `#ffffff` | 16.29 |
| Secondary text | `#cccccc` | 10.15 |

---

## 2. Colour rules both apps follow

**Greys are perfectly neutral.** Every surface value in both apps has R = G = B *exactly*. No warm
tint, no cool tint, no fashionable dark navy. All the chroma on screen lives in content and in at
most one accent. **A tinted dark grey photographs well in a mockup and goes muddy on a real
monitor.**

**The ramp is logarithmic, not linear.** Steps get bigger in hex as you climb, because the eye needs
a larger absolute step at higher luminance to see the same difference:

```
ChatGPT:   00  →  21  →  30  →  38  →  42  →  67
hex gap:      33     15      8     10     37
ratio:      1.30   1.22   1.13   1.20   2.33
```

`+0x08` near the bottom is invisible; the same `+0x08` at `#303030` → `#383838` is a perfectly
usable hover. **Near black, spend hex generously. Higher up, spend it carefully.** This is the single
most common reason a hand-picked dark ramp feels wrong: **even hex spacing produces uneven perceived
spacing.**

**Body text is 16:1, not 4.5:1.** Both apps put pure white on their darkest surfaces, and neither
treats 4.5 as a target — 4.5 is where the *third* tier lands, and only just.

| Tier | ChatGPT | PowerToys |
|---|---|---|
| Primary | 16.10 | 16.29 |
| Secondary | 7.34 | 10.15 |
| Placeholder / disabled | 4.67 | — |

**Three text weights, not five.** Four greys at 9, 8, 7 and 6 read as one mushy grey; three at 16,
7.5 and 4.7 read as a hierarchy.

**Nothing is dimmed with opacity.** Every softer shade is its own solid value. **Opacity over a dark
ground pulls a colour towards the ground and quietly destroys the ratio you measured.**

---

## 3. The nesting ladder — deeper means lighter

**This is the organising principle underneath everything else here.** Every level of containment
steps *lighter* than the thing containing it, monotonically, every time.

| Depth | ChatGPT panel | ChatGPT popover | PowerToys |
|---|---|---|---|
| 0 — page | `#000000` | `#000000` | `#202020` |
| 1 — the container | `#212121` panel **1.30** | `#353535` menu **1.71** | `#2b2b2b` card **1.15** |
| 2 — a component inside it | `#303030` control **1.22** | `#4a4a4a` row hover **1.38** | `#2d2d2d` sub-row **1.03** |
| 3 — a component inside *that* | `#383838` hover **1.13** | — | `#383838` input **1.17** |

Three things fall out of it:

**a) The step *shrinks* with depth** — 1.30, then 1.22, then 1.13. There is less headroom at each
level, so each level is allowed less of it. **This is why depth 3 stops working with fill alone and
needs a hairline instead.**

**b) How far a container jumps encodes how much it floats.** A docked settings panel sits 1.30 off
the page; a floating popover, at the *same* nesting depth, sits **1.71**. **The ladder is not a fixed
scale you index into — the size of the first jump is the elevation signal.**

**c) The ladder and the hover ladder are the same ladder.** A hover is one more rung. **Nesting depth
and interaction state spend from one shared budget**, which is why a theme that spends it all on
nesting has nothing left for hover.

### The two exceptions

**Large multi-line entry wells go down** — one textarea sits 1.30 *below* its container, the only
element in the whole sample that reverses direction. **The distinction is affordance, not size**: a
chip or a button is a raised object you press; a big text well is a hole you type into. It only works
because the panel sits 1.30 above black in the first place — **on a compressed ramp there is nothing
to sink to, and a sunk element reads as a gap rather than a well.**

**Single-line fields don't move at all** — the panel shade exactly, with a stroke around it. **It is
an outline, not a surface**, and it is the safe default when the ramp is tight.

| Element | Direction | Why |
|---|---|---|
| Panel, card, popover, menu | **Up**, by a lot if it floats | it contains things |
| Chip, pill, tag, icon button, row | **Up**, by less | a raised, pressable object |
| Single-line field, search box | **Neither** — stroke only | an outline, not a surface |
| Large multi-line entry well | **Down** one step | a hole you type into |

> **Rule: containment goes up, recession goes down, and only one element type recedes.** If you
> cannot say which of the two a component is, outline it instead of filling it.

---

## 4. Hover and state — where the headroom goes

**This is the part most dark themes get wrong, and it is a colour problem, not a layout one.** Look
at what is reserved *above* the panel shade:

```
#212121   panel                                  ← the resting surface
#303030   control at rest            1.22 on panel
#383838   nav row hover              1.37 on panel
#424242   borders                    1.60 on panel
#676767   icon button hover          2.33 on the control's own rest fill
```

**Five usable levels above the resting surface**, and the loudest hover is not a polite nudge — a
2.33 ratio, **a bigger jump than the one between the page and the panel.**

| Transition | Ratio | Note |
|---|---|---|
| Sidebar row rest → hover | 1.21 | quietest state in either app |
| Sidebar row hover = selected | 1.21 | **the same value; not distinguished by fill** |
| Nav row rest → hover | 1.37 | |
| Popover row rest → selected | 1.38 | |
| Icon button rest → hover | 2.33 | loudest |

**a) 1.20 is the floor for a state change, and the top of the range is much higher than people
expect.** Anything under about 1.15 is not a hover, it is a rounding error — **and no contrast
script will flag it, because both values pass on their own.** The useful band is roughly **1.20 to
2.35**, with small icon buttons at the loud end because they have no label to signal with.

**b) Hover and selected can share a value**, with the distinction carried by text weight and
persistent icons. **Inventing a separate shade between hover and rest is how a ramp runs out of
room.**

**The failure mode this prevents:** a theme picks a page and a card, both look good in a static
mockup, and then every hover, focus and selected state has to be squeezed into whatever is left.
Everything ends up 1.04 apart and the interface feels dead. **Choose the resting surface so there is
room above it, then design the states.**

**Hover is not the only signal, because touch has no hover.** Both apps carry the state in the icon
and the label too; the fill is reinforcement, not the whole message.

---

## 5. Edges, shadows and blur

**Neither app uses a drop shadow. Anywhere.** Checked in three places — a modal sheet, a popover
menu and a card — and each gives panel to backdrop in one or two pixels, at a *fixed* value, with no
falloff and no penumbra.

**Elevation is expressed by lightness and a hairline, not by blur.** A thing that floats is lighter;
a thing that is docked is darker; the boundary is one or two solid pixels. **A soft blurred shadow
over a dark ground is nearly invisible anyway** — you are darkening something that is already almost
black — so both apps spend the pixel on an edge instead.

### The three edge treatments

| Situation | Treatment | Ratio |
|---|---|---|
| Two surfaces far apart in lightness | **No edge at all** | 1.30 |
| Two surfaces nearly identical | **Darker hairline** below/left | fills 1.15, line 1.19 under the card |
| Something that genuinely floats | **Lighter rim**, 1 px | 1.20 |

**The middle row is the most transferable trick in either app.** One card is only **1.15** from its
page and its sub-rows **1.03** from the card — effectively the same colour — and both are separated
entirely by a line *darker than the page itself*. **A dark hairline reads as a shadow, which is what
the eye expects between stacked physical objects.** A *light* hairline in dark mode reads as a
rim-lit outline, which is louder and correctly reserved for the floating popover.

> **Rule: below ~1.20 between two touching surfaces, stop pushing the fills apart and draw the edge
> instead — and in dark mode, draw it darker, not lighter.**

**Backdrops** are a heavy near-opaque scrim, not a glassy blur: content behind flattens almost to
the canvas, and a saturated button behind it dims nearly out of existence. **The scrim's job is to
remove the background from consideration, not to decorate it.** Nothing in either app depends on a
backdrop filter.

**Dividers are drawn *lighter* than the surface they sit on, and well above the fill steps around
them** — 1.60 and 1.59 inside panels, against surface steps of 1.15–1.30. **A divider is deliberately
more contrasty than the panel-to-page step: it has to survive being one pixel tall.**

---

## 6. Accent colour — absent, or structural

The two apps take opposite positions, and both are coherent.

**One has no accent colour in its chrome at all.** Sidebar, settings, modals, menus, buttons — greys
and white. The only saturated pixels in the entire set are inside message content and one send
button. **Every affordance is carried by lightness.**

**The other uses one accent constantly, and always the same way: as a fill with near-black text on
it.** Measured 7.06 on a card, 8.12 on the page, and **10.47 for the dark text sitting on the
accent**. Never accent-coloured body text on a dark ground, never an accent-tinted border doing
structural work.

Note the accent is a **light** blue, not a mid blue. **On a dark ground a mid-saturation brand colour
usually fails its contrast floor**; the dark variant has to be lightened until it clears, and then it
is bright enough to be used as a fill with dark text on top.

> **Rule: pick one accent job and do only it.** Either the accent fills small solid shapes with dark
> text on top, or a *lightened* variant writes words. Doing both with one value breaks one of them.

**One measured wobble, kept honest.** A destructive menu item is red text at **3.17** on its menu,
under the 4.5 floor, and it ships anyway — carried by the red icon beside it. **The reference is not
perfect here.** A lighter red clears 4.5 on the same ground without losing the meaning.

**What is *not* coherent is the common middle ground:** accent-tinted borders, accent backgrounds at
8% opacity, and accent text at three different weights, all at once. **Neither reference does any of
it.**

---

## 7. Checklist

1. Neutral greys — R = G = B on every surface value. Chroma comes from the accent and content.
2. Page shade chosen against the *deepest* thing you need. Pure black only if nothing recedes below
   the page; the moment you want a shadow line or a sunk well, start higher so there is floor space
   beneath you.
3. Six surface values, logarithmically spaced — big steps near black, small ones higher up.
4. **Every level of containment steps lighter than its container**, by a shrinking amount: roughly
   1.30, then 1.22, then 1.13. Only a large entry well goes down; when in doubt, outline instead of
   filling.
5. Nesting and hover spend from the **same** budget. Count the deepest nesting you need *and* the
   states it has to support before fixing the card shade.
6. Text in three tiers, roughly 16 / 8 / 4.7, all solid values, never opacity.
7. Every pointer-reactive element has a hover **≥ 1.20** above its own rest fill; small unlabelled
   icon buttons go to ~2.3. Hover and selected may share a value.
8. Surfaces closer than ~1.20 get an edge instead of more fill: a **darker** hairline for stacking, a
   lighter 1 px rim only for things that genuinely float.
9. Dividers inside a panel are ~1.6 against it — louder than the surface steps around them.
10. No drop shadows, no backdrop blur. Elevation is lightness plus a hairline.
11. One accent, one job: a bright fill with dark text on it, or a lightened variant for words.
12. **Measure both directions with a script.** Every number in this document came from one.
