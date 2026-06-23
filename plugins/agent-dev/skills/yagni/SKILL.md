---
name: yagni
description: Plan or perform ruthless YAGNI repo cleanup. Use when asked to identify or remove stale docs, unused code/deps, duplicate scripts/config/deploy paths, dead flags/routes, speculative abstractions/product surfaces, misleading tests, or implementation/docs drift while preserving active decisions and guardrails.
---

# YAGNI Cleanup

## Operating Posture

Be ruthless about assessment and conservative about mutation. Treat sentimental code, ornamental docs, speculative abstractions, stale plans, fake affordances, and sunk-cost surfaces as cleanup candidates. Treat explicit active decisions, user corrections, and recent intentional work as guardrails even when the surface looks wasteful from inspection alone.

Do not judge from filename vibes. Inspect the real repo first, collect evidence, then classify candidates.

## Repo Inspection

Start by mapping the system as it exists:

1. Read repo instructions and intent: `AGENTS.md`, README files, product docs, active plans, ADRs, decision logs, issue references, and recent user-provided corrections.
2. Inspect declared runtime surfaces: package manifests, lockfiles, scripts, route registries, app entrypoints, public exports, CLIs, API schemas, migrations, config, environment examples, deployment files, CI, and release automation.
3. Trace usage before calling something dead: imports, references, tests, generated outputs, documentation links, route reachability, feature flags, build scripts, and runtime config.
4. Compare docs to implementation. Flag docs that promise removed, deferred, unbuilt, or browser-only behavior as product risk, not harmless prose.
5. Separate active decisions from drift. If the user says a surface is active, classify it as `keep` and record the decision instead of arguing from local evidence alone.

## Classify Candidates

Classify every candidate with one of these labels:

- `remove`: delete a high-confidence dead, misleading, duplicate, or unused surface.
- `shrink`: reduce an overbuilt abstraction, workflow, config, or UI to the part that is actually used.
- `merge`: collapse duplicate scripts, docs, configs, deploy paths, helpers, or test utilities into one honest path.
- `document honestly`: update docs, plans, UI copy, or tests to match current product reality when the implementation should stay.
- `keep`: preserve real guardrails, active decisions, currently used behavior, or intentionally deferred work.
- `needs decision`: ask the user when evidence conflicts or deletion would encode a product decision the repo cannot prove.

For each candidate, include the evidence that makes the classification fair: file paths, command output, usage traces, stale references, dependency graph hints, or explicit product statements.

## Cut Preference

Favor high-confidence cuts in this order:

1. User and product clarity: fake affordances, stale active plans, docs overclaiming product state, confusing dead routes, misleading tests, and duplicated user-facing workflows.
2. Operational risk reduction: duplicate deploy paths, dead CI, stale release scripts, unused runtime schemas, unused feature flags, obsolete config, and dependencies that widen attack or maintenance surface.
3. Code volume: orphaned files, one-caller abstractions, duplicate helpers, speculative extension points, unused components, and scaffolding kept only because it exists.

Call out code or docs that are misleading, ornamental, duplicative, speculative, or preserved by sunk cost. Be direct, but do not invent certainty. If the evidence is weak, say so and classify as `needs decision`.

## Guardrails

Keep real guardrails unless the user explicitly asks to revisit them:

- safety checks, validation scripts, smoke tests, and release protections
- privacy boundaries, auth checks, RLS constraints, rate limits, audit logs, and permission gates
- migrations, data backfills, schema compatibility layers, and rollback paths
- recent intentional decisions, active product bets, and user-corrected assumptions
- docs that accurately mark a feature as deferred, experimental, or intentionally preserved

YAGNI cleanup should remove waste, not weaken safety or erase live product intent.

## Output Shape

When planning, lead with the prioritized cleanup plan:

- `Rank`: cleanup order
- `Classification`: `remove`, `shrink`, `merge`, `document honestly`, `keep`, or `needs decision`
- `Surface`: paths or repo area
- `Evidence`: concise proof from inspection
- `Action`: exact recommended patch or decision
- `Risk/verification`: what could break and how to check it

After the plan, list preserved surfaces that looked suspicious but should stay, and list any `needs decision` questions. Keep the summary blunt and practical.

## Implementation Mode

When asked to implement cleanup:

1. Patch the smallest coherent slice first.
2. Avoid opportunistic rewrites, formatting churn, renames, and broad architectural cleanup.
3. Keep behavior changes aligned with the selected classification.
4. Update docs and tests when they are the stale surface.
5. Run the repo's relevant checks, or explain exactly why they could not be run.

Prefer deleting one proven-dead path cleanly over touching many adjacent files with weaker evidence.

## Calibration Cases

Use these as sanity checks for judgment:

- If photos look unused but the user says they are active, classify photos as `keep` and record the active decision.
- If map view is deferred, prefer `document honestly` over building or deleting unrelated map scaffolding unless there is stronger evidence.
- Flag orphaned confirmation UI, stale active plans, duplicate deploy paths, unused browser-only API schemas, and docs that overclaim product state.
- Flag an abstraction with one caller as `shrink` unless it is a real boundary for safety, compatibility, or an explicit near-term decision.
