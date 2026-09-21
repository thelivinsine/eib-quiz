#!/usr/bin/env python3
"""Generate og-image.svg AND og-image.png from one set of constants.

NOT YET RUN FOR PRODUCTION. The social card is deliberately deferred until the
landing-page refactor lands (docs/plans/landing-page-refactor.md), because that
refactor settles the branding the card should carry. Running this today WILL
overwrite the committed og-image.svg and og-image.png with copy that has not
been agreed — so run it only when you mean to ship the new card, and commit
both outputs together.

Why it exists: the two files used to be hand-synced, and they drifted. The PNG
carried a lime `#BFFF00` from a palette two generations back, plus copy
("Berlin Quiz", "310 FRAGEN") from when the app was Berlin-only, while the SVG
had moved on. A rasteriser that reads the same constants as the vector cannot
drift that way again.

    python tools/make-og-image.py

Before running, revisit the three copy constants below against whatever the
refactor decides the brand is. The values here are a provisional pass: they
match the current <title>, not the mockup's "EIB Quiz / Learn · Practice ·
Pass" lockup. A social card is only ever seen small, so check the result at
thumbnail size rather than full width.
"""
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

# --- palette: mirrors index.html's dark tokens. Keep in step with :root. ---
BG = "#10151D"          # --canvas (dark)
ACCENT = "#60A5FA"      # --accent (dark)
INK = "#FFFFFF"         # --on-dark
MUTED = "#98A1B0"       # --muted (dark)

# --- copy. Matches <title>: "300 Fragen + alle 16 Bundesländer (DE/EN)". ---
LINE1 = "Einbürgerungstest"
LINE2 = "Alle 16 Bundesländer"
STRAP = "300 FRAGEN · DE / EN · KOSTENLOS"

# --- geometry, shared by both outputs ---
MARK = (90, 150, 96)            # x, y, size
TICK = [(26, 50), (42, 67), (72, 32)]   # in mark-local coords
TICK_W = 10
Y1, Y2, Y3 = 370, 460, 535      # text baselines
X_TEXT, X_STRAP = 90, 92
FS_BIG, FS_STRAP, TRACK = 92, 34, 6

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F_BIG = r"C:\Windows\Fonts\seguibl.ttf"      # Segoe UI Black ~ weight 800
F_MONO = r"C:\Windows\Fonts\consola.ttf"


def svg():
    mx, my, ms = MARK
    tick = " ".join(f"{'M' if i == 0 else 'L'}{x} {y}" for i, (x, y) in enumerate(TICK))
    return f"""<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="{W}" height="{H}" fill="{BG}"/>
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="{ACCENT}" stop-opacity="0.16"/>
      <stop offset="65%" stop-color="{BG}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  <g transform="translate({mx},{my})">
    <rect x="0" y="0" width="{ms}" height="{ms}" rx="20" fill="{BG}" stroke="{ACCENT}" stroke-width="3" opacity="0.6"/>
    <path d="{tick}" fill="none" stroke="{ACCENT}" stroke-width="{TICK_W}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="{X_TEXT}" y="{Y1}" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="{FS_BIG}" font-weight="800" fill="{INK}" letter-spacing="-2">{LINE1}</text>
  <text x="{X_TEXT}" y="{Y2}" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="{FS_BIG}" font-weight="800" fill="{ACCENT}" letter-spacing="-2">{LINE2}</text>
  <text x="{X_STRAP}" y="{Y3}" font-family="'Courier New',monospace" font-size="{FS_STRAP}" fill="{MUTED}" letter-spacing="{TRACK}">{STRAP}</text>
</svg>
"""


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def png():
    img = Image.new("RGB", (W, H), hex2rgb(BG))

    # radial glow: accent at 16% from the top-centre, gone by 65% of r
    cx, cy, r = W / 2, 0.0, W * 0.8
    glow = Image.new("L", (W, H), 0)
    gp = glow.load()
    for y in range(H):
        dy2 = (y - cy) ** 2
        for x in range(0, W, 2):          # every other column, then smooth
            d = ((x - cx) ** 2 + dy2) ** 0.5 / r
            v = 0.0 if d >= 0.65 else (1 - d / 0.65) * 0.16
            gp[x, y] = int(v * 255)
            if x + 1 < W:
                gp[x + 1, y] = int(v * 255)
    img = Image.composite(Image.new("RGB", (W, H), hex2rgb(ACCENT)), img, glow)

    d = ImageDraw.Draw(img)
    mx, my, ms = MARK

    # the mark: a 60%-opacity accent hairline, composited by hand
    edge = tuple(round(b + (a - b) * 0.6)
                 for a, b in zip(hex2rgb(ACCENT), hex2rgb(BG)))
    d.rounded_rectangle([mx, my, mx + ms, my + ms], radius=20,
                        fill=hex2rgb(BG), outline=edge, width=3)

    pts = [(mx + x, my + y) for x, y in TICK]
    d.line(pts, fill=hex2rgb(ACCENT), width=TICK_W, joint="curve")
    for x, y in pts:                      # round caps
        d.ellipse([x - TICK_W // 2, y - TICK_W // 2,
                   x + TICK_W // 2, y + TICK_W // 2], fill=hex2rgb(ACCENT))

    big = ImageFont.truetype(F_BIG, FS_BIG)
    mono = ImageFont.truetype(F_MONO, FS_STRAP)
    # SVG y is a BASELINE; PIL's anchor "ls" is left-baseline, so they agree.
    d.text((X_TEXT, Y1), LINE1, font=big, fill=hex2rgb(INK), anchor="ls")
    d.text((X_TEXT, Y2), LINE2, font=big, fill=hex2rgb(ACCENT), anchor="ls")

    x = X_STRAP                            # letter-spacing, drawn by hand
    for ch in STRAP:
        d.text((x, Y3), ch, font=mono, fill=hex2rgb(MUTED), anchor="ls")
        x += mono.getlength(ch) + TRACK
    return img


if __name__ == "__main__":
    p = os.path.join(ROOT, "og-image.svg")
    with open(p, "w", encoding="utf8", newline="") as f:
        f.write(svg())
    print("wrote", p)
    q = os.path.join(ROOT, "og-image.png")
    png().save(q, "PNG", optimize=True)
    print("wrote", q, os.path.getsize(q) // 1024, "KB")
