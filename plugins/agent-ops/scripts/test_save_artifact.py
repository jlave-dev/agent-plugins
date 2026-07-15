#!/usr/bin/env python3
import pathlib
import subprocess
import sys
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("save_artifact.py")


class SaveArtifactTest(unittest.TestCase):
    def run_script(self, kind: str, output_dir: pathlib.Path) -> pathlib.Path:
        option = "--notes-dir" if kind == "note" else "--plans-dir"
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--kind",
                kind,
                "--title",
                "Short Descriptive Title",
                option,
                str(output_dir),
                "--date",
                "2026-04-13",
            ],
            input="# Short Descriptive Title\n",
            text=True,
            capture_output=True,
            check=True,
        )
        return pathlib.Path(completed.stdout.strip())

    def test_writes_date_prefixed_slug_and_collision_suffix_for_both_kinds(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output_dir = pathlib.Path(temp_dir)
            note = self.run_script("note", output_dir)
            note_collision = self.run_script("note", output_dir)
            plan = self.run_script("plan", output_dir)

        self.assertEqual(note.name, "2026-04-13-short-descriptive-title.md")
        self.assertEqual(note_collision.name, "2026-04-13-short-descriptive-title-2.md")
        self.assertEqual(plan.name, "2026-04-13-short-descriptive-title-3.md")


if __name__ == "__main__":
    unittest.main()
