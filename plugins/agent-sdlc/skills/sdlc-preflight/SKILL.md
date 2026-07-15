---
name: sdlc-preflight
description: Use when an Agent SDLC issue is ready to dispatch or resume and the orchestrator must verify the issue, dependency mode, branch, worktree, base ref, active issue/PR overlap, and hard-stop conditions such as detached HEAD or wrong checkout.
---

# SDLC Preflight

Verify that an Agent SDLC issue is safe to dispatch before a worker edits code.

## Workflow

1. Inspect live repo and GitHub state:
   - `git status --short --branch`
   - `git fetch origin --prune`
   - `gh issue view <number> --json number,title,body,labels,url,state`
   - `gh issue list --label agent:active --state open`
   - `gh issue list --label agent:blocked --state open`
   - `gh pr list --state open`
2. Extract `## Dependencies`, `## Worker Dispatch`, and `## Agent State`.
3. Verify the declared base ref resolves. Default to `origin/HEAD`, then `origin/main`, when the issue does not declare a base.
4. Run the plugin guard for declared scope paths and verification commands:
   - `node plugins/agent-sdlc/scripts/guardrails.js validate-base --base <declared-base> --file <scope-path> --command "<verification-command>"`
   - Scope paths may be files or directories; directory scopes are expanded to child files.
   - Stop if it reports files, child files, or package scripts that exist only in the current worktree but not at the declared base.
5. Verify the declared branch is available or belongs to this issue. If it is already checked out in another worktree, inspect that worktree before reusing it.
6. Re-check active issues and PRs for path/domain overlap. If dependency mode changed, stop and mark/report the issue as blocked or stacked.
7. If the current checkout is detached or on the wrong branch for issue-specific work, stop before reading more repo workflow context or editing files.
8. For a fresh worker lane, require branch provisioning from the declared base SHA, a pushed `origin/<branch>` ref, and a worker bootstrap that verifies `git branch --show-current` plus `git rev-parse HEAD` before implementation instructions or edits are allowed.
9. On success, update `## Agent State` with `Status: preflight_passed`, base, branch, and any safe non-local-path worktree note.

## Rules

- Do not create implementation changes in this role.
- Do not put local absolute paths in GitHub issue bodies or comments.
- Before `gh issue edit --body-file` or `gh pr edit --body-file`, run `node plugins/agent-sdlc/scripts/guardrails.js body --body-file <draft> > <safe-body>`.
- Treat `HEAD (no branch)` as a hard stop unless the user explicitly asks to repair the checkout.
