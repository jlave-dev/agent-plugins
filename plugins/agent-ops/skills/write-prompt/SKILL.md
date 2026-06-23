---
name: write-prompt
description: Turn a rough gist, shorthand ask, notes, or half-formed request into a clear copy-ready prompt. Use when the user invokes $write-prompt, says prompt:, gist:, make this a prompt, promptify, or otherwise indicates they want a prompt artifact instead of the underlying task performed.
---

# Write Prompt

## Purpose

Convert the user's rough intent into a strong Markdown prompt they can send to Codex, another agent, or a side conversation. Do not perform the underlying task. Produce the prompt that should be sent.

## Trigger Discipline

Use this skill when the user explicitly invokes `$write-prompt`, writes a prompt-making cue such as `prompt:`, `gist:`, `ask:`, `make this a prompt`, or `promptify`, or clearly asks for prompt expansion.

Do not use this skill merely because the user's request is short. If they ask you to implement, research, review, explain, or decide something directly, do that task instead.

## Workflow

1. Identify the intended recipient: Codex coding agent, planning/research agent, side-chat helper, browser/operator agent, reviewer, or generic assistant.
2. Preserve the user's actual goal, constraints, voice, and urgency. Add structure and missing operational detail, but do not invent facts, credentials, file paths, decisions, or external state.
3. Ask at most one clarifying question only when the missing answer would materially change the prompt. Otherwise make reasonable assumptions inside the prompt.
4. Write one recommended prompt by default. Provide variants only when the user asks or when the gist clearly has two viable intents.
5. Output the finished prompt as a single fenced `markdown` code block by default. Put any necessary assumption outside the block only when it materially affects how the prompt should be used. Omit the fence only if the user explicitly asks for rendered Markdown instead of a copy block.

## Prompt Contents

Include the pieces that make the prompt easier for an agent to execute:

- Objective: the concrete outcome the user wants.
- Context: relevant background, artifacts, repo paths, prior decisions, users, constraints, or product details supplied by the user.
- Scope: what to change or inspect, and what to leave alone.
- Execution mode: whether to implement, plan only, review, research, compare options, or ask before mutating.
- Verification: commands, checks, screenshots, device tests, CI, browser validation, or proof level expected.
- Deliverables: final answer shape, saved file, PR, branch, matrix, plan, patch, or other artifact.
- Tone and format: concise, blunt, exhaustive, decision-quality, copy-ready, no fluff, or any user-specified voice.
- Markdown structure: short headings, bullets, numbered steps, checklists, or tables when they make the prompt easier to scan and execute.

## Codex-Specific Prompts

When the target is Codex, make the prompt operational:

- Name the workspace, repo, branch, files, docs, or plans to inspect when provided.
- State mutation boundaries clearly: implement now, plan only, do not edit files, do not touch git, commit and push, open PR, or preserve current behavior.
- Include safety rules for live services, secrets, deployments, external accounts, and irreversible changes.
- Specify how to handle blockers: inspect first, use existing docs, make reasonable assumptions, ask only if truly blocked, or stop at a decision point.
- Require evidence appropriate to the task: local tests, simulator/device checks, browser verification, logs, CI readback, App Store/TestFlight/Firebase validation, or manual smoke steps.
- Tell the agent to report what changed, what was verified, and what remains uncertain.

## Style

Make prompts direct and usable. Remove apologetic setup, generic AI instructions, corporate filler, and vague excellence language. Prefer specific verbs, concrete files, clear constraints, and explicit acceptance criteria.

Use placeholders only when unavoidable, and make them obvious, such as `[repo path]` or `[date]`. If the user gave enough context, fill it in.

The prompt artifact itself should be valid Markdown. Use clear section headings when the prompt has multiple parts, and use bullets or checklists for scope, constraints, verification, and deliverables. Always wrap the finished prompt in a fenced `markdown` code block so it is copy-ready. Only omit the fence if the user explicitly asks for rendered Markdown instead of a copy block. Avoid long preambles; the user came for the prompt, not an essay about the prompt.

## Output Patterns

For most requests, output a fenced Markdown copy block:

```markdown
**Objective**
[Finished prompt text]
```

If one assumption matters, output:

```markdown
Assumption: [short assumption]

**Objective**
[Finished prompt text]
```

If variants are requested, output:

```markdown
**Option 1: [label]**
[Prompt]

**Option 2: [label]**
[Prompt]
```
