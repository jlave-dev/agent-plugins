#!/usr/bin/env python3
import pathlib
import subprocess
import sys
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("save_note.py")


class SaveNoteTest(unittest.TestCase):
    def run_script(self, notes_dir: pathlib.Path) -> pathlib.Path:
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--title",
                "Short Descriptive Title",
                "--notes-dir",
                str(notes_dir),
                "--date",
                "2026-04-13",
            ],
            input="# Short Descriptive Title\n",
            text=True,
            capture_output=True,
            check=True,
        )
        return pathlib.Path(completed.stdout.strip())

    def test_writes_date_prefixed_slug_and_collision_suffix(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            notes_dir = pathlib.Path(temp_dir)
            first = self.run_script(notes_dir)
            second = self.run_script(notes_dir)

        self.assertEqual(first.name, "2026-04-13-short-descriptive-title.md")
        self.assertEqual(second.name, "2026-04-13-short-descriptive-title-2.md")


if __name__ == "__main__":
    unittest.main()
