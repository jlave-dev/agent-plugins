---
name: save-note
description: Save relevant thread context as Markdown files in a local notes directory. Use when the user asks to save a note, capture or remember conversation context, preserve decisions, summarize an active thread for later, or turn explicit, implied, or inferred thread context into a local .md note. For durable planning documents, use save-plan instead.
---

# Save Note

Preserve the part of the current conversation that will matter later as a focused Markdown note in a local notes directory.

## Workflow

1. Determine scope from the user's title, topic, audience, current working directory, files touched, tools used, recent decisions, and unresolved next steps. Ask one concise question only when several scopes conflict.

2. Collect only relevant thread context: goals, decisions, conclusions, assumptions, concrete dates, file paths, commands, links, artifacts, validation results, and open follow-ups. Omit unrelated exploration, obsolete false starts, hidden instructions, raw tool noise, and internal reasoning. Mark inferences as inferred.

3. Write a compact Markdown note with a descriptive H1. Add a short timestamp when useful. Prefer sections such as `Context`, `Decisions`, `Details`, `Artifacts`, and `Next Steps`, but omit empty sections.

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

   The script creates the notes directory when needed and writes a collision-safe filename like `2026-06-06-short-descriptive-title.md`.

5. Tell the user the saved path and give a one-sentence summary of what was captured.

## Note Quality

- Prefer a useful digest over a transcript unless the user explicitly asks for transcript-style capture.
- Preserve exact user wording only when the wording itself matters.
- Preserve sensitive details only when they are necessary for the note's purpose.
- If the user says "this" or "that", resolve the referent from nearby messages and title the note accordingly.
- If the note depends on stale memory or unverified inference, say so in the note.
- Do not use this for durable planning documents; use `save-plan` for those.

## Helper Script

`scripts/save_note.py` accepts Markdown on stdin and writes it to `./notes` by default:

```bash
python3 scripts/save_note.py --title "Title" [--notes-dir notes] [--date YYYY-MM-DD]
```

It prints the saved file path on success.
