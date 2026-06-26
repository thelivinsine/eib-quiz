#!/usr/bin/env python3
"""
Build final image assets from the PDF crops (img/upload/_pdf, produced by
extract-catalogue-images.py) and wire them into questions.json.

Three question shapes:
  - option : 4 separate images  -> option_images[4], keep options/correct
  - composite (maps + Q130): 1 image + numbered "1/2/3/4" answers -> image, options=1..4
  - prompt : 1 image + existing text answers -> image, keep options/correct

All `correct` indices were visually verified to already match the catalogue
ordering, so they are preserved as-is.
"""
import json, os, shutil
from PIL import Image

SRC = "img/upload/_pdf"
rows = {r["cat_id"]: r for r in json.load(open("tools/data/catalogue-image-map.json", encoding="utf-8"))}
app = json.load(open("questions.json", encoding="utf-8"))
byid = {q["id"]: q for q in app}

# catalogue cat_id -> app id and shape are already in rows; helpers:
def crop(cat, i):  # path to i-th crop (1-based)
    return f"{SRC}/{cat.replace('/', '_')}/img{i}.png"

def ensure(d):
    os.makedirs(d, exist_ok=True)

# credits captured from the PDF (© lines)
CREDITS = {r["app_id"]: r["credit"] for r in rows.values() if r.get("credit") and r.get("app_id")}

# ---- 1) general option-image questions (4 separate) ----
GEN_OPT = {
    21:  ("img/q21",  ["Bundeswappen (Deutschland)", "Christusmonogramm (Chi-Rho)", "Bundeswehr-Kreuz", "DDR-Emblem"],
                      ["Federal coat of arms (Germany)", "Chi-Rho (Christogram)", "Bundeswehr Cross", "GDR emblem"]),
    209: ("img/q209", ["Bundeswappen (Deutschland)", "Christusmonogramm (Chi-Rho)", "Bundeswehr-Kreuz", "DDR-Emblem"],
                      ["Federal coat of arms (Germany)", "Chi-Rho (Christogram)", "Bundeswehr Cross", "GDR emblem"]),
    226: ("img/q226", ["Flagge der USA", "Flagge der Europäischen Union", "Flagge der Vereinten Nationen", "anderes Emblem"],
                      ["Flag of the USA", "Flag of the European Union", "Flag of the United Nations", "another emblem"]),
}
def cat_for_app(aid):
    for cid, r in rows.items():
        if r["app_id"] == aid:
            return cid, r
    raise KeyError(aid)

for aid, (folder, de_opts, en_opts) in GEN_OPT.items():
    cid, r = cat_for_app(aid)
    ensure(folder)
    paths = []
    for i in range(1, 5):
        dst = f"{folder}/o{i}.png"
        shutil.copyfile(crop(cid, i), dst)
        paths.append(dst)
    q = byid[aid]
    q["options"] = de_opts; q["options_en"] = en_opts
    q["option_images"] = paths
    q.pop("image", None)

# ---- 2) state Wappen (4 separate), keep "1..4" labels ----
for r in rows.values():
    cid = r["cat_id"]
    if not (cid.endswith("-1") and r["type"] == "option"):
        continue
    code = cid.split("-")[0]
    folder = f"img/states/{code}"; ensure(folder)
    paths = []
    for i in range(1, 5):
        dst = f"{folder}/{code}-1-{i}.png"
        shutil.copyfile(crop(cid, i), dst)
        paths.append(dst)
    q = byid[r["app_id"]]
    q["options"] = ["1", "2", "3", "4"]; q["options_en"] = ["1", "2", "3", "4"]
    q["option_images"] = paths
    q.pop("image", None)

# ---- 3) composite questions: maps (*-8) + Q130 -> single image, "1..4" answers ----
def set_composite(aid, dst):
    cid, r = cat_for_app(aid)
    ensure(os.path.dirname(dst))
    shutil.copyfile(crop(cid, 1), dst)
    q = byid[aid]
    q["image"] = dst
    q["options"] = ["1", "2", "3", "4"]; q["options_en"] = ["1", "2", "3", "4"]
    q.pop("option_images", None)

for r in rows.values():
    cid = r["cat_id"]
    if cid.endswith("-8"):
        code = cid.split("-")[0]
        set_composite(r["app_id"], f"img/states/{code}/{code}-8.png")
set_composite(130, "img/q130/ballots.png")

# ---- 4) prompt-image questions: 1 image, keep text answers ----
PROMPT = {
    55:  "img/q55-reichstag.webp",
    70:  "img/q70-heinemann-schmidt.png",
    176: "img/q176-besatzungszonen.png",
    181: "img/q181-brandt-kniefall.png",
    187: "img/q187-ddr-flagge.png",
    216: "img/q216-bundesadler.png",
    235: "img/q235-mitterrand-kohl-verdun.png",
}
for aid, dst in PROMPT.items():
    cid, r = cat_for_app(aid)
    ensure(os.path.dirname(dst) or ".")
    src = crop(cid, 1)
    if dst.endswith(".webp"):
        Image.open(src).convert("RGB").save(dst, "WEBP", quality=88, method=6)
    else:
        shutil.copyfile(src, dst)
    q = byid[aid]
    q["image"] = dst
    q.pop("option_images", None)

# ---- 5) image credits (visible field) ----
for aid, credit in CREDITS.items():
    if aid in byid:
        byid[aid]["image_credit"] = credit

# preserve the repo's compact one-object-per-line array style
with open("questions.json", "w", encoding="utf-8") as f:
    f.write("[\n")
    f.write(",\n".join("  " + json.dumps(q, ensure_ascii=False, separators=(",", ":")) for q in app))
    f.write("\n]\n")
print("questions.json updated.")
print("credits set on:", sorted(CREDITS))
