# Framework guide

Use this guide when selecting a formal method, explaining the method, or showing
a worked investigation.

## Framework map

| Framework | Investigation use | Limit |
|---|---|---|
| Deduction | Derive predictions and contradictions from premises. | Proof is conditional on the premises. |
| Induction | Estimate patterns and base rates from cases. | Gives confidence, not necessity. |
| Abduction | Generate explanations and useful tests. | Candidates are not proof. |
| First-order logic | Express objects, relations, and quantified rules. | Time, uncertainty, and defaults need extensions. |
| Modal logic | Express possibility, necessity, time, or knowledge. | Results depend on the selected semantics. |
| Non-monotonic logic | Model defeasible defaults and exceptions. | Later evidence can withdraw conclusions. |
| Constraint satisfaction | Prune assignments that violate hard constraints. | Feasible does not mean probable or causal. |
| Argumentation | Expose conflicting evidence and rebuttals. | Acceptance depends on argument semantics. |
| Bayesian reasoning | Rank hypotheses and expected test effects. | Requires defensible priors and likelihoods. |
| Causal inference | Test causes with graphs, controls, and interventions. | Association alone does not identify cause. |
| Model checking | Test modeled invariants and reachability. | Proves the model property, not model fidelity. |

The usual flow is:

```text
observations → abduction → candidate hypotheses
                         ↓
facts + constraints → deduction/CSP → survivors
                         ↓
base rates + evidence → Bayesian/causal ranking
                         ↓
different predictions → next discriminating test → revise
```

Use argumentation when evidence conflicts. Use non-monotonic rules when new
evidence can defeat defaults. Use modal or temporal logic when order,
possibility, knowledge, or eventual behavior matters.

## Example: API latency incident

Question: Why did API latency rise after 14:05?

Evidence: latency rose at 14:05; requests report pool-acquisition timeouts; pool
occupancy reached its limit while database CPU stayed normal; version B finished
rollout at 14:03. Assume the clocks differ by less than one minute.

Hypotheses: `H1` slow queries, `H2` version B leaks connections, `H3` database
capacity fell, `H4` network delay, `H5` other/unknown.

Normal CPU weakens but does not refute `H1`; blocked queries can hold connections.
`H2` and `H3` remain consistent. Compare checkout/return counts by version or
roll back one safe canary. If only B retains connections and rollback reverses
it, `H2` becomes **likely**. Until tracing identifies the mechanism, report
“version B causes connection retention,” not a specific leaking code path.
“Version B caused all latency” remains **unknown**.

## Example: survey completion decline

Question: Why did completion fall from 62% to 35%?

Opens are stable; abandonment concentrates on page 3; the redesign and audience
changed together. Complete event records **logically entail** only that recorded
page-3 abandonment rose. Redesign causation is **consistent**, not proved. A
reproduced disabled Continue button makes a mobile defect **likely** for that
browser. A randomized old/new test can estimate the redesign effect, not prove
it for untested populations.

## Investigation worksheet

```text
Question / decision:
Scope / time / boundary:
Required confidence and stop rule:

Evidence ledger
ID | type | claim | source/time/scope | reliability | depends on

Constraints and assumptions
ID | statement | hard or defeasible | justification

Hypotheses
ID | explanation | must be true | expected | refuter | status | next test

Entailment / subsumption map:
Unsupported specificity removed:
Contradictions / disputed evidence:
Ranking method and dependence warnings:
Weakest decision-sufficient conclusion and label:
Residual alternatives:
Next evidence action:
```

## Research basis

- C. S. Peirce, [Deduction, Induction, and Hypothesis](https://en.wikisource.org/wiki/Popular_Science_Monthly/Volume_13/August_1878/Illustrations_of_the_Logic_of_Science_VI), 1878.
- R. Carnap, [Logical Foundations of Probability](https://fitelson.org/confirmation/carnap_logical_foundations_of_probability.pdf), 1950.
- S. Kripke, [Semantical Analysis of Modal Logic I](https://doi.org/10.1002/malq.19630090502), 1963.
- R. Reiter, [A Logic for Default Reasoning](https://doi.org/10.1016/0004-3702(80)90014-4), 1980.
- A. Mackworth, [Consistency in Networks of Relations](https://doi.org/10.1016/0004-3702(77)90007-8), 1977.
- P. M. Dung, [On the Acceptability of Arguments](https://doi.org/10.1016/0004-3702(94)00041-X), 1995.
- J. Pearl, [The Foundations of Causal Inference](https://www.cs.ucla.edu/~kaoru/r355-corrections.pdf), 2010.
- E. Clarke, E. Emerson, and A. Sistla, [Automatic Verification of Finite-State Concurrent Systems](https://doi.org/10.1145/5397.5399), 1986.
- T. Bayes, [An Essay Towards Solving a Problem in the Doctrine of Chances](https://doi.org/10.1098/rstl.1763.0053), 1763.
- M. T. Bennett, [The Optimal Choice of Hypothesis Is the Weakest, Not the Shortest](https://doi.org/10.1007/978-3-031-33469-6_5), 2023.
- NIST, [SP 800-61 Rev. 3](https://doi.org/10.6028/NIST.SP.800-61r3), 2025.
