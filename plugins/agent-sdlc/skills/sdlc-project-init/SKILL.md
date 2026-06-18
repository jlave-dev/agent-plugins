---
name: sdlc-project-init
description: Use when the user wants to initialize or propose an `.agent-sdlc.yml` config for a repository so Agent SDLC workflows can discover project name, default base branch, verification commands, CI tier policy, GitHub issue labels, workflow defaults, reviewer/docs thread titles, and review loop settings.
---

# SDLC Project Init

Create or propose a project-local `.agent-sdlc.yml` config for Agent SDLC workflows.

## Workflow

1. Inspect the target repo. If none is specified, use the current working directory.
2. Run `node <plugin-root>/scripts/init-project-config.ts <repo-root>` to generate a proposed config.
3. Show the proposed config to the user and explain any missing verification commands.
4. Write the file only after explicit user approval, then rerun the script with `--write`.

## Detection Rules

The helper detects common package managers from lockfiles, reads `package.json` scripts, and prefers an existing `verify` script. If no `verify` script exists, it proposes common test, typecheck, lint, and build commands that are actually present. The generated config also includes default GitHub Issue labels, CI fast-check commands, integration labels, merge queue/group evidence flags, risky path categories, and human-review risk categories for `$sdlc-issue-intake`.

## Safety

Do not overwrite an existing `.agent-sdlc.yml` unless the user explicitly asks to replace it. Do not create reviewer threads as part of initialization.

## Output

Return the proposed config, whether it was written, and the verification commands it found. Keep the config small enough that future workflow threads can read it quickly.
