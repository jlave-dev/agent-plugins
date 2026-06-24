---
name: sdlc-orchestrate
description: Use when the user wants Agent SDLC to continue an issue or pull request to the next workflow role automatically, including preflight, dispatch, evidence refresh, review, docs, or merge queue routing from GitHub issue/PR state.
---

# SDLC Orchestrate

Continue an Agent SDLC issue or PR by routing to the next role. The GitHub Issue `## Agent State` is the durable workflow record.

## Workflow

1. Identify the issue and PR from the user's request, current branch, or linked GitHub metadata.
2. Run the dry-run resolver:
   - `node <plugin-root>/scripts/next-step.ts --issue <number>`
   - Add `--pr <number>` when a PR exists.
3. Read the returned `role` and `reason`.
4. If `stop` is true, report the reason and do not invent another step.
5. Use the returned role:
   - `sdlc-preflight`: verify issue, branch, worktree, and overlap before dispatch.
   - `sdlc-dispatch-issue`: create or resume the worker lane.
   - `sdlc-evidence`: refresh PR/issue proof and blocker state.
   - `sdlc-docs`: update stale docs or policy surfaces.
   - `sdlc-review-loop`: run independent review.
   - `sdlc-merge-queue`: merge only approved and current-head-safe PRs.
6. After the role updates issue/PR state, rerun the resolver only when the user asked to continue the SDLC flow end to end.

## Rules

- Derive defaults from the repo, package scripts, GitHub issue state, and PR metadata.
- Do not bypass a missing prior state. If preflight or evidence is missing, run the required role instead of continuing.
- Do not merge unless the issue/user explicitly put merging in scope and the resolver returns `sdlc-merge-queue`.
