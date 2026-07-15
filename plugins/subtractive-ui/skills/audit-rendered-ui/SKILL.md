---
name: audit-rendered-ui
description: Use when reviewing screenshots or rendered frontend UI for leaky copy, redundancy, visual clutter, responsive fit, broken assets, or handoff polish.
---

# Audit Rendered UI

Use after opening the app in a browser, viewing supplied screenshots, or capturing simulator screenshots.

## Required Input

Inspect actual pixels. Prefer browser, screenshot, image, or simulator evidence over code guesses. If the app cannot run, say the audit is code-only and lower confidence.

## Viewports

Check at least:

- mobile: `390x844`
- tablet: `768x1024`
- desktop: `1280x900`

For native apps, use the closest available simulator screenshots.

## Audit Passes

1. Implementation-detail leak pass.
   - Flag user-visible copy about APIs, providers, databases, architecture, mocks, demos, local state, scaffolding, functions, model internals, or setup.
   - Ask whether a polished production app would say this to a normal user.

2. Redundancy pass.
   - Flag repeated titles, body copy, CTAs, save/confirm actions, suggestions, filters, and labels that restate nearby text.
   - Prefer one element doing the work of two.

3. Text and layout fit pass.
   - No clipped labels.
   - No overlapping controls.
   - No loading labels that resize buttons.
   - Long words fit or wrap cleanly.

4. Visual clutter pass.
   - Flag nested cards, too many panels, crowded button rows, unneeded badges, oversized helper text, and competing primary actions.
   - Prefer removing or consolidating before restyling.

5. Interaction and asset pass.
   - Primary flows work.
   - Disabled, loading, error, and destructive states are understandable.
   - Maps, images, icons, and canvas or 3D surfaces are nonblank.
   - Provider attribution is present when required, but not framed as task copy.

6. Reference-alignment pass.
   - Compare against named references for hierarchy, density, typography, color roles, and rhythm.
   - Do not copy stale reference labels or deferred features.

## Output

Lead with findings. For each finding include visible evidence, problem, fix, and severity: `blocker`, `high`, `medium`, or `low`.

If the audit is for an implementation agent, include a short subtractive edit plan with the smallest code areas to change.

## References

Read `references/leak-dedup-checklist.md` for leaky words, redundant patterns, and replacement examples.
