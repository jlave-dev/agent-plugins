---
name: reason-from-evidence
description: Investigate evidence with explicit hypotheses and justified conclusions. Use when debugging systems, analyzing incidents or reports, reducing possible explanations, finding missing evidence, or separating proof, consistency, probability, and speculation.
---

# Reason from Evidence

Build an auditable case. Do not turn observations into conclusions by narration.

## Set the proof standard

Use these labels exactly:

- **Logically entailed:** Every admissible model of the stated facts, constraints,
  and assumptions makes the claim true.
- **Consistent with the facts:** At least one admissible model permits the claim.
  This is viability, not support.
- **Likely:** A stated probabilistic model or evidence-weighting method ranks the
  claim above alternatives. Give the basis and uncertainty.
- **Speculative:** The claim is not refuted but has little positive support.
- **Refuted:** The claim conflicts with a trusted fact or necessary constraint.
- **Unknown:** Available evidence cannot classify the claim.

Let `K = F ∪ C ∪ A`, where `F` is accepted facts, `C` is constraints, and `A`
is explicit assumptions. For a consistent `K` and a claim `q`:

```text
entailed:   K ⊨ q              refuted: K ∪ {q} is unsatisfiable
consistent: some model satisfies K ∪ {q}
```

Do not call uncertain premises facts. A valid deduction from an uncertain
assumption remains conditional on that assumption.

## Run the investigation

1. **Frame the question.** State the exact outcome, scope, time window, system
   boundary, and required confidence. Preserve volatile evidence before tests
   or remediation can change it.
2. **Build an evidence ledger.** Give each item an ID. Record its type
   (`observation`, `report`, `accepted fact`, `assumption`, or `constraint`),
   source, time, scope, reliability, and dependencies. Treat “the log contains
   X” separately from “X occurred.”
3. **Check the base.** Normalize terms and time zones. Flag conflicts, stale
   records, missing intervals, and shared sources. If trusted premises
   contradict, isolate disputed subsets; do not derive arbitrary conclusions
   from the inconsistent set.
4. **Generate hypotheses abductively.** Include distinct causal families,
   ordinary failures, process or measurement error, and `other/unknown`.
   State any completeness claim. Do not confuse a good explanation with proof.
5. **Derive predictions.** For each hypothesis, list what must be true, what
   would be expected, what would distinguish it, and what would refute it.
   Search for disconfirming evidence before confirming detail.
6. **Prune deductively.** Refute a hypothesis only when it violates a trusted
   fact or necessary constraint. Use a truth table, timeline, dependency graph,
   CSP/SAT/SMT solver, query, or small model when manual consistency checks are
   unreliable. Keep surviving hypotheses; survival alone adds no probability.
7. **Remove unsupported specificity.** Map entailment or subsumption among
   survivors. If `Hstrong ⊨ Hweak`, then `Hweak` is weaker and the claims are
   not mutually exclusive alternatives. Prefer the weakest claim that is still
   adequate for the question or decision; retain stronger detail only when
   evidence supports its added commitments. Do not confuse shorter wording with
   logical weakness. Without a justified task distribution, weakness is a
   reporting discipline, not evidence that a causal hypothesis is more likely.
8. **Rank survivors.** Use base rates, evidence likelihood, causal fit, number
   of unsupported assumptions, and source quality. Use
   `P(H|E) ∝ P(E|H)P(H)` only when priors and likelihoods are defensible.
   Otherwise use an explicit ordinal ranking. Do not double-count correlated
   evidence.
9. **Choose the next test.** Prefer evidence for which leading hypotheses make
   different predictions. Balance expected discrimination against cost, delay,
   risk, reversibility, and evidence destruction. Treat absent evidence as
   evidence only when detection was expected and reliable.
10. **Update and stop deliberately.** Add results to the ledger, withdraw
   defeated defaults, and re-run consistency and ranking. Stop when the required
   decision threshold is met, one safe action dominates across survivors, or
   further evidence costs more than its decision value.

For formal framework selection, worked examples, and a copyable worksheet, read
[the framework guide](references/framework-guide.md).

## Report

Lead with the weakest decision-sufficient conclusion. Include:

1. Question and scope.
2. Accepted facts, constraints, and explicit assumptions.
3. A hypothesis table with status, broader or narrower related hypotheses,
   supporting evidence, conflicts, required assumptions, and decisive next test.
4. Contradictions and evidence-quality limits.
5. Conclusion labeled **logically entailed**, **consistent**, **likely**,
   **speculative**, **refuted**, or **unknown**.
6. Residual alternatives and the smallest next evidence-gathering action.

State whether a formal result proves the real system or only its model. Never
claim that one surviving explanation is true unless the hypothesis set is
demonstrably exhaustive and the evidence entails it.
