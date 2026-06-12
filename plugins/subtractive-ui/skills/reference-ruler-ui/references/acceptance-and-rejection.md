# Acceptance And Rejection

Require: reference path, implementation URL/path, viewport, DPR, state, data assumptions, screenshots, crops, before/after ruler values, and DOM/console/interaction checks when relevant.

Accept only when the target invariant improves, the crop improves or visibly matches better, whole-screen rhythm does not materially regress, sibling anchors hold, and behavior stays intact.

Reject when a patch improves a tiny crop but hurts the full screen, fixes child marks inside a wrong parent, overfits variable data, trusts OCR/VLM without screenshot evidence, moves a neighboring anchor, or swaps in a generic component.

Ledger fields: residual, ruler, patch, evidence, decision, reason, next.
