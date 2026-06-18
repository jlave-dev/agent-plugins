# SDLC Review Handoff

## Project

- Name: {{PROJECT_NAME}}
- Directory: {{PROJECT_DIR}}
- Branch: {{BRANCH}}
- Base: {{BASE_BRANCH}}
- Base ref: {{BASE_REF}}
- Comparison: {{COMPARE_RANGE}}
- Generated: {{GENERATED_AT}}

## Request

Please review the current working tree as an independent reviewer. Focus on correctness, regressions, missing tests, maintainability, and local project conventions.

## Issue Context

- Issue: {{ISSUE_REF}}
- Title: {{ISSUE_TITLE}}
- State: {{ISSUE_STATE}}
- URL: {{ISSUE_URL}}
- Labels: {{ISSUE_LABELS}}

### CI Tier

- Tier: {{ISSUE_CI_TIER}}
- Evidence source: {{ISSUE_CI_EVIDENCE_SOURCE}}
- Stack position: {{ISSUE_CI_STACK_POSITION}}

```text
{{ISSUE_CI_TIER_SECTION}}
```

### Acceptance Criteria

```text
{{ISSUE_ACCEPTANCE_CRITERIA}}
```

### Dependencies

```text
{{ISSUE_DEPENDENCIES}}
```

### Verification From Issue

```text
{{ISSUE_VERIFICATION}}
```

### Issue Body

```markdown
{{ISSUE_BODY}}
```

## Git Summary

```text
{{STATUS_SUMMARY}}
```

## Changed Files From Base

```text
{{CHANGED_FILES}}
```

## Diff Stat From Base

```text
{{DIFF_STAT}}
```

## Staged Changes

```text
{{STAGED_SUMMARY}}
```

## Unstaged Changes

```text
{{UNSTAGED_SUMMARY}}
```

## Verification Commands

```text
{{VERIFY_COMMANDS}}
```

## Configured CI Policy

```text
{{CI_POLICY}}
```

## Reviewer Output Contract

Return severity-ranked findings with file and line references where possible. End with exactly one verdict line:

```text
Verdict: approved
Verdict: changes_requested
Verdict: needs_human
```
