---
name: sdlc-dispatch-issue
description: Use when an orchestrator should pick or receive an Agent SDLC GitHub Issue whose preflight has passed, create the implementation branch/worktree, spawn the worker thread from the issue's saved Worker Dispatch prompt, or record worker state back on the issue without doing worker fixes inline.
---

# SDLC Dispatch Issue

Launch the worker lane for a preflighted Agent SDLC issue.

## Hard Stops

- Do not implement the issue in the orchestrator thread.
- Do not use multi-agent subagents as implementation workers.
- Do not merge the PR from this role.
- Do not put local absolute worktree paths in GitHub issue/PR text.
- If Agent State is not `Status: preflight_passed`, run `$sdlc-preflight` first and stop unless it passes.

## Workflow

1. Pick the issue:
   - Use the user-named issue, or the oldest open `agent:ready` issue whose dependencies are independent.
   - Skip `agent:blocked` and `agent:active` issues unless the user asks to resume.
2. Inspect live state:
   - `git status --short --branch`
   - `git fetch origin --prune`
   - `gh issue view <number> --json number,title,body,labels,url,state`
   - `gh issue list --label agent:active --state open`
   - `gh pr list --state open`
3. Read `## Worker Dispatch`, `## Agent State`, declared base, branch, dependency mode, and simulator evidence.
4. Stop if `## Worker Dispatch` is missing and cannot be reconstructed from `$sdlc-issue-intake` without guessing.
5. Create or reuse the declared branch/worktree:
   - Before creating worker state, run `node plugins/agent-sdlc/scripts/guardrails.js validate-base --base <declared-base> --file <scope-path> --command "<verification-command>"` for the issue scope and declared fast checks; scope paths may be files or directories.
   - If the branch already exists, verify it belongs to this issue before using it.
   - For a fresh lane, create the named branch from the exact declared base SHA with `git switch -c <declared-branch> <base-sha>`, then push it with `git push -u origin <declared-branch>` before provisioning the worktree.
   - Provision the worker worktree from the pushed named branch, not from a detached commit or the orchestrator checkout.
   - Before `create_thread`, verify the declared branch resolves with `git rev-parse --verify <branch>^{commit}`.
   - If the branch was just created locally, push it with upstream tracking and verify `git rev-parse --verify origin/<branch>^{commit}` before `create_thread`; otherwise Codex worktree setup can fail with `fatal: invalid reference`.
   - After thread creation, wait for the real worker thread/worktree and require its first action to be `git switch <declared-branch>` if needed, followed by `git branch --show-current`, `git status --short --branch`, and `git rev-parse HEAD`; on a fresh lane, HEAD must equal the declared base SHA. The worker must not receive implementation instructions, read more workflow context, or edit files until the symbolic branch and exact base are verified.
6. Update issue Agent State:
   - `Status: active`
   - `Owner`
   - `Base`
   - `Branch`
   - `Worker Thread` after creation
7. Create the project worker thread with the issue's saved `Worker Dispatch` plus:
   - private worktree path
   - branch name
   - live overlap snapshot
   - simulator evidence requirement
   - instructions to update the issue/PR, run `$sdlc-evidence`, then `$sdlc-review-loop`
8. Comment on the issue with worker thread ID, branch, simulator evidence requirement, and dispatch time. Keep the local path out.
9. Report issue URL, branch, worktree, worker thread ID, and whether this was new or resumed.

## Failure Modes

- If GitHub cannot be read or updated, stop before creating a worker.
- If branch/worktree ownership is unclear, stop with the exact local status.
- If thread creation is unavailable, mark/report the issue blocked; do not substitute a subagent.
- If worktree creation fails with `fatal: invalid reference`, materialize the declared branch ref locally and on origin, then retry once before marking the issue blocked.
- If the worker starts detached or on another branch, stop immediately, attach the declared branch, verify status and HEAD, and only then continue.
- Before editing issue/PR bodies, write the next body to a draft file and run `node plugins/agent-sdlc/scripts/guardrails.js body --body-file <draft> > <safe-body>`; pass the safe file to `gh --body-file`.
