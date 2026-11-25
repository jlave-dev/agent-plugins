---
name: verify-behavior
description: Prove or refute a specific claim about implementation behavior, including whether a refactor preserves it for every supported input. Use when writing a rule that must always hold or reviewing a change that promises equivalent behavior.
---

# Verify Behavior

State the claim in the caller's terms. For a refactor, identify the baseline and candidate revisions, the entry point, and what a caller can observe. For a new implementation, take the rule from the requirement or an independent specification. An equivalence proof can preserve a bug shared by both versions.

## Establish the contract

Trace a real caller to the implementation that runs. Identify the supported inputs, relevant initial state, build target, and observations that decide the claim. These may include the return value, errors, termination, mutations, or the order of external calls. Compare executions under the same external conditions. Cite the code or contract that justifies a precondition. If a tool needs a narrower domain, keep the original claim open and name the restriction.

## Try to settle the claim

Choose the least expensive decisive check available for the target language. Look for a concrete difference at a changed boundary, default, or branch before spending time on a proof. Use isolated copies when trying hypothetical refactors.

- **Identical executable artifacts.** Rebuild both versions with the same dependencies, options and environment. Keep comparison outputs outside both builds' inputs. Compare executable bytes and relevant resources. Trace the target into the artifact and exercise its caller under a working configuration when practical. Scope the conclusion to that build and runtime context. Different bytes alone leave equivalence open.
- **Exhaustive execution.** For a finite domain, justify its completeness from the contract and compare the actual implementations for every input and relevant state. If using representative cases, prove they cover the domain and preserve the observations within each class. Random trials and arbitrary size limits support a testing result.
- **Reason from the implementation.** A local rewrite may follow directly from the language rules. Show that each path preserves evaluation order, effects, and outcomes. For a machine-checked proof, use a verifier with semantics for the operations in the code, or check the theorem in Lean. Connect a translated program to the implementation with a verified translation or a checked certificate. A handwritten model or an unvalidated translation leaves a separate implementation claim open. Name the trusted compiler, runtime semantics, or external contracts where relevant.

Run the checker on the intended statement. Inspect its result for unfinished obligations, assumed conclusions and impossible preconditions. With Lean, check the named theorem's `#print axioms` output for transitive placeholders (`sorryAx`) and unexpected axioms. If the user requires a machine-checked proof, keep the claim unproved until the checker covers the requested obligation. Replay a candidate counterexample through the actual entry point and capture both outcomes where possible. A discrepancy confined to a model is evidence about that model.

## Report the result

- **Proved** requires a complete implementation-linked argument for the stated domain and observations. Identify the decisive comparison, exhaustive check, or derivation. Say which steps a machine checked and which rely on manual reasoning.
- **Refuted** requires a valid counterexample. Give the smallest useful input and initial state, the observed outcomes or source-linked derivation, and a way to reproduce it.
- **Unproved** identifies the precise gap. Report any passing tests or model theorem with their own scope. An unsupported operation, timeout, or failed proof tactic leaves the claim open.

Give a replay command with the revisions, build settings or tool versions it depends on. Keep the proof or witness when it will help the user check the next change. Report independent claims and build targets separately when their verdicts differ.
