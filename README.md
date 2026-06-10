# Agent Skills

[![Release](https://github.com/jlave-dev/agent-skills/actions/workflows/release.yml/badge.svg)](https://github.com/jlave-dev/agent-skills/releases)

A repo-local Codex plugin marketplace for reusable agent workflows. The marketplace currently packages Amazon account workflows and Subtractive UI frontend-review workflows as installable Codex plugins.

## Install The Marketplace

This repo exposes its Codex marketplace at:

```text
.agents/plugins/marketplace.json
```

From a local checkout, add the marketplace root to Codex:

```bash
codex plugin marketplace add /path/to/agent-skills
```

After changes are pushed, Codex can also add it from GitHub:

```bash
codex plugin marketplace add jlave-dev/agent-skills
```

## Available Plugins

### Amazon

Amazon workflows for product research, order inspection, and review drafting.

Included Codex skills:

- `shop-amazon`: verify Amazon product-page facts and return ranked product recommendations.
- `find-orders`: inspect Amazon orders, invoices, return windows, warranty clues, and reorder availability.
- `write-reviews`: draft Amazon product reviews and submit only after explicit approval.

### Subtractive UI

Minimal, reference-led frontend critique for designing, auditing, and refactoring product UI.

Included Codex skills:

- `design-frontend`: design frontend screens from specs, screenshots, and visual references.
- `audit-rendered-ui`: review real rendered UI for leaky copy, redundancy, layout issues, and handoff polish.
- `refactor-ui`: remove UI clutter and implementation-detail copy while preserving behavior.

## Development

Install dependencies before running repository scripts:

```bash
npm install
```

Run the repo test suite:

```bash
npm test
```

Validate a skill after editing its `SKILL.md`, references, or `agents/openai.yaml`:

```bash
python3 /Users/james/.codex/skills/.system/skill-creator/scripts/quick_validate.py plugins/<plugin-name>/skills/<skill-name>
```

Validate a plugin after editing its manifest, marketplace metadata, or skill layout:

```bash
python3 /Users/james/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/<plugin-name>
```

Refresh a plugin cachebuster version during local plugin development:

```bash
python3 /Users/james/.codex/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py plugins/<plugin-name>
```

## Project Structure

```text
agent-skills/
├── .agents/
│   └── plugins/
│       └── marketplace.json     # Codex plugin marketplace
├── plugins/
│   ├── amazon/
│   │   ├── .codex-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   └── subtractive-ui/
│       ├── .codex-plugin/
│       │   └── plugin.json
│       ├── references/
│       └── skills/
├── scripts/                     # Release helper scripts and tests
├── .github/workflows/           # Release automation
├── .releaserc.json              # semantic-release configuration
├── CHANGELOG.md                 # Auto-generated changelog
└── package.json                 # Repository version tracking
```

## Releases

This project uses automated semantic versioning powered by [semantic-release](https://github.com/semantic-release/semantic-release). Every merge to `main` is evaluated automatically and, when commits require it, semantic-release creates:

- a version bump in `package.json`
- an updated `CHANGELOG.md`
- a Git tag (`vX.Y.Z`)
- a GitHub Release with generated notes

See [Releases](https://github.com/jlave-dev/agent-skills/releases) for the full changelog.

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) to drive automated releases:

```text
<type>[optional scope]: <description>
```

Common types:

- `feat`: new skill, plugin, or feature
- `fix`: bug fix
- `docs`: documentation changes
- `chore`: maintenance tasks
- `test`: test additions or changes

Use the plugin name for plugin-wide changes and the skill name for skill-specific changes:

```bash
feat(amazon): add order workflow plugin
fix(shop-amazon): handle empty search results
docs(write-reviews): clarify submit approval
```

Do not include `codex` in branch names or commit messages.

## License

MIT. See [TERMS.md](TERMS.md) and [PRIVACY.md](PRIVACY.md) for repository-level usage and privacy notes.
