---
name: sdlc-review-loop
description: Use when the user wants to run a structured implementer/reviewer workflow across Codex threads for the current repository or change set, including creating or reusing a reviewer thread, sending a review handoff, reading feedback, iterating on fixes, and resubmitting for review.
---

# SDLC Review Loop

Run an implementer/reviewer loop from the current thread.

## Requirements Gate

Before creating or messaging threads, make sure the target repository and change set are clear. If the user did not specify a repository, use the current working directory. If there is no git repository, stop and explain that the handoff helper expects git-backed changes.

## Workflow

1. Inspect the repo with non-destructive commands: `git status --short --branch`, `git diff --stat HEAD`, and targeted file reads as needed.
2. Generate the handoff:
   - Run `node <plugin-root>/scripts/build-handoff.ts <repo-root>`.
   - If the script fails, fix the handoff manually from git status, changed files, diff stat, and `.agent-sdlc.yml` if present.
3. Prepare the reviewer prompt:
   - Include the generated handoff.
   - Include the reviewer role contract from `$sdlc-reviewer` or `../sdlc-reviewer/SKILL.md`.
4. Find or create the reviewer thread:
   - Prefer the configured `threads.reviewer.title`.
   - If no config exists, use `Reviewer: <projectName>`.
   - Reuse an existing matching reviewer thread when available; otherwise create one in the same project.
5. Send the reviewer prompt and wait for feedback.
6. Classify the response by its final verdict line: `approved`, `changes_requested`, or `needs_human`.
7. If changes are requested, present the findings to the implementer, fix them, and resubmit until approved or `review.maxCycles` is reached.
8. Escalate to the user when the reviewer asks an unanswerable product question, the verdict is `needs_human`, or the max cycle count is reached.

## Persistence

Do not write `.agent-sdlc/reviews/` logs unless the user explicitly asks to persist project-local review records. If persistence is requested, save the handoff, reviewer response, verdict, and cycle number under `.agent-sdlc/reviews/`.

## Output

Keep the user oriented with short status updates: reviewer thread used, verdict, requested changes, and whether another cycle is needed. Do not claim a review is clean unless the reviewer returned `Verdict: approved`.
