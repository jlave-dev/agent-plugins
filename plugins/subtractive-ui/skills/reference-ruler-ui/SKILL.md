---
name: reference-ruler-ui
description: "Use when matching a frontend implementation to a concrete visual reference: image-to-code UI work, mockup or screenshot replication, screenshot-driven polish, pixel-fidelity repair loops, or generated mockups that need faithful implementation."
---

# Reference Ruler UI

Use `design-frontend` first when visual direction or product state is unclear. Use this skill when a concrete mockup, screenshot, or generated reference is the target. Use `audit-rendered-ui` between passes for clutter, copy leaks, responsive fit, and polish findings. Use `refactor-ui` when the fix is simplification rather than reference matching.

## Workflow

1. Freeze the scene.
   - Save the reference image and render the implementation at reference-like viewport(s).
   - Wait for fonts and assets, capture screenshots, and record route/path, viewport, DPR, state, and data assumptions.

2. Classify visible marks.
   - `stable chrome`: layout, controls, rows, icons, labels, nav, sidebars, cards, form fields, logos.
   - `fixed-data content`: values or chart marks explicitly part of the target state.
   - `variable data`: chart traces, sparklines, graph particulars, generated records, live values.
   - Do not optimize arbitrary chart, graph, or sparkline traces unless the task fixes the data. For variable data, measure the stable chrome around it.

3. Build the object graph.
   - Identify parent and child objects: shell, panels, cards, rows, toolbars, forms, icons, typography roles, charts, canvases, navigation, active states.
   - If a child repair worsens the crop or whole screen, climb to the parent ruler. If a parent repair improves layout but leaves a child wrong, descend.

4. Extract reference rulers.
   - For each important object, name measurable invariants: box, rhythm, centerline, baseline, anchor points, stroke, darkness, typography, color role, icon silhouette, state, sibling anchors, and parent slot.
   - Read `references/object-rulers.md` for the ruler checklist.

5. Implement and compare.
   - Use existing project patterns, design tokens, stable dimensions, real controls, realistic states, and no visible implementation commentary.
   - Capture full-screen side-by-sides plus crops for suspicious regions. Check DOM, console, interactions, and computed typography when type matters.

6. Repair recursively.
   - Pick one residual at a time.
   - Apply the smallest relevant operator from `references/repair-operators.md`.
   - Keep a mismatch ledger with attempted repairs and evidence.

7. Accept or reject.
   - Accept only when the targeted invariant improves, the relevant crop improves or visibly matches better, whole-screen rhythm does not materially regress, and sibling guardrails hold.
   - Reject and document variants that improve a local metric but harm the whole screen. See `references/acceptance-and-rejection.md`.

## Common Rulers

- Repeated rows/lists: row interval, lane center, separator y/darkness, icon/control size, text box, trailing affordance, visible row count.
- Timeline rows: marker/text/time/chevron center vs lane center, rail x, marker diameter, rail stroke/dash.
- Mobile viewport: fixed nav/home indicator, above-fold content budget, status/top bars, active section height.
- Typography: font candidate, computed family, size, weight, line height, letter spacing, crop bounds.
- Icon actions: metaphor, silhouette, accent component geometry, slot box.
- Editor/canvas: coordinate system, stable anchors, badge/port centers, connector guardrails, canvas grid pitch/contrast.
- Editor palettes/template libraries: category icon taxonomy, icon slot, label x, row rhythm, chevron anchor.
- Side-panel forms: label column, field x/width/height, row interval, select chevrons, code box bounds.
- Dashboards: shell columns, section-stack y rulers, card bands, table-head bands, chart plot boxes.
- Charts with variable data: chrome and plot-space only unless the data is fixed.
- Logos/brand marks: tight crop, accent area, bbox, centroid, slot width, wordmark anchor.

## Output

Report:

- reference path
- implementation URL/path and viewport(s)
- stable chrome, fixed-data content, and variable data classifications
- top residuals
- repairs attempted
- accepted and rejected variants with evidence
- final screenshots/metrics
- remaining known mismatches

## Anti-Patterns

- Matching semantic labels but not spacing, density, or rhythm.
- Using generic component defaults.
- Treating "serif" or "sans" as a font match.
- Overfitting variable chart, graph, or sparkline traces.
- Fixing child chart/table marks before parent layout.
- Reusing one generic icon where the reference has a taxonomy.
- Trusting OCR or VLM output as acceptance proof.
- Using whole-screen RMSE as the only judge.
- Stopping after the first plausible screenshot.
