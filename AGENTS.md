# Agent Skills - Development Guidelines

## Commit Conventions

This project uses **Conventional Commits** to drive automated semantic versioning.

### Format

```
<type>[optional scope]: <description>
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New skill or feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation changes only | PATCH |
| `chore` | Maintenance tasks | PATCH |
| `perf` | Performance improvements | PATCH |
| `refactor` | Code refactoring | PATCH |
| `test` | Test additions/changes | PATCH |

### Scopes

Use skill name as scope for skill-specific changes:
- `amazon-shopping` - Amazon Shopping skill
- (Add more as new skills are created)

### Examples

```bash
# Repository-level changes
feat: add github-actions skill
docs: update README with installation guide
chore: upgrade dependencies

# Skill-specific changes
feat(amazon-shopping): add wishlist integration
fix(amazon-shopping): handle empty search results correctly
docs(amazon-shopping): clarify verification steps

# Breaking changes
feat(amazon-shopping)!: change product data structure
BREAKING CHANGE: Product API now requires new format
```

## Release Process

1. Push commits to main (following conventional commits)
2. GitHub Actions runs semantic-release and, when a release is due, creates a single release commit with:
   - Updated `package.json` version
   - Auto-generated CHANGELOG
   - Synced skill versions in `SKILL.md` files
   - Git tag and GitHub release

## Project Structure

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
├── package.json      # Version tracking (not published to npm)
└── .commitlintrc.json # Commit linting rules (update scopes when adding skills)
```

**Note**: When adding new skills, update the `scope-enum` in `.commitlintrc.json` to include the new skill name.
