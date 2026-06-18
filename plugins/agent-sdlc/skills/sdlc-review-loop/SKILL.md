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
   - If a GitHub Issue number is known, run `node <plugin-root>/scripts/build-handoff.ts <repo-root> --issue <number>` so the reviewer sees the issue goal, acceptance criteria, dependencies, CI tier, configured CI policy, and verification plan.
   - If the script fails, fix the handoff manually from git status, changed files, diff stat, and `.agent-sdlc.yml` if present.
3. Prepare the reviewer prompt:
   - Include the generated handoff.
   - Include the reviewer role contract from `$sdlc-reviewer` or `../sdlc-reviewer/SKILL.md`.
   - State whether the PR is standalone, a stack layer, or the top-of-stack when known.
   - State whether full integration evidence is required from the current head SHA, the top-of-stack PR, or the configured merge queue/merge group.
4. Find or create the reviewer thread:
   - Prefer the configured `threads.reviewer.title`.
   - If no config exists, use `Reviewer: <projectName>`.
   - Reuse an existing matching reviewer thread when available; otherwise create one in the same project.
5. Send the reviewer prompt and wait for feedback.
6. Classify the response by its final verdict line: `approved`, `changes_requested`, or `needs_human`.
7. If changes are requested, present the findings to the implementer, fix them, and resubmit until approved or `review.maxCycles` is reached.
8. Escalate to the user when the reviewer asks an unanswerable product question, the verdict is `needs_human`, or the max cycle count is reached.

## Documentation Lane

When the user asks for documentation coverage, or the change adds or changes public behavior, hand the same change context to `$sdlc-docs`. The docs role should update repository documentation only and return `docs_updated`, `docs_not_needed`, or `needs_human`. Keep docs updates in the same PR unless the user asks for a separate documentation follow-up.

## GitHub Issue Lane

When the current change came from `$sdlc-issue-intake` or a GitHub Issue, treat the issue as the task record:

- Include the issue number in the handoff when generating reviewer context.
- Judge the implementation against the issue acceptance criteria, not only the diff.
- Judge verification against the declared CI tier. `fast-check-only` needs configured fast checks; `full-ci-required` needs full integration evidence before approval; `full-ci-before-merge` may be approved with clear pre-merge evidence still pending; `human-decision` needs explicit user risk acceptance or a smaller blocking question.
- If review is approved, update the issue or ask the implementer to update it with the PR, checks run, and remaining risk.
- If review requests changes, keep the issue in an active or review state.
- If the reviewer returns `needs_human`, mark or request `needs-human` on the issue when GitHub access is available.

## CI Evidence Lane

- Read `## CI Tier` from the issue context and `## Configured CI Policy` from the generated handoff.
- For stack layers, make clear whether full integration can wait for the top-of-stack PR or must run on the current layer's head SHA.
- Treat merge-queue or merge-group checks as acceptable evidence only when `.agent-sdlc.yml` says that evidence is supported.
- Do not run, rerun, or manage GitHub Actions from this skill. Record what evidence exists, what is missing, and whether the missing evidence blocks review or only blocks merge.

## Persistence

Do not write `.agent-sdlc/reviews/` logs unless the user explicitly asks to persist project-local review records. If persistence is requested, save the handoff, reviewer response, verdict, and cycle number under `.agent-sdlc/reviews/`.

## Output

Keep the user oriented with short status updates: reviewer thread used, verdict, requested changes, and whether another cycle is needed. Do not claim a review is clean unless the reviewer returned `Verdict: approved`.
