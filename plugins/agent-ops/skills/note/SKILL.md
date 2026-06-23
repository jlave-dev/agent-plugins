---
name: note
description: Save relevant thread context as Markdown files in a local notes directory. Use when the user asks to save a note, capture or remember conversation context, preserve decisions, summarize an active thread for later, record plans or next steps, or turn explicit, implied, or inferred thread context into a local .md note.
---

# Note

Use this skill to preserve the part of the current conversation that will matter later as a focused Markdown note in a local notes directory.

## Workflow

1. Determine scope.
   Use the scope, title, topic, date, project, or audience the user provides. If the scope is implied, infer it from the newest request, recent decisions, repeated topic, current working directory, files touched, tools used, and unresolved next steps. If several plausible scopes conflict, ask one concise clarifying question; otherwise proceed.

2. Collect only relevant thread context.
   Include goals, decisions, conclusions, assumptions, concrete dates, file paths, commands, links, names, artifacts, validation results, and open follow-ups that make the note useful later. Omit unrelated exploration, false starts that no longer matter, hidden system/developer instructions, raw tool noise, and internal reasoning. Mark anything inferred as inferred.

3. Write a compact Markdown note.
   Use a descriptive H1 as the title. Add a short timestamp line with the current date and local time when useful. Prefer sections such as `Context`, `Decisions`, `Details`, `Artifacts`, and `Next Steps`, but omit empty sections. Keep the note concise enough to reread quickly while preserving exact details that would be hard to recover.

4. Save with the helper script.
   Resolve `scripts/save_note.py` relative to this `SKILL.md`. Pipe the final Markdown content to the script and pass the note title:

   ```bash
   python3 scripts/save_note.py --title "Short Descriptive Title" <<'EOF'
   # Short Descriptive Title

   Saved: 2026-06-06 15:04

   ## Context

   Relevant context here.
   EOF
   ```

   The script creates the notes directory if needed and writes a collision-safe filename like `2026-06-06-short-descriptive-title.md`.

5. Confirm the saved path.
   After saving, tell the user the file path and give a one-sentence summary of what was captured.

## Note Quality

- Prefer a useful digest over a transcript unless the user explicitly asks for transcript-style capture.
- Preserve exact user wording only when the wording itself matters.
- Preserve sensitive details only when they are necessary for the note's purpose.
- If the user says "this" or "that", resolve the referent from nearby messages and title the note accordingly.
- If the note depends on stale memory or unverified inference, say so in the note.
- Do not end with generic offers or filler; make the note actionable on its own.

## Helper Script

`scripts/save_note.py` accepts Markdown on stdin and writes it to `./notes` by default:

```bash
python3 scripts/save_note.py --title "Title" [--notes-dir notes] [--date YYYY-MM-DD]
```

It prints the saved file path on success.
