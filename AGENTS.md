# Agent Plugins - Development Guidelines

## Project Context

This repository publishes a Codex plugin marketplace at `.agents/plugins/marketplace.json`. Plugin implementations live under `plugins/<plugin-name>/`, with each plugin carrying its own `.codex-plugin/plugin.json` manifest and `skills/<skill-name>/` directories.

## Commands

Install dependencies before running repository scripts:

```bash
npm install
```

Run the repo test suite:

```bash
npm test
```

Validate an edited skill:

```bash
python3 /Users/james/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/<plugin-name>/skills/<skill-name>
```

Validate an edited plugin:

```bash
python3 /Users/james/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/<plugin-name>
```

Refresh a plugin cachebuster version while preparing local plugin changes:

```bash
python3 /Users/james/.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py plugins/<plugin-name>
```

When available, run Plugin Eval from the cached script for skill-quality checks:

```bash
node /Users/james/.codex/plugins/cache/openai-curated/plugin-eval/c6ea566d/scripts/plugin-eval.js analyze plugins/<plugin-name>/skills/<skill-name> --format markdown
```

## Validation

- For skill changes, run `quick_validate.py` on each edited skill.
- For plugin manifest, marketplace, or plugin layout changes, run `validate_plugin.py` on the edited plugin.
- For release helper or package-script changes, run `npm test`.
- For README or AGENTS updates, verify documented commands against `package.json`, `.releaserc.json`, `.github/workflows/`, and the current plugin layout.

## Repository Structure

```text
agent-plugins/
├── .agents/plugins/marketplace.json
├── plugins/
│   ├── amazon/
│   │   ├── .codex-plugin/plugin.json
│   │   ├── assets/
│   │   └── skills/
│   │       ├── find-orders/
│   │       ├── shop-amazon/
│   │       └── write-reviews/
│   └── subtractive-ui/
│       ├── .codex-plugin/plugin.json
│       ├── assets/
│       ├── references/
│       └── skills/
├── scripts/
├── .github/workflows/
├── .releaserc.json
└── package.json
```

## Skill And Plugin Conventions

- Use `<action>-<noun>` skill names.
- Keep each `SKILL.md` compact and move detailed, situational guidance into `references/`.
- Include `agents/openai.yaml` for plugin skills, with concise user-facing metadata and a default prompt mentioning `$skill-name`.
- Keep browser/tool instructions user-facing unless implementation detail is necessary for reliability.
- Add or update `.commitlintrc.json` scopes when adding, renaming, or removing plugins or skills.
- Use `plugins/<plugin-name>/references/` for plugin-wide reference material and `plugins/<plugin-name>/skills/<skill-name>/references/` for skill-specific material.

## Plugin Icons

- Put plugin presentation icons in `plugins/<plugin-name>/assets/` and reference them from `.codex-plugin/plugin.json` under `interface.composerIcon` and `interface.logo`.
- Prefer a single scalable SVG such as `./assets/icon.svg` unless the icon requires a raster source; keep paths relative to the plugin root and starting with `./`.
- Before drawing, decide what the icon should communicate for the plugin, then inspect current plugin/app icon examples for style calibration. Do not jump straight to the first obvious metaphor.
- Keep icons minimal and legible at small sizes: one centered symbol, strong silhouette, limited palette, no text, no screenshots-in-miniature, and no decorative badges unless the badge is the core metaphor.
- Avoid copying protected brand marks, logos, or trade dress unless the plugin is first-party for that brand or the user explicitly supplies and approves the asset.
- After icon changes, render-check the SVG at both large and small sizes, refresh the plugin cachebuster with `update_plugin_cachebuster.py`, and run `validate_plugin.py` for each edited plugin.

## Commit Conventions

This project uses Conventional Commits to drive semantic-release.

When asked to open, merge, or publish a PR in this repository, finish the full
workflow before stopping: validate, commit, push, open the PR if needed, check
CI, merge when safe, or report the concrete blocker.

```text
<type>[optional scope]: <description>
```

Use Conventional Commit-style prefixes for branch names too:

```text
<type>/<scope-or-short-description>
```

Prefer a configured scope when the branch is for one plugin or skill. Use short, lowercase, hyphen-separated branch names.

Use these types:

- `feat`: new skill, plugin, or feature
- `fix`: bug fix
- `docs`: documentation changes only
- `chore`: maintenance tasks
- `perf`: performance improvements
- `refactor`: code refactoring
- `test`: test additions or changes
- `style`: formatting-only changes
- `build`: build system changes
- `ci`: CI workflow changes

Current scopes include:

- `amazon`
- `agent-sdlc`
- `shop-amazon`
- `find-orders`
- `write-reviews`
- `subtractive-ui`
- `design-frontend`
- `audit-rendered-ui`
- `refactor-ui`
- `sdlc-docs`
- `sdlc-dispatch-issue`
- `sdlc-issue-intake`
- `sdlc-project-init`
- `sdlc-review-loop`
- `sdlc-reviewer`
- `release`
- `deps`

Examples:

```bash
feat/agent-sdlc-plugin
fix/shop-amazon-empty-results
feat(amazon): add order workflow plugin
fix(shop-amazon): handle empty search results correctly
docs(write-reviews): clarify review submission approval
chore(release): update automation docs
```

Never include `codex` in branch names or commit messages.

## Release Process

Push conventional commits to `main`. GitHub Actions runs semantic-release and, when a release is due, creates:

- Git tag and GitHub release
- generated release notes in the GitHub Release
- downloadable `agent-plugins-vX.Y.Z.tar.gz` archive

Do not configure semantic-release to commit release assets back to `main`. The committed `package.json` version is the development placeholder `0.0.0-development`; semantic-release temporarily rewrites it only inside the CI workspace before creating the release archive. GitHub Releases are the changelog source of truth. Do not manually edit release versions in skill frontmatter. Plugin manifests may use helper-generated cachebuster versions during plugin development.
