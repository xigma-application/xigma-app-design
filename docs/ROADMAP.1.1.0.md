# xigma — Roadmap 1.1.0

Continuation of [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) — small, separate features, checked off as
they land. Kept apart from the big performance stage in [ROADMAP.2.0.0.md](./ROADMAP.2.0.0.md).

## Stage 1 — Color Sampler (eyedropper)

A loupe follows the cursor with a zoomed pixel preview; click to pick the color under it. Reads the
real rendered color, not a screenshot approximation. Closes on Escape or after picking.

## Stage 2 — Enter: text editing / shape → vector

Enter on a text node starts editing it. Enter on a Rectangle/Ellipse/Line/Arrow/Polygon/Star turns
it into an editable vector shape and opens Vector Edit Mode right away, in one undo step.
(Arrowheads are lost on conversion — no vector equivalent.)

## Stage 3 — Paint: custom color and a drag brush

Paint now uses a real color you pick, instead of a random one. Dragging paints (or removes) every
face the brush crosses in one stroke, instead of one click per face. Write-up:
`.claude/docs/vector-network.md` §67-69.

- [x] color picker on the tool, survives Erase/Cut/Shape Builder
- [x] drag paints/removes multiple faces at once
- [x] the picker's opacity slider actually does something now — a painted face can be see-through

## Stage 4 — Selection size label

A blue `W x H` badge sits just outside the selection, following its edge as it rotates. Hidden in
Vector Edit Mode.

## Stage 5 — Shape contact guides

When a shape sits flush against a neighbor, a red line marks the touching edge — while dragging,
resizing, or Alt-hovering. Figma-style. Now also works for diagonal and same-side placements.

## Stage 6 — Shape alignment snap on move

Dragging a shape snaps its edges/center onto other shapes' edges/centers.

## Stage 7 — Shape alignment snap on resize

Same snapping, now while resizing.

## Stage 8 — Shape alignment snap on draw

Same snapping, now while drawing a brand-new shape.

## Stage 9 — Snap performance fix

Snapping was rescanning every shape on the page on every mouse move during a drag/resize/draw.
Now it scans once per gesture instead.

## Stage 10 — Single-purpose app, no more routing

The app dropped client-side routing — it lives on its own subdomain with nothing else to route to.
Removed `react-router` and the old starter-template pages.

## Stage 11 — Text on Path: attach to an existing shape

Text on Path can now attach to an existing vector or shape instead of always drawing a fresh curve
— click where you want the text to start. The attached path now moves, rotates, resizes, copies,
and pastes as one unit with its text, and shows its own dashed outline only when relevant.

## Stage 12 — Flatten and Outline as stroke for text

Two new destructive text commands: Flatten turns a whole text node into one vector shape; Outline
as stroke keeps every letter as its own selectable vector instead. Full write-up:
`.claude/docs/text-flatten-and-outline.md`. (Performance follow-up tracked in ROADMAP.2.0.0.md.)

## Stage 13 — Masks (Figma-style)

A layer can now clip the layers above it in its group to its own painted shape — "Use as mask"
(⌃⌘M). Works with every layer type, including strokes. Full write-up: `.claude/docs/masks.md`.

- [ ] follow-ups: broader e2e coverage, mask hit-region clipping, multiple masks per group, other
      mask blend modes

## Stage 14 — Figma-style distance measurement (Alt+hover)

Select something, hold Alt, hover another shape — orange dashed lines with the distance in px show
the gap, like Figma. Now also works inside Vector Edit Mode: select a point, segment, or a few
points at once, then Alt-hover another point, segment, or whole face to measure against it.

## Related

[[canvas-rendering-pipeline]] — the render loop this app's tools plug into.

[[text-flatten-and-outline]] — full pipeline behind Stage 12.

[[masks]] — full pipeline behind Stage 13.
