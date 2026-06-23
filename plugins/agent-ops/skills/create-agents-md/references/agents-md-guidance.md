# AGENTS.md Guidance

Use this reference when deciding what an `AGENTS.md` should include or when auditing one for usefulness.

## Source-backed principles

- Treat `AGENTS.md` as a README for coding agents.
  The open AGENTS.md project describes it as a predictable place for context and instructions that help agents work on a project.
  It complements human-facing README content by holding build steps, tests, conventions, and other agent-focused details.

- Use standard Markdown and no required schema.
  The format is intentionally simple.
  Headings and sections can match the project, as long as the instructions are clear.

- Put the file where agents and humans expect it.
  Add a root `AGENTS.md` for repository-wide guidance.
  Use nested `AGENTS.md` files for packages or subprojects with different stacks, commands, or boundaries.
  The closest applicable file takes precedence in common agent workflows, while explicit user chat instructions override file guidance.

- Keep the file compact and specific.
  High-signal guidance names repo-specific facts an agent cannot safely infer, such as exact commands, testing expectations, migration rules, generated-code paths, security constraints, workflow details, and review expectations.
  Avoid bloated, duplicated, generic, or quietly stale instruction blocks.

- Put commands where agents can execute them.
  AGENTS.md examples and best-practice guides emphasize setup, build, test, lint, and validation commands with exact syntax.
  Missing commands force agents to guess.

- Route to deeper docs instead of embedding everything.
  Use `AGENTS.md` as a compact router to docs, configs, runbooks, package READMEs, and task-specific skills.
  Keep source-of-truth details in the owning file when possible.

- State boundaries explicitly.
  Useful boundaries describe what agents should always do, what requires approval, and what must not be touched.
  This is especially important for secrets, destructive commands, production systems, generated files, schema changes, vendored code, and broad refactors.

- Maintain it as living documentation.
  Review it when build, test, release, security, or data-handling workflows change.
  Remove instructions that no longer affect behavior.

- Prefer minimal requirements.
  Research on repository-level context files found that unnecessary requirements can make tasks harder and increase cost, even when agents respect the instructions.
  Keep only requirements that materially improve correctness or safety.

## Recommended audit checklist

- The file clearly states its scope.
- Commands are exact, current, and include working directory or service prerequisites when needed.
- Validation expectations are specific to task categories.
- Code style guidance is repo-specific and not just generic craft advice.
- Boundaries name exact paths, systems, data classes, and approval triggers.
- The file routes to deeper docs or nested AGENTS.md files instead of duplicating them.
- Monorepo root instructions avoid stack-specific clutter.
- Nested files do not duplicate root rules unless local emphasis is necessary.
- Time-sensitive notes have an owner, date, or removal condition.
- Tool-specific syntax appears only when intentionally targeting that tool.
- The file contains no stale template text, contradictory rules, or commands absent from the repo.

## Source Links

- OpenAI Developers, Custom instructions with AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- AGENTS.md open format: https://agents.md/
- AGENTS.md GitHub repository: https://github.com/agentsmd/agents.md
- DirectiveOps, AGENTS.md Best Practices for Teams: https://www.directiveops.dev/blog/agents-md-best-practices
- AI Context Docs Lifecycle, AGENTS.md Best Practices: https://sergiusavva.github.io/ai-context-docs-lifecycle/guides/agents-md-best-practices/
- arXiv, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?: https://arxiv.org/abs/2602.11988
