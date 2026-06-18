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

## CI Tier
Tier: fast-check-only / full-ci-required / full-ci-before-merge / human-decision
Reason: [Why this tier was chosen.]
Fast checks: [commands from `.agent-sdlc.yml` or issue-specific checks]
Full integration evidence: not required / current head SHA / top-of-stack PR / merge queue or merge group / human decision
Stack position: standalone / stack layer / top-of-stack / unknown
Labels: [full-ci, ready-to-merge, or repo-specific labels when applicable]

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

## CI Tier Notes

- `fast-check-only`: configured fast checks are enough for review and merge.
- `full-ci-required`: full integration evidence is required before reviewer approval, usually because touched paths match `ci.riskyPaths` or the change crosses integration boundaries.
- `full-ci-before-merge`: fast checks are enough for implementation review, but full integration must pass on the top-of-stack PR, current head SHA, or merge queue before merge.
- `human-decision`: policy, risk, or missing access requires the user to choose acceptable CI evidence.

## Worker Prompt

```text
Implement GitHub issue #<number> in <repo>.

Base: origin/<base> @ <sha>
Branch: <type>/<short-description>
Dependency mode: independent / stacked on PR #... / speculative
CI tier: fast-check-only / full-ci-required / full-ci-before-merge / human-decision
CI evidence source: fast checks / current head SHA / top-of-stack PR / merge queue or merge group / human decision
Scope:
- ...

Before editing, re-check active issues and PRs for overlap. If the dependency mode has changed, stop and report it.

Acceptance criteria:
- ...

Verification:
- ...

Open a draft PR linked to the issue when the first coherent implementation exists. Before review, run verification, update the issue Agent State, and use $sdlc-review-loop for an independent review.
```
