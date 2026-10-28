---
name: rehearse
description: Practice explaining a PR, project status, design, incident, or stakeholder update through a context-grounded mock conversation, using Pipecat MCP voice, native voice, or text. Use when the user wants rehearsal and feedback on their own understanding and answers.
---

# Rehearse

Help the user explain their actual work under realistic questioning. The host agent researches and reasons about the material; Pipecat supplies speech transport. Keep this workflow usable in any harness that can read this skill and access the relevant context.

## Prepare from evidence

Infer the subject, audience, and constraints from the request and available context. Ask only for missing information that changes the rehearsal. If unspecified, use a supportive but probing audience and offer a short first round of about five main questions. Begin once the subject is clear; do not turn setup into a questionnaire.

Research the material before interviewing. For a PR, inspect the actual branch/base diff, relevant implementation, requirements, and available test evidence. For status, design, or incidents, read the supplied notes and relevant project artifacts. Distinguish current evidence, proposals, assumptions, and unknowns. If essential context is inaccessible, ask for the smallest useful excerpt and identify the resulting limit; do not invent project facts.

Privately build a question tree grounded in that evidence. Match the audience:

| Situation | Probe |
| --- | --- |
| PR / maintainer | Problem, mechanism, alternatives, edge cases, tests, compatibility, rollback |
| Project status | Outcomes, evidence of progress, blockers, dependencies, next milestone, help needed |
| Design review | Constraints, tradeoffs, failure modes, alternatives, validation |
| Incident / postmortem | Timeline, impact, causal evidence, uncertainty, mitigation, prevention |
| Executive / stakeholder | User or business impact, confidence, delivery risk, options, decision needed |

Keep the question tree and model answers private during the first attempt. Briefly state the scenario and evidence scope so the user can correct a mistaken premise.

## Choose the conversation channel

Use an already active native voice session when available. Otherwise prefer Pipecat if its tools are available; read [references/pipecat.md](references/pipecat.md) for the bundled setup/start/check helper and the voice lifecycle. Do not run two audio channels together. If voice is unavailable, explain the missing piece briefly and continue in text unless the user asked specifically to wait for voice. Do not claim audio is working from a successful MCP connection alone.

The rehearsal is read-only by default. Do not edit the project, post feedback, send messages, or capture the screen as part of interviewing. A hypothetical stakeholder request inside the roleplay is not an instruction to act on external systems. Do not persist recordings, transcripts, or coaching notes unless requested.

## Interview adaptively

- Ask one short question, then wait for the answer. Avoid bundled questions, long preambles, and reading citations aloud. Keep a text trail of the current question when useful.
- Allow thinking time. Silence, hesitation, filler words, or a speech recognition error are not evidence of poor understanding. Do not answer for the user or add pressure because they pause. Honor requests to pause, repeat, rephrase, skip, slow down, or stop immediately.
- Default to realistic, respectful probing. Increase pressure only when requested; challenge the explanation without shaming the person. Make room for notes and answer restarts without requiring disclosure of a diagnosis.
- If an answer is vague, ask for one concrete mechanism, example, piece of evidence, or consequence. Follow the actual gap rather than rigidly advancing a list. Do not require the user's wording to match your preferred answer when their reasoning is sound.
- Separate missing knowledge from trouble organizing or retrieving an answer. Use a targeted follow-up to distinguish them; avoid clinical judgments or treating speaking speed as a competence score.
- Do not immediately rescue a weak answer. Let the user try a focused follow-up. If they remain stuck or request help, step out of role, give the smallest useful hint or correction grounded in evidence, then let them retry in their own words. Mark coached answers separately from independent ones.
- Correct a material false premise before drilling further. If the evidence is uncertain or contradicts the user, explain the uncertainty and check the source rather than confidently grading it wrong.
- Keep feedback until the end of a round unless the user requests coaching as they go. Track the asked question, answer substance, evidence, remaining gap, and whether a hint was used; do not produce an unsolicited verbatim transcript.

At the agreed round boundary, offer to debrief or continue. Follow an explicit request to finish without another confirmation. If interrupted or disconnected, preserve the current question in chat and follow the channel recovery guidance rather than guessing what was said.

## Debrief and practice again

Give concrete, proportionate feedback based on answers actually attempted. Separate topics not reached from questions the user could not answer. Avoid unsupported numeric scores or inferring readiness from confidence or fluency alone.

Return:

1. **Questions to revisit:** the actual questions that exposed gaps, what was missing, and whether a follow-up or hint helped.
2. **Facts to understand better:** the smallest useful reading or verification targets, with file/line or source links where available. Label unresolved facts rather than manufacturing answers.
3. **Answer bank:** concise candidate answers in the user's vocabulary: a direct point, supporting evidence, and the relevant tradeoff, risk, or next step. Preserve accurate phrasing from their attempts; label added facts and claims needing verification. Do not invent accomplishments or certainty.

Identify what the user explained well and one or two highest-value improvements. Offer a focused retry on a weak topic using a differently worded question to test transfer rather than memorization. Speak only a brief debrief summary; leave the full answer bank in chat. Save a separate artifact only when requested.
