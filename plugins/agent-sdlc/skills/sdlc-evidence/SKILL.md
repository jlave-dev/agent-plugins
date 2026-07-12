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
7. Re-read the PR and issue after each mutation. Body edits, label changes, and draft-to-ready transitions can enqueue a fresh workflow run; if they do, wait for that run and refresh the exact-head check readback before claiming `merge_ready`.

## Rules

- Current-head evidence must name the exact PR head SHA.
- A local screenshot path does not count as attached proof. Use a GitHub-hosted image/video link when simulator evidence is required.
- Before `gh issue edit --body-file` or `gh pr edit --body-file`, run `node plugins/agent-sdlc/scripts/guardrails.ts body --body-file <draft> > <safe-body>` and edit from the safe file.
- Do not rerun hosted CI when the known blocker is account capacity, spending limit, or another external startup failure; record it as a blocker with the right class.
- Do not downgrade a valid approved/evidence-ready state to `needs_human` merely because a reviewer thread or API call transiently errors; reserve that class for an actual user, access, product, or risk gate.
