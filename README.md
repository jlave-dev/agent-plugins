# Agent Plugins

A repo-local Codex plugin marketplace for reusable agent workflows. The marketplace currently packages Agent Ops helpers, Agent Dev cleanup workflows, Amazon account workflows, Subtractive UI frontend-review workflows, and Agent SDLC development workflows as installable Codex plugins.

## Install The Marketplace

This repo exposes its Codex marketplace at:

```text
.agents/plugins/marketplace.json
```

From a local checkout, add the marketplace root to Codex:

```bash
codex plugin marketplace add <agent-plugins-checkout>
```

After changes are pushed, Codex can also add it from GitHub:

```bash
codex plugin marketplace add <owner>/agent-plugins
```

## Available Plugins

### Agent Ops

Operational helpers for repo documentation, note and plan capture, prompt drafting, and PDF work.

Included Codex skills:

- `create-agents-md`: create or refresh high-signal `AGENTS.md` files.
- `create-readme`: create or refresh useful project `README.md` files.
- `save-note`: save relevant thread context as local Markdown notes.
- `save-plan`: save durable planning documents as local Markdown files.
- `pdf`: create, read, and visually verify PDF artifacts.
- `write-prompt`: turn rough asks into copy-ready prompts.

### Agent Dev

Developer maintenance workflows for repo cleanup and simplification.

Included Codex skills:

- `yagni`: audit or remove stale, unused, duplicated, speculative, or misleading repo surfaces.

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

### Agent SDLC

Zero-config issue intake, worker dispatch, evidence refresh, review, docs, and merge coordination for mostly agentic software development.

Included Codex skills:

- `sdlc-orchestrate`: inspect issue/PR state and continue to the next SDLC role automatically.
- `sdlc-issue-intake`: turn rough requests into scoped GitHub Issues with saved worker dispatch prompts and declared CI tiers.
- `sdlc-preflight`: verify branch, worktree, base, and active-work overlap before dispatch.
- `sdlc-dispatch-issue`: pick a ready SDLC issue, create its branch/worktree, launch the worker thread, and record the worker state on the issue.
- `sdlc-evidence`: refresh PR evidence, current-head checks, attached proof, and issue Agent State.
- `sdlc-review-loop`: send current changes through an implementer/reviewer loop with CI evidence expectations.
- `sdlc-merge-queue`: merge approved SDLC PRs in dependency order without fixing worker branches inline.
- `sdlc-docs`: update repository docs after implementation changes.
- `sdlc-reviewer`: review a change handoff and return an explicit verdict.

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
python3 <codex-home>/skills/.system/skill-creator/scripts/quick_validate.py plugins/<plugin-name>/skills/<skill-name>
```

Validate a plugin after editing its manifest, marketplace metadata, or skill layout:

```bash
python3 <codex-home>/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/<plugin-name>
```

Refresh a plugin cachebuster version during local plugin development:

```bash
python3 <codex-home>/skills/.system/plugin-creator/scripts/update_plugin_cachebuster.py plugins/<plugin-name>
```

## Project Structure

```text
agent-plugins/
├── .agents/
│   └── plugins/
│       └── marketplace.json     # Codex plugin marketplace
├── plugins/
│   ├── amazon/
│   │   ├── .codex-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   ├── agent-dev/
│   │   ├── .codex-plugin/
│   │   │   └── plugin.json
│   │   ├── assets/
│   │   └── skills/
│   ├── agent-ops/
│   │   ├── .codex-plugin/
│   │   │   └── plugin.json
│   │   ├── assets/
│   │   └── skills/
│   ├── agent-sdlc/
│   │   ├── .codex-plugin/
│   │   │   └── plugin.json
│   │   ├── assets/
│   │   ├── scripts/
│   │   └── skills/
│   └── subtractive-ui/
│       ├── .codex-plugin/
│       │   └── plugin.json
│       ├── references/
│       └── skills/
├── scripts/                     # Release helper scripts and tests
├── .github/workflows/           # Release automation
├── .releaserc.json              # semantic-release configuration
├── dist/                        # Ignored release artifacts
└── package.json                 # Development package metadata
```

## Releases

This project uses automated semantic versioning powered by [semantic-release](https://github.com/semantic-release/semantic-release). Every merge to `main` is evaluated automatically and, when commits require it, semantic-release creates:

- a Git tag (`vX.Y.Z`)
- a GitHub Release with generated notes
- a downloadable archive named `agent-plugins-vX.Y.Z.tar.gz`

Release notes live in the repository's GitHub Releases page; there is no committed `CHANGELOG.md`. During release preparation, semantic-release rewrites `package.json` and plugin manifests to the computed release version, packages the archive, and commits those version bumps back to `main` with `[skip ci]`.

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
