# Plugin Icon Style

## Vision

Use flat signal marks: minimal, friendly plugin icons that read instantly in a small launcher or marketplace grid.

Each icon is a full-bleed solid-color square with one centered geometric metaphor. The family should feel colorful and warm without becoming toy-like, mascot-driven, or illustrative.

## Principles

- One metaphor per plugin. Pick the core job, not every feature.
- Preserve approved icons. When feedback names one icon or one defect, patch that exact surface instead of regenerating the set.
- Flat raster PNG only. Do not use SVG icon assets for plugin presentation.
- Use a small, controlled palette. Avoid faux 3D, realistic materials, heavy shadows, or texture; subtle flat background variance is acceptable when it keeps the icon full-bleed.
- The background color must fill every pixel, including all four corners. Do not draw a rounded tile on a white, black, or transparent canvas.
- Use rounded, geometric silhouettes with large negative space and strong contrast.
- Use no text, letters, numbers, UI screenshots, brand marks, or mini diagrams.
- Keep one optional accent chip for state or category, such as a check, minus, dot, or search ring.
- Test at 32px. If the icon becomes a blob, simplify it.

## Palette Direction

- Agent Ops: coral background, off-white operations manual glyph, large teal gear, small golden status accent.
- Agent Dev: violet background, off-white code brackets, centered mint sparkle.
- Amazon: orange tile, off-white parcel glyph, dark navy search accent. Avoid Amazon-specific marks.
- Subtractive UI: deep green tile, off-white cleanup bars, coral minus accent.
- Agent SDLC: deep blue tile, off-white loop nodes, golden completion accent.

## Generation Prompt Rules

Use ImageGen for the source asset, then flatten locally if the model adds gradients or soft rendering.

Prompt for:

```text
Minimal flat icon rendered as a raster PNG. Full-bleed color square background filling every pixel, including all corners. One centered geometric glyph. Clean simple shapes, crisp edges, no outline unless needed, no rounded tile on a separate canvas, no realistic materials, no faux 3D, no perspective, no text, no letters, no numbers, no watermark. High contrast and legible at 32px.
```

## Research Notes

- Apple app icon guidance emphasizes a simple, recognizable design built around one clear idea: https://developer.apple.com/design/human-interface-guidelines/app-icons
- Material icon guidance emphasizes simple, modern, friendly shapes reduced to minimal form: https://developers.google.com/fonts/docs/material_icons
- Fluent icon guidance emphasizes familiar, friendly, recognizable symbols: https://fluent2.microsoft.design/iconography
