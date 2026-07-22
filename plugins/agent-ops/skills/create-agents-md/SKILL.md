---
name: create-agents-md
description: Create, update, audit, or split AGENTS.md files for repositories and subdirectories. Use when Codex needs repo-specific agent instructions for commands, conventions, validation, architecture boundaries, monorepo routing, safety, or review workflows.
---

# Create AGENTS.md

Write scoped, repo-specific instructions that make non-obvious or high-risk decisions explicit. Optimize for signal, not a fixed length.

Read `references/agents-md-guidance.md` when creating a new file, auditing stale instructions, handling a monorepo, or documenting multiple build, test, or review paths.

## Workflow

1. Inspect existing `AGENTS.md` files, README, manifests, build files, scripts, CI, docs, security guidance, generated-code markers, public interfaces, test helpers, and relevant source directories.
2. Set the file scope: root for shared rules, nested for a package or service with different commands or boundaries. The nearest file wins unless the user says otherwise.
3. Trace representative change paths to find preferred abstractions, architectural pressure points, generated-artifact coupling, review risks, and differences between local, CI, and platform-specific checks.
4. Preserve useful project facts, remove stale or duplicated guidance, and never encode a rule that conflicts with the current user request.
5. Include only behavior-changing guidance: exact commands, preferred helpers or seams, repo conventions, validation triggers, review checklists, context-routing links, safety boundaries, and important generated or vendored paths.
6. Write conditional rules as `when X changes, do Y`; include the working directory, execution order, expected cost, and approval boundary when those affect behavior.
7. Use exact paths, symbols, and short examples for non-obvious conventions. Add rationale only when it prevents a plausible wrong action.
8. Validate links, paths, commands, heading structure, scope, and stale template language before finishing.

## Useful Sections

Use only sections that fit the repo:

- Project context and scope
- Commands and validation
- Architecture, ownership, and preferred extension points
- Code or repository conventions
- Testing strategy, helpers, fixtures, and snapshots
- Generated artifacts and cross-platform constraints
- Review risks and compatibility surfaces
- Context loading and routing
- Boundaries, security, and data handling
- Git and PR workflow

Prefer concrete paths and commands over generic craft advice. Route detailed source-of-truth material to deeper docs instead of duplicating it.

## Output

Edit the file directly when asked. Report the repo facts checked, commands and links verified, and any inferred guidance that needs maintainer confirmation.
