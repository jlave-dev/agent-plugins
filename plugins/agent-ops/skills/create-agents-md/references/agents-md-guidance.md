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

- Optimize for decision value, not a target line count.
  A mature repository may need substantial instructions when it has several build systems, public interfaces, platform constraints, or subsystem-specific workflows.
  Every rule should still change an agent's likely action.

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

## Patterns from OpenAI Codex

OpenAI's Codex repository `AGENTS.md` at commit `5c18cc0` is organized around real engineering decisions rather than a generic template. Generalize these patterns without copying its Rust- or Codex-specific rules:

- Organize around actual work areas.
  Use subsystem, package, interface, or workflow headings when they help an agent find the rules that govern the code being changed.
  A root file does not need a broad project tour if scoped operational sections route work more effectively.

- Document the tempting wrong path and the preferred seam.
  Name exact helpers, modules, types, or commands to reuse, plus APIs, files, or shortcuts to avoid.
  This is more actionable than generic advice such as "follow existing patterns."

- Couple change triggers to required follow-up work.
  Write rules such as "if dependency files change, regenerate the build lockfile" or "if API shapes change, update schemas and docs."
  Name every companion artifact that must land in the same change.

- Distinguish local proof from broader proof.
  State the cheapest relevant check first, when a package or full-suite check is required, what CI covers that local runs do not, and which expensive actions require approval.
  Include the working directory and ordering when either matters.

- Record architecture pressure points and ownership boundaries.
  Identify bloated or high-churn modules, preferred extension points, public/private API boundaries, generated or externally owned docs, and paths that should not absorb more responsibility.
  Include the reason when the locally convenient choice is architecturally wrong.

- Make review guidance concrete.
  List compatibility surfaces to inspect, risk thresholds that change review severity, and practical size limits or staging expectations when the project actually enforces them.

- Specify how tests should be authored, not only how they run.
  Capture the preferred test level, existing harnesses and fixtures, file placement, assertion style, snapshot review flow, and kinds of low-value tests to avoid.

- Explain tool and environment interactions that create false confidence.
  Call out build-system resource declarations, sandbox behavior, cross-platform requirements, remote-component combinations, or other cases where one successful local path is insufficient.

- Use small examples to disambiguate syntax or API shape.
  Include one desired form and important exceptions; avoid catalogs of obvious examples.

- Preserve deliberate non-churn rules.
  State when not to rewrite existing code solely to adopt a new convention, especially when equivalent forms exist or migration would obscure the functional change.

Do not imitate the source file's length, headings, technology choices, internal names, or thresholds. Derive comparable guidance only from verified facts in the target repository.

## Discovery questions

Use these questions while inspecting the repository; include only answers that materially change behavior:

- What locally obvious edit would violate an architectural, ownership, or compatibility boundary?
- Which existing helper, harness, module, or command is the supported extension point?
- Which edits require regenerated files, schemas, snapshots, docs, or lockfiles in the same change?
- Which checks differ by package, build system, operating system, CI, or execution environment?
- Which public interfaces or persisted data require an explicit breaking-change review?
- Which tests provide meaningful proof, and which test patterns create noise or brittle coverage?
- Which commands are slow, destructive, broad, or approval-sensitive?

## Recommended audit checklist

- The file clearly states its scope.
- Commands are exact, current, and include working directory or service prerequisites when needed.
- Commands are ordered from narrow proof to broad proof, with local-versus-CI coverage and approval boundaries stated where relevant.
- Validation expectations are specific to task categories.
- Change triggers name required companion artifacts such as schemas, snapshots, generated code, docs, or lockfiles.
- Code style guidance is repo-specific and not just generic craft advice.
- Preferred helpers, modules, test harnesses, and extension points use exact names and paths.
- Architectural pressure points and compatibility surfaces are named when they affect implementation or review.
- Test guidance covers the appropriate level and authoring pattern, not just the runner command.
- Boundaries name exact paths, systems, data classes, and approval triggers.
- The file routes to deeper docs or nested AGENTS.md files instead of duplicating them.
- Monorepo root instructions avoid stack-specific clutter.
- Nested files do not duplicate root rules unless local emphasis is necessary.
- Time-sensitive notes have an owner, date, or removal condition.
- Tool-specific syntax appears only when intentionally targeting that tool.
- The file contains no stale template text, contradictory rules, or commands absent from the repo.

## Source Links

- OpenAI Codex, pinned `AGENTS.md` studied for the repository-specific patterns above: https://github.com/openai/codex/blob/5c18cc0acc3734f0e78e422a7fd94ea4a2be652e/AGENTS.md
- OpenAI Developers, Custom instructions with AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- AGENTS.md open format: https://agents.md/
- AGENTS.md GitHub repository: https://github.com/agentsmd/agents.md
- DirectiveOps, AGENTS.md Best Practices for Teams: https://www.directiveops.dev/blog/agents-md-best-practices
- AI Context Docs Lifecycle, AGENTS.md Best Practices: https://sergiusavva.github.io/ai-context-docs-lifecycle/guides/agents-md-best-practices/
- arXiv, Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?: https://arxiv.org/abs/2602.11988
