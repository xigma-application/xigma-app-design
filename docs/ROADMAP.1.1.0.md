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
- [x] extended to diagonal placements (matching edge, no overlap): a bridge segment now connects the
      nearest corners across the gap instead of drawing nothing
- [x] extended to same-side matches too (both tops/bottoms/lefts/rights aligned, not just facing edges)

## Stage 6 — Shape alignment snap on move

Dragging a shape now snaps its edges/centre onto other shapes' edges/centres within tolerance,
reusing the vector-edit alignment-guide math (renamed out of its vector-specific naming into shared
`getAlignmentGuide`/`getGroupAlignmentGuide`/`drawAlignmentGuide`). Resize and draw-new-shape snap
are deferred. Write-up: `.claude/docs/selection-and-manipulation.md` §24.

- [x] shared alignment-guide core (no behaviour change) + `getDragAlignmentSnap` move-time snap, e2e

## Stage 7 — Shape alignment snap on resize

Dragging a resize handle now snaps that edge/corner onto other shapes' edges within tolerance too,
reusing §24's same shared core (single-point `getAlignmentGuide`, not the group variant — resize only
ever moves one query point). Skipped for rotated single-node resizes, where the box math already runs
in unrotated local space. Write-up: `.claude/docs/selection-and-manipulation.md` §25.

- [x] `getResizeAlignmentSnap` wired into `getResizeDragFrame`, gated to unrotated single/multi-node
      resizes, e2e

## Stage 8 — Shape alignment snap on draw

Drawing a new shape from scratch now snaps its live free corner onto other shapes' edges within
tolerance too — the third and final leg of the phased snap rollout. Reuses Stage 7's single-point core
unchanged (renamed `getResizeAlignmentSnap` → `getPointAlignmentSnap`, now shared by both), wired into
`useDrawShapeTool`/`useDrawStarTool`/`useDrawPolygonTool`/`useDrawTextTool`. Write-up:
`.claude/docs/selection-and-manipulation.md` §26.

- [x] `getPointAlignmentSnap` wired into all four box-drawing hooks, e2e

## Stage 9 — Snap candidates cached per gesture

`getCandidateShapes` was being recomputed on every `pointermove`/`pointerup` of a move/resize/draw
gesture despite scanning the whole page each time. Now computed once at arm time and cached on the
gesture's own state (`TDragState`/`TResizeDragState`, or a local ref for the draw-tool hooks), not
re-derived until the next gesture starts. No spatial/viewport filtering yet — every eligible node on
the page is still a candidate regardless of distance, matching the rest of this subsystem's hit-testing/
hover/marquee/contact-guide code (a real shared spatial index, mirroring the vector-network crossing
detector's hash-grid, is future work, not started). Write-up:
`.claude/docs/selection-and-manipulation.md` §27.

- [x] `getCandidateShapes` moved from every pointer event to gesture-arm time across all three snap
      call sites

## Stage 10 — Client-side routing removed, single-purpose subdomain app

The app ships behind its own subdomain now, with no multi-route concept to route between —
`react-router` and `src/core/Routing/` are gone, along with the unreachable `HomePage`/`NotFoundPage`
starter-template pages. `components/App/App.tsx` absorbed `pages/DesignPage/DesignPage.tsx` directly;
`src/pages/` no longer exists. Write-up: `.claude/docs/app-shell.md`.

- [x] `CanvasRefsProvider` relocated to `components/App/core/`, `?page=`/`?project=` read via plain
      `window.location.search` instead of React Router hooks, e2e/`useCopyPageLink` updated to match

## Stage 11 — Text on Path: attach to an existing vector or shape

Text on Path no longer only draws a fresh ellipse — clicking an existing eligible vector chain (the
same `getVectorChainOrder(node) !== null` condition Variable Width uses) or a plain convertible
shape (Rectangle/Ellipse/Polygon/Star/Line/Arrow, auto-converted via the existing `Enter`
shape-to-vector machinery) attaches the text to it on the spot, reading from wherever the user
actually clicked rather than always the chain's own start. The bound guide now behaves as one unit
with its text through drag/rotate/resize/mirror, carries along through copy/duplicate/paste, hides
its own stroke while idle (dashed blue on hover/selected/editing), and no longer produces a stray
second selection box. Write-up: `.claude/docs/design-tool-architecture.md`,
`.claude/docs/design-store-architecture.md`, `.claude/docs/selection-and-manipulation.md`,
`.claude/docs/canvas-rendering-pipeline.md`.

- [x] click-to-attach on an eligible vector or a convertible shape, `pathStartOffset` from the click
      point, `text-on-path` hover cursor, still falls back to drag-a-new-ellipse past the attach slop
- [x] guide vector carried as one unit through move/rotate/resize/mirror-resize, dropped from the
      Layers tree, dashed guide shown only on hover/selected/editing instead of always
- [x] guide dropped from `selectedIds` so it can never trigger the group (two-box) selection-outline
      mode instead of the correct per-node rotated outline
- [x] guide cloned alongside its text on copy/duplicate/paste instead of pasting as plain straight text
- [x] fixed `getVectorChainPositionAtLength` snapping text to the wrong end of a segment right after
      a corner when the chain has to walk that segment in reverse to stay continuous

## Stage 12 — Flatten and Outline as stroke for text

Text can now be destructively converted to real vector geometry via opentype.js font-outline
extraction (parsing the bundled Inter TTF at runtime), not just the pre-baked MSDF atlas it renders
from normally. Flatten fuses a whole text node into one vector, matching Figma; Outline as stroke
keeps every letter its own independent vector and groups them instead, also matching Figma, so
individual letters stay selectable/recolorable afterward. Both support text-on-path (bakes the
glyphs, deletes the now-orphaned path node) and both stay available on text unconditionally, since
there's still no properties-panel UI to ever set a real stroke on a text node. Full write-up:
`.claude/docs/text-flatten-and-outline.md`; performance follow-up tracked separately in
ROADMAP.2.0.0.md Stage 2.

- [x] font-outline extraction pipeline (`fontOutline/`): TTF parsing, quadratic→cubic tangent
      upconversion, per-glyph fill/stroke vector builders, and a rigid per-glyph transform for
      text-on-path so the flattened result lines up with the on-path MSDF preview
- [x] fixed a real cusp-collapse regression (glyphs like "(" and ")" rendering as spiked/twisted
      shapes) and a non-determinism bug in the shared DCEL face-derivation search that randomly
      dropped letter faces on multi-character flatten
- [x] Outline as stroke splits each glyph into its own vector and groups them via the same
      select-and-`groupNodes` mechanism a manual multi-select-group gesture uses, instead of fusing
      the whole word — including a shared-pivot rotation bake so a rotated multi-letter group stays
      rigid instead of each letter spinning around its own center
- [x] fixed `rotateVectorNodeOrigin`/`resizeVectorVertices` rounding each vertex independently after
      a rotate or resize, which was distorting flattened glyph curves — same bug class already fixed
      for plain node drag

## Related

[[canvas-rendering-pipeline]] — context for the render loop and the `WEBGL_CONTEXT_ATTRIBUTES`
contract that `resolveColorSampleRequest` is attached to.

[[text-flatten-and-outline]] — full pipeline behind Stage 12: font extraction, per-glyph vector
assembly, and the two destructive commands built on top of them.
