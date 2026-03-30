---
name: consult-codex
version: "1.0.3"
disable-model-invocation: true
description: Ask Codex CLI for a second opinion on local code changes, debugging findings, architectural tradeoffs, or ship-readiness decisions. Use only when the user explicitly asks for Codex's opinion, a Codex review, or a Codex sanity check. Do not invoke this skill automatically.
---

# Consult Codex

Use this skill to get Codex's take after you already have useful context. Treat Codex as an informed second opinion, not a replacement for your own first-pass analysis.

This skill is manual-only. Do not use it unless the user explicitly asks for Codex input.

## Use This Skill When

- The user explicitly asks for Codex's opinion, review, or sanity check.
- The user explicitly asks you to run `codex`, `codex exec`, or `codex exec review`.
- The user explicitly requests another LLM's perspective and wants that perspective to come from Codex CLI.

## Do Not Use This Skill When

- You think a second opinion might be helpful, but the user did not ask for Codex.
- The user is asking a straightforward knowledge question you can answer directly.
- You have not gathered concrete context yet.
- Your prompt would be vague, like "fix this" or "what do you think?"
- The issue is simple enough that a second opinion would add delay without value.

## Gather Context First

Before invoking Codex, collect the smallest useful bundle of evidence:

- What changed, or what problem you are diagnosing.
- Relevant files, code snippets, or diff context.
- Tests run, observed failures, and exact error text.
- Your current hypothesis and what you are unsure about.
- Specific questions you want Codex to answer.

Good prompts are concrete and scoped. Codex is most useful when you ask it to validate or challenge a specific theory.

## How To Invoke Codex

For code review of current local changes, prefer `codex exec review` from the repository root.

`codex exec review --uncommitted` works without a custom prompt. If you need custom review guidance, use plain `codex exec` instead and include the relevant diff context yourself.

```bash
codex exec review --uncommitted --ephemeral -m gpt-5.4 -c 'model_reasoning_effort="xhigh"'
```

For debugging, architecture, or validation questions, use `codex exec` directly.

```bash
tmp="$(mktemp)"
cat <<'EOF' > "$tmp"
I need a second opinion on this implementation/debugging analysis.

Context:
- what changed or what is failing
- relevant code paths
- tests run and outcomes
- current hypothesis

Questions:
1. Is my root-cause analysis sound?
2. What alternative explanations or edge cases am I missing?
3. What would you check before shipping?
EOF
codex exec -C "$PWD" -m gpt-5.4 -c 'model_reasoning_effort="xhigh"' - < "$tmp"
rm -f "$tmp"
```

## Prompt Writing Rules

- State the exact thing to validate.
- Include the evidence you already gathered.
- Ask targeted questions, not open-ended ones.
- Invite Codex to challenge your assumptions.
- Prefer "check for missing edge cases, regressions, and better alternatives" over "looks good?"

## Good Query Patterns

For completed work:

```text
Review this authentication implementation. Check for JWT handling security, session management risks, and missing tests.
```

For architectural decisions:

```text
Evaluate this caching strategy using Redis. Tradeoffs considered: performance vs complexity and invalidation strategy. What risks or alternatives am I missing?
```

For debugging:

```text
Validate this root-cause analysis for intermittent 500 errors. My hypothesis is a race condition in concurrent request handling. Check for alternative explanations and the fastest confirming diagnostics.
```

## How To Use The Result

Do not dump raw Codex output back to the user. Distill it into:

- Key Findings
- Recommendations
- Concerns or Risks

Call out where Codex agrees with your view, where it challenges you, and what action that changes. If Codex fails or returns low-value output, say so plainly and continue with your own judgment.
