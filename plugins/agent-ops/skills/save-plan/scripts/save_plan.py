#!/usr/bin/env python3
import argparse
import datetime as dt
import pathlib
import re
import sys
import unicodedata


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").strip()
    ticket_match = re.match(r"^([A-Z][A-Z0-9]+-\d+)\b(.*)$", ascii_value)

    prefix = ""
    rest = ascii_value
    if ticket_match:
        prefix = ticket_match.group(1)
        rest = ticket_match.group(2)

    slug = re.sub(r"[^a-zA-Z0-9]+", "-", rest.lower()).strip("-")
    if prefix and slug:
        return f"{prefix}-{slug}"[:80].strip("-")
    if prefix:
        return prefix
    return slug[:80].strip("-") or "plan"


def unique_path(plans_dir: pathlib.Path, slug: str, date_text: str) -> pathlib.Path:
    candidate = plans_dir / f"{slug}-{date_text}.md"
    if not candidate.exists():
        return candidate

    counter = 2
    while True:
        candidate = plans_dir / f"{slug}-{date_text}-{counter}.md"
        if not candidate.exists():
            return candidate
        counter += 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Save Markdown from stdin to a collision-safe local plan."
    )
    parser.add_argument("--title", required=True, help="Human-readable plan title")
    parser.add_argument(
        "--plans-dir",
        help="Directory for plans; defaults to the current user's plans directory",
    )
    parser.add_argument(
        "--date",
        default=dt.date.today().isoformat(),
        help="Date suffix for the filename, formatted YYYY-MM-DD",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    content = sys.stdin.read()
    if not content.strip():
        print("error: no Markdown content received on stdin", file=sys.stderr)
        return 2

    plans_dir = (
        pathlib.Path(args.plans_dir).expanduser()
        if args.plans_dir
        else pathlib.Path.home() / "plans"
    )
    plans_dir.mkdir(parents=True, exist_ok=True)

    path = unique_path(plans_dir, slugify(args.title), args.date)
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")
    print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
