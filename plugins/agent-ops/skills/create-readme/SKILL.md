---
name: create-readme
description: Create or update README.md files for repositories, packages, apps, libraries, CLI tools, services, datasets, and docs folders. Use when Codex needs to draft, rewrite, audit, or refresh a README; add installation, configuration, usage, contribution, support, license, status, screenshots, badges, troubleshooting, or maintainer sections; or make an existing README accurate, scannable, and project-specific.
---

# Create README

Make the README a useful front door: explain what the project does, who it serves, how to start, and where to go next.

Read `references/readme-guidance.md` when the README is complex, public-facing, package-published, or being audited.

## Workflow

1. Inspect the existing README, manifests, package metadata, build files, scripts, docs, license, examples, CI, and relevant entry points.
2. Identify the primary reader and first-use path. Put purpose, audience, value, requirements, installation, and the shortest working example before deep detail.
3. Preserve useful structure, links, terminology, and voice. Remove stale claims, broken links, obsolete setup, and filler.
4. Include only relevant sections: status, requirements, installation, configuration, quick start, usage, development, troubleshooting, docs, support, contributing, security, license, or maintainers.
5. Verify commands and claims against the repository. Use relative links for repo files, fenced copyable commands, and alt text for images.
6. Finish with a heading, Markdown, link, and accuracy pass.

## Quality Rules

- Prefer plain active language and short paragraphs.
- Keep package-facing instructions self-contained; link long references elsewhere.
- Keep contributor detail out of user quick starts unless contributors are the main audience.
- Do not add decorative badges or screenshots that do not help a reader succeed.

## Output

Edit the README directly when asked. Report the commands, links, and claims checked, plus anything that remains inferred or worth maintainer review.
