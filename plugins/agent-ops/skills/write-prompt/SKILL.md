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
2. Preserve the user's explicit goal, values, constraints, voice, urgency, and supplied facts. Never invent credentials, paths, decisions, evidence, or external state.
3. Ask at most one question only when its answer would materially change the outcome or authorization boundary. Otherwise include a reasonable assumption or decision rule.
4. Write one lean, outcome-first prompt. State the user-visible goal, success criteria, relevant context and evidence, constraints and permissions, tool-routing rules, required output, validation, and stop or fallback conditions only when they change behavior.
5. Remove repeated rules, unnecessary examples, and step-by-step process that the recipient can choose efficiently. Resolve contradictions. Reserve `must`, `never`, `always`, and `only` for true invariants; use decision rules for judgment calls.

## Prompt Contract

Describe what good looks like instead of prescribing every step. Keep supplied values exact and let the recipient choose the implementation, search, tool, or reasoning path unless a sequence is required for safety or correctness.

For concise outputs, name the facts, decisions, caveats, and next actions that must remain, then say what may be omitted. When tone matters, describe concrete writing choices rather than relying on labels such as "friendly" or "professional." Keep personality and collaboration behavior brief and distinct.

## Codex Prompts

Name supplied repos, branches, files, docs, plans, and commands. State the authorized work layer, such as research, planning, implementation, review, or external coordination. Allow expected in-scope local work and validation without unnecessary approval requests, while naming boundaries for secrets, live services, deployments, external accounts, destructive actions, cost, and scope expansion.

Require prerequisite retrieval when correctness depends on it. Define what needs evidence or citations, what validation matters, and what to report when evidence is missing, tools fail, or the completion bar cannot be met. Prefer the fewest useful tool loops without sacrificing correctness.

## Format

Return a single fenced `markdown` block by default. For complex prompts, use short sections such as Goal, Success Criteria, Context, Constraints, Tools, Output, and Stop Rules, omitting any section that adds no behavioral value. Provide variants only when requested or when the gist clearly has two viable intents.
