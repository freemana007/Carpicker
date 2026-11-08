#!/usr/bin/env python3
"""Fetch freely licensed car photos from Wikimedia Commons.

For each car in scripts/car-photo-sources.json, take the main photo of its
Wikipedia article (or a specific Commons file), check the licence is free
(CC BY, CC BY-SA, CC0 or public domain), save a resized WebP copy in
public/cars/, and record the credit in src/data/carPhotos.json.

Needs network access to en.wikipedia.org, commons.wikimedia.org and
upload.wikimedia.org, plus Pillow (pip install pillow).

Usage: python3 scripts/fetch-car-photos.py [car-id ...]
"""

import html
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "scripts" / "car-photo-sources.json"
OUT_DIR = ROOT / "public" / "cars"
MANIFEST = ROOT / "src" / "data" / "carPhotos.json"
UA = "CarPickerIreland/0.1 (car photo import script; https://github.com/freemana007/Carpicker)"
FREE = re.compile(r"^(cc[- ]by|cc0|public domain|pd)", re.I)
WIDTH = 960


def get_json(url: str, params: dict) -> dict:
    q = url + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    req = urllib.request.Request(q, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def strip_html(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def lead_image(article: str) -> str | None:
    d = get_json(
        "https://en.wikipedia.org/w/api.php",
        {"action": "query", "titles": article, "prop": "pageimages", "piprop": "name", "redirects": 1},
    )
    pages = d.get("query", {}).get("pages", [])
    if not pages or "pageimage" not in pages[0]:
        return None
    return "File:" + pages[0]["pageimage"]


def file_info(file_title: str) -> dict | None:
    d = get_json(
        "https://commons.wikimedia.org/w/api.php",
        {"action": "query", "titles": file_title, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": WIDTH},
    )
    pages = d.get("query", {}).get("pages", [])
    if not pages or "imageinfo" not in pages[0]:
        return None
    ii = pages[0]["imageinfo"][0]
    meta = ii.get("extmetadata", {})
    return {
        "thumb": ii.get("thumburl") or ii["url"],
        "source": ii["descriptionurl"],
        "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown",
        "license": strip_html(meta.get("LicenseShortName", {}).get("value", "")),
        "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
        "title": file_title,
    }


def download_webp(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        img = Image.open(io.BytesIO(r.read())).convert("RGB")
    if img.width > WIDTH:
        img = img.resize((WIDTH, round(img.height * WIDTH / img.width)), Image.LANCZOS)
    img.save(dest, "WEBP", quality=80, method=6)


def main() -> int:
    sources = {k: v for k, v in json.loads(SOURCES.read_text()).items() if not k.startswith("_")}
    only = set(sys.argv[1:])
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    done: dict[str, str] = {}  # Commons file -> saved file name (reuse for variants of the same model)
    problems = []

    for car_id, src in sources.items():
        if only and car_id not in only:
            continue
        try:
            file_title = src.get("file") or lead_image(src["article"])
            if not file_title:
                problems.append(f"{car_id}: no main photo on '{src.get('article')}'")
                continue
            info = file_info(file_title)
            if not info:
                problems.append(f"{car_id}: couldn't read {file_title}")
                continue
            if not FREE.match(info["license"]):
                problems.append(f"{car_id}: {file_title} has licence '{info['license']}', not free, skipped")
                continue
            name = done.get(file_title) or f"{car_id}.webp"
            if file_title not in done:
                download_webp(info["thumb"], OUT_DIR / name)
                done[file_title] = name
            manifest[car_id] = {
                "file": name,
                "author": info["author"][:120],
                "license": info["license"],
                "licenseUrl": info["licenseUrl"],
                "source": info["source"],
                "title": file_title,
            }
            print(f"✓ {car_id}: {file_title} ({info['license']}, {info['author'][:40]})")
            time.sleep(0.3)  # be polite to Wikimedia
        except Exception as e:  # noqa: BLE001
            problems.append(f"{car_id}: {e}")

    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False) + "\n")
    for p in problems:
        print("✗", p)
    print(f"{len(manifest)} cars have photos; {len(problems)} problems.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
