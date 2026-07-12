---
name: sdlc-review-loop
description: Use when running an Agent SDLC implementer/reviewer loop for a git-backed change, including generating a handoff, reusing the singleton reviewer thread, classifying review verdicts, iterating fixes, and keeping evidence/issue state current.
---

# SDLC Review Loop

Run an implementer/reviewer loop from the current thread.

## Requirements Gate

- Use the current repo unless the user names another repo.
- Stop if there is no git repo.
- For Agent SDLC issue/PR work, require fresh `$sdlc-evidence` first unless Agent State already says `evidence_ready` or `merge_ready` for the current PR head.

## Workflow

1. Inspect the change with `git status --short --branch`, branch diff, and targeted file reads.
2. Generate handoff context:
   - `node <plugin-root>/scripts/build-handoff.ts <repo-root>`
   - Add `--issue <number>` when a GitHub Issue is known.
   - Save large output to a temporary handoff file. Send the reviewer a compact target summary plus the handoff path; do not inline an unbounded handoff into a long-lived reviewer thread.
3. Prepare the reviewer prompt with:
   - generated handoff
   - `$sdlc-reviewer` role contract
   - PR URL, worker thread ID when known, stack position, CI tier, evidence source, and simulator evidence status
4. Reuse exactly one reviewer thread named `Reviewer: <projectName>`. Create it only when none exists.
5. Lock the target at the top of the prompt with issue number, PR number, checkout, branch, base SHA, and head SHA. State that the latest target overrides all prior thread history and that unrelated prior tasks must be ignored.
6. Send the prompt and wait for a final verdict line: `approved`, `changes_requested`, or `needs_human`. Accept a verdict only when the reviewer’s verification notes identify the same issue, PR, and head; a verdict about another task is not a verdict for this loop.
7. If the singleton returns stale-task output or a transient `systemError`, read its status, send one concise target-correction/retry prompt, and keep review pending. Do not convert a transient runtime failure into `needs_human` or overwrite valid evidence state unless a real human gate exists.
8. After every valid verdict, run or request `$sdlc-evidence` so the issue and PR record the current head, checks, evidence, blockers, and review result.
9. If changes are requested, fix only the findings, refresh evidence, and resubmit until approved or `review.maxCycles` is reached.
10. If marking a draft PR ready or changing labels is part of closeout, do it only after the last code/evidence update, then wait for any newly queued current-head checks and perform one final evidence readback. Do not call a PR `merge_ready` while a post-mutation check is still queued.
11. Escalate when the reviewer returns `needs_human`, asks an unanswerable product/risk question, or max cycles are reached.

## Docs Lane

Use `$sdlc-docs` in the same PR when the change affects docs, public behavior, commands, CI/release policy, repo guidance, operational behavior, or user-facing workflows.

## Evidence Rules

- Judge implementation against issue acceptance criteria, not only the diff.
- Judge verification against the declared CI tier.
- For simulator-required changes, require PR-attached screenshot/video evidence; local paths do not count.
- Missing full integration evidence for `full-ci-before-merge` may be approval-compatible only when recorded as a merge blocker.
- Do not run or rerun GitHub Actions from this skill; record existing evidence and blocker class.

## Output

Report the reviewer thread used, verdict, requested changes, evidence status, and whether another cycle is needed. Do not claim the review is clean unless the reviewer returned `Verdict: approved`.
