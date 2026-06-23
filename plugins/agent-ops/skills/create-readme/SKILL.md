---
name: create-readme
description: Create or update README.md files for repositories, packages, apps, libraries, CLI tools, services, datasets, and docs folders. Use when Codex needs to draft, rewrite, audit, or refresh a README; add installation, configuration, usage, contribution, support, license, status, screenshots, badges, troubleshooting, or maintainer sections; or make an existing README accurate, scannable, and project-specific.
---

# Create README

Use this skill to make a README function as the project's front door: quickly explain what the project is, who it helps, how to start, where to go next, and what is current.

For the source-backed checklist behind these instructions, read `references/readme-guidance.md` when the README is complex, public-facing, package-published, or being audited.

## Workflow

1. Inspect the project before writing.
   Read the existing `README.md`, manifests, package metadata, build files, scripts, docs, license, contribution docs, examples, Docker files, CI config, and app entry points as relevant.
   Prefer repo facts over generic boilerplate.

2. Identify the README job.
   Decide whether the primary reader is a user, library consumer, CLI user, contributor, operator, maintainer, package registry visitor, dataset consumer, or internal teammate.
   Let that reader decide the section order and level of detail.

3. Preserve useful existing structure.
   When updating, keep working badges, anchors, links, terminology, and project voice.
   Remove stale claims, broken commands, outdated screenshots, dead links, and sections that no longer match the repo.

4. Make the first screen answer the basics.
   Put the project name, plain-language purpose, target audience, core value, and one useful next step near the top.
   A reader should not need to inspect the repository tree to know what the project is.

5. Include only relevant sections.
   Start from the section guide below, then omit anything that would be filler.
   Link to deeper docs instead of stuffing the README with exhaustive reference material.

6. Verify commands and claims when feasible.
   Run or inspect setup, test, build, usage, and package commands before presenting them as copyable truth.
   If live verification is unsafe or too expensive, say what was inferred and from where.

7. Finish with a maintenance pass.
   Check heading hierarchy, code fences, relative links, image alt text, markdown rendering risks, and whether the README still matches the codebase.

## Section Guide

Use this order as a default, not a template to fill blindly:

- Title: Use the project or package name.
- Summary: State what it does, who it is for, and why it exists in 1-3 short paragraphs.
- Status: Mention deprecation, experimental status, production readiness, compatibility, or maintenance mode when relevant.
- Visuals: Add screenshots, GIFs, terminal output, architecture diagrams, or demo links when they help readers understand the result quickly.
- Features: List only the most important capabilities or differentiators.
- Requirements: Name runtimes, OS constraints, accounts, services, keys, hardware, or version constraints.
- Installation: Provide minimal copyable steps from clean checkout or package install.
- Configuration: Document required environment variables, config files, secrets, ports, permissions, and defaults.
- Quick start: Show the shortest successful path to first value.
- Usage: Include realistic commands, code snippets, API calls, UI steps, expected output, and common options.
- Development: Explain local setup, scripts, tests, linting, fixtures, migrations, generated files, and release steps when useful.
- Troubleshooting: Capture common failure modes and known-good checks.
- Documentation: Link to deeper docs, examples, API references, architecture notes, runbooks, or wiki pages.
- Support: Tell readers where to ask questions or report bugs.
- Contributing: Link to `CONTRIBUTING.md` or summarize the issue, branch, test, and pull request path.
- Security: Link to `SECURITY.md` or explain private reporting for vulnerabilities when applicable.
- License: Name the license and link to `LICENSE` when present.
- Maintainers or contact: Include owners, points of contact, or team names for internal/package-level projects.

## Writing Standards

- Prefer plain, active language over marketing copy or implementation trivia.
- Use descriptive headings that match what a reader is trying to do.
- Keep commands copyable and specific to this repository.
- Use fenced code blocks with language identifiers for commands, code, JSON, YAML, logs, and output.
- Use relative links for files inside the repository.
- Keep link text on one line when targeting GitHub rendering.
- Add alt text for images and avoid image-only explanations.
- Avoid badges unless they communicate maintained, accurate status.
- Avoid tables for dense prose; use them for structured comparisons, variables, options, or compatibility matrices.
- Keep package registry READMEs self-contained enough to make sense outside GitHub.
- For monorepos, write the root README as navigation and put focused READMEs in package or service directories when needed.

## Update Heuristics

When refreshing an existing README:

- Compare documented commands to `package.json`, `Makefile`, `pyproject.toml`, `Cargo.toml`, `go.mod`, Docker files, CI config, or equivalent project sources.
- Compare documented features to source code, routes, tests, examples, screenshots, and release notes.
- Prefer deleting stale content over hiding it in comments.
- Move long API references, design docs, and operational runbooks to linked docs when they distract from first-use success.
- Keep contributor-only detail out of user-facing quick starts unless the project is mainly for contributors.
- Mention assumptions in the final response when you could not verify a setup path.

## Output Expectations

When editing a README for the user:

- Make the file change directly unless the user only asked for advice.
- Summarize what changed and what evidence informed the README.
- Report commands, links, or examples you verified.
- Report anything that remains inferred, stale-looking, or worth checking manually.
