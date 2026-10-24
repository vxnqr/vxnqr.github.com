#!/usr/bin/env python3
"""Пересобирает media_list.json по содержимому папки media/.
Запускай после того, как добавил/удалил файлы в media/ (или дважды кликни update_media.bat)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "media")
EXT = {".mp4", ".webm", ".mov", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}

os.makedirs(MEDIA, exist_ok=True)
names = sorted(
    (f for f in os.listdir(MEDIA) if os.path.splitext(f)[1].lower() in EXT),
    key=lambda s: [int(t) if t.isdigit() else t.lower() for t in __import__("re").split(r"(\d+)", s)],
)
with open(os.path.join(HERE, "media_list.json"), "w", encoding="utf-8") as fh:
    json.dump([{"name": n} for n in names], fh, ensure_ascii=False, separators=(",", ":"))

videos = [n for n in names if os.path.splitext(n)[1].lower() in {".mp4", ".webm", ".mov"}]
print(f"media_list.json обновлён: файлов {len(names)}, из них видео {len(videos)}")
for n in names:
    print("  ", n)
