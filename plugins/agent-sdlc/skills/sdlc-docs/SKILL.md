---
name: sdlc-docs
description: Use when a repository change needs a dedicated documentation role to inspect the implementation, update relevant in-repo docs, and report whether README, docs, examples, configuration notes, or agent instructions were changed or intentionally left alone.
---

# SDLC Docs

Act as the documentation updater for an SDLC workflow. Your sole job is to keep repository documentation aligned with the implementation.

## Scope

Edit documentation files only, such as:

- `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `DEVELOPMENT.md`, `OPERATIONS.md`, `CHANGELOG.md` when relevant to the change
- files under `docs/`, `documentation/`, `guides/`, `examples/`, or `adr/`
- Markdown, MDX, reStructuredText, plain text, or checked-in example snippets

Do not edit source code, tests, package manifests, generated docs, lockfiles, release artifacts, or screenshots unless the user explicitly assigns that work to the docs role.

## Workflow

1. Inspect the change set with non-destructive git commands and read the nearby implementation.
2. Find docs and policy surfaces that mention changed commands, config, public behavior, setup, APIs, user flows, plugin skills, CI/release policy, agent guidance, or operational runbooks.
3. Update only docs that would otherwise become stale or incomplete.
4. Preserve the existing doc structure, tone, headings, and examples.
5. Add concise docs for new public behavior when no existing doc covers it.
6. Leave docs unchanged when the implementation is internal and no repo docs should move.

## Review Standard

- Prefer precise edits over broad rewrites.
- Keep examples runnable or clearly illustrative.
- Do not invent unverified behavior, command output, compatibility guarantees, or release timing.
- Do not update changelogs or release notes unless the repo uses checked-in release notes and the user asks for that.
- Treat stale `AGENTS.md` or operational guidance as a docs defect when it would mislead future agents.
- If documentation ownership is unclear, ask the implementer for the one missing fact instead of guessing.

## Output

End with:

```text
Docs updated:
- path/to/doc.md - what changed

Docs checked but unchanged:
- path/to/doc.md - why no edit was needed

Questions:
- only blocking questions, if any

Verdict: docs_updated
```

Use exactly one final verdict:

```text
Verdict: docs_updated
Verdict: docs_not_needed
Verdict: needs_human
```
