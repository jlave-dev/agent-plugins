---
name: map-project-decisions
description: Map a greenfield software project's components and separate human-owned product or architecture decisions from safe, reversible, or testable choices the agent should make. Use when starting a new app, service, CLI, integration, or major subsystem.
---

# Map Project Decisions

Protect the user's control over consequential tradeoffs without turning project shaping into an exhaustive interview. Map the first usable slice, identify its real components, and decide who must own each open decision.

## Core distinction

Do not equate an important decision with a human decision.

- **Human-owned:** Multiple defensible choices remain, and the choice expresses product intent, policy, risk tolerance, ownership, or an enduring commitment that cannot be inferred safely.
- **Agent-owned:** A dominant safety or correctness practice exists, the choice follows established local conventions, or the detail is low-cost to change behind a stable seam.
- **Agent-investigated:** The answer is empirical. Research it, measure it, or build a small prototype instead of asking the user to predict it.
- **Deferred by the agent:** The decision does not affect the first usable slice. Preserve a reasonable path to change it and define the condition that should reopen it.

The last three are all agent-owned. They do not require permission unless the work itself needs authorization.

Do not ask the user to design baseline safety. Apply the strongest practical platform default for secret storage, least privilege, input handling, transport security, safe file permissions, and destructive-action safeguards. For example, a personal macOS CLI should store a router password in Keychain, not plaintext JSON. Ask only when an actual requirement, such as headless automation or cross-platform support, removes the dominant default or changes the trust boundary.

## Establish the decision frame

Use the request, repository, documentation, target environment, and available tools to infer:

- the primary user and outcome
- the smallest slice that is useful end to end
- where the software runs and who operates it
- sensitive data, credentials, permissions, and destructive capabilities
- external systems, money flows, and other side effects

Find facts yourself. Ask one framing question only if its answer would materially change the component map and cannot be inferred. Do not expand the map with hypothetical future features or generic enterprise concerns.

## Map components

Describe components as responsibility boundaries with meaningful contracts, not as a list of files or libraries. Consider only categories that the slice actually needs:

- user entry points and output surfaces
- core domain behavior and policy
- identity, authorization, credentials, and trust boundaries
- configuration, state, storage, retention, and recovery
- external integrations and network boundaries
- execution, packaging, deployment, and upgrades
- observability, failure handling, and operator controls

For each component, state its responsibility, the boundary it owns, and the decisions that could change that boundary. Combine categories when a separate component would add no useful seam.

## Assign decision ownership

Classify each open decision with the following test.

Make it a **human gate** only when all of these are true:

1. The answer changes at least one of these: user-visible product behavior, business policy, a trust or privacy boundary, data ownership or lifecycle, an external authority, operational responsibility, recurring cost class, public contract, or a dependency that is expensive to leave.
2. Two or more defensible choices remain after applying evidence, platform standards, repository conventions, and established best practices.
3. The choice cannot be deferred cheaply behind a stable interface or resolved by a small experiment.
4. A wrong assumption would plausibly cause harm or substantial rework before the next realistic feedback point.

Otherwise, keep it agent-owned. Choose a recommended default and state the reason. Prefer a safe default behind a stable seam when classification is close.

Important agent-owned decisions can still be disclosed. Disclosure is not a request for approval.

## Ask only admissible questions

Before asking a question, complete this sentence internally:

> I cannot implement component X safely until the user chooses Y, because the answer changes Z and no dominant or reversible default exists.

If the sentence is weak, do not ask. Decide, investigate, prototype, or defer instead.

For each real gate, give:

- the concrete decision and affected components
- why it must be settled now
- two or three plausible choices and their material consequences
- a recommendation, when the user's stated goals support one

Ask no more than three gates in one round. Order them by dependency and blast radius. Recompute only the decisions that their answers unlock. Stop questioning as soon as the first usable slice is unblocked; do not walk every branch of the design tree.

Do not ask about naming, internal libraries, code organization, ordinary framework choices, speculative scale, nice-to-have scope, or preferences with no meaningful user consequence. Do not ask a verbal question that is better answered with a prototype or measurement.

## Output

Keep the result concise and usable as implementation context:

1. **First usable slice** — the outcome and scope boundary.
2. **Component map** — component, responsibility, and important seam.
3. **Human gates** — only unresolved decisions that pass the full gate test.
4. **Agent decisions** — important defaults already selected, especially safety and data-handling defaults, with short reasons.
5. **Investigate or defer** — empirical checks and later decisions, each with a trigger to revisit.

If no human gate remains, say so and continue with the requested work. If gates remain, do not cross the affected irreversible seam until the user answers. Continue safe research, prototyping, or reversible setup when it provides useful progress.

## Calibration examples

- **Agent decision:** Store a macOS CLI password in Keychain and keep only non-secret settings in a config file. This is a dominant platform safety default.
- **Human gate:** Decide whether credentials may leave the device for hosted synchronization. This changes a privacy and trust boundary with more than one defensible product policy.
- **Agent decision:** Choose a conventional internal logging library. It is replaceable and does not express product policy.
- **Investigate:** Prototype one long form and a short multi-step flow when the better interaction cannot be known from discussion.
- **Deferred:** Design multi-user roles later when the first slice is explicitly single-user and the data model can preserve an ownership seam.
