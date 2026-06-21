---
name: sdlc-dispatch-issue
description: Use when an orchestrator should pick or receive an Agent SDLC GitHub Issue, create the implementation branch/worktree, spawn the worker thread from the issue's saved Worker Dispatch prompt, record worker state back on the issue, or coordinate an approved PR merge queue without doing worker fixes inline.
---

# SDLC Dispatch Issue

Turn a ready Agent SDLC issue into a live worker thread without asking the human to copy a prompt.

## Requirements Gate

- Use the current repository unless the user names another repo.
- Require `gh` for reading and updating GitHub Issues.
- Use thread-management tools when available. If they are not already listed, search for `create_thread`, `list_projects`, and related thread tools before falling back.
- Do not use multi-agent subagents as implementation workers for Agent SDLC issue dispatch. If Codex thread creation is unavailable, mark/report the issue as blocked instead of substituting a subagent.
- Do not implement the issue in the orchestrator thread. This skill creates or resumes the worker lane.
- Do not merge the worker PR unless the issue or user explicitly asks for merging.
- When simulator evidence needs a GitHub-hosted image attachment and `gh image` is unavailable, install the GitHub CLI extension with `gh extension install drogers0/gh-image`.
- Do not write local absolute worktree paths into GitHub issue bodies, issue comments, PR bodies, or PR comments. Keep those paths only in the private worker prompt and local orchestrator notes.

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
   - Extract `## Dependencies`, `## CI Tier`, `## Simulator Evidence`, `## Agent State`, `Base`, `Branch`, and `Mode`.
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
   - Fill `Owner`, `Base`, and `Branch` in `## Agent State`.
   - If the issue has a `Worktree` field, use `local worker worktree assigned (not recorded in GitHub)` instead of a local absolute path.
7. Spawn the worker thread:
   - Use `list_projects` to find the current repository's project.
   - Use `create_thread` to create a project worker thread. Prefer a worktree environment when the available tool supports the desired branch; otherwise create a project-local thread and put the worktree path at the top of the prompt.
   - If `create_thread` returns a pending worktree instead of an immediate thread ID, record the pending worktree setup and follow up with the actual thread ID when it becomes available.
   - Do not use `multi_agent`/subagent tools for this implementation worker dispatch path.
   - The worker prompt must include the issue's saved `Worker Dispatch` text plus:
     - exact worktree path
     - branch name
     - live overlap snapshot
     - simulator evidence requirement from the issue
     - instruction to update the issue and PR
     - instruction to use `$sdlc-review-loop` after implementation verification
     - instruction not to merge unless explicitly requested
8. Record the worker:
- Update `Worker Thread` in `## Agent State`.
- Add a brief issue comment with worker thread ID, branch, simulator evidence requirement, and dispatch time. Do not include the local worktree path.
9. Report the dispatch:
   - Provide the issue URL, branch, worktree, worker thread ID, and whether the worker was newly created or resumed.
   - Emit the created-thread directive if the thread tool returned a new thread ID.

## Merge Queue Workflow

Use this lane when the user asks an orchestrator to merge multiple open PRs, such as "merge these PRs in order." The orchestrator coordinates merges only; it does not fix conflicts, failed checks, stale branches, tests, or code.

1. Refresh live state:
   - `git status --short --branch`
   - `git fetch origin --prune`
   - open PRs in the requested order, or oldest/dependency order when no order is given
   - each PR's draft state, current head SHA, required checks, review-loop verdict, linked issue `## Agent State`, associated worker thread, and mergeability/conflicts
2. For each PR in order:
   - Confirm the linked issue, worker thread, and `Verdict: approved` or explicit `Verdict: needs_human`; for `needs_human`, require the human acceptance before merge.
   - Inspect the actual PR diff before marking ready or merging: run `gh pr diff <number> --name-only` plus `gh pr diff <number> --patch` for the highest-risk touched files. Do not rely only on worker summaries, issue state, or review-loop approval.
   - Confirm required checks are green on the current PR head. If checks are pending, wait and poll; do not skip required checks.
   - If the PR is draft but otherwise ready, mark it ready.
   - Merge using the repository's configured merge helper when one exists; otherwise use the repository's normal GitHub merge path.
   - Verify the PR is merged/closed and the issue closed, or update the issue with why it remains open.
3. If checks fail:
   - Stop that PR.
   - Hand it back to the original worker thread with failing check links and a concise fix request.
   - Require the worker to push fixes, rerun verification, update Agent State, and rerun `$sdlc-review-loop`.
   - Continue only to later PRs that are truly independent and safe.
4. If merge conflicts or stale-branch code fixes are needed:
   - Do not resolve them in the orchestrator thread.
   - Hand back to the original worker with PR number, base branch/head, conflict files, required rebase/merge target, and instructions to fix, verify, push, and rerun `$sdlc-review-loop`.
5. If the original worker thread is unavailable:
   - Update the issue as blocked.
   - Ask the human whether to spawn a replacement worker.
   - Do not silently fix the PR in the orchestrator thread.

Example conflict handoff:

```text
PR #79 conflicts with current `origin/main` after earlier queue merges.

Please resume the original worker branch, rebase/merge onto `origin/main`, resolve only these conflict files:
- src/app.tsx

Then run the declared verification, push the updated branch, update the issue Agent State with the new head/checks, and rerun `$sdlc-review-loop`. The orchestrator will resume the merge queue only after review is approved or explicitly needs_human.
```

## Worker Prompt Addendum

Append this to the issue's saved `Worker Dispatch` prompt before creating the thread:

```text
You are the implementation worker for this Agent SDLC issue.

Use the provided worktree and branch. Do not edit the orchestrator's main checkout.

After implementation:
- Run the declared verification.
- If simulator evidence is required, or if your implementation changes app UI/native behavior, build and run the app in the declared iOS Simulator or Android Emulator, capture a screenshot or screen recording of the relevant flow, and attach the artifact to the PR body or a PR comment. A local filesystem path alone does not count as evidence.
- To attach a screenshot with GitHub CLI, install `gh-image` if needed using `gh extension install drogers0/gh-image`, run `gh image <artifact-path> --repo <owner>/<repo>`, and paste the returned Markdown image link into the PR. Do not include local absolute paths in the PR or issue text.
- Commit with a Conventional Commit message.
- Push the branch and open or update a PR linked to the issue.
- Update the issue Agent State with PR, checks, attached evidence, blockers, and any residual risk.
- Start `$sdlc-review-loop` from the worker thread and iterate until the reviewer returns `Verdict: approved`, `Verdict: needs_human`, or the configured max cycle count is reached.
- Do not merge the PR unless this dispatch prompt explicitly says merging is in scope.
```

## Failure Modes

- If GitHub cannot be read or updated, do not create a worker from stale local assumptions.
- If the issue lacks enough dispatch context and cannot be reconstructed safely, label it `needs-human` and explain what is missing.
- If branch creation fails because the branch already exists in another worktree, inspect that worktree and either reuse it or stop with the exact path and status.
- If thread creation is unavailable, leave the issue updated with the worktree and branch, mark/report the dispatch as blocked, and do not spawn a subagent replacement.
