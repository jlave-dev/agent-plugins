---
name: write-prompt
description: Turn rough intent into a copy-ready prompt sized to the task. Use when the user asks to write or refine a prompt, invokes $write-prompt, or says promptify; not to execute the underlying task.
---

# Write Prompt

Return one prompt for the intended recipient. Do not perform its underlying task. Prompt-making cues such as `prompt:`, `gist:`, and `ask:` apply when the user wants a prompt artifact; ordinary requests to implement, research, or explain remain direct tasks.

## Size To The Task

Start with the shortest prompt that preserves the user's intent. Complexity comes from dependencies, uncertainty, consequences, and deliverables, not the length of the gist.

- Simple, self-contained ask: one sentence or short paragraph. No headings, role preamble, plan, or acceptance checklist.
- Several meaningful requirements: a paragraph and a short list when it improves scanning.
- Complex or consequential work: use only the sections needed to separate goals, context, constraints, and completion evidence. A short production-migration request may need more detail than a long rewrite request.

These are choices, not templates or word limits. Honor a requested format or level of detail. If the original is already clear, edit lightly. Do not add scope to make a prompt look complete.

## Draft

1. Identify the recipient and desired result from context. Preserve supplied facts, paths, commands, constraints, permissions, and voice exactly where they matter. Do not invent missing state or assume the recipient has this conversation; carry over the context it needs.
2. Resolve routine gaps with reasonable defaults. Ask one focused question only when a missing answer prevents a useful prompt or changes authorization; otherwise write a conditional instruction for the recipient. Do not guess consent.
3. Lead with the outcome. Add success criteria, evidence, tools, or stop conditions only when they change execution. Let the recipient choose its method unless a sequence is necessary for correctness.
4. Remove repetition, stock phrases, generic expertise claims, and unnecessary process. Reserve absolute rules for real invariants. Specify concrete writing choices when tone matters; prefer plain prose unless a list or table helps the requested output.

## Agent Tasks

Apply these rules only when relevant to the generated task:

- Carry authorized work through completion. Use existing context and routine assumptions; do independent work while a necessary answer is pending. If an action needs approval, prepare the reviewable result first and pause at that action. Preserve explicit no-send, no-publish, and other boundaries without adding hypothetical approval gates.
- User instructions override skill guidelines, subject to higher-priority instructions and actual tool permissions. If file guidance blocks progress, identify the file and exact rule and explain the conflict rather than silently stopping.
- Require relevant source retrieval and evidence when correctness depends on external facts. If evidence or tools are unavailable, report the specific gap instead of claiming completion.
- Scale validation to the change and complete required checks. Broaden or repeat checks when changes, failures, or unresolved risks justify it. Avoid tests that merely restate trivial edits.
- Include delegation guidance when requested or when the target workflow needs it and supports subagents. Name useful independent subtasks; do not prescribe agents for a simple task or invent available tools.

## Output Check

Return only one fenced `markdown` block by default, without commentary. Follow a requested wrapper instead. Provide variants only when requested. Before returning, check that all explicit requirements survive and every added instruction changes behavior.

For example, `prompt: make this email shorter but keep the deadline` needs only: “Shorten the email below. Keep its meaning and deadline unchanged.” Include the supplied email after it. Do not expand this into Goal / Context / Constraints / Output sections.

Guidance basis: [OpenAI GPT-6 Astra prompting best practices](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices), reviewed 2026-09-05. Apply relevant guidance; do not paste the guide into every prompt.
