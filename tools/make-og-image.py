#!/usr/bin/env python3
"""Generate og-image.svg AND og-image.png from one set of constants.

    python tools/make-og-image.py

Run for production on 2026-09-21, at the end of the landing-page refactor. It
was held back until then because that refactor settled the branding the card
carries — doing it earlier would have meant doing it twice.

Why it exists: the two files used to be hand-synced, and they drifted. The PNG
carried a lime `#BFFF00` from a palette two generations back, plus copy
("Berlin Quiz", "310 FRAGEN") from when the app was Berlin-only, while the SVG
had moved on. A rasteriser that reads the same constants as the vector cannot
drift that way again. NEVER hand-edit one of the two outputs; change a constant
here, re-run, and commit both.

The mark is the German flag in a rounded square, the same mark the header wears
since phase 6. It replaced a drawn tick, which said nothing about the subject
and was the one stroked glyph left anywhere in the project.

The copy stays descriptive rather than the "EIB Quiz / Learn · Practise · Pass"
lockup: a link preview is read beside its own URL, so the space is better spent
saying what the thing IS. 300 is the number the app's own hero and stats band
give (the 460 in the repo counts all sixteen states' sets, of which a reader
ever sees ten).

A social card is only ever seen small, so check the result at thumbnail size
rather than full width.
"""
import os
from xml.sax.saxutils import escape

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
# The flag's own values, as in index.html's .brand-mark. Not theme tokens.
FLAG = ("#000000", "#DD0000", "#FFCE00")
Y1, Y2, Y3 = 370, 460, 535      # text baselines
X_TEXT, X_STRAP = 90, 92
FS_BIG, FS_STRAP, TRACK = 92, 34, 6

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Font files, in preference order. PIL needs a real path and every OS keeps
# them somewhere different, so name candidates and take the first that exists
# rather than hardcoding one machine's layout.
F_BIG = ["C:/Windows/Fonts/seguibl.ttf",      # Segoe UI Black ~ weight 800
         "/System/Library/Fonts/Supplemental/Arial Black.ttf",
         "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
F_MONO = ["C:/Windows/Fonts/consola.ttf",
          "/System/Library/Fonts/Menlo.ttc",
          "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]


def font(candidates, size):
    """First candidate that exists. A clear message beats PIL's bare OSError."""
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    raise SystemExit("No usable font found. Tried:\n  " + "\n  ".join(candidates)
                     + "\nAdd this machine's font path to the list in " + __file__)


def svg():
    mx, my, ms = MARK
    band = ms / 3
    bands = "".join(
        f'<rect x="0" y="{i * band:g}" width="{ms}" height="{band:g}" fill="{c}"/>'
        for i, c in enumerate(FLAG))
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
    <clipPath id="mark"><rect width="{ms}" height="{ms}" rx="20"/></clipPath>
    <g clip-path="url(#mark)">{bands}</g>
  </g>
  <text x="{X_TEXT}" y="{Y1}" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="{FS_BIG}" font-weight="800" fill="{INK}" letter-spacing="-2">{escape(LINE1)}</text>
  <text x="{X_TEXT}" y="{Y2}" font-family="'Segoe UI',Helvetica,Arial,sans-serif" font-size="{FS_BIG}" font-weight="800" fill="{ACCENT}" letter-spacing="-2">{escape(LINE2)}</text>
  <text x="{X_STRAP}" y="{Y3}" font-family="'Courier New',monospace" font-size="{FS_STRAP}" fill="{MUTED}" letter-spacing="{TRACK}">{escape(STRAP)}</text>
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

    # The mark: three bands drawn into a rounded-rectangle mask, which is the
    # raster equivalent of the SVG's clipPath rather than a second design.
    mark = Image.new("RGB", (ms, ms), hex2rgb(FLAG[0]))
    md = ImageDraw.Draw(mark)
    for i, c in enumerate(FLAG):
        md.rectangle([0, round(i * ms / 3), ms, round((i + 1) * ms / 3)], fill=hex2rgb(c))
    mask = Image.new("L", (ms, ms), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, ms - 1, ms - 1], radius=20, fill=255)
    img.paste(mark, (mx, my), mask)

    d = ImageDraw.Draw(img)

    big = font(F_BIG, FS_BIG)
    mono = font(F_MONO, FS_STRAP)
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
