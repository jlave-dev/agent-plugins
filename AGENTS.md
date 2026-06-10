# Agent Skills - Development Guidelines

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
agent-skills/
├── .agents/plugins/marketplace.json
├── plugins/
│   ├── amazon/
│   │   ├── .codex-plugin/plugin.json
│   │   └── skills/
│   │       ├── find-orders/
│   │       ├── shop-amazon/
│   │       └── write-reviews/
│   └── subtractive-ui/
│       ├── .codex-plugin/plugin.json
│       ├── references/
│       └── skills/
├── scripts/
├── .github/workflows/
├── .releaserc.json
├── CHANGELOG.md
└── package.json
```

## Skill And Plugin Conventions

- Use `<action>-<noun>` skill names.
- Keep each `SKILL.md` compact and move detailed, situational guidance into `references/`.
- Include `agents/openai.yaml` for plugin skills, with concise user-facing metadata and a default prompt mentioning `$skill-name`.
- Keep browser/tool instructions user-facing unless implementation detail is necessary for reliability.
- Add or update `.commitlintrc.json` scopes when adding, renaming, or removing plugins or skills.
- Use `plugins/<plugin-name>/references/` for plugin-wide reference material and `plugins/<plugin-name>/skills/<skill-name>/references/` for skill-specific material.

## Commit Conventions

This project uses Conventional Commits to drive semantic-release.

```text
<type>[optional scope]: <description>
```

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
- `shop-amazon`
- `find-orders`
- `write-reviews`
- `subtractive-ui`
- `design-frontend`
- `audit-rendered-ui`
- `refactor-ui`
- `release`
- `deps`

Examples:

```bash
feat(amazon): add order workflow plugin
fix(shop-amazon): handle empty search results correctly
docs(write-reviews): clarify review submission approval
chore(release): 1.2.1 [skip ci]
```

Never include `codex` in branch names or commit messages.

## Release Process

Push conventional commits to `main`. GitHub Actions runs semantic-release and, when a release is due, creates a release commit with:

- updated `package.json` version
- auto-generated `CHANGELOG.md`
- Git tag and GitHub release

Do not manually edit release versions in skill frontmatter. Plugin manifests may use helper-generated cachebuster versions during plugin development; repo package versioning remains controlled by semantic-release.
