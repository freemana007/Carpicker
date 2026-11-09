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
import urllib.error
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


def fetch(url: str, timeout: int = 30) -> bytes:
    """GET with polite retries: Wikimedia rate-limits bursts with HTTP 429."""
    delay = 5.0
    for attempt in range(6):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5:
                raise
            wait = float(e.headers.get("Retry-After") or delay)
            time.sleep(wait)
            delay = min(delay * 2, 60)
    raise RuntimeError("unreachable")


def get_json(url: str, params: dict) -> dict:
    q = url + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    return json.loads(fetch(q))


def strip_html(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def lead_images(articles: list[str]) -> dict[str, str]:
    """Main photo of each Wikipedia article, looked up in batches of 50 (one request per batch)."""
    out: dict[str, str] = {}
    for i in range(0, len(articles), 50):
        batch = articles[i : i + 50]
        d = get_json(
            "https://en.wikipedia.org/w/api.php",
            {"action": "query", "titles": "|".join(batch), "prop": "pageimages", "piprop": "name", "redirects": 1, "pilimit": 50},
        )
        q = d.get("query", {})
        # Map each requested title through normalisation and redirects to the final page title.
        alias = {t: t for t in batch}
        for n in q.get("normalized", []):
            alias = {k: (n["to"] if v == n["from"] else v) for k, v in alias.items()}
        for r in q.get("redirects", []):
            alias = {k: (r["to"] if v == r["from"] else v) for k, v in alias.items()}
        by_title = {p["title"]: p.get("pageimage") for p in q.get("pages", [])}
        for t in batch:
            img = by_title.get(alias[t])
            if img:
                out[t] = "File:" + img
        time.sleep(1)
    return out


def files_info(file_titles: list[str]) -> dict[str, dict]:
    """Licence, author and a resized image URL for each Commons file, in batches of 50."""
    out: dict[str, dict] = {}
    for i in range(0, len(file_titles), 50):
        batch = file_titles[i : i + 50]
        d = get_json(
            "https://commons.wikimedia.org/w/api.php",
            {"action": "query", "titles": "|".join(batch), "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": WIDTH},
        )
        q = d.get("query", {})
        alias = {t: t for t in batch}
        for n in q.get("normalized", []):
            alias = {k: (n["to"] if v == n["from"] else v) for k, v in alias.items()}
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            p = pages.get(alias[t])
            if not p or "imageinfo" not in p:
                continue
            ii = p["imageinfo"][0]
            meta = ii.get("extmetadata", {})
            out[t] = {
                "thumb": ii.get("thumburl") or ii["url"],
                "source": ii["descriptionurl"],
                "author": strip_html(meta.get("Artist", {}).get("value", "")) or "Unknown",
                "license": strip_html(meta.get("LicenseShortName", {}).get("value", "")),
                "licenseUrl": meta.get("LicenseUrl", {}).get("value"),
                "title": p["title"],
            }
        time.sleep(1)
    return out


def download_webp(url: str, dest: Path) -> None:
    img = Image.open(io.BytesIO(fetch(url, timeout=60))).convert("RGB")
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

    todo = {k: v for k, v in sources.items() if (not only or k in only) and not v.get("skip")}
    articles = sorted({v["article"] for v in todo.values() if not v.get("file")})
    leads = lead_images(articles) if articles else {}
    file_for = {k: (v.get("file") or leads.get(v.get("article", ""))) for k, v in todo.items()}
    infos = files_info(sorted({f for f in file_for.values() if f}))

    for car_id, src in todo.items():
        try:
            file_title = file_for[car_id]
            if not file_title:
                problems.append(f"{car_id}: no main photo on '{src.get('article')}'")
                continue
            info = infos.get(file_title)
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
                time.sleep(1)  # be polite to Wikimedia
            manifest[car_id] = {
                "file": name,
                "author": info["author"][:120],
                "license": info["license"],
                "licenseUrl": info["licenseUrl"],
                "source": info["source"],
                "title": info["title"],
            }
            print(f"✓ {car_id}: {info['title']} ({info['license']}, {info['author'][:40]})", flush=True)
        except Exception as e:  # noqa: BLE001
            problems.append(f"{car_id}: {e}")

    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False) + "\n")
    for p in problems:
        print("✗", p)
    print(f"{len(manifest)} cars have photos; {len(problems)} problems.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
