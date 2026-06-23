---
name: create-agents-md
description: Create or update AGENTS.md files that guide AI coding agents in repositories, monorepos, packages, services, and subdirectories. Use when Codex needs to draft, rewrite, audit, compact, split, or refresh agent instructions; document build/test/lint commands, repo structure, coding conventions, safety boundaries, permission rules, validation expectations, monorepo routing, tool-specific notes, or references to deeper docs and project skills.
---

# Create AGENTS.md

Use this skill to create high-signal `AGENTS.md` files: compact, repo-specific instructions that tell coding agents what they cannot safely infer from the codebase.

For the source-backed checklist behind these instructions, read `references/agents-md-guidance.md` when creating a new file, auditing stale instructions, or handling a monorepo.

## Workflow

1. Inspect before writing.
   Read existing `AGENTS.md` files, README, package manifests, build files, scripts, CI workflows, docs, contribution guidance, security policy, generated-code markers, and key source directories.
   Prefer observed repo facts over generic agent advice.

2. Decide the file scope.
   Use the repository root for cross-project rules.
   In monorepos or mixed stacks, create or update nested `AGENTS.md` files near the code they govern when local commands or conventions differ.
   Make root files route agents to the right subproject instructions instead of duplicating every detail.

3. Preserve precedence and ownership.
   Keep instructions local to their directory scope unless the file explicitly says otherwise.
   When updating, preserve useful project-specific rules and remove stale, duplicated, or generic content.
   If a rule conflicts with current user instructions, do not encode the conflict as permanent policy.

4. Write only behavior-changing guidance.
   Include instructions that prevent known mistakes, reduce ambiguity, protect data, or save retries.
   Do not restate broad coding principles, language tutorials, or facts agents can read from source files and manifests.

5. Put executable commands early.
   Include exact setup, test, lint, typecheck, build, formatting, dev server, migration, and codegen commands where relevant.
   Prefer stable wrapper commands such as `make test`, `just check`, or `pnpm test` when the repo provides them.
   Add expected context such as working directory, required services, environment files, ports, and whether failures must block completion.

6. Route to deeper context.
   Link to docs, runbooks, architecture notes, codegen instructions, style guides, ADRs, package READMEs, or project skills when they are the source of truth.
   Keep the `AGENTS.md` line short and tell the agent when to read the referenced file.

7. Define boundaries.
   Separate normal expectations from actions that require user approval and actions that are forbidden.
   Call out secrets, generated files, production systems, database migrations, destructive commands, vendored code, licensing, and broad refactors where relevant.

8. Validate the result.
   Check every command against repo files or by running safe commands.
   Check links and paths.
   Make sure the final file is concise, scoped, and free of stale template language.

## Recommended Sections

Use this order as a default, then omit irrelevant sections:

- Project context: One short paragraph naming stack, architecture shape, and important directories.
- Scope: State whether this file applies to the whole repo or a subdirectory.
- Commands: Exact setup, run, test, lint, typecheck, build, codegen, migration, and release commands.
- Validation: What must be run before finishing specific categories of changes.
- Code style: Repo-specific naming, formatting, architecture, ownership, test, and dependency patterns.
- Repository structure: Where new code, tests, fixtures, docs, generated files, and assets belong.
- Context loading: Which docs, READMEs, runbooks, or skills to read for specific tasks.
- Boundaries: What agents may do, must ask before doing, and must never do.
- Security and data: Secrets, credentials, PII, production access, local-only requirements, and reporting paths.
- Git or PR workflow: Branch, commit, review, changelog, and PR title conventions when they matter.
- Maintenance: Who owns the file or when to update it.

## Writing Standards

- Keep it short enough to stay in context and easy to maintain.
- Prefer concrete commands, paths, and examples over abstract preferences.
- Use imperative instructions.
- Use Markdown headings and bullets.
- Use fenced code blocks for command groups.
- Use relative links for repository files.
- Avoid personas, motivational language, generic best practices, and repeated handbook text.
- Avoid time-sensitive notes unless they have an owner or removal condition.
- Avoid tool-specific invocation syntax in shared instructions unless the repository only targets that tool.
- For generated files or fragile areas, name the exact paths and approved update commands.

## Monorepo Pattern

For a monorepo root `AGENTS.md`:

- Keep root instructions as a router and global safety layer.
- List major packages or services and the instruction file each one owns.
- State that agents must read the nearest relevant `AGENTS.md` before editing scoped code.
- Put shared commands at the root only if they truly work across the repo.
- Put stack-specific commands and conventions in nested files.

Example routing table:

```markdown
## Context Loading

| Working On | Read First |
| --- | --- |
| Web app | `packages/web/AGENTS.md` |
| API service | `services/api/AGENTS.md` |
| Database migrations | `docs/database.md` |
```

## Update Heuristics

When refreshing an existing `AGENTS.md`:

- Compare documented commands to `package.json`, `Makefile`, `justfile`, `pyproject.toml`, `Cargo.toml`, `go.mod`, Docker files, and CI workflows.
- Remove instructions that merely say to be careful, follow best practices, or write clean code unless they encode a specific repo behavior.
- Replace broad negatives with clear alternatives when possible.
- Deduplicate rules already present in a closer nested `AGENTS.md`.
- Preserve user-specific or machine-specific instructions only when the file is intentionally local rather than repo-shared.
- Add a maintenance note only if ownership or review timing is actually useful.

## Output Expectations

When editing `AGENTS.md` for the user:

- Make the file change directly unless the user only asked for advice.
- Summarize which repo facts informed the instructions.
- Report commands and links you verified.
- Mention any instructions that remain inferred or should be confirmed by a maintainer.
