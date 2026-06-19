# Issue And CI Template

Use this reference after the intake workflow has identified the target repository, base branch, active work, and likely dependency mode.

## Default Labels

Use these unless `.agent-sdlc.yml` overrides them:

```text
agent:ready
agent:active
agent:blocked
agent:review
agent:speculative
needs-human
full-ci
ready-to-merge
stacked
```

Area labels are optional and repo-specific, for example `area:frontend`, `area:backend`, `area:docs`, and `area:infra`.

## Issue Body

````markdown
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

## CI Tier
Tier: fast-check-only / full-ci-required / full-ci-before-merge / human-decision
Reason: [Why this tier was chosen.]
Fast checks: [commands from `.agent-sdlc.yml` or issue-specific checks]
Full integration evidence: not required / current head SHA / top-of-stack PR / merge queue or merge group / human decision
Stack position: standalone / stack layer / top-of-stack / unknown
Labels: [full-ci, ready-to-merge, or repo-specific labels when applicable]

## Simulator Evidence
Required: no / yes / conditional for app UI or native flow changes
Targets: iOS Simulator / Android Emulator / browser only / not applicable
Artifact: screenshot or screen recording attached to PR / not required
Notes: [Which user flow needs visual proof, or why simulator evidence is not applicable.]

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
Worktree:
Worker Thread:
PR:
Checks:
Evidence:
Blockers:

## Worker Dispatch

```text
Implement GitHub issue #<number> in <repo>.

Issue: <issue URL>
Base: origin/<base> @ <sha>
Branch: <type>/<short-description>
Dependency mode: independent / stacked on PR #... / speculative
CI tier: fast-check-only / full-ci-required / full-ci-before-merge / human-decision
CI evidence source: fast checks / current head SHA / top-of-stack PR / merge queue or merge group / human decision
Simulator evidence: no / yes / conditional for app UI or native flow changes
Scope:
- ...

Before editing, re-check active issues and PRs for overlap. If the dependency mode has changed, stop and report it.

Acceptance criteria:
- ...

Verification:
- ...

Implementation workflow:
- Use the worktree created by the orchestrator. Do not edit the orchestrator's main checkout.
- Open a draft PR linked to the issue when the first coherent implementation exists.
- When simulator evidence is required or the change affects an app UI/native flow, build and run the app in the declared simulator/emulator, capture a screenshot or screen recording of the relevant flow, and attach that artifact to the PR body or a PR comment. Do not rely on a local file path as evidence.
- For screenshots, use `gh-image` when a GitHub-hosted attachment URL is needed: install it with `gh extension install drogers0/gh-image` if `gh image` is unavailable, run `gh image <artifact-path> --repo <owner>/<repo>`, and paste the returned Markdown image link into the PR. Do not include local absolute paths in PR or issue text.
- Before review, run the declared verification, update the issue Agent State, and use $sdlc-review-loop for an independent review.
- After review approval, update the PR and issue with checks, review result, and remaining risk. Do not merge unless the dispatching prompt explicitly asks you to merge.
```
````

## CI Tier Notes

- `fast-check-only`: configured fast checks are enough for review and merge.
- `full-ci-required`: full integration evidence is required before reviewer approval, usually because touched paths match `ci.riskyPaths` or the change crosses integration boundaries.
- `full-ci-before-merge`: fast checks are enough for implementation review, but full integration must pass on the top-of-stack PR, current head SHA, or merge queue before merge.
- `human-decision`: policy, risk, or missing access requires the user to choose acceptable CI evidence.

## Worker Dispatch Prompt

```text
Implement GitHub issue #<number> in <repo>.

Issue: <issue URL>
Base: origin/<base> @ <sha>
Branch: <type>/<short-description>
Dependency mode: independent / stacked on PR #... / speculative
CI tier: fast-check-only / full-ci-required / full-ci-before-merge / human-decision
CI evidence source: fast checks / current head SHA / top-of-stack PR / merge queue or merge group / human decision
Simulator evidence: no / yes / conditional for app UI or native flow changes
Scope:
- ...

Before editing, re-check active issues and PRs for overlap. If the dependency mode has changed, stop and report it.

Acceptance criteria:
- ...

Verification:
- ...

Implementation workflow:
- Use the worktree created by the orchestrator. Do not edit the orchestrator's main checkout.
- Open a draft PR linked to the issue when the first coherent implementation exists.
- When simulator evidence is required or the change affects an app UI/native flow, build and run the app in the declared simulator/emulator, capture a screenshot or screen recording of the relevant flow, and attach that artifact to the PR body or a PR comment. Do not rely on a local file path as evidence.
- For screenshots, use `gh-image` when a GitHub-hosted attachment URL is needed: install it with `gh extension install drogers0/gh-image` if `gh image` is unavailable, run `gh image <artifact-path> --repo <owner>/<repo>`, and paste the returned Markdown image link into the PR. Do not include local absolute paths in PR or issue text.
- Before review, run the declared verification, update the issue Agent State, and use $sdlc-review-loop for an independent review.
- After review approval, update the PR and issue with checks, review result, and remaining risk. Do not merge unless the dispatching prompt explicitly asks you to merge.
```
