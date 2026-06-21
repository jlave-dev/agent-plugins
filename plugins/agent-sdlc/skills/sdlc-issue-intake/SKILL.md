---
name: sdlc-issue-intake
description: Use when turning a rough feature request, bug report, cleanup idea, or agent task into a scoped GitHub Issue for Agent SDLC workflows, including active-work overlap checks, dependency classification, labels, branch naming, CI tiering, and a worker dispatch prompt saved into the issue.
---

# SDLC Issue Intake

## Overview

Turn messy intent into one traceable GitHub Issue before implementation starts. Keep this lightweight: the issue is the coordination record, the PR is the review surface, and branches/worktrees remain disposable execution spaces. The worker prompt must be saved in the issue so an orchestrator can dispatch it later without asking the user to copy/paste anything.

## Requirements Gate

- Use the current repository unless the user names another repo.
- Require `gh` only when creating or reading GitHub Issues. If `gh` is unavailable or unauthenticated, draft the issue body and stop before GitHub mutation.
- Do not implement code as part of intake unless the user explicitly asks to continue after issue creation.
- Ask at most one clarifying question, and only when the answer changes architecture, data model, auth/security behavior, public behavior, billing, or destructive operations.

## Workflow

1. Inspect repo state:
   - `git status --short --branch`
   - `git fetch origin` when network/remote access is available
   - `git rev-parse --verify origin/<base>` using `.agent-sdlc.yml` `defaultBase` when present, otherwise `main`
2. Read `references/issue-and-ci-template.md` before drafting or updating the issue body or worker prompt.
3. Inspect active work:
   - `gh issue list --label agent:active --state open`
   - `gh issue list --label agent:blocked --state open`
   - `gh pr list --state open`
4. Convert the request into a scoped issue with goal, acceptance criteria, scope boundaries, dependency notes, risk labels, CI tier, verification plan, and worker dispatch prompt.
5. Classify the task:
   - `independent`: branch from latest base.
   - `stacked`: depends on one unmerged PR; stack on that PR branch.
   - `speculative`: explores an approach or competing design; draft PR only until promoted.
   - `blocked`: depends on multiple unmerged PRs, conflicts with active work, or needs a human decision.
6. Classify CI tier from `.agent-sdlc.yml` when present: `fast-check-only`, `full-ci-required`, `full-ci-before-merge`, or `human-decision`.
7. Create or update the GitHub Issue only after the issue body is coherent and includes `## Worker Dispatch` from the reference template. Add labels from `.agent-sdlc.yml` when configured; otherwise use the defaults in the reference.
8. After creating a new issue, read it back and patch the saved `Worker Dispatch` block so it includes the final issue number and URL assigned by GitHub.
9. Do not require the human to handle the worker prompt. Return the issue URL, dependency mode, branch, base SHA, and a concise next step such as `Ready for $sdlc-dispatch-issue`.

## Branch And Dependency Rules

- Branch names use Conventional Commit style: `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`, `chore/<short-description>`.
- Never include agent names in branch names or commit messages.
- If an issue depends on one open PR, mark it `stacked` and set the parent PR explicitly.
- If an issue depends on multiple open PRs, mark it `agent:blocked` and ask the user to choose an integration path.
- If another active issue touches the same files or domain, stop and report the overlap unless this is explicitly speculative.

## CI Tier Rules

- Start at `fast-check-only` for docs, tests, prompts, local refactors, and changes covered by configured `ci.fastChecks`.
- Use `full-ci-required` when the change touches configured `ci.riskyPaths`, alters integration contracts, or needs full-system proof before a reviewer can trust it.
- Use `full-ci-before-merge` for stack layers or changes where review can proceed on fast evidence but merge must wait for the top-of-stack PR, current head SHA, or configured merge queue/merge group proof.
- Use `human-decision` when the task matches `ci.humanReviewRisks` or `merge.requireHumanFor`, when branch-protection policy is ambiguous, or when required CI access is unavailable.
- Record the evidence source explicitly. Do not collapse current-head, top-of-stack, and merge-queue evidence into the same proof claim.

## Output

Use the issue body and worker dispatch shapes from `references/issue-and-ci-template.md`. End with a concise status summary, not a worker prompt dump. The durable worker prompt belongs in the GitHub Issue under `## Worker Dispatch`.
