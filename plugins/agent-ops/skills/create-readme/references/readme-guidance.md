# README Guidance

Use this reference when deciding what a README should include or when auditing a README for usefulness.

## Source-backed principles

- Treat the README as the repository or package landing page.
  GitHub frames it as the place to explain why a project is useful, what readers can do with it, and how to use it.
  npm similarly recommends a root-level `README.md` so package consumers can install, configure, and use the package from the registry page.

- Cover the first-use path before long-form detail.
  The common core is: what the project does, why it matters, how to get started, how to use it, where to get help, and who maintains it.
  Installation, usage, and license are common themes in package README research and package registry guidance.

- Keep README scope tight.
  GitHub recommends putting only the information needed to start using and contributing in the README, with longer documentation in wikis or linked docs.
  Google recommends package-level READMEs include or point to usage, contacts, status, and relevant documentation.

- Put READMEs where hosting and package tools surface them.
  Use `README.md` with the exact casing.
  Put the root README at the repository or package root.
  For monorepos or major package directories, add focused READMEs where a browser will render them for that directory.

- Make public package READMEs self-contained.
  Package registries may render README content away from the full repository context.
  Include install, configuration, usage, and links that still make sense from the package page.

- Prefer skim-friendly technical writing.
  Use active voice, clear headings, short paragraphs, consistent Markdown spacing, copyable code blocks, and plain link text.
  Keep notes, badges, tables, screenshots, and warnings useful rather than decorative.

- Preserve accuracy over completeness.
  README content is harmful when it advertises deprecated APIs, obsolete setup paths, or features that no longer exist.
  Verify commands and claims against the current codebase when feasible.

## Recommended audit checklist

- The first 10 lines make the project identity, purpose, audience, and primary value clear.
- The README shows the shortest path to install or run the project.
- Usage examples are realistic and copyable.
- Requirements and configuration are explicit.
- Links are relative where they point inside the repository.
- Images have alt text and are current.
- Badges are accurate and useful.
- Contribution, support, security, and license guidance exists or is linked when relevant.
- Maintenance status, deprecation, compatibility, or production readiness is clear when relevant.
- Long reference material is linked rather than embedded.
- Commands, package names, ports, env vars, screenshots, and feature lists match the repository.

## Source Links

- GitHub Docs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
- npm Docs: https://docs.npmjs.com/about-package-readme-files/
- Google Style Guide: https://google.github.io/styleguide/docguide/READMEs.html
- GitLab Documentation Style Guide: https://docs.gitlab.com/development/documentation/styleguide/
- Make a README: https://www.makeareadme.com/
