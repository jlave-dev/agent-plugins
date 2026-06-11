# SDLC Review Handoff

## Project

- Name: {{PROJECT_NAME}}
- Directory: {{PROJECT_DIR}}
- Branch: {{BRANCH}}
- Base: {{BASE_BRANCH}}
- Generated: {{GENERATED_AT}}

## Request

Please review the current working tree as an independent reviewer. Focus on correctness, regressions, missing tests, maintainability, and local project conventions.

## Git Summary

```text
{{STATUS_SUMMARY}}
```

## Changed Files

```text
{{CHANGED_FILES}}
```

## Diff Stat

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

## Reviewer Output Contract

Return severity-ranked findings with file and line references where possible. End with exactly one verdict line:

```text
Verdict: approved
Verdict: changes_requested
Verdict: needs_human
```
