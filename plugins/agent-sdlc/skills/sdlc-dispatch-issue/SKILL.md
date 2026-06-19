---
name: sdlc-dispatch-issue
description: Use when an orchestrator should pick or receive an Agent SDLC GitHub Issue, create the implementation branch/worktree, spawn the worker thread from the issue's saved Worker Dispatch prompt, and record the worker state back on the issue.
---

# SDLC Dispatch Issue

Turn a ready Agent SDLC issue into a live worker thread without asking the human to copy a prompt.

## Requirements Gate

- Use the current repository unless the user names another repo.
- Require `gh` for reading and updating GitHub Issues.
- Use thread-management tools when available. If they are not already listed, search for `create_thread`, `list_projects`, and related thread tools before falling back.
- Do not implement the issue in the orchestrator thread. This skill creates or resumes the worker lane.
- Do not merge the worker PR unless the issue or user explicitly asks for merging.

## Issue Selection

1. If the user names an issue number, dispatch that issue.
2. Otherwise list open ready issues with the configured ready label, defaulting to:
   - `gh issue list --label agent:ready --state open --json number,title,labels,updatedAt,url`
3. Prefer the oldest ready issue whose `## Dependencies` mode is `independent`.
4. Skip issues labeled `agent:blocked` or `agent:active` unless the user explicitly asks to resume them.
5. If multiple issues are equally suitable and picking one could conflict with active work, ask one short question. Otherwise pick the oldest ready issue and proceed.

## Workflow

1. Inspect repo state and active work:
   - `git status --short --branch`
   - `git fetch origin --prune`
   - `gh issue list --label agent:active --state open`
   - `gh issue list --label agent:blocked --state open`
   - `gh pr list --state open`
2. Read the issue:
   - `gh issue view <number> --json number,title,body,labels,url,state`
   - Extract `## Worker Dispatch`.
   - Extract `## Dependencies`, `## Agent State`, `Base`, `Branch`, and `Mode`.
3. If `## Worker Dispatch` is missing:
   - Reconstruct it from the issue body using the template in `$sdlc-issue-intake`.
   - Update the issue body so future dispatches do not need reconstruction.
   - If reconstruction would be lossy, stop and mark the issue `needs-human`.
4. Re-check dependency mode against live active issues and PRs:
   - If the issue says `independent` but overlaps an active issue or open PR in the same files/domain, stop and update labels/state to blocked or stacked.
   - If the issue says `stacked`, verify the parent PR is still open and record the parent branch.
   - If the issue says `blocked` or `human-decision`, do not dispatch.
5. Prepare the branch/worktree:
   - For independent issues, start from the declared `Base` when it resolves; otherwise use the current `origin/<base>`.
   - For stacked issues, start from the parent PR head branch.
   - Create or reuse the declared branch.
   - Prefer a disposable worktree path under `~/.codex/worktrees/<issue-number>-<short-slug>/<repo-name>`.
   - If the branch or worktree already exists, verify it belongs to this issue and inspect `git status --short --branch` before reusing it.
6. Update the issue before dispatch:
   - Add `agent:active`.
   - Remove `agent:ready` when present.
   - Fill `Owner`, `Base`, `Branch`, and `Worktree` in `## Agent State`.
7. Spawn the worker thread:
   - Use `list_projects` to find the current repository's project.
   - Use `create_thread` to create a project worker thread. Prefer a worktree environment when the available tool supports the desired branch; otherwise create a project-local thread and put the worktree path at the top of the prompt.
   - The worker prompt must include the issue's saved `Worker Dispatch` text plus:
     - exact worktree path
     - branch name
     - live overlap snapshot
     - instruction to update the issue and PR
     - instruction to use `$sdlc-review-loop` after implementation verification
     - instruction not to merge unless explicitly requested
8. Record the worker:
   - Update `Worker Thread` in `## Agent State`.
   - Add a brief issue comment with worker thread ID, worktree path, branch, and dispatch time.
9. Report the dispatch:
   - Provide the issue URL, branch, worktree, worker thread ID, and whether the worker was newly created or resumed.
   - Emit the created-thread directive if the thread tool returned a new thread ID.

## Worker Prompt Addendum

Append this to the issue's saved `Worker Dispatch` prompt before creating the thread:

```text
You are the implementation worker for this Agent SDLC issue.

Use the provided worktree and branch. Do not edit the orchestrator's main checkout.

After implementation:
- Run the declared verification.
- Commit with a Conventional Commit message.
- Push the branch and open or update a PR linked to the issue.
- Update the issue Agent State with PR, checks, blockers, and any residual risk.
- Start `$sdlc-review-loop` from the worker thread and iterate until the reviewer returns `Verdict: approved`, `Verdict: needs_human`, or the configured max cycle count is reached.
- Do not merge the PR unless this dispatch prompt explicitly says merging is in scope.
```

## Failure Modes

- If GitHub cannot be read or updated, do not create a worker from stale local assumptions.
- If the issue lacks enough dispatch context and cannot be reconstructed safely, label it `needs-human` and explain what is missing.
- If branch creation fails because the branch already exists in another worktree, inspect that worktree and either reuse it or stop with the exact path and status.
- If thread creation is unavailable, leave the issue updated with the worktree and branch, but report that dispatch could not create the worker thread.
