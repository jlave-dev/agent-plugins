# Agent Skills

[![Release](https://github.com/jlave-dev/agent-skills/actions/workflows/release.yml/badge.svg)](https://github.com/jlave-dev/agent-skills/releases)

A collection of installable agent skills compatible with the Vercel Skills CLI.

## Installation

Install skills using the Vercel Skills CLI:

```bash
# Install all skills
npx skills add jlave-dev/agent-skills

# List available skills first
npx skills add jlave-dev/agent-skills --list

# Install specific skill
npx skills add jlave-dev/agent-skills --skill amazon-shopping

# Install globally
npx skills add jlave-dev/agent-skills -g
```

## Available Skills

### Amazon Shopping
Search Amazon.com, extract product data, and present ranked recommendations.

## Releases

This project uses automated semantic versioning powered by [semantic-release](https://github.com/semantic-release/semantic-release). Every merge to `main` is evaluated automatically and, when commits require it, semantic-release creates:
- a version bump in `package.json`
- synced `version` fields in all `skills/**/SKILL.md`
- a Git tag (`vX.Y.Z`)
- a GitHub Release with generated notes

See [Releases](https://github.com/jlave-dev/agent-skills/releases) for the full changelog.

## Development

### Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/) to drive automated releases:

```
<type>[optional scope]: <description>
```

| Type | Bump | Description |
|------|------|-------------|
| `feat` | MINOR | New skill or feature |
| `fix` | PATCH | Bug fix |
| `docs` | PATCH | Documentation changes |
| `chore` | PATCH | Maintenance tasks |

**Examples:**
```bash
feat: add github-actions skill
feat(amazon-shopping): add wishlist integration
fix(amazon-shopping): handle empty search results
docs: update README with installation guide
```

### Project Structure

Skills are organized in the `skills/` directory following the [Agent Skills Specification](https://agentskills.io).

```
agent-skills/
├── skills/           # Individual skill implementations
│   └── <skill-name>/
│       ├── SKILL.md          # Skill definition (with version)
│       ├── evaluations.json  # Test definitions
│       ├── reference/        # Reference docs
│       └── scripts/          # Implementation scripts
├── .github/          # GitHub configuration
│   └── workflows/            # CI/CD
├── .releaserc.json   # semantic-release configuration
├── CHANGELOG.md      # Auto-generated changelog
└── package.json      # Version tracking
```

## License

MIT
