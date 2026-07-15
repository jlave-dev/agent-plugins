---
name: save-plan
description: Save durable planning documents as Markdown files in $HOME/plans. Use when the user asks to save a plan, write this down as a plan, put planning work in the plans directory, preserve a migration/design/review/implementation plan, hydrate an agreed plan with detail, or update an existing saved plan.
---

# Save Plan

Turn the plan the user and agent just agreed on into a durable Markdown document in the user's home plans directory.

## Workflow

1. Decide whether to create or update. If the user asks to revise an existing plan, update that file unless they ask for a new version. Before creating a new plan, quickly scan `$HOME/plans` for an existing file on the same topic.

2. Capture only durable planning context: agreed direction, decisions, assumptions, constraints, file or system touchpoints, phases, risks, mitigations, validation, and next steps. Remove stale assumptions after direction changes. Do not use this directory for temporary scratch notes.

3. Choose the filename. Use a concise descriptive filename, for example `2026-04-13-feature-plan.md`. Use a `YYYY-MM-DD` date prefix, lowercase words, and hyphens for new plans unless updating.

4. Write an implementation-oriented plan with a clear H1. Prefer concrete sections such as `Summary`, `Phases`, `Risks`, `Mitigations`, `Next Steps`, and `Done When`; omit empty sections. Keep it actionable so a later agent can continue without reconstructing the chat.

5. Resolve `<plugin-root>` to the installed `agent-ops` plugin directory. Save new plans with the shared helper there; do not assume the consumer's current directory is this repository. Pipe the final Markdown content to `<plugin-root>/scripts/save_artifact.py` with `--kind plan`, the title, and optional `--plans-dir`/`--date` values:

   ```bash
   python3 <plugin-root>/scripts/save_artifact.py --kind plan --title "Short Descriptive Plan" <<'EOF'
   # Short Descriptive Plan

   ## Summary

   Durable planning context here.
   EOF
   ```

   The script creates the plans directory when needed and writes a collision-safe filename with a date prefix.

6. Tell the user the exact saved path and give a one-sentence summary of what the plan preserves.

## Updating Existing Plans

- Preserve useful prior context, but delete obsolete assumptions after direction changes.
- When renaming for filename convention cleanup, keep the descriptive portion unchanged unless the user asks otherwise.
- Prefer editing the existing plan over creating duplicates.

## Helper Script

`<plugin-root>/scripts/save_artifact.py --kind plan` accepts Markdown on stdin and writes it to the current user's plans directory by default:

```bash
python3 <plugin-root>/scripts/save_artifact.py --kind plan --title "Title" [--plans-dir path] [--date YYYY-MM-DD]
```

It prints the saved file path on success.
