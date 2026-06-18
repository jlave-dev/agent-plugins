---
name: sdlc-issue-intake
description: Use when turning a rough feature request, bug report, cleanup idea, or agent task into a scoped GitHub Issue for Agent SDLC workflows, including active-work overlap checks, dependency classification, labels, branch naming, and an implementation handoff prompt.
---

# SDLC Issue Intake

## Overview

Turn messy intent into one traceable GitHub Issue before implementation starts. Keep this lightweight: the issue is the coordination record, the PR is the review surface, and branches/worktrees remain disposable execution spaces.

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
2. Inspect active work:
   - `gh issue list --label agent:active --state open`
   - `gh issue list --label agent:blocked --state open`
   - `gh pr list --state open`
3. Convert the request into a scoped issue with goal, acceptance criteria, scope boundaries, dependency notes, risk labels, and verification plan.
4. Classify the task:
   - `independent`: branch from latest base.
   - `stacked`: depends on one unmerged PR; stack on that PR branch.
   - `speculative`: explores an approach or competing design; draft PR only until promoted.
   - `blocked`: depends on multiple unmerged PRs, conflicts with active work, or needs a human decision.
5. Create or update the GitHub Issue only after the issue body is coherent. Add labels from `.agent-sdlc.yml` when configured; otherwise use the defaults in this skill.
6. Return the implementation prompt for the worker agent, including issue number, base SHA, branch name, dependency mode, touched areas, and verification commands.

## Default Labels

Use these unless `.agent-sdlc.yml` overrides them:

```text
agent:ready
agent:active
agent:blocked
agent:review
agent:speculative
needs-human
ready-to-merge
stacked
```

Area labels are optional and repo-specific, for example `area:frontend`, `area:backend`, `area:docs`, and `area:infra`.

## Issue Shape

Use this body:

```markdown
## Goal
[What should be true when this is done.]

## Acceptance Criteria
- [Observable outcome]
- [Test, doc, or verification requirement]

## Scope
Likely touched areas:
- `[path or domain]`

Out of scope:
- [Explicit exclusions]

## Dependencies
Depends on: none / #issue / PR #number
Mode: independent / stacked / speculative / blocked

## Plan
- [Small implementation steps]

## Verification
- `[repo verify command]`
- [Targeted test or smoke check]

## Human Review Triggers
- [auth/data/security/public API/migration/product decision, if any]

## Agent State
Status: ready
Owner:
Base:
Branch:
PR:
Checks:
Blockers:
```

## Branch And Dependency Rules

- Branch names use Conventional Commit style: `feat/<short-description>`, `fix/<short-description>`, `docs/<short-description>`, `chore/<short-description>`.
- Never include agent names in branch names or commit messages.
- If an issue depends on one open PR, mark it `stacked` and set the parent PR explicitly.
- If an issue depends on multiple open PRs, mark it `agent:blocked` and ask the user to choose an integration path.
- If another active issue touches the same files or domain, stop and report the overlap unless this is explicitly speculative.

## Implementation Prompt Output

End with a worker prompt shaped like:

```text
Implement GitHub issue #<number> in <repo>.

Base: origin/<base> @ <sha>
Branch: <type>/<short-description>
Dependency mode: independent / stacked on PR #... / speculative
Scope:
- ...

Before editing, re-check active issues and PRs for overlap. If the dependency mode has changed, stop and report it.

Acceptance criteria:
- ...

Verification:
- ...

Open a draft PR linked to the issue when the first coherent implementation exists. Before review, run verification, update the issue Agent State, and use $sdlc-review-loop for an independent review.
```
