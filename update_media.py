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
