---
name: refactor-ui
description: Use when editing frontend code to remove clutter, leaky copy, redundant UI, duplicate actions, nested cards, or over-explained screens while preserving behavior.
---

# Refactor UI

Use when the next step is to edit UI code.

## Rule

Remove or consolidate before adding. Preserve behavior unless the user explicitly asks to change product scope.

## Sequence

1. Inventory the visible surface.
   - List titles, paragraphs, helper panels, badges, buttons, duplicated labels, empty states, and repeated suggestions.
   - Mark implementation-detail copy for deletion or replacement.

2. Pick the minimum target.
   - One title per screen area.
   - One primary action per decision area.
   - One path for each task unless distinct paths have clear user value.

3. Edit copy.
   - Replace internal language with user action language.
   - Delete copy that explains obvious controls.
   - Keep labels short and concrete.

4. Edit structure.
   - Remove nested cards and extra panels.
   - Merge duplicate controls.
   - Move secondary actions into icon buttons, menus, or quieter rows when appropriate.
   - Keep repeated item cards consistent and compact.

5. Preserve app state.
   - Do not break existing props, handlers, queries, routes, auth, or data contracts.
   - Do not change backend, schema, or API behavior for presentation cleanup.

6. Verify in browser.
   - Check mobile first.
   - Inspect actual on-screen text, not only code.
   - Confirm no duplicate primary CTAs or implementation words remain.

## References

Read `../audit-rendered-ui/references/leak-dedup-checklist.md` when rewriting common leaky copy or simplifying repeated structures.

Clarify the flow first if the task is unclear rather than merely cluttered.

## Acceptance Standard

The UI should look like a product, not a status report from the implementation.
