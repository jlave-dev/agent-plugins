#!/usr/bin/env python3
import pathlib
import subprocess
import sys
import tempfile
import unittest


SCRIPT = pathlib.Path(__file__).with_name("save_plan.py")


class SavePlanTest(unittest.TestCase):
    def run_script(self, plans_dir: pathlib.Path) -> pathlib.Path:
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--title",
                "Feature Plan",
                "--plans-dir",
                str(plans_dir),
                "--date",
                "2026-04-13",
            ],
            input="# Feature Plan\n",
            text=True,
            capture_output=True,
            check=True,
        )
        return pathlib.Path(completed.stdout.strip())

    def test_writes_date_prefixed_slug_and_collision_suffix(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            plans_dir = pathlib.Path(temp_dir)
            first = self.run_script(plans_dir)
            second = self.run_script(plans_dir)

        self.assertEqual(first.name, "2026-04-13-feature-plan.md")
        self.assertEqual(second.name, "2026-04-13-feature-plan-2.md")


if __name__ == "__main__":
    unittest.main()
