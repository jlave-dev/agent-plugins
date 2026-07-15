---
name: create-agents-md
description: Create or update AGENTS.md files that guide AI coding agents in repositories, monorepos, packages, services, and subdirectories. Use when Codex needs to draft, rewrite, audit, compact, split, or refresh agent instructions; document build/test/lint commands, repo conventions, safety boundaries, validation expectations, monorepo routing, tool notes, or references to deeper docs and skills.
---

# Create AGENTS.md

Write compact, repo-specific instructions that tell agents what they cannot safely infer from the codebase.

Read `references/agents-md-guidance.md` when creating a new file, auditing stale instructions, or handling a monorepo.

## Workflow

1. Inspect existing `AGENTS.md` files, README, manifests, build files, scripts, CI, docs, security guidance, generated-code markers, and relevant source directories.
2. Set the file scope: root for shared rules, nested for a package or service with different commands or boundaries. The nearest file wins unless the user says otherwise.
3. Preserve useful project facts, remove stale or duplicated guidance, and never encode a rule that conflicts with the current user request.
4. Include only behavior-changing guidance: exact commands, repo conventions, context-routing links, validation expectations, secrets/data/destructive-action boundaries, and important generated or vendored paths.
5. Put copyable commands early. Verify them against manifests, build files, scripts, and workflows.
6. Validate links, paths, commands, heading structure, scope, and stale template language before finishing.

## Useful Sections

Use only sections that fit the repo:

- Project context and scope
- Commands and validation
- Code or repository conventions
- Context loading and routing
- Boundaries, security, and data handling
- Git and PR workflow

Prefer concrete paths and commands over generic craft advice. Route detailed source-of-truth material to deeper docs instead of duplicating it.

## Output

Edit the file directly when asked. Report the repo facts checked, commands and links verified, and any inferred guidance that needs maintainer confirmation.
