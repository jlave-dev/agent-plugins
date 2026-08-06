# Framework guide

Use this guide when selecting a formal method, explaining the method, or showing
a worked investigation.

## Framework map

| Framework | Plain-language role | Investigation use | Strength and limit |
|---|---|---|---|
| Deduction | Apply rules to premises. | Derive necessary predictions and eliminate contradictions. | Proves a conditional result; it cannot repair false or incomplete premises. |
| Induction | Generalize from repeated cases. | Estimate patterns, base rates, and reliability from observations. | Supports a degree of confidence, not logical necessity. |
| Abduction | Propose explanations for observations. | Generate hypotheses and select useful tests. | Produces candidates or a best explanation, not proof. |
| First-order logic | Describe objects, relations, and quantified rules. | Formalize claims such as `∀x, failed(x) → alerted(x)` and test entailment or satisfiability. | Precise within the vocabulary; time, uncertainty, and defaults need extensions. |
| Modal logic | Reason about necessity, possibility, time, obligation, or knowledge. | Separate “observed,” “known,” “possibly occurred,” and “must eventually occur.” | Its result depends on the chosen possible-world or temporal semantics. |
| Non-monotonic logic | Permit defaults that later evidence can withdraw. | Model “normally,” exceptions, incomplete information, and changing incident beliefs. | A default conclusion is defeasible, not entailed by classical logic. |
| Constraint satisfaction | Find assignments that satisfy all hard restrictions. | Encode domains, timelines, dependencies, and mutually exclusive choices; prune impossible combinations. | Finds feasible models. Feasible does not mean probable or causal. |
| Argumentation frameworks | Represent arguments and attacks between them. | Expose conflicting reports, rebuttals, source dependencies, and defensible sets of claims. | Acceptance depends on the selected argument semantics and evidence model. |
| Bayesian reasoning | Update probability with evidence. | Rank surviving hypotheses and quantify how a test changes odds. | Numeric output is only as sound as priors, likelihoods, and independence assumptions. |
| Causal inference | Distinguish observation from intervention. | Use causal graphs, controls, interventions, and counterfactuals to test cause claims. | Association alone does not identify cause; identification needs assumptions or design. |
| Model checking / formal verification | Check every modeled state or prove a property. | Test invariants, reachability, ordering, and concurrency hypotheses; obtain counterexample traces. | Proves or refutes a model property, not model fidelity or an unbounded implementation by default. |

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

Evidence:

- `E1` observation: client metrics show p95 latency rose at 14:05.
- `E2` observation: timed-out requests report database-pool acquisition timeout.
- `E3` observation: pool occupancy reached its limit; database CPU stayed normal.
- `E4` fact, conditional on deployment records: version B finished rollout at 14:03.
- `A1` assumption: these clocks differ by less than one minute.

Hypotheses: `H1` slow queries, `H2` version B leaks connections, `H3` database
capacity fell, `H4` network delay, `H5` other/unknown.

Deductive pruning does not prove `H2`. `E3` weakens `H1`; it does not refute it
because blocked queries can consume connections without high CPU. `H2` and `H3`
remain consistent. The best next test compares checkout/return counts by version
or rolls back one safe canary. If only version B accumulates unreleased
connections and a canary rollback reverses that behavior, label `H2` **likely**
with intervention evidence. Label “version B caused all latency” **unknown**
until scope, alternative changes, and measurement fidelity are checked.

## Example: survey completion decline

Question: Why did completion fall from 62% to 35%?

Facts and observations: invitation and open rates are stable; abandonment is
concentrated on page 3; a redesign and audience change occurred in the same
week. Hypotheses include confusing page-3 wording, a mobile defect, a different
audience, and measurement error.

It is **logically entailed** from complete event records that recorded sessions
abandon page 3 more often. A redesign cause is only **consistent** because the
audience changed too. If failures are concentrated on one mobile browser and a
replay reproduces a disabled Continue button, the defect becomes **likely** for
that segment. A randomized old/new form test can estimate the redesign effect;
it still does not prove the same effect for untested populations.

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

Contradictions / disputed evidence:
Ranking method and dependence warnings:
Conclusion label and exact claim:
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
- NIST, [SP 800-61 Rev. 3](https://doi.org/10.6028/NIST.SP.800-61r3), 2025.
