# xigma — Roadmap 1.1.0

Continuation of [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) in the same spirit — small, separate chunks
of work, checkboxes ticked as progress is made — but a separate file, because this is work outside
the "recreating Figma step by step" history from 1.0.0 (that file closes on a concrete, already
implemented history) and outside the big, multi-session performance stage in
[ROADMAP.2.0.0.md](./ROADMAP.2.0.0.md). 1.1.0 collects the next tiny UI/tooling features in the same
style as 1.0.0.

## Stage 1 — Color Sampler (eyedropper) in the ColorPicker

Ported from x-design — a "loupe" tracking the cursor with a 7×7 px grid preview; a click picks the
color under the center pixel. The color is read for real from WebGL (`gl.readPixels` in the render
loop, not `html2canvas` like in x-design), through a generic registry
(`colorPixelSamplerRegistry.ts`) with no Design↔ColorPicker dependency in either direction. The
sampler hides correctly over panels/popovers (hit-test via `document.elementFromPoint`, not via
canvas geometry). It closes on Escape and after a click.

## Stage 2 — Enter: text editing / converting a shape to vector

Enter on Text/Text-on-path enters caret editing (like a double-click). Enter on
Rectangle/Ellipse/Line/Arrow/Polygon/Star converts the shape to `NodeType.vector` (new `replaceNode`
reducer, `utils/canvas/vectorNetwork/convertShapeToVector/`, geometry as real Bézier curves) and
immediately opens Vector Edit Mode, in a single undo step. The arrowhead — deliberately lost, no
equivalent on a vector. e2e: `enter-shape-to-vector.spec.ts` + `edit-text.spec.ts`.

## Stage 3 — Paint: custom color and a drag brush

Paint got a real color choice (a ColorPicker in the toolbar instead of a random hue from the
loop-key hash) and `fillColorOverrideByKey` carried forward through Erase/Cut/Shape Builder, so an
operation that changes geometry doesn't wipe the chosen color. It also gained a drag mode — it paints
(or, in remove mode, removes) every new face under the brush in one stroke, instead of just one face
per click; a drag started on an already-filled face always ends with that face still filled (it
doesn't toggle like a single click). Full write-up: `.claude/docs/vector-network.md` §67-69.

- [x] ColorPicker wired into the tool button, color held in `paintColor` (Redux)
- [x] color survives Erase/Cut/Shape Builder instead of reverting to a random hue
- [x] drag paints/removes multiple faces in one stroke, always-paint-never-remove at drag start

## Stage 4 — Selection size label (W × H badge)

A blue `W x H` badge just outside the selection, docked to the visually-bottom edge, staying parallel
to it and hopping edges every 45° of rotation; centred, 5px off the edge, hidden in Vector Edit Mode.
Reuses the variable-width tool's label; also retunes the shared canvas blue to `#337ae1`. Write-up:
`.claude/docs/selection-and-manipulation.md` §22.

- [x] rotation-aware placement + edge-hop, blue badge via `drawValueLabel` (`{ angleDeg, edgeGapPx, fill }`)

## Stage 5 — Shape contact guides

A red X-capped line along a neighbour's edge when a single axis-aligned shape (not group/frame) sits
exactly flush against it — shown while dragging, resizing, or Alt-hovering. Figma-style; skips
overlaps and off-90° rotations. Write-up: `.claude/docs/selection-and-manipulation.md` §23.

- [x] `getShapeContactGuides` detection + `resolveShapeContactGuides` trigger + `drawShapeContactGuides` render, e2e

## Related

[[canvas-rendering-pipeline]] — context for the render loop and the `WEBGL_CONTEXT_ATTRIBUTES`
contract that `resolveColorSampleRequest` is attached to.
