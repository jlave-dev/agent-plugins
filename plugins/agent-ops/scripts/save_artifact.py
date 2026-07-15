#!/usr/bin/env python3
import argparse
import datetime as dt
import pathlib
import re
import sys
import unicodedata


def slugify(value: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").strip()
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug[:80].strip("-") or fallback


def unique_path(output_dir: pathlib.Path, date_text: str, slug: str) -> pathlib.Path:
    candidate = output_dir / f"{date_text}-{slug}.md"
    if not candidate.exists():
        return candidate

    counter = 2
    while True:
        candidate = output_dir / f"{date_text}-{slug}-{counter}.md"
        if not candidate.exists():
            return candidate
        counter += 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Save Markdown from stdin to a collision-safe note or plan."
    )
    parser.add_argument("--kind", choices=("note", "plan"), required=True)
    parser.add_argument("--title", required=True, help="Human-readable artifact title")
    parser.add_argument("--notes-dir", help="Output directory for notes")
    parser.add_argument("--plans-dir", help="Output directory for plans")
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

    if args.kind == "note":
        output_dir = pathlib.Path(args.notes_dir or "notes").expanduser()
    else:
        output_dir = pathlib.Path(args.plans_dir or pathlib.Path.home() / "plans").expanduser()

    output_dir.mkdir(parents=True, exist_ok=True)
    path = unique_path(output_dir, args.date, slugify(args.title, args.kind))
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
