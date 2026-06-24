---
name: sdlc-evidence
description: Use when an Agent SDLC implementation has a PR or review verdict and the workflow needs current-head checks, local verification, attached proof, simulator evidence, blocker classification, PR body updates, or GitHub issue Agent State refresh before review or merge.
---

# SDLC Evidence

Refresh the proof that makes an Agent SDLC PR reviewable or mergeable.

## Workflow

1. Read the issue and PR:
   - `gh issue view <number> --json number,title,body,labels,url,state`
   - `gh pr view <number> --json number,title,url,state,isDraft,headRefOid,statusCheckRollup,reviewDecision,files`
2. Compare PR `headRefOid` with any head recorded in `## Agent State`.
3. Read declared verification, CI tier, simulator evidence, and review verdict from the issue/PR.
4. Classify missing or deferred proof:
   - `review_blocker`: reviewer cannot trust the change yet.
   - `merge_blocker`: implementation can be approved, but merge evidence is pending.
   - `human_gate`: product, risk, access, or release decision needs the user.
   - `non_blocking`: residual note only.
5. Update the PR body or comment with current head, checks, attached evidence, and blockers.
6. Update issue `## Agent State`:
   - `Status: evidence_ready` when review can proceed.
   - `Status: merge_ready` when review is approved and required merge evidence is current.
   - `Status: needs_human` for human gates.
   - `Status: blocked` for fix-required blockers.

## Rules

- Current-head evidence must name the exact PR head SHA.
- A local screenshot path does not count as attached proof. Use a GitHub-hosted image/video link when simulator evidence is required.
- Do not rerun hosted CI when the known blocker is account capacity, spending limit, or another external startup failure; record it as a blocker with the right class.
