#!/usr/bin/env python3
"""Extract Instagram POSTS only, list/copy media, write manifest for import."""

from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import datetime
from html import unescape
from pathlib import Path


def unescape_html(value: str) -> str:
    return re.sub(r"<[^>]+>", "", unescape(value)).strip()


def parse_posts_html(path: Path) -> list[dict]:
    if not path.exists():
        return []
    text = path.read_text(encoding="utf-8", errors="replace")
    pattern = re.compile(
        r'<h2 class="_3-95 _2pim _a6-h _a6-i">(.*?)</h2>'
        r'[\s\S]*?<a target="_blank" href="(media/posts/[^"]+)"'
        r'[\s\S]*?<div class="_3-94 _a6-o">(.*?)</div>'
    )
    posts = []
    for caption, media, date in pattern.findall(text):
        posts.append(
            {
                "caption": unescape_html(caption),
                "media": media,
                "date": unescape_html(date),
            }
        )
    return posts


def parse_date(date_str: str) -> tuple[int | None, str | None, int]:
    try:
        # Instagram export: "Mar 07, 2026 11:16 am"
        dt = datetime.strptime(date_str, "%b %d, %Y %I:%M %p")
        return dt.year, dt.isoformat(), int(dt.timestamp())
    except ValueError:
        return None, None, 0


def title_from_caption(caption: str, year: int | None) -> str:
    cleaned = re.sub(r"Check out this post!\s*", "", caption, flags=re.I)
    cleaned = re.sub(r"#[\w]+", " ", cleaned)
    cleaned = re.sub(r"@[\w.]+", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) >= 3:
        return cleaned[:80]
    return f"Artwork {year}" if year else "Artwork"


def medium_from_caption(caption: str) -> str:
    lower = caption.lower()
    if "acrylic" in lower:
        return "Acrylic on canvas"
    if "canvas" in lower:
        return "Canvas painting"
    if "paint" in lower:
        return "Painting"
    return "Drawing"


def tags_from_caption(caption: str) -> list[str]:
    tags = {"instagram", "lakshandrawings"}
    tags.update(m.group(1).lower() for m in re.finditer(r"#([A-Za-z0-9_]+)", caption))
    return sorted(tags)


def main() -> int:
    if len(sys.argv) < 2:
        print(
            "Usage: python3 scripts/prepare-instagram-posts.py <instagram-export-folder>",
            file=sys.stderr,
        )
        return 1

    ig_root = Path(sys.argv[1]).expanduser().resolve()
    if not ig_root.is_dir():
        print(f"Not a folder: {ig_root}", file=sys.stderr)
        return 1

    root = Path(__file__).resolve().parents[1]
    out_dir = root / "import" / "instagram-ready"
    out_dir.mkdir(parents=True, exist_ok=True)

    posts = parse_posts_html(
        ig_root / "your_instagram_activity/media/posts_1.html"
    ) + parse_posts_html(ig_root / "your_instagram_activity/media/posts.html")

    by_media: dict[str, dict] = {}
    for post in posts:
        by_media.setdefault(post["media"], post)

    convert_list = out_dir / "convert-list.txt"
    prepared: list[dict] = []
    skipped_missing = 0
    skipped_non_art = 0
    index = 0

    convert_rows: list[str] = []

    for post in by_media.values():
        abs_path = ig_root / post["media"]
        if not abs_path.exists():
            skipped_missing += 1
            continue

        lower = post["caption"].lower()
        if "chessjuniors" in lower or "calgarychess" in lower:
            skipped_non_art += 1
            continue

        year, iso, sort = parse_date(post["date"])
        media_id = abs_path.stem
        index += 1
        out_name = f"{index:03d}-{media_id}.jpg"
        out_path = out_dir / out_name

        ext = abs_path.suffix.lower()
        if ext in {".jpg", ".jpeg"}:
            shutil.copy2(abs_path, out_path)
        else:
            convert_rows.append(f"{abs_path}|{out_path}")

        caption = post["caption"]
        if not caption or caption.lower() in {"hashtags", "place", "title"}:
            caption = "#lakshandrawings"

        prepared.append(
            {
                "file": out_name,
                "source": post["media"],
                "title": title_from_caption(caption, year),
                "caption": caption,
                "medium": medium_from_caption(caption),
                "year": year,
                "posted_at": iso,
                "sort_order": sort,
                "tags": tags_from_caption(caption),
                "needs_convert": ext not in {".jpg", ".jpeg"},
            }
        )

    convert_list.write_text("\n".join(convert_rows) + ("\n" if convert_rows else ""), encoding="utf-8")

    # Keep only entries whose output exists or needs convert
    prepared.sort(key=lambda item: item.get("sort_order") or 0, reverse=True)
    for i, item in enumerate(prepared):
        item["sort_order"] = len(prepared) - i

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(prepared, indent=2), encoding="utf-8")

    print(f"Prepared manifest for {len(prepared)} posts → {out_dir}")
    print(f"Need conversion: {len(convert_rows)} (see {convert_list})")
    print(f"Skipped missing: {skipped_missing}, non-art: {skipped_non_art}")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
