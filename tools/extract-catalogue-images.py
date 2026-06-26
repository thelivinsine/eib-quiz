#!/usr/bin/env python3
"""
Enumerate + extract image questions from the official BAMF catalogue PDF
(img/gesamtfragenkatalog-lebenindeutschland.pdf).

Authoritative source of "which questions have images" — the catalogue JSON has no
image flag and text heuristics miss prompt-image questions (e.g. Aufgabe 187/216).

Usage:
  python3 tools/extract-catalogue-images.py enumerate   # -> tools/data/catalogue-image-map.json + printout
  python3 tools/extract-catalogue-images.py extract      # render+crop into img/upload/_pdf/
"""
import fitz, re, json, sys, os, unicodedata

PDF = "img/gesamtfragenkatalog-lebenindeutschland.pdf"
HEADER_Y = 150          # images with top y < this are the page header logo -> ignore
STATE_NAME_TO_CODE = {
    "Baden-Württemberg": "BW", "Bayern": "BY", "Berlin": "BE", "Brandenburg": "BB",
    "Bremen": "HB", "Hamburg": "HH", "Hessen": "HE", "Mecklenburg-Vorpommern": "MV",
    "Niedersachsen": "NI", "Nordrhein-Westfalen": "NW", "Rheinland-Pfalz": "RP",
    "Saarland": "SL", "Sachsen": "SN", "Sachsen-Anhalt": "ST",
    "Schleswig-Holstein": "SH", "Thüringen": "TH",
}

def norm(s):
    s = unicodedata.normalize("NFC", s or "")
    s = s.replace("„", '"').replace("“", '"').replace("”", '"').replace("–", "-")
    return re.sub(r"\s+", " ", s).strip().lower()

def enumerate_pdf():
    doc = fitz.open(PDF)
    state = None            # current "Teil II" state code, None = general (Teil I)
    results = []
    for pno in range(doc.page_count):
        page = doc[pno]
        d = page.get_text("dict")
        full = page.get_text()
        # update state context on a "Teil II Fragen für das Bundesland X" page.
        # match longest state name first so "Sachsen-Anhalt" wins over "Sachsen".
        if "Teil II" in full:
            for nm in sorted(STATE_NAME_TO_CODE, key=len, reverse=True):
                if ("Bundesland " + nm) in full:
                    state = STATE_NAME_TO_CODE[nm]; break

        # collect Aufgabe headings with their y position, and the line after (question stem)
        headings = []   # (y0, num, stem)
        lines = []      # (y0, text)
        for b in d["blocks"]:
            for l in b.get("lines", []):
                txt = "".join(sp["text"] for sp in l["spans"]).strip()
                if txt:
                    lines.append((l["bbox"][1], txt))
        lines.sort()
        for i, (y, txt) in enumerate(lines):
            hm = re.match(r"Aufgabe\s+(\d+)\s*$", txt)
            if hm:
                # join following lines into the stem until the next heading, an answer
                # option, an image credit, or a terminal "?" (questions end with "?").
                parts = []
                for (_, t2) in lines[i+1:]:
                    if re.match(r"Aufgabe\s+\d", t2) or t2.startswith("©") \
                            or re.match(r"^(Seite\s+\d)", t2):
                        break
                    parts.append(t2)
                    if t2.rstrip().endswith("?"):
                        break
                stem = re.sub(r"\s+", " ", " ".join(parts)).strip()
                headings.append((y, int(hm.group(1)), stem))

        # capture any copyright credit lines on the page (e.g. "© Deutscher Bundestag/...")
        credits = [t for (_, t) in lines if t.strip().startswith("©")]

        # collect content images (exclude header logo band)
        imgs = [im for im in page.get_image_info(xrefs=True) if im["bbox"][1] >= HEADER_Y]

        if not headings or not imgs:
            continue
        # assign each image to nearest heading above it
        headings.sort()
        for (hy, num, stem) in headings:
            mine = [im for im in imgs
                    if im["bbox"][1] >= hy - 5
                    and not any(hy2 > hy and im["bbox"][1] >= hy2 - 5 for (hy2, _, _) in headings)]
            if not mine:
                continue
            mine.sort(key=lambda im: im["bbox"][0])  # left-to-right
            cat_id = f"{state}-{num}" if state else str(num)
            typ = "option" if len(mine) >= 3 else "prompt"
            results.append({
                "page": pno, "state": state, "aufgabe": num, "cat_id": cat_id,
                "type": typ, "n_images": len(mine), "stem": stem,
                "boxes": [[round(v, 1) for v in im["bbox"]] for im in mine],
                "xrefs": [im.get("xref") for im in mine],
                "credit": credits[0] if credits else None,
            })
    return results

