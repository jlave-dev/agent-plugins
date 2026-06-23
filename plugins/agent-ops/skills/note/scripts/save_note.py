#!/usr/bin/env python3
import argparse
import datetime as dt
import pathlib
import re
import sys
import unicodedata


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug[:80].strip("-") or "note"


def unique_path(notes_dir: pathlib.Path, date_text: str, slug: str) -> pathlib.Path:
    candidate = notes_dir / f"{date_text}-{slug}.md"
    if not candidate.exists():
        return candidate

    counter = 2
    while True:
        candidate = notes_dir / f"{date_text}-{slug}-{counter}.md"
        if not candidate.exists():
            return candidate
        counter += 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Save Markdown from stdin to a collision-safe local note."
    )
    parser.add_argument("--title", required=True, help="Human-readable note title")
    parser.add_argument(
        "--notes-dir",
        default="notes",
        help="Directory for notes; defaults to ./notes",
    )
    parser.add_argument(
        "--date",
        default=dt.date.today().isoformat(),
        help="Date prefix for the filename, formatted YYYY-MM-DD",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    content = sys.stdin.read()
    if not content.strip():
        print("error: no Markdown content received on stdin", file=sys.stderr)
        return 2

    notes_dir = pathlib.Path(args.notes_dir).expanduser()
    notes_dir.mkdir(parents=True, exist_ok=True)

    slug = slugify(args.title)
    path = unique_path(notes_dir, args.date, slug)
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
