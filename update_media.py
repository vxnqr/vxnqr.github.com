#!/usr/bin/env python3
"""Пересобирает media_list.json (и вшитый список в index.html) по содержимому папки media/.
Запускай после того, как добавил/удалил файлы в media/ (или дважды кликни update_media.bat)."""
import json, os, re, sys

try:
    sys.stdout.reconfigure(errors="replace")  # чтобы странные символы в именах не роняли скрипт в консоли Windows
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "media")
VIDEO = {".mp4", ".webm", ".mov"}
EXT = VIDEO | {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}

def natural(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]

os.makedirs(MEDIA, exist_ok=True)
names = sorted((f for f in os.listdir(MEDIA) if os.path.splitext(f)[1].lower() in EXT), key=natural)

list_path = os.path.join(HERE, "media_list.json")
try:
    with open(list_path, encoding="utf-8") as fh:
        old = [x["name"] for x in json.load(fh)]
except Exception:
    old = []

payload = json.dumps([{"name": n} for n in names], ensure_ascii=False, separators=(",", ":"))
with open(list_path, "w", encoding="utf-8") as fh:
    fh.write(payload)

# запасной список внутри index.html (если media_list.json вдруг не загрузился)
idx = os.path.join(HERE, "index.html")
fallback_ok = False
if os.path.exists(idx):
    with open(idx, encoding="utf-8") as fh:
        html = fh.read()
    pat = re.compile(r'(<script type="application/json" id="media-list-fallback">)(.*?)(</script>)', re.S)
    if pat.search(html):
        safe = payload.replace("<", "\\u003c")
        with open(idx, "w", encoding="utf-8") as fh:
            fh.write(pat.sub(lambda m: m.group(1) + safe + m.group(3), html, count=1))
        fallback_ok = True

videos = [n for n in names if os.path.splitext(n)[1].lower() in VIDEO]
added = [n for n in names if n not in old]
removed = [n for n in old if n not in names]

print(f"Файлов в media/: {len(names)}, из них видео: {len(videos)}")
for n in added:
    print("  + добавлено:", n)
for n in removed:
    print("  - убрано:   ", n)
if not added and not removed:
    print("  Новых файлов в media/ нет — список не изменился.")

stray = [f for f in os.listdir(HERE) if os.path.splitext(f)[1].lower() in VIDEO]
if stray:
    print("\nВНИМАНИЕ: эти видео лежат рядом со скриптом, а не в папке media/ — сайт их не увидит:")
    for n in stray:
        print("   ", n)
    print("  Перенеси их в media/ и запусти скрипт ещё раз.")

print("\nДальше: залей на хостинг media_list.json" + (", index.html" if fallback_ok else "") + " и новые файлы из media/.")

# ---------- people.json: аватарки + скрины отзывов по папкам ----------
# avatars/<slug>.(jpg|png|webp)         — аватарка человека (slug = data-key в index.html)
# reviews/<slug>/1.jpg, 2.jpg, ...      — скрины отзывов (только картинки), порядок по имени
AVATARS = os.path.join(HERE, "avatars")
REVIEWS = os.path.join(HERE, "reviews")
IMG = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
people_path = os.path.join(HERE, "people.json")

try:
    with open(people_path, encoding="utf-8") as fh:
        people = json.load(fh).get("people", {})
    if not isinstance(people, dict):
        people = {}
except Exception:
    people = {}

# слаги: из index.html (data-key), из имён аватарок и из папок reviews/
slugs = []
def add_slug(s):
    if s and s not in slugs:
        slugs.append(s)

idx_path = os.path.join(HERE, "index.html")
if os.path.exists(idx_path):
    with open(idx_path, encoding="utf-8") as fh:
        html = fh.read()
    for m in re.finditer(r'data-key="([^"]+)"', html):
        add_slug(m.group(1))

if os.path.isdir(AVATARS):
    for f in sorted(os.listdir(AVATARS), key=natural):
        if os.path.splitext(f)[1].lower() in IMG:
            add_slug(os.path.splitext(f)[0])

if os.path.isdir(REVIEWS):
    for d in sorted(os.listdir(REVIEWS), key=natural):
        if os.path.isdir(os.path.join(REVIEWS, d)):
            add_slug(d)

def pick_avatar(slug):
    if not os.path.isdir(AVATARS):
        return ""
    low = slug.lower()
    for f in sorted(os.listdir(AVATARS), key=natural):
        stem, ext = os.path.splitext(f)
        if stem.lower() == low and ext.lower() in IMG:
            return "avatars/" + f
    return ""

def pick_reviews(slug):
    folder = None
    if os.path.isdir(REVIEWS):
        for d in sorted(os.listdir(REVIEWS), key=natural):
            p = os.path.join(REVIEWS, d)
            if os.path.isdir(p) and d.lower() == slug.lower():
                folder = p
                break
    if not folder:
        return []
    return ["reviews/" + os.path.basename(folder) + "/" + f
            for f in sorted(os.listdir(folder), key=natural)
            if os.path.splitext(f)[1].lower() in IMG]

out = {}
shots_total = 0
for slug in slugs:
    prev = people.get(slug) if isinstance(people.get(slug), dict) else {}
    av = pick_avatar(slug)
    if not av:
        old = prev.get("avatar", "")
        if old and os.path.exists(os.path.join(HERE, old.replace("/", os.sep))):
            av = old
    rv = pick_reviews(slug)
    if not rv:
        rv = [p for p in prev.get("reviews", [])
              if os.path.exists(os.path.join(HERE, str(p).replace("/", os.sep)))]
    if not av and not rv:
        continue
    entry = {}
    if av:
        entry["avatar"] = av
    entry["reviews"] = rv
    out[slug] = entry
    shots_total += len(rv)

with open(people_path, "w", encoding="utf-8") as fh:
    fh.write(json.dumps({"people": out}, ensure_ascii=False, indent=2) + "\n")

# вшитая копия people.json в index.html (file:// и оффлайн)
if os.path.exists(idx_path):
    with open(idx_path, encoding="utf-8") as fh:
        html = fh.read()
    pat3 = re.compile(r'(<script type="application/json" id="people-fallback">)(.*?)(</script>)', re.S)
    packed = json.dumps(out, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    if pat3.search(html):
        with open(idx_path, "w", encoding="utf-8") as fh:
            fh.write(pat3.sub(lambda m: m.group(1) + packed + m.group(3), html, count=1))
    fallback_ok = True

av_count = sum(1 for v in out.values() if v.get("avatar"))
rv_count = sum(1 for v in out.values() if v.get("reviews"))
print(f"people.json: {len(out)} людей, {av_count} с аватаркой, {rv_count} с отзывами ({shots_total} скринов).")
print("Дальше: залей people.json и папки avatars/, reviews/.")