def load_app():
    return json.load(open("questions.json", encoding="utf-8"))

def reconcile(results):
    app = load_app()
    rows = []
    for r in results:
        ns = norm(r["stem"])
        # substring match (robust to line-wrapping): app `de` contained in the PDF stem
        # or vice-versa; prefer same-state candidates.
        cand = [q for q in app
                if ns and (norm(q["de"]) in ns or ns in norm(q["de"])
                           or norm(q["de"])[:40] == ns[:40]
                           or norm(q["de"])[-40:] == ns[-40:])]
        appq = None
        if r["state"]:
            for q in cand:
                if q.get("state") == r["state"]:
                    appq = q; break
        appq = appq or (cand[0] if cand else None)
        tagged = bool(appq and (appq.get("image") or appq.get("option_images"))) if appq else None
        rows.append({**r,
                     "app_id": appq["id"] if appq else None,
                     "app_tagged": tagged,
                     "app_de": appq["de"] if appq else None})
    return rows, app

def render_box(page, box, zoom=4.0, pad=2):
    r = fitz.Rect(box[0]-pad, box[1]-pad, box[2]+pad, box[3]+pad)
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), clip=r, alpha=False)
    return pix

def extract(rows, only=None, outdir="img/upload/_pdf"):
    doc = fitz.open(PDF)
    os.makedirs(outdir, exist_ok=True)
    n = 0
    for r in rows:
        if only and r["cat_id"] not in only and str(r.get("app_id")) not in only:
            continue
        page = doc[r["page"]]
        d = os.path.join(outdir, (r["cat_id"] or "x").replace("/", "_"))
        os.makedirs(d, exist_ok=True)
        for i, box in enumerate(r["boxes"], 1):
            pix = render_box(page, box)
            fn = os.path.join(d, f"img{i}.png")
            pix.save(fn)
            n += 1
    print(f"rendered {n} image crops into {outdir}")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "enumerate"
    res = enumerate_pdf()
    rows, app = reconcile(res)
    os.makedirs("tools/data", exist_ok=True)
    json.dump(rows, open("tools/data/catalogue-image-map.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    opt = [r for r in rows if r["type"] == "option"]
    pr = [r for r in rows if r["type"] == "prompt"]
    print(f"IMAGE QUESTIONS FOUND IN PDF: {len(rows)}  (option-image={len(opt)}, prompt-image={len(pr)})")
    untagged = [r for r in rows if r["app_tagged"] is False]
    unmatched = [r for r in rows if r["app_id"] is None]
    print(f"  mapped to app questions: {sum(1 for r in rows if r['app_id'])}/{len(rows)}")
    print(f"  currently UNTAGGED in app (image missing): {len(untagged)}")
    print()
    print("=== PROMPT-IMAGE questions (image + text answers) ===")
    for r in pr:
        flag = "" if r["app_tagged"] else "  <-- UNTAGGED in app!"
        print(f"  cat {r['cat_id']:<6} app Q{r['app_id']}  imgs={r['n_images']}  {r['stem'][:55]}{flag}")
    print()
    print("=== OPTION-IMAGE questions ===")
    for r in opt:
        flag = "" if r["app_tagged"] else "  <-- UNTAGGED!"
        print(f"  cat {r['cat_id']:<6} app Q{r['app_id']}  imgs={r['n_images']}  {r['stem'][:50]}{flag}")
    if unmatched:
        print("\n=== UNMATCHED to app (review) ===")
        for r in unmatched:
            print(f"  cat {r['cat_id']:<6} {r['type']} {r['stem'][:60]}")

    if cmd in ("extract", "samples"):
        only = set(sys.argv[2:]) or None
        extract(rows, only=only)
