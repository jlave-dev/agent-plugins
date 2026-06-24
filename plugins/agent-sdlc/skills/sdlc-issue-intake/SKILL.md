---
name: sdlc-issue-intake
description: Use when turning a rough feature request, bug report, cleanup idea, or agent task into a scoped GitHub Issue for Agent SDLC workflows, including active-work overlap checks, dependency classification, labels, branch naming, CI tiering, and a worker dispatch prompt saved into the issue.
---

# SDLC Issue Intake

Turn messy intent into one traceable GitHub Issue. The issue is the coordination record; implementation happens later through `$sdlc-orchestrate`.

## Hard Stops

- Do not implement code during intake unless the user explicitly asks to continue.
- Require `gh` only for GitHub reads/writes. If unavailable, draft the issue body and stop.
- Ask at most one clarifying question, only when it changes architecture, data model, auth/security, public behavior, billing, or destructive work.

## Workflow

1. Inspect the repo:
   - `git status --short --branch`
   - `git fetch origin` when available
   - resolve default base from `origin/HEAD`, then `origin/main`
2. Read `references/issue-and-ci-template.md`.
3. Check active work:
   - `gh issue list --label agent:active --state open`
   - `gh issue list --label agent:blocked --state open`
   - `gh pr list --state open`
4. Draft a scoped issue with goal, acceptance criteria, scope boundaries, dependency mode, CI tier, verification, simulator evidence, Agent State, and saved `## Worker Dispatch`.
5. Classify dependency mode:
   - `independent`: branch from latest base.
   - `stacked`: depends on one unmerged PR.
   - `speculative`: draft PR until promoted.
   - `blocked`: conflicting active work, multiple dependencies, or human decision needed.
6. Classify CI tier:
   - `fast-check-only`: docs, tests, prompts, local refactors, or detected fast checks cover it.
   - `full-ci-required`: risky paths or integration contracts need full proof before review.
   - `full-ci-before-merge`: review can proceed on fast proof, merge waits for full proof.
   - `human-decision`: auth, data, migration, security, public API, billing, ambiguous branch protection, or unavailable CI access.
7. Create/update the issue only after the body is coherent and includes `## Worker Dispatch`.
8. After creating a new issue, read it back and patch `## Worker Dispatch` with the final issue number and URL.

## Rules

- Branch names use Conventional Commit style, such as `feat/<short-description>`.
- Never include agent names in branch names or commit messages.
- Stop on active issue/PR overlap unless the task is explicitly speculative.
- Do not collapse current-head, top-of-stack, and merge-queue evidence into one proof claim.

## Output

Return issue URL, dependency mode, branch, base SHA, CI tier, and `Ready for $sdlc-orchestrate`. Do not dump the worker prompt; it belongs in the issue.
