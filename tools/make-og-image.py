#!/usr/bin/env python3
"""Generate og-image.svg AND og-image.png from one set of constants.

    python tools/make-og-image.py

Why it exists: the two files used to be hand-synced, and they drifted. The PNG
carried a lime `#BFFF00` from a palette two generations back, plus copy
("Berlin Quiz", "310 FRAGEN") from when the app was Berlin-only, while the SVG
had moved on. Now the PNG is a screenshot of the SVG, so they cannot drift.
NEVER hand-edit one of the two outputs; change a constant here, re-run, and
commit both.

Redrawn 2026-10-10 against the current UI. The card is the app's DARK theme:
the neutral charcoal canvas and dark accent (it had kept the old slate
#10151D / #60A5FA), Bricolage Grotesque over Inter (it used Segoe UI and
Courier New), a sentence-case strap with no tracking (nothing in the app is
uppercase any more), and the header's full lockup - mark, "EIB Quiz" and
"Learn. Practise. Pass." - with the dark theme's per-bar glow, where it had
the bare mark.

The lockup is READ from docs/brand/ (the kit's dark horizontal SVG, text
already outlined), so re-run tools/make-logo-kit.mjs first if the logo
changes. The glow is index.html's #brandGlow filter and opacities (black 30%,
red 50%, yellow 70%); if those change there, change them here.

The headline stays descriptive: a link preview is read beside its own URL, so
the space is better spent saying what the thing IS. 300 is the number the
app's own hero and stats band give.

Needs Chrome, and Chrome needs the network (Google Fonts), exactly like
make-logo-kit.mjs. A social card is only ever seen small, so check the result
at thumbnail size rather than full width.
"""
import os
import re
import subprocess
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

W, H = 1200, 630
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = os.environ.get("CHROME", "C:/Program Files/Google/Chrome/Application/chrome.exe")

# --- palette: index.html's DARK tokens. Keep in step with :root. ---
BG = "#1A1A1A"          # --canvas
ACCENT = "#70ADFA"      # --accent
INK = "#FFFFFF"         # --text
MUTED = "#B3B3B3"       # --muted

# --- copy. Matches <title>: "300 Fragen + alle 16 Bundesländer (DE/EN)". ---
LINE1 = "Einbürgerungstest"
LINE2 = "Alle 16 Bundesländer"
STRAP = "300 Fragen · Deutsch & Englisch · kostenlos"

# --- geometry ---
LOGO = os.path.join("docs", "brand", "svg", "eib-quiz-logo-horizontal-dark.svg")
LOGO_X, LOGO_Y, LOGO_H = 90, 96, 84     # the lockup is 212.8 x 63 units
X_TEXT = 86                             # Bricolage's E has a side bearing
X_STRAP = 90                            # Inter's 3 has less
Y1, Y2, Y3 = 352, 448, 530              # text baselines
FS_BIG, FS_STRAP = 96, 34

FONTS = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:"
         "opsz,wght@96,700&family=Inter:wght@500&display=block")
HEAD = "'Bricolage Grotesque',sans-serif"
BODY = "Inter,sans-serif"


def logo():
    with open(os.path.join(ROOT, LOGO), encoding="utf8") as f:
        body = re.search(r"</title>(.*)</svg>", f.read(), re.S).group(1)
    # The glow blurs the three bar OUTLINES. Picked by fill, not by position, so
    # a reorder in the kit cannot swap the ramp: the dark kit draws the black
    # bar's full outline in its slate rim colour (the navy on top is inset).
    bars = dict(re.findall(r'fill="(#[0-9A-F]{6})" d="([^"]+)"', body))
    black, red, yellow = bars["#64748B"], bars["#E10600"], bars["#FFCC00"]
    glow = (f'<g filter="url(#brandGlow)" fill="{INK}">'
            f'<path fill-opacity=".3" d="{black}"/><path fill-opacity=".5" d="{red}"/>'
            f'<path fill-opacity=".7" d="{yellow}"/></g>')
    return f'<g transform="translate({LOGO_X},{LOGO_Y}) scale({LOGO_H / 63:g})">{glow}{body}</g>'


def svg():
    return f"""<svg viewBox="0 0 {W} {H}" width="{W}" height="{H}" xmlns="http://www.w3.org/2000/svg">
  <style>@import url("{escape(FONTS)}");</style>
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="{ACCENT}" stop-opacity="0.14"/>
      <stop offset="65%" stop-color="{BG}" stop-opacity="0"/>
    </radialGradient>
    <filter id="brandGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.69" result="a"/><feGaussianBlur in="SourceGraphic" stdDeviation="3.4" result="b"/><feComponentTransfer in="b" result="b2"><feFuncA type="linear" slope="0.36"/></feComponentTransfer><feMerge><feMergeNode in="b2"/><feMergeNode in="a"/></feMerge></filter>
  </defs>
  <rect width="{W}" height="{H}" fill="{BG}"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  {logo()}
  <text x="{X_TEXT}" y="{Y1}" font-family="{HEAD}" font-size="{FS_BIG}" font-weight="700" fill="{INK}" letter-spacing="-0.02em">{escape(LINE1)}</text>
  <text x="{X_TEXT}" y="{Y2}" font-family="{HEAD}" font-size="{FS_BIG}" font-weight="700" fill="{ACCENT}" letter-spacing="-0.02em">{escape(LINE2)}</text>
  <text x="{X_STRAP}" y="{Y3}" font-family="{BODY}" font-size="{FS_STRAP}" font-weight="500" fill="{MUTED}">{escape(STRAP)}</text>
</svg>
"""


def chrome(*args):
    # Headless Chrome makes its own throwaway profile; no --user-data-dir needed.
    r = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                        "--virtual-time-budget=10000", *args], capture_output=True, text=True)
    if r.returncode:
        raise SystemExit(f"Chrome failed ({r.returncode}):\n{r.stderr[-2000:]}")
    return r.stdout


def fonts_load():
    # Chrome silently falls back to another face when Google Fonts is out of
    # reach, and the card would ship in it. Probe the same stylesheet first.
    page = (f'<link rel="stylesheet" href="{escape(FONTS)}"><script>'
            "Promise.all([document.fonts.load('700 96px \"Bricolage Grotesque\"'),"
            "document.fonts.load('500 34px Inter')]).then(r=>document.title="
            "r.every(f=>f.length)?'FONTS_OK':'FONTS_MISSING')</script>")
    return "<title>FONTS_OK</title>" in chrome("--dump-dom", "data:text/html," + quote(page))


def png(svg_path, out):
    # The SVG carries its own width and height and an SVG document has no body
    # margin, so a window of the card's size screenshots exactly the card.
    chrome(f"--window-size={W},{H}", f"--screenshot={out}", Path(svg_path).as_uri())


if __name__ == "__main__":
    if not fonts_load():
        raise SystemExit("Bricolage Grotesque / Inter did not load from Google Fonts "
                         "(Chrome needs the network). Nothing written.")
    s = svg()
    p = os.path.join(ROOT, "og-image.svg")
    with open(p, "w", encoding="utf8", newline="") as f:
        f.write(s)
    print("wrote", p)
    q = os.path.join(ROOT, "og-image.png")
    png(p, q)
    print("wrote", q, os.path.getsize(q) // 1024, "KB")
