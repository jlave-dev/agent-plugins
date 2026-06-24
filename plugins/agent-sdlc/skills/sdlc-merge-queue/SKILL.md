---
name: sdlc-merge-queue
description: Use when Agent SDLC PRs are approved and marked merge-ready, and an orchestrator should merge one or more PRs in dependency order while verifying current-head checks, issue Agent State, review verdicts, and handing conflicts or failed checks back to workers instead of fixing inline.
---

# SDLC Merge Queue

Merge approved Agent SDLC PRs without doing implementation fixes in the orchestrator lane.

## Workflow

1. Refresh live state:
   - `git status --short --branch`
   - `git fetch origin --prune`
   - `gh pr view <number> --json number,title,url,state,isDraft,headRefOid,mergeStateStatus,statusCheckRollup,reviewDecision`
   - linked issue `## Agent State`
2. Confirm the issue says `Status: merge_ready`, has a PR, has current-head evidence, and records an approved review or explicit accepted `needs_human` verdict.
3. Inspect the actual PR diff before merging:
   - `gh pr diff <number> --name-only`
   - `gh pr diff <number> --patch` for the highest-risk touched files.
4. Confirm required checks are green on the current PR head. Pending checks may be polled; failed checks stop the queue.
5. Mark ready if the PR is still draft and all gates pass.
6. Merge with the repo's merge helper when one exists; otherwise use the repo's normal GitHub merge path.
7. Verify the PR merged and the linked issue closed or explain why it remains open.

## Hand Back Instead Of Fixing

- For failed checks, send the failure links and a concise fix request to the original worker thread.
- For conflicts or stale branches, ask the worker to rebase/merge onto the required base, resolve only conflict files, verify, push, refresh evidence, and rerun review.
- If the worker thread is unavailable, update the issue as blocked and ask the user whether to spawn a replacement worker.
