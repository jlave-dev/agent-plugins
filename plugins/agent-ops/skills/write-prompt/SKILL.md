---
name: write-prompt
description: Turn a rough gist, shorthand ask, notes, or half-formed request into a clear copy-ready prompt. Use when the user invokes $write-prompt, says prompt:, gist:, make this a prompt, promptify, or otherwise indicates they want a prompt artifact instead of the underlying task performed.
---

# Write Prompt

Turn rough intent into one clear Markdown prompt for Codex, another agent, or a side conversation. Do not perform the underlying task.

## Trigger Discipline

Use this skill only for `$write-prompt`, prompt-making cues such as `prompt:`, `gist:`, `ask:`, `make this a prompt`, or `promptify`, or an explicit request for prompt expansion. If the user asks to implement, research, review, explain, or decide directly, do that task instead.

## Workflow

1. Identify the recipient: coding, planning, research, review, browser/operator, side-chat, or generic assistant.
2. Preserve the user's goal, constraints, voice, urgency, and supplied facts. Add structure and missing operational detail without inventing credentials, paths, decisions, or external state.
3. Ask at most one question only when its answer would materially change the prompt; otherwise state a reasonable assumption inside it.
4. Write one recommended prompt by default. Include objective, context, scope, execution mode, verification, deliverables, tone, format, and safety boundaries as relevant.

## Codex Prompts

Name supplied repos, branches, files, docs, plans, and commands. State whether to edit, plan, review, publish, or ask before mutating. Include boundaries for secrets, live services, deployments, external accounts, and irreversible actions. Specify evidence and what to report when blocked or uncertain.

## Format

Return a single fenced `markdown` block by default. Use headings, bullets, and placeholders only when they make the prompt copy-ready. Provide variants only when requested or when the gist clearly has two viable intents.
