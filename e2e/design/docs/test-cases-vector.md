# Vector — test case catalog

Test cases for the Pen/Pencil tools and Vector Edit Mode (cut, erase, shape builder, variable width, corner radius, vertex count) that live in `e2e/design/vector/`.

## Pencil drawing

Pencil (`ToolName.pencil`, `Shift+P`, shares Pen's dropdown) is a single continuous drag — press,
drag, release — that commits exactly one `TVectorNode` per stroke, unlike Pen's click-by-click
multi-session network. It reuses the existing Vector Edit Mode mechanism unchanged for editing.
Progressive chunked simplification (not one global RDP pass at release) and tangent-magnitude
clamping both fix real, reported curve-fit overshoot on tight loops/sharp reversals; full write-up:
`.claude/docs/pencil-tool.md`.

| #   | Scenario                                                                                                                 | Unit |         E2E         |
| --- | ------------------------------------------------------------------------------------------------------------------------ | :--: | :-----------------: |
| 317 | A single drag draws a visible stroke, and the tool stays active for an immediate second stroke, no reselect needed       |  —   | ✅ `pencil.spec.ts` |
| 318 | A drag too short to clear the minimum shape size is discarded, drawing nothing                                           |  —   | ✅ `pencil.spec.ts` |
| 319 | Shift held mid-drag locks the segment to a straight line and holds it through a direction reversal                       |  —   | ✅ `pencil.spec.ts` |
| 320 | Releasing Shift mid-drag resumes freehand drawing from the locked endpoint, instead of staying constrained               |  —   | ✅ `pencil.spec.ts` |
| 321 | Releasing the mouse button while Shift is still held (no separate Shift-keyup) still commits the axis-locked segment     |  ✅  | ✅ `pencil.spec.ts` |
| 322 | A committed Pencil stroke opens in Vector Edit Mode via double-click, and its vertices drag like an ordinary vector node |  —   | ✅ `pencil.spec.ts` |

#321 is the fixed regression described in `pencil-tool.md` §5: `handlePointerUp.ts` originally read
the tail directly, which the Shift branch of `handlePointerMove` never wrote to, so a stroke ended
by releasing the mouse mid-lock silently drew nothing. Unit-covered directly
(`foldPendingAxisLock.spec.ts`, `handlePointerUp.spec.ts`'s own wiring test) and kept in e2e too,
since it's exactly the kind of real pointerup/keyup-ordering bug a synthetic event can hide.

The tight-loop curve-fit overshoot itself (chunked commit + tangent clamping, `pencil-tool.md` §1-2)
has no dedicated scenario here — it was verified numerically (a standalone deviation-measurement
script, not a browser) rather than via pixel-diff, since no single function's branch captures the
bug; #317-320 exercise the same code paths incidentally.

## Corner radius (Rectangle)

Four draggable handles, one per corner, that round a Rectangle's corners — canvas-only for now, no
side-panel numeric input yet (a separate, later feature). Handles render only while the node is both
selected _and_ hovered (`drawCornerRadiusHandlesLayer.ts`), unlike the resize corner squares which
show on selection alone — and only once the shape's own on-screen size clears
`MIN_ELEMENT_SCREEN_SIZE_FOR_RADIUS_HANDLES_PX` (`shouldShowCornerRadiusHandles.ts`), matching
Figma's own "too small to bother" cutoff. Dragging works absolute-position-based off the grabbed
corner (`getCornerRadiusFromPoint.ts`, mirroring `continueEndpointDrag.ts`'s "write the raw point,
don't accumulate deltas" convention), with `radius = max(leftward/rightward inset, up/down inset)` —
deliberately not requiring diagonal movement, so either axis alone can drive it to max. Once several
corners' handles coincide (radius near/at `getMaxCornerRadius` = half the shorter side), a single
click can't disambiguate which corner was meant; resolution defers to the drag's own first-movement
direction against each candidate's quadrant position (`resolveCornerFromDirection.ts`), settling
once and reusing that pick for the rest of the gesture. At `cornerRadius === 0` the existing resize
corner-handle still wins any hit-test tie (`handlePointerDown.ts`'s
`resizeHandleHit ? null : getCornerRadiusHandleAtPoint(...)` short-circuit).

At rest (not being dragged), `cornerRadius === 0` renders the handle at a "zero-state" screen-space
offset from the corner purely so it stays grabbable — dragging _toward_ `cornerRadius === 0` used to
visibly snap the handle out to that same offset the instant the dispatched radius hit exactly 0,
even while the pointer was still held down near the corner. `drawCornerRadiusHandlesLayer.ts` now
takes an `isDraggingCornerRadius` flag (threaded from `Canvas.tsx`'s own `cornerRadiusDragRef`/
`polygonCornerRadiusDragRef` — lifted out of `useSelectionTool.ts` and passed to both it and
`useCanvasRenderLoop` the same way `hoverRef`/`marqueeRef`/`sliceRef` already are, then dereferenced
per-frame in `startRenderLoop.ts`'s `tick`) that forces `getCornerRadiusHandlePositions.ts`/
`getPolygonCornerRadiusHandlePosition.ts` to use the literal radius (even 0, sitting right on the
corner/vertex) instead of the zero-state fallback while a drag is actually in progress; the
zero-state offset only re-applies once `disarmCornerRadiusDrag.ts`/`disarmPolygonCornerRadiusDrag.ts`
clear the ref on pointer release.

A small but _nonzero_ radius has its own visibility edge case: at rest, `cornerRadius > 0` renders
the handle at its literal position (`radius` world units from the corner/vertex), inset by a fixed
**world** amount that doesn't change with zoom — but the handle's own rendered screen size does stay
constant regardless of zoom, so as you zoom out, the screen-space gap between the handle and the
corner/vertex it sits next to keeps shrinking until the handle visually overlaps that corner (or the
resize handle sitting on it). `shouldShowCornerRadiusHandles.ts` now takes the live `cornerRadius`
and `isDragging` too, gating on **both** the existing shape-size check and a new
`cornerRadius * viewport.zoom >= MIN_RADIUS_HANDLE_GAP_PX` check (reusing the same floor the
zero-state offset already clamps to) — `cornerRadius === 0` is exempt (the zero-state offset already
guarantees a visible gap by construction) and `isDragging` is exempt (mid-drag always tracks the
literal position per the fix above; hiding it while the user is actively holding it would be worse).
Both hit-testing (`getCornerRadiusHandleAtPoint.ts`/`getPolygonCornerRadiusHandleAtPoint.ts`) and
rendering (`drawCornerRadiusHandlesLayer.ts`) read the same gate, so a hidden handle is also
ungrabbable, not just invisible.

| #   | Scenario                                                                                                                                                       | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 115 | Handles render only once the rectangle is both selected and hovered — selected alone shows nothing extra                                                       |  ✅  | ✅ `corner-radius.spec.ts` |
| 116 | Dragging the ne handle purely left (no diagonal movement) alone drives the radius to max                                                                       |  ✅  | ✅ `corner-radius.spec.ts` |
| 117 | Dragging the ne handle purely down (no diagonal movement) alone also drives the radius to max                                                                  |  ✅  | ✅ `corner-radius.spec.ts` |
| 118 | Clicking exactly on the corner still arms the resize handle, not the radius handle, even once cornerRadius is nonzero                                          |  ✅  |             —              |
| 119 | Once several handles coincide near max radius, the drag's first-movement direction picks which corner applies                                                  |  ✅  |             —              |
| 120 | A rounding stored via drag never overshoots a fractional max (e.g. 50.5 on a 101px side) after rounding to the nearest px                                      |  ✅  |             —              |
| 121 | Handles vanish entirely once the shape's on-screen size drops below the visibility threshold, regardless of radius                                             |  ✅  |             —              |
| 127 | Dragging to radius 0 keeps the handle tracking the pointer at the corner mid-drag, only snapping to the zero-state offset once the pointer is released         |  ✅  | ✅ `corner-radius.spec.ts` |
| 128 | A small nonzero radius hides its handle once zooming out shrinks its screen-space gap below the minimum, instead of letting it overlap the corner              |  ✅  | ✅ `corner-radius.spec.ts` |
| 129 | A radius that clears the minimum screen gap keeps showing its handle even when small, and `cornerRadius === 0` is never hidden by this rule regardless of zoom |  ✅  |             —              |
| 134 | Releasing any drag (corner-radius or otherwise) outside the shape, with no further pointer movement, hides its hover outline/handles immediately               |  ✅  | ✅ `corner-radius.spec.ts` |

#118-#121, #129 stay unit-only: each is a precise, already-exact `store.getState()`/direct-function-call
assertion (`handlePointerDown.spec.ts`, `resolveCornerFromDirection.spec.ts`,
`continueCornerRadiusDrag.spec.ts`, `shouldShowCornerRadiusHandles.spec.ts`/
`getCornerRadiusHandleAtPoint.spec.ts`) that a screenshot diff can't meaningfully improve on — per
the "why so few scenarios get e2e coverage" rationale below, none of these turn on real browser
paint timing the way #115-#117 do (a real `pointermove`/`pointerdown` sequence against the real
rendered handle positions actually reaching the grabbed corner and repainting the rounded fill).

#134 was a real, shipped bug in `useHoverHighlight.ts`, not specific to corner radius: its
`handlePointerMove` early-returns unless `event.buttons === 0`, deliberately ignoring pointer moves
while any button is held (so hover doesn't flicker onto other nodes mid-drag) — but nothing ever
re-evaluated hover once a drag ended without a _further_ `pointermove`, so releasing outside a shape
(e.g. dragging a corner-radius handle past the shape's own edge) left the hover outline/handle stuck
showing the pre-drag hover state indefinitely, as if the cursor were still over the shape. Fixed by
also listening for `pointerup` with the exact same handler — pointer capture (`setPointerCapture` on
arm) guarantees `pointerup` still fires on the canvas even with the cursor physically outside the
shape's bounds, and by the time a primary-button `pointerup` fires `event.buttons` is already back to
0, so the existing gate lets it through unmodified. Caught one existing e2e test relying on the
previously-stale behavior incidentally: releasing a corner-radius drag exactly on the resize handle's
own corner point now correctly nulls hover (matching what a plain, undragged hover at that exact spot
already did) rather than keeping the prior corner-radius-handle hover state — fixed by re-hovering the
comparison position explicitly before that test's final screenshot.

## Corner radius (Polygon)

A single draggable handle, at the polygon's fixed top vertex (`getPolygonPoints` always places
vertex index 0 at the apex regardless of `sides`/aspect ratio), that rounds every vertex identically
by one shared `cornerRadius` — unlike Rectangle's 4 independent-looking corners. Same visibility
gate as Rectangle (`shouldShowCornerRadiusHandles`, selected _and_ hovered), but no
collision/candidate resolution is possible since there's only ever one handle, so the drag wiring is
its own small mechanism (`armPolygonCornerRadiusDrag`/`continuePolygonCornerRadiusDrag`/
`disarmPolygonCornerRadiusDrag`) parallel to Rectangle's rather than sharing it. Dragging projects
the pointer onto the fixed vertex→center axis and clamps to `[0, getMaxPolygonCornerRadius]` — the
apothem-based max where adjacent rounded corners just touch and the polygon degenerates into its own
inscribed circle — so "toward center increases, away decreases" falls out of the projection itself
with no direction-resolution step needed.

| #   | Scenario                                                                                                                   | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 122 | The handle renders only once the triangle is both selected and hovered — selected alone shows nothing extra                |  ✅  | ✅ `corner-radius.spec.ts` |
| 123 | Dragging the handle straight down (toward the center) visibly rounds every corner                                          |  ✅  | ✅ `corner-radius.spec.ts` |
| 124 | Dragging past the center and back doesn't misbehave (stays clamped, keeps tracking the pointer)                            |  ✅  | ✅ `corner-radius.spec.ts` |
| 125 | The dispatched radius clamps to `getMaxPolygonCornerRadius`, matching the confirmed Figma apothem values                   |  ✅  |             —              |
| 126 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —              |
| 132 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `corner-radius.spec.ts` |

#125-#126 stay unit-only for the same reason as Rectangle's #118-#121: each is an exact
`store.getState()`/direct-function-call assertion (`getMaxPolygonCornerRadius.spec.ts`,
`continuePolygonCornerRadiusDrag.spec.ts`, `getPolygonCornerRadiusHandleAtPoint.spec.ts`) that
doesn't turn on real browser paint timing the way #122-#124 do. #132 was a real, shipped bug: the
handle-position math ran entirely in local/unflipped space and never applied `flipPoint` to the
result, so a flipped polygon's handle rendered at the pre-flip location, floating off the actual
shape. Fixed by flipping the computed local position forward (`getPolygonCornerRadiusHandlePosition.ts`)
and, symmetrically, un-flipping the pointer position before projecting it during a drag
(`continuePolygonCornerRadiusDrag.ts`) — the same forward/inverse pairing `isPointInPolygon.ts`
already used for hit-testing the shape itself.

## Corner radius (Star)

Same single-handle mechanism as Polygon (`armStarCornerRadiusDrag`/`continueStarCornerRadiusDrag`/
`disarmStarCornerRadiusDrag`, one shared `cornerRadius` applied to every vertex), but the tangent-arc
rounding math (`getRoundedVertexPoints`, shared with Polygon) rounds a star's concave inner vertices
the same way it rounds the convex outer tips — the arc's bisector direction falls out of the vertex
geometry itself, so no convex/concave branch is needed. The handle sits at the rounding arc's own
center, offset from the vertex by `radius / sin(halfAngle)` (`getCornerRadiusHandleSetbackMultiplier`,
also shared with Polygon and matching how Rectangle's corner handles already behave), not on the
rounded boundary itself.

| #   | Scenario                                                                                                                   | Unit |            E2E             |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :------------------------: |
| 127 | The handle renders only once the star is both selected and hovered — selected alone shows nothing extra                    |  ✅  | ✅ `corner-radius.spec.ts` |
| 128 | Dragging the handle toward the center visibly rounds both the outer tips and the inner points                              |  ✅  | ✅ `corner-radius.spec.ts` |
| 129 | Dragging past the center and back doesn't misbehave (stays clamped, keeps tracking the pointer)                            |  ✅  | ✅ `corner-radius.spec.ts` |
| 130 | The dispatched radius clamps to `getMaxStarCornerRadius`                                                                   |  ✅  |             —              |
| 131 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —              |
| 133 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `corner-radius.spec.ts` |

#130-#131 stay unit-only for the same reason as Polygon's #125-#126 above. #133 is the same
shipped-and-fixed bug as Polygon's #132 — see that entry for the root cause and fix.

## Vertex count (Polygon)

A single draggable handle, at the polygon's `sides`-dependent vertex index 1 (the vertex adjacent to
the fixed apex used by the corner-radius handle), that changes the polygon's own `sides` count.
Same visibility gate as corner radius (`shouldShowVertexCountHandle`, selected _and_ hovered, no
`cornerRadius`/`isDragging` params since there's nothing to fade in/out). Unlike corner radius's
distance-based projection, the drag itself (`getVertexCountFromLocalPoint.ts`) snaps to the nearest
of `[POLYGON_MIN_SIDES, POLYGON_MAX_SIDES]` by comparing the pointer's angle from the shape's center
against each candidate count's own target angle (`(2π/count) - π/2`) — the same "toward the fixed
apex increases, past the vertical axis resets to the minimum" feel as corner radius, but angle-based
rather than distance-based, matching how Figma's own tool behaves. Same arm/continue/disarm wiring
shape as corner radius (`armPolygonVertexCountDrag`/`continuePolygonVertexCountDrag`/
`disarmPolygonVertexCountDrag`), and the same forward-flip/un-flip pairing for
`getPolygonVertexCountHandlePosition`/`continuePolygonVertexCountDrag` that corner radius already
uses (see #132 above) — since it's the identical class of bug, mirrored here in unit tests but not
re-verified in e2e beyond the flip case below.

| #   | Scenario                                                                                                                   | Unit |            E2E            |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 135 | The handle renders only once the triangle is both selected and hovered — selected alone shows nothing extra                |  ✅  | ✅ `vertex-count.spec.ts` |
| 136 | Dragging the handle straight up, toward the apex used by the corner-radius handle, increases `sides`                       |  ✅  | ✅ `vertex-count.spec.ts` |
| 137 | Dragging past the vertical axis through the center resets `sides` to `POLYGON_MIN_SIDES` (3)                               |  ✅  | ✅ `vertex-count.spec.ts` |
| 138 | The dispatched count snaps to the candidate whose own target angle is nearest the pointer's angle from the center          |  ✅  |             —             |
| 139 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —             |
| 140 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `vertex-count.spec.ts` |

#138-#139 stay unit-only for the same reason as corner radius's analogous rows above — exact
`store.getState()`/direct-function-call assertions, not real-browser-timing paths.

## Vertex count (Star)

Same single-handle mechanism as Polygon, but the target handle is `points`-dependent vertex index 2
(the next spike's outer tip — vertex index 1 is the concave inner vertex between spikes, which would
be the wrong reference point) and the changed field is `points` instead of `sides`. The angle-based
snapping (`getVertexAngle`/`getVertexCountFromLocalPoint`) doesn't depend on the star's `ratio` at
all — only the outer-vertex geometry matters — so `TStarVertexCountDragState` carries no `ratio`
field, unlike `TStarCornerRadiusDragState`.

| #   | Scenario                                                                                                                   | Unit |            E2E            |
| --- | -------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 141 | The handle renders only once the star is both selected and hovered — selected alone shows nothing extra                    |  ✅  | ✅ `vertex-count.spec.ts` |
| 142 | Dragging the handle straight up, toward the apex used by the corner-radius handle, increases `points`                      |  ✅  | ✅ `vertex-count.spec.ts` |
| 143 | Dragging past the vertical axis through the center resets `points` to `STAR_MIN_POINTS` (3)                                |  ✅  | ✅ `vertex-count.spec.ts` |
| 144 | The dispatched count snaps to the candidate whose own target angle is nearest the pointer's angle from the center          |  ✅  |             —             |
| 145 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold                          |  ✅  |             —             |
| 146 | After a mirroring resize (flipX/flipY), the handle appears at its physically flipped position, not the local/unflipped one |  ✅  | ✅ `vertex-count.spec.ts` |

#144-#145 stay unit-only for the same reason as Polygon's #138-#139 above. Also worth noting: a
4-sided polygon's vertex-count handle (target angle 0°) lands exactly on the resize tool's own east
edge-midpoint handle, so both `handlePointerDown.ts` and `useHoverHighlight.ts` give the
vertex-count handles priority over resize at that coincident point (unit-covered in
`handlePointerDown.spec.ts`/`useHoverHighlight.spec.tsx`; not e2e — no visual difference exists to
screenshot between "resize armed" and "vertex-count armed" until a drag actually starts).

## Ellipse arc / ring (Sweep, Start, Ratio handles)

Three handles on a selected+hovered Ellipse. **Sweep** (`arcEndAngle`, on the perimeter) drags a cut
into the shape. **Start** (`arcStartAngle`, on the perimeter, distinguished from Sweep only by a dot
drawn inside it — Figma calls this the same "Start handle") rotates the whole cut, preserving its
sweep width; it existed as arm/continue/disarm files but was never wired into
`handlePointerDown`/`handlePointerMove`/`handlePointerUp`/`useHoverHighlight`, so dragging it did
nothing and no cursor ever showed — fixed in this pass. **Ratio** (`arcRatio`, rests at dead center
when 0) hollows the shape into a ring; when dragged past the shape's own angular boundary into the
cut-away gap, `arcRatioInverted` flips which of the two wedges is treated as filled (matches Figma:
"drag the Ratio handle into the gap to swap which segment is shown") — `getEffectiveArcAngles`
resolves this by feeding the already-resolved major arc's own `(majorStart, majorStart+majorSweep)`
back through `getEllipseArcMajorArc`, which is the one raw pair whose own resolution is exactly the
complementary arc. Once `arcRatio` reaches its max (1), the ring's inner and outer edges coincide and
the fill has zero area, so `drawEllipseArcRatioGuideArc` traces that collapsed boundary as a curve —
the same role `drawEllipseArcGuideLine`'s straight line plays for a fully cut-away (`majorSweep`
`=== 0`) shape, just curved instead of straight since here the radius is real, only the band's
thickness has collapsed. Sweep/Start's own rest position also shifts to the midpoint of the ring
band (not the outer tip) once `arcRatio > 0`, and their live drag is clamped to that same band
(inner rim to outer rim) instead of sliding from dead center.

| #   | Scenario                                                                                                                  | Unit |           E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 147 | Dragging the Sweep handle cuts a wedge out of the ellipse                                                                 |  —   | ✅ `ellipse-arc.spec.ts` |
| 148 | The Start handle shows the `radius` cursor once a cut exists, and dragging it rotates the whole cut                       |  —   | ✅ `ellipse-arc.spec.ts` |
| 149 | Dragging the Ratio handle hollows a ring out of the (even uncut) ellipse                                                  |  —   | ✅ `ellipse-arc.spec.ts` |
| 150 | Dragging the Ratio handle into the cut-away gap swaps which side is filled, versus the same drag distance into the fill   |  —   | ✅ `ellipse-arc.spec.ts` |
| 151 | The rotate handle is hidden for both extremes — a full circle (`majorSweep === 360`) and a fully cut-away shape (`=== 0`) |  —   |            —             |
| 152 | Sweep/Start rest at the ring band's midpoint once `arcRatio > 0`, instead of the outer tip                                |  —   |            —             |
| 153 | The Ratio guide arc appears only once `arcRatio` reaches 1 on a genuinely cut (not full-circle) shape                     |  —   |            —             |

Unit coverage for this whole section is a known gap as of this pass (tracked separately, not part of
this change) — all four e2e specs above were written and run against the real implementation, so
they're live regression guards regardless. #151-#153 are precise single-formula/single-branch
checks (`getEllipseArcRotateHandlePosition`'s radius formula, the guide-arc trigger condition) better
suited to a future unit test than a screenshot diff, once that unit coverage lands.

## Ratio (Star)

A third Star handle, alongside corner radius (vertex index 0) and vertex count (vertex index 2):
**Ratio** sits on vertex index 1 — the concave inner vertex between the tip and the next spike,
physically between the other two handles on the outline — and drags `ratio` (the inner/outer radius
fraction) between `STAR_MIN_RATIO` (0.001) and `STAR_MAX_RATIO` (1). Its rest position reuses the
same shared `getVertexCountHandlePositionFromVertices` bisector-plus-corner-radius-setback helper the
vertex-count handle uses (just at handle index 1 instead of 2), so it stays pinned to the true vertex
even once a corner radius rounds it — the same "stick to the point" fix `getStarVertexCountHandlePosition`
needed after a stored `cornerRadius` valid for one `points` count went unclamped for another. Unlike
vertex count's angle-snapping, the drag itself is a continuous scalar: `getRatioFromLocalPoint`
projects the pointer onto the fixed axis from center to vertex index 1's own ratio-1 anchor point (an
axis whose direction depends only on `points`, never on the ratio being dragged), then clamps.

| #   | Scenario                                                                                                | Unit |            E2E            |
| --- | ------------------------------------------------------------------------------------------------------- | :--: | :-----------------------: |
| 154 | Dragging the Ratio handle toward its own fixed anchor rounds out the points, changing the shape         |  ✅  | ✅ `vertex-count.spec.ts` |
| 155 | The dispatched ratio is clamped to `[STAR_MIN_RATIO, STAR_MAX_RATIO]` once the pointer over/undershoots |  ✅  |             —             |
| 156 | The handle vanishes entirely once the shape's on-screen size drops below the visibility threshold       |  ✅  |             —             |

#155-#156 stay unit-only for the same reason as the vertex-count handle's analogous rows above —
exact `store.getState()`/direct-function-call assertions, not real-browser-timing paths.

## Pen tool and vector editing

Pen (`ToolName.pen`, shortcut `p`) and its Pencil variant (`ToolName.pencil`, `shift+p`, lives only
in Pen's dropdown — same shared-button/last-used-variant mechanic as Frame/Section above, backed by
its own `lastPenTool` store field) draw a `NodeType.vector` node: a graph of `vertices` connected by
`segments`, each segment optionally carrying a `tangentStart`/`tangentEnd` handle that curves it. A
plain click places a straight-segment vertex; a click-drag places one with an outgoing tangent handle,
curving the segment just placed. Clicking back onto the path's own start vertex closes the loop
(the closing segment can itself be curved, if the vertex just before it was dragged). `Escape` is
staged, one step per press: (1) stop extending — clears the "active" vertex so the rubber-band
preview line disappears, but stays on Pen and stays in vector edit mode; (2) revert the active tool
to Move, still in edit mode; (3) exit vector edit mode entirely. Switching tools mid-draw without
pressing Escape first (e.g. clicking Move directly) leaves the in-progress vertex "stale" — switching
back to Pen resumes extending from it, while an explicit Escape first starts a disconnected fragment
instead. A finished (or abandoned) fragment and a later one clicked elsewhere both extend the _same_
vector node's `segments`/`vertices` map rather than creating a new node, as long as vector edit mode
was never exited in between.

Double-clicking an already-placed vector node (Move tool, nothing else selected) re-enters vector
edit mode for it, rendering per-vertex dots (`drawVectorEditHandlesLayer/`). Tangent handles are
**not** shown by default — a segment's handles only render (and only become hittable/hoverable, via
the same `isVectorSegmentEndpointSelected.ts` predicate both layers share) once one of that segment's
two endpoint vertices is in the _effective_ selected-vertex set — selecting a vertex reveals the
handles of every segment touching it, both its own end and the neighboring vertex's end one hop away,
matching Figma (a branch vertex with several segments reveals a handle pair per segment).
`getOneHopVectorVertexIds.ts` grows that effective set by one further hop, but **only** through a
segment carrying no tangent at all (a plain corner) — a real curve is an opaque boundary the reveal
never crosses, so `A --plain click--> B --curved--> C` selecting `A` reveals `B`–`C`'s handles too,
while a chain of real curves stops exactly at the selected vertex's own two neighbors, no further. A
handle stays visible on its own once directly selected, or if it belongs to the Pen tool's still-active
vertex, even without its parent vertex selected. Dragging a vertex dot moves that vertex; dragging a
(now-visible) tangent handle curves its segment.
A vertex's `vertexHandleModes` entry (`corner`/`smooth`/`symmetric`,
`getMirroredVectorSegments.ts`) controls whether dragging one of its two handles also moves the
other: `symmetric` mirrors using the dragged handle's own new length, `smooth` mirrors using the
other handle's existing length, `corner` never mirrors. Every gesture that creates a vertex's first
real tangent by dragging — `updateVectorHandleDrag.ts` (Pen click-drag) and
`armVectorCornerHandleOnPointerDown.ts` (Ctrl/Cmd-drag out of a plain corner) — tags that vertex
`symmetric`, not `smooth`: a length-only-preserved-on-the-other-side "smooth" mirror was reported
back as a bug (the freshly-dragged handle stretched, the vertex's _other_ handle only rotated to
match, staying short) — see row 177/209 below. Clicking on an edge (not a vertex) with the **Pen
tool** active — either idle or mid-extension — inserts a new vertex there, splitting the segment in
two (`splitVectorSegment.ts`, shared by `startVectorFragment.ts`'s idle-click branch and
`continueVectorNetwork/closeLoopOntoEdge.ts`'s mid-draw branch, which also connects the active vertex
to the new split point, exactly like closing a loop onto an existing vertex — including arming a drag
on that connecting segment, so a click-_drag_ onto the split point shapes its tangent instead of only
ever joining it with a straight line, same as `closeLoopOntoVertex.ts` already did; row 207).
This used to be a Move-tool arm-resolver (`armVectorEdgeInsertOnPointerDown.ts`) that fired regardless
of active tool; moved into the Pen tool's own pointerdown chain and removed from `ARM_RESOLVERS`
entirely to match Figma, where edge-splitting used to be a Pen-only affordance. It's since come back to
the Move tool too, but narrower: hovering anywhere along a segment (still gated by the same wide
`getVectorEdgeAtPoint.ts` edge tolerance the blue hover-highlight already used) reveals an insertion dot
fixed at that segment's own geometric midpoint (`getSegmentMidpoint.ts`, not the cursor's own position
along the curve — direct correction after a first cut that tracked the cursor: "ma być tylko ten który
się pojawia na środku"), switching the cursor to `pen-extend` only once the pointer is precisely over that
dot (`getVectorSegmentMidpointAtPoint.ts`, a `VECTOR_VERTEX_HIT_RADIUS_PX`-radius hit-test mirroring
`getVectorVertexAtPoint.ts`). A plain click precisely on the dot splits the segment and selects the new
vertex there (rows 210–212); a plain click anywhere else on the segment still just selects it, same as
before this feature existed — `armVectorSegmentOnPointerDown.ts` still eagerly selects on press either
way (so a real drag from anywhere on the segment keeps working exactly as before, row 200/201), only
deciding split-vs-stay-selected in `disarmVectorMultiDrag.ts` on release without movement, via a new
`'split-segment'` `TVectorPendingClickAction` variant. A miss-click (empty space) while
editing clears the current point selection and — new since `armVectorMarqueeOnPointerDown.ts` replaced
the old miss-only `armVectorEditMissOnPointerDown.ts` — arms a marquee scoped to the edited network's own
vertices: a plain click with no further movement nets out to "just deselect" (the marquee never
collects anything if the pointer never moves), while a click-drag selects every **vertex** whose point
falls inside the dragged rect (`getVectorPointsInRect.ts` — tangent handles are deliberately excluded from
box-drag selection, since sweeping a box near a curve routinely catches a handle's control point along with
nearby vertices; a single click/shift-click on a handle still selects it directly, per below). This still
never exits edit mode by itself; exiting by click is reserved
for a deliberate **double**-click on empty space (`useVectorEditOnDoubleClick.ts`), which only clears
`vectorEditingNodeId` — the node's own `selectedIds` entry is untouched, so it stays selected (ordinary
resize/rotate handles), just no longer in edit mode. `handleSetSelection.ts` also clears
`vectorEditingNodeId` any time the selection changes to something other than solely the node being edited
(e.g. selecting a different node), so there is no quirk where a previous node's edit handles linger on
screen after that.

Both `selectedVectorVertexIdsRef` and `selectedVectorHandlesRef` (`TCanvasRefs`) are arrays — a vertex or
tangent handle can be part of a multi-selection alongside others of either kind. A **plain** click on a
point still fully replaces the selection with just that one item (clearing the other ref, same
mutual-exclusivity as before); **shift+click** instead toggles that one point into or out of whichever ref
it belongs to, leaving everything else untouched (`toggleSelection.ts`/`toggleVectorHandleSelection.ts`),
so a shift-click sequence can freely mix vertices and handles into one combined selection. Once 2+
**vertices** (and _only_ vertices — see below) are selected, `drawVectorMultiSelectBox.ts` draws a
bounding-box outline over them — clicking inside that box (not on a specific point, not shift-held) arms
a rigid group drag (`vectorMultiDragRef`/`continueVectorMultiDrag.ts`) that translates every selected
vertex and handle by the same pixel delta in one `updateNode` dispatch. **Any tangent handle in the
selection — alone or mixed with vertices — always kills box eligibility** (`isVectorMultiSelectBoxEligible.ts`,
`selectedHandles.length === 0 && selectedVertexIds.length > 1`): a bounding box with independent
resize/rotate semantics has no clean definition for a set of tangent-handle control points the way it
does for vertices, and Figma doesn't have one for this case either. A handle-only (or mixed)
multi-selection can still be dragged — by grabbing one of its own already-selected members directly
(`armVectorGroupDrag.ts`, same rigid group-drag/`continueVectorMultiDrag.ts` translate), never via a box
interior click. `getVectorMultiSelectOrigins.ts` and `getVectorMultiSelectBounds.ts` both resolve a
selected handle's drag-origin/bounds point through the same `getEffectiveTangentStart`/`getEffectiveTangentEnd`
preview fallback (§10-equivalent, see `vector-network.md`) the draw/hit-test code already uses — reading
a raw `segment.tangentEnd` there instead would silently drop or freeze a preview-only handle (one whose
real tangent has never actually been dragged yet) during a multi-drag/bounds computation.

Two gotchas the specs below work around, worth knowing before adding more:

- **Undo/redo shortcuts must use `Control+z`/`Control+Shift+z`, never `ControlOrMeta+z`.** This
  project picks its primary modifier key (`⌘` vs `Ctrl`) at runtime from
  `react-device-detect`'s `isMacOs`, which reads `navigator.userAgent` — and Playwright's built-in
  `devices['Desktop Chrome']` preset always reports a Windows-flavored UA regardless of the host OS,
  so the app always resolves to `Ctrl` in this suite even when it's actually running on a Mac.
  Playwright's `'ControlOrMeta'` alias, by contrast, resolves from the real host OS and sends `⌘` on
  a Mac runner — which the app never listens for here, so the shortcut silently does nothing. This
  matches the plain `'Control'` already used in `selection.spec.ts`.
- **A vector node's whole stroke renders in a brighter "actively editing this vertex" tint once any
  vertex/handle has been grabbed, and that tint is driven by a ref (not undoable store state), so it
  outlives an undo that reverts the vertex's actual position.** A full-canvas (or even whole-shape)
  screenshot comparison back to an untouched "before" capture will spuriously differ for this reason
  alone. Isolate the geometric claim instead: clip to a small region containing only the specific
  point/vertex under test, ideally one with no segment passing through it at all (see
  `dragVectorPoint`'s neighboring-vertex and undo tests below for the pattern), or compare two
  post-interaction captures to each other rather than to a pristine baseline.

| #   | Scenario                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Unit |           E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :----------------------: |
| 157 | Clicking places vertices and extends an open path with straight segments on every click                                                                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 158 | Click-dragging while placing a vertex curves the new segment via a tangent handle                                                                                                                                                                                                                                                                                                                                                                            |  ✅  |     ✅ `pen.spec.ts`     |
| 159 | A drag shorter than `MIN_DRAG_DISTANCE_PX` is still treated as a plain (straight) click                                                                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 160 | The pen preview (rubber-band) line follows the pointer, and a snap indicator appears near the start vertex                                                                                                                                                                                                                                                                                                                                                   |  ✅  |     ✅ `pen.spec.ts`     |
| 161 | Clicking back onto the start vertex closes the loop with a straight closing segment                                                                                                                                                                                                                                                                                                                                                                          |  ✅  |     ✅ `pen.spec.ts`     |
| 162 | Dragging the vertex just before closing stages a curve that also bends the closing segment                                                                                                                                                                                                                                                                                                                                                                   |  ✅  |     ✅ `pen.spec.ts`     |
| 163 | A closed loop renders a different, connected outline than the same vertices left open                                                                                                                                                                                                                                                                                                                                                                        |  ✅  |     ✅ `pen.spec.ts`     |
| 164 | Escape steps through: stop extending → revert tool to Move → exit vector edit mode, one stage per press                                                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 165 | Switching tools mid-draw without Escape leaves the in-progress node directly editable via the Move tool                                                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 166 | Switching back to Pen after leaving mid-draw (no Escape) resumes extending from the stale active vertex                                                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 167 | After finishing one fragment, clicking elsewhere still extends the same vector node's segments, not a new node                                                                                                                                                                                                                                                                                                                                               |  ✅  |     ✅ `pen.spec.ts`     |
| 168 | Pen sits between Rectangle and Text in the toolbar                                                                                                                                                                                                                                                                                                                                                                                                           |  —   |     ✅ `pen.spec.ts`     |
| 169 | Pencil lives only in the Pen dropdown (no top-level icon), and the shared button remembers it as last-used                                                                                                                                                                                                                                                                                                                                                   |  ✅  |     ✅ `pen.spec.ts`     |
| 170 | Pen and Pencil apply distinct cursor classNames while active                                                                                                                                                                                                                                                                                                                                                                                                 |  —   |     ✅ `pen.spec.ts`     |
| 171 | The Pencil tool does not draw anything on the canvas yet (placeholder variant)                                                                                                                                                                                                                                                                                                                                                                               |  ✅  |     ✅ `pen.spec.ts`     |
| 172 | The Pen tool stays active after finishing a network, unlike shape tools which revert to the default tool                                                                                                                                                                                                                                                                                                                                                     |  ✅  |     ✅ `pen.spec.ts`     |
| 173 | Undo steps back through vertex placements one click at a time, redo-equivalent independent references land pixel-equal                                                                                                                                                                                                                                                                                                                                       |  ✅  |     ✅ `pen.spec.ts`     |
| 174 | Double-clicking a vector node enters edit mode; double-clicking empty space exits it again, leaving selection intact                                                                                                                                                                                                                                                                                                                                         |  ✅  | ✅ `vector-edit.spec.ts` |
| 175 | Dragging a vertex dot moves that vertex                                                                                                                                                                                                                                                                                                                                                                                                                      |  ✅  | ✅ `vector-edit.spec.ts` |
| 176 | Dragging an existing tangent handle curves the adjacent segment                                                                                                                                                                                                                                                                                                                                                                                              |  ✅  | ✅ `vector-edit.spec.ts` |
| 177 | Dragging one handle at a vertex whose tangent was click-drag-created also moves its other handle, curving both segments — the vertex is tagged `symmetric` (angle **and** length mirror), not `smooth` (angle only)                                                                                                                                                                                                                                          |  ✅  | ✅ `vector-edit.spec.ts` |
| 178 | Clicking an edge away from its own fixed midpoint with the Move tool selects the segment, same as before this feature existed                                                                                                                                                                                                                                                                                                                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 179 | Clicking empty space in edit mode deselects the active vertex but keeps edit mode open (single click, not double)                                                                                                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 180 | Selecting a different node while still editing one cleanly exits edit mode for the original — no lingering handles                                                                                                                                                                                                                                                                                                                                           |  ✅  | ✅ `vector-edit.spec.ts` |
| 181 | A selected (not editing) vector node still resizes via the ordinary 8-direction handles                                                                                                                                                                                                                                                                                                                                                                      |  ✅  | ✅ `vector-edit.spec.ts` |
| 182 | A selected (not editing) vector node still rotates via the ordinary rotate ring                                                                                                                                                                                                                                                                                                                                                                              |  ✅  | ✅ `vector-edit.spec.ts` |
| 183 | Undo after dragging a vertex restores its previous position                                                                                                                                                                                                                                                                                                                                                                                                  |  ✅  | ✅ `vector-edit.spec.ts` |
| 184 | Dragging a vertex on an already-rotated, not-yet-baked vector node moves only that vertex, not the whole shape                                                                                                                                                                                                                                                                                                                                               |  ✅  | ✅ `vector-edit.spec.ts` |
| 185 | With the Pen tool selected but idle (not extending), clicking an edge splits it and arms the new point for immediate extension                                                                                                                                                                                                                                                                                                                               |  ✅  | ✅ `vector-edit.spec.ts` |
| 186 | With the Pen tool actively extending, clicking an existing edge attaches the in-progress line to it (splitting the edge) and ends the extension                                                                                                                                                                                                                                                                                                              |  ✅  | ✅ `vector-edit.spec.ts` |
| 187 | Shift+click toggles a vertex into the multi-selection, and a second shift+click on it removes it again                                                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `vector-edit.spec.ts` |
| 188 | Shift+click mixes a vertex and a tangent handle into one multi-selection; dragging inside the resulting box moves both together                                                                                                                                                                                                                                                                                                                              |  ✅  | ✅ `vector-edit.spec.ts` |
| 189 | Dragging a marquee over empty space selects every vertex/handle whose point falls inside it, leaving points outside untouched                                                                                                                                                                                                                                                                                                                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 190 | Resuming a vertex after Escape interrupts a curve does not silently reuse the old drag as the next segment's tangent                                                                                                                                                                                                                                                                                                                                         |  ✅  |     ✅ `pen.spec.ts`     |
| 191 | Splitting a curved edge preserves the original curve's shape on both sides — proper De Casteljau subdivision, no kink at the new point                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `vector-edit.spec.ts` |
| 192 | Click-dragging directly on the active vertex (a separate gesture, not while placing it) shapes the tangent for the next segment                                                                                                                                                                                                                                                                                                                              |  ✅  |     ✅ `pen.spec.ts`     |
| 193 | Click-dragging directly on a resumed (non-active) vertex after Escape shapes its outgoing tangent the same way                                                                                                                                                                                                                                                                                                                                               |  ✅  |     ✅ `pen.spec.ts`     |
| 194 | Click-dragging onto an existing vertex to close the loop shapes the closing segment's tangent, instead of only ever closing it straight                                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 195 | A click-drag close reveals both the closing segment's own tangent and the live-dragged handle, unlike a plain closing click                                                                                                                                                                                                                                                                                                                                  |  ✅  |     ✅ `pen.spec.ts`     |
| 196 | Clicking a segment with the Move tool selects it, and Delete removes that segment — an endpoint left with zero remaining segments is pruned as a dangling point, an endpoint still held by another segment stays                                                                                                                                                                                                                                             |  ✅  | ✅ `vector-edit.spec.ts` |
| 197 | Hovering a segment with the Move tool (no button held) highlights it in blue at half opacity, distinct from both neutral and a full selection                                                                                                                                                                                                                                                                                                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 198 | Shift+click toggles a segment into a multi-selection with another segment, and a second shift+click on it removes it again                                                                                                                                                                                                                                                                                                                                   |  ✅  | ✅ `vector-edit.spec.ts` |
| 199 | Shift-selecting a segment also reveals its own tangent handles, even with no vertex of its own separately selected                                                                                                                                                                                                                                                                                                                                           |  ✅  |            —             |
| 200 | Dragging one of several selected segments moves the whole group together, not just the one grabbed                                                                                                                                                                                                                                                                                                                                                           |  ✅  | ✅ `vector-edit.spec.ts` |
| 201 | Dragging directly on an unselected segment selects it and moves it in one gesture, translating only its own two endpoint vertices                                                                                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 202 | Selecting a tangent handle reveals every handle its own vertex would reveal (neighbors plus the opposite one), without marking that vertex's own dot as selected                                                                                                                                                                                                                                                                                             |  ✅  |            —             |
| 203 | The marquee can catch a tangent handle or a segment (via its bounding box, even over a straight segment's own middle), not just vertices                                                                                                                                                                                                                                                                                                                     |  ✅  | ✅ `vector-edit.spec.ts` |
| 204 | A handle caught anywhere in the gesture locks the marquee to handles-only for good — even overriding an already-locked points/segments mode mid-drag, dropping everything else from the selection                                                                                                                                                                                                                                                            |  ✅  |            —             |
| 205 | A point caught in the box always wins over segments, unconditionally (regardless of segment count) and even overriding an already-locked segments-only mode mid-drag                                                                                                                                                                                                                                                                                         |  ✅  |            —             |
| 206 | A point/segment selected right before a marquee gesture starts stays visible/catchable via its tangents for the whole gesture, even though the gesture itself deselects it immediately on pointer-down                                                                                                                                                                                                                                                       |  ✅  |            —             |
| 207 | Click-dragging onto an existing segment while actively drawing (Pen) attaches the in-progress line to it and arms a drag on the connecting segment, so the same click-drag shapes its tangent                                                                                                                                                                                                                                                                |  ✅  | ✅ `vector-edit.spec.ts` |
| 208 | Click-dragging directly on the Pen's active vertex, when it already has a real incoming segment, leaves that segment untouched on a plain drag — only Ctrl/Cmd+drag mirrors into it (row 192's e2e capture already renders the plain-drag gesture's own outgoing effect; row 219 covers the Ctrl distinction)                                                                                                                                                |  ✅  |            —             |
| 209 | Dragging a click-drag-created tangent handle a different distance moves the vertex's other handle the same distance, not just to the same angle — length mirrors, not only rotation                                                                                                                                                                                                                                                                          |  ✅  | ✅ `vector-edit.spec.ts` |
| 210 | Hovering anywhere on a segment with the Move tool shows an insertion dot at its own fixed midpoint, but the cursor only switches to pen-extend once the pointer is precisely over that point                                                                                                                                                                                                                                                                 |  ✅  |            —             |
| 211 | Clicking precisely on a segment's own fixed midpoint with the Move tool splits it and selects the new vertex there, instead of selecting the segment                                                                                                                                                                                                                                                                                                         |  ✅  | ✅ `vector-edit.spec.ts` |
| 212 | Clicking an already-selected segment still splits it (if precisely on its fixed midpoint) rather than leaving the now-stale segment id selected                                                                                                                                                                                                                                                                                                              |  ✅  |            —             |
| 213 | Ctrl/Cmd+clicking a segment (no drag yet) reveals its default straight-line tangent handles on both endpoints without bending it — the click only arms the drag, dragging is what actually shapes the curve                                                                                                                                                                                                                                                  |  ✅  | ✅ `vector-edit.spec.ts` |
| 214 | Ctrl/Cmd+dragging a segment's interior bends it into a curve via its tangents, distinct from a plain (no-Ctrl) drag on the same point, which just moves the whole segment instead                                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 215 | Ctrl/Cmd+hovering an existing vertex shows the segment cursor (pulling a fresh handle), distinct from Ctrl/Cmd+hovering the same segment's own interior (bending it), which shows the bend cursor                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 216 | Shift+click multi-selecting two tangent handles with no vertex in the selection draws no bounding box; dragging one moves the other (even a preview-only one, never dragged for real before) by the exact same pixel delta, not a different derived amount                                                                                                                                                                                                   |  ✅  | ✅ `vector-edit.spec.ts` |
| 217 | Ctrl/Cmd+drag starting where several segments meet close to a shared vertex resolves which one bends by comparing the first real drag direction against each candidate's own direction from that vertex, instead of always picking the first-created segment — deterministic angle math, precisely asserted via `store.getState()` in the unit suite; no rendering/timing stake an e2e capture would add                                                     |  ✅  |            —             |
| 218 | Ctrl/Cmd+drag starting exactly on a corner vertex touched by 2+ segments pulls a fresh handle from whichever segment's own direction matches the first real drag direction, instead of always the first-created one (same angle-candidate mechanism as #217, applied to §9's corner-pull gesture) — deliberately does not merge two vertices that only coincide by imprecise drawing (distinct ids, no shared vertex) into one group; Figma has the same gap |  ✅  |            —             |
| 219 | Click-dragging directly on the Pen's active vertex, when it already has a real incoming segment, only bends that segment when Ctrl/Cmd is held — a plain drag renders differently than a Ctrl/Cmd+drag of the same gesture, since only the Ctrl case mirrors into the already-committed segment (row 208's own data-level assertion, confirmed as a real rendering distinction)                                                                              |  ✅  |     ✅ `pen.spec.ts`     |
| 220 | The multi-select box (2+ selected vertices, no handles) disappears for the entire duration of a group-translate drag started from its own interior, then reappears once the drag releases — distinct from the resize/rotate boxes, which stay visible through their own live drags                                                                                                                                                                           |  ✅  | ✅ `vector-edit.spec.ts` |
| 221 | Hovering within the angle-snap tolerance of horizontal/vertical from the active Pen vertex pulls the rubber-band preview onto the exact axis, rendering pixel-identical to hovering exactly on that axis                                                                                                                                                                                                                                                     |  ✅  |     ✅ `pen.spec.ts`     |
| 222 | A diagonal hover, well outside the angle-snap tolerance, keeps the default blue rubber-band preview instead of the orange snap color a cardinal-direction hover gets                                                                                                                                                                                                                                                                                         |  ✅  |     ✅ `pen.spec.ts`     |
| 223 | Clicking within the angle-snap tolerance commits the new vertex exactly onto the cardinal axis, not the raw cursor position                                                                                                                                                                                                                                                                                                                                  |  ✅  |     ✅ `pen.spec.ts`     |
| 224 | The angle-snap tolerance shrinks past 100% zoom — a hover that snaps at 100% zoom no longer does once zoomed in far enough, so the attraction feels weaker at high zoom instead of staying as forgiving as at/below 100%                                                                                                                                                                                                                                     |  ✅  |            —             |
| 225 | Click-dragging a tangent handle while placing a vertex (Pen tool), within the angle-snap tolerance of horizontal, snaps the handle onto the exact axis relative to the vertex, rendering pixel-identical to dragging exactly on that axis                                                                                                                                                                                                                    |  ✅  |     ✅ `pen.spec.ts`     |
| 226 | Click-dragging that same tangent handle well outside the angle-snap tolerance keeps the default blue instead of the orange snap color                                                                                                                                                                                                                                                                                                                        |  ✅  |     ✅ `pen.spec.ts`     |
| 227 | Dragging an already-committed tangent handle in Vector Edit Mode, within the angle-snap tolerance of horizontal relative to its own vertex, snaps it onto the exact axis, pixel-identical to dragging exactly on that axis                                                                                                                                                                                                                                   |  ✅  | ✅ `vector-edit.spec.ts` |
| 228 | Dragging that same existing tangent handle well outside the angle-snap tolerance keeps the default blue instead of the orange snap color                                                                                                                                                                                                                                                                                                                     |  ✅  | ✅ `vector-edit.spec.ts` |
| 229 | Shift held while clicking a diagonal point hard-constrains the new vertex to the nearest 15deg increment, even at an angle the plain (no-Shift) snap ignores entirely                                                                                                                                                                                                                                                                                        |  ✅  |     ✅ `pen.spec.ts`     |
| 230 | Shift held while dragging a tangent handle while placing a vertex (Pen tool) hard-constrains it to the nearest 15deg increment, differing from the identical drag without Shift                                                                                                                                                                                                                                                                              |  ✅  |     ✅ `pen.spec.ts`     |
| 231 | Shift held while dragging an already-committed tangent handle in Vector Edit Mode hard-constrains it to the nearest 15deg increment, differing from the identical drag without Shift                                                                                                                                                                                                                                                                         |  ✅  | ✅ `vector-edit.spec.ts` |
| 232 | Pressing Shift immediately re-evaluates the rubber-band preview (Pen tool, no active drag), snapping it without any further pointer movement — a real browser keydown-timing behavior a unit test can't observe                                                                                                                                                                                                                                              |  ✅  |     ✅ `pen.spec.ts`     |
| 233 | Pressing Shift immediately re-evaluates an in-progress tangent-handle drag while placing a vertex (Pen tool), without needing the pointer to move again                                                                                                                                                                                                                                                                                                      |  ✅  |     ✅ `pen.spec.ts`     |
| 234 | Pressing Shift immediately re-evaluates an in-progress drag on an already-committed tangent handle in Vector Edit Mode, without needing the pointer to move again                                                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 235 | Placing a new vertex (Pen tool) near a vertex on a completely separate shape snaps it onto that vertex's row/column (smart alignment guide), pixel-identical to placing it exactly there                                                                                                                                                                                                                                                                     |  ✅  |     ✅ `pen.spec.ts`     |
| 236 | Dragging an existing tangent handle (Vector Edit Mode) near a vertex on a completely separate shape snaps it onto that alignment guide, pixel-identical to dragging exactly there                                                                                                                                                                                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 237 | Dragging an existing single vertex (Vector Edit Mode) near a vertex on a completely separate shape snaps it onto that alignment guide, pixel-identical to dragging exactly there                                                                                                                                                                                                                                                                             |  ✅  | ✅ `vector-edit.spec.ts` |
| 238 | Box-dragging several selected vertices together snaps the whole group by the same correction once any ONE of them touches an alignment guide, keeping the group rigid — pixel-identical to dragging exactly onto it                                                                                                                                                                                                                                          |  ✅  | ✅ `vector-edit.spec.ts` |
| 239 | The Lasso tool (activated via its "Q" shortcut) selects every vertex whose point falls inside a freeform, multi-point drawn loop, leaving points outside untouched                                                                                                                                                                                                                                                                                           |  ✅  | ✅ `vector-edit.spec.ts` |
| 240 | Starting a Lasso drag directly on top of an UNselected existing vertex still starts a lasso stroke instead of dragging that vertex — Lasso only yields the click when the hit element is already part of the current selection (row 262)                                                                                                                                                                                                                     |  ✅  | ✅ `vector-edit.spec.ts` |
| 241 | The Lasso fill renders a uniform translucent overlay over empty canvas while the stroke is still being drawn, not the page's own checker background bleeding through a torn alpha channel — regression check: `drawVectorFill.ts`'s composite pass re-enabled alpha writes, letting a translucent fill punch through the canvas's own locked-opaque alpha channel; only observable mid-drag, since the next frame's background repaint self-heals it         |  ✅  | ✅ `vector-edit.spec.ts` |
| 242 | The Paint tool (activated via its "Shift+B" shortcut) fills a clicked face with the node's fill color and removes the fill again on a second click of the same face — a real WebGL stencil-fill render only e2e can observe                                                                                                                                                                                                                                  |  ✅  | ✅ `vector-edit.spec.ts` |
| 243 | Paint correctly fills all 3 regions of a curved network self-crossing a triangle at two points on the same curve, without the render loop throwing — regression check for the De Casteljau tail-tangent-scaling bug (a curve split at 2 crossings) and empirical proof deriveVectorFaces' seenFaceKeys dedup guard never fires even on this shape                                                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 244 | Pressing Escape after a click-drag-staged tangent (Pen tool) clears its preview line/diamond handle immediately, with no pointer move required first — regression check: the preview lives in a plain ref written only by the canvas's own pointermove handler, so Escape's Redux dispatch alone left it stale on screen until the next real pointermove happened to overwrite it                                                                            |  ✅  | ✅ `vector-edit.spec.ts` |
| 245 | Dragging a vertex onto another vertex of the SAME shape, within merge tolerance, switches the cursor to the dedicated merge affordance mid-drag and, on release, merges the two into one — the shared edge between them collapses (self-loop dropped) instead of surviving as a zero-length segment                                                                                                                                                          |  ✅  | ✅ `vector-edit.spec.ts` |
| 246 | Dragging a vertex of one vector shape onto a vertex of a completely separate shape merges the two shapes into a single node — the dragged-from shape survives and absorbs the other's whole vertex/segment graph, the absorbed shape is deleted outright, and Vector Edit Mode stays open on the surviving shape                                                                                                                                             |  ✅  | ✅ `vector-edit.spec.ts` |
| 247 | Selecting Bend from `VectorEditToolbar` makes a plain (no-Ctrl) segment drag bend it, rendering pixel-identical to the existing Ctrl/Cmd+drag gesture on the same points — Bend now works as a real, persistent tool, not just a modifier                                                                                                                                                                                                                    |  ✅  | ✅ `vector-edit.spec.ts` |
| 248 | Holding Ctrl/Cmd while Move is the active tool visually flips `VectorEditToolbar`'s highlighted button from Move to Bend with no change to the real active tool, reverting on release; the persistent Bend selection (row 247) is unaffected by Ctrl either way — pure toolbar UI state with no rendering/timing stake beyond what `VectorEditToolbar.spec.tsx`'s real component render + window keydown/keyup already asserts precisely                     |  ✅  |            —             |
| 249 | A painted face on a shape survives a cross-shape vertex merge that absorbs and deletes that shape — regression check for `mergeVectorVertices.ts` silently dropping the absorbed node's `filledFaceKeys`, live-reported after a merge made a previously-painted face vanish                                                                                                                                                                                  |  ✅  | ✅ `vector-edit.spec.ts` |

## Multi-vector edit (Phase 1 — several open nodes at once)

Several `NodeType.vector` nodes can be open for editing simultaneously (`vectorEditingNodeIds:
string[]`, entered by selecting 2+ vectors and pressing Enter). They never structurally connect
on their own — only an explicit gesture (drag-to-merge, or a Pen click landing on another open
node) does. Full scenario log, including branch-logic paths already pinned down by the unit
suite and not repeated here, lives in `__test-cases__/multi-vector-edit.test.md`.

| #   | Scenario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Unit |              E2E               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: | :----------------------------: |
| 250 | Selecting two vector nodes and pressing Enter opens both for editing at once — real handles rendered on both, `vectorEditingNodeIds` holds both ids                                                                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 251 | Dragging a vertex on one open node moves only that node — the sibling open node's own geometry is untouched, proving cross-node hit-testing actually resolves to the right owner                                                                                                                                                                                                                                                                                                                       |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 252 | A marquee drawn across two open nodes catches vertices from both (union, not pick-one), leaving vertices outside the box on either node untouched                                                                                                                                                                                                                                                                                                                                                      |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 253 | Deleting vertices selected across two open nodes removes both in one gesture, grouped by owning node, and a single Undo restores both — one history gesture, not two                                                                                                                                                                                                                                                                                                                                   |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 254 | Pressing Escape while two nodes are open exits editing for both at once, not one at a time                                                                                                                                                                                                                                                                                                                                                                                                             |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 255 | Clicking exactly on another open node's vertex with the Pen tool performs a real structural merge (absorb-and-delete, reusing §46's merge semantics) — not just a visual coincidence of coordinates                                                                                                                                                                                                                                                                                                    |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 256 | Clicking on another open node's segment (not a vertex) with the Pen tool splits that segment and merges the two nodes into one, same as row 255 but via `splitVectorSegment`                                                                                                                                                                                                                                                                                                                           |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 257 | Hovering another open node's vertex or segment with the Pen tool shows the snap/extend cursor and rubber-band preview before any click — the same affordance same-node hovering already gets                                                                                                                                                                                                                                                                                                           |  ⏳  | ✅ `multi-vector-edit.spec.ts` |
| 258 | Clicking genuinely blank canvas with the Pen tool while several nodes are open creates an independent new vector ("vector C") — the other open nodes are left completely untouched, no stray contour tacked onto either one                                                                                                                                                                                                                                                                            |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 259 | The Paint tool fills a face on the second, non-primary open node, not just the first (`vectorEditingNodeIds[0]`) — a real WebGL stencil-fill render only e2e can observe                                                                                                                                                                                                                                                                                                                               |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 260 | The multi-select box spans two open nodes at once (marquee across both) and dragging its interior moves every vertex on both nodes by the same real-pointer-drag delta, in one grouped dispatch                                                                                                                                                                                                                                                                                                        |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 261 | Selecting a single segment (not its own vertices) makes the multi-select box eligible, and dragging the box moves both of the segment's endpoints together                                                                                                                                                                                                                                                                                                                                             |  ✅  | ✅ `multi-vector-edit.spec.ts` |
| 262 | Starting a Lasso drag directly on top of an ALREADY-selected vertex moves the whole selection (all vertices the lasso just caught) instead of clearing it and starting a new lasso stroke — fixes a real reported bug where Lasso unconditionally intercepted every pointerdown, making a lasso-selected group impossible to move without switching tools first                                                                                                                                        |  ✅  |    ✅ `vector-edit.spec.ts`    |
| 263 | A painted square keeps its fill, unchanged, after a single-vertex drag turns it self-intersecting ("bowtie") — `filledFaceKeys` holds a piece-identity key (`getVectorPieceBoundaryKeys.ts`) anchored to each piece's own two stable boundaries (real vertices, or crossings identified by which other real segment they border) rather than a key derived from the current planarization, so the exact same stored key resolves before and after the drag with no remap step and no sliver limitation |  ✅  |    ✅ `vector-edit.spec.ts`    |
| 264 | A painted region bounded by a multiply-crossed segment's middle piece (an {8/3} star's small central octagon, each of its 8 segments crossed several times) stays resolvable after a drag changes which segments a piece's boundary crossings border — the case that broke the earlier "whole real segment id" identity scheme entirely (it could only resolve a segment crossed at most once)                                                                                                         |  ✅  |    ✅ `vector-edit.spec.ts`    |

## Cut tool (Split + Divide)

`ToolName.cut` ('x' shortcut) offers two gestures on the same drag: a plain click (no drag past the
threshold) severs a segment/vertex in place without creating a new node ("Split"); a real drag past
the threshold divides the network along that line into separate nodes ("Divide"). Full scenario log,
including the live-reported bugs behind rows 267–269 below, lives in `__test-cases__/vector-cut.test.md`.

| #   | Scenario                                                                                                                                                                                                                                                                                                                   | Unit |          E2E           |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------: |
| 265 | Pressing 'x' switches the active tool to Cut; with no node open for editing, a real Cut drag over a shape is a no-op (the tool switch itself doesn't gate on Vector Edit Mode — `armVectorCutOnPointerDown` does, on `pointerdown`)                                                                                        |  ✅  |    ✅ `cut.spec.ts`    |
| 266 | Split: a plain click (no drag) on a segment severs it in place — no new node, the two new open ends sit at the same point with no shared vertex                                                                                                                                                                            |  ✅  |    ✅ `cut.spec.ts`    |
| 267 | Split: clicking exactly on a branch vertex (3+ segments) detaches only the clicked segment, leaving the other two attached to the original vertex                                                                                                                                                                          |  ✅  |    ✅ `cut.spec.ts`    |
| 268 | Divide: a real drag that both starts and ends outside the shape's contour on both sides (not touching either edge) splits a filled square into two independently-filled halves — the reported case that first surfaced this whole area's bugs                                                                              |  ✅  |    ✅ `cut.spec.ts`    |
| 269 | Divide: a line that misses the shape entirely, or crosses only one edge of a closed triangle (its other two edges still bridge the severed point), leaves it completely untouched — still one connected node                                                                                                               |  ✅  |    ✅ `cut.spec.ts`    |
| 270 | Divide: cutting an unfilled shape leaves both resulting halves unfilled — `addCutClosingSegment` no-ops instead of adding a closing segment                                                                                                                                                                                |  ✅  |    ✅ `cut.spec.ts`    |
| 271 | Regression: cutting a shape with 3+ adjacent painted faces keeps every fill, including a middle face bounded by segments shared with two neighbors — `addCutClosingSegment` used to pair newly-severed open ends globally by line position and silently drop whichever face's pair landed on the skipped alternating slot  |  ✅  |    ✅ `cut.spec.ts`    |
| 272 | Regression: cutting an already-cut piece a second time still keeps its fill — a crossing on a once-severed segment (fragment id like `s2#1`) failed to match its original face's base segment id, dropping the fill on both new pieces                                                                                     |  ✅  |    ✅ `cut.spec.ts`    |
| 273 | Regression: a face painted across a Pen-drawn line crossing an existing shape keeps its fill after a later Cut through it — the crossing only ever existed virtually (render-time planarization), never persisted as a real vertex, so a later Cut had no idea the two paths ever related at that point                    |  ✅  |    ✅ `cut.spec.ts`    |
| 274 | A single Undo after a Divide cut restores the original filled node in one step                                                                                                                                                                                                                                             |  ✅  |    ✅ `cut.spec.ts`    |
| 275 | With two nodes open for editing at once, a Divide drag whose line crosses only one of them touches just that one — the sibling node is left byte-identical, and its own id is reused for one of its resulting pieces (not deleted)                                                                                         |  ✅  | ✅ `cut-multi.spec.ts` |
| 276 | One Divide drag whose line crosses both open nodes at once produces 4 resulting pieces total (2 per shape), all left open for editing, all correctly filled                                                                                                                                                                |  ✅  | ✅ `cut-multi.spec.ts` |
| 277 | A single Undo after one drag that cut both open nodes reverts both back to their original single-piece state at once — one history gesture, not two                                                                                                                                                                        |  ✅  | ✅ `cut-multi.spec.ts` |
| 278 | Divide: a cut that doesn't disconnect the shape into separate pieces still cuts it — every crossing genuinely severs into two disconnected points (Figma-style, matching Split), never a shared pass-through vertex, so each piece can be dragged independently                                                            |  ✅  |    ✅ `cut.spec.ts`    |
| 279 | Divide: a chord that cleanly divides one face of a multi-face node gives both new independent pieces their own fill, Figma-style, even though the crossed segments are genuinely severed — the untouched-looking sibling face loses its own fill instead, since its boundary edge was severed with nothing on the far side |  ✅  |    ✅ `cut.spec.ts`    |
| 280 | Divide: an isolated crossing (drag enters a face but never crosses back out) leaves any genuinely untouched sibling face's fill key byte-identical, while the touched face's own fill is gone                                                                                                                              |  ✅  |    ✅ `cut.spec.ts`    |
| 281 | Divide: on a 3-band node, a cut that cleanly splits only the top band leaves a genuinely untouched third (bottom) band's fill key byte-identical, while the middle band — never entered directly, but collaterally severed at its shared boundary with the top band — loses its own fill                                   |  ✅  |    ✅ `cut.spec.ts`    |

## Vector Edit Mode — live fill highlight during vertex/segment drag

While dragging a single vertex or a whole segment (both endpoints) in Vector Edit Mode, any
currently-filled face touching the dragged vertex/vertices is now hatch-highlighted live, every
frame, as a visual cue for which fill is about to be affected — the same
`drawVectorHatchFill.ts` primitive the Paint tool's own hover-highlight already uses
(`drawVectorPaintHoverPreview.ts`), just driven by the active drag's vertex ids
(`getVectorFilledFacesTouchingVertexIds.ts` / `getVectorDraggedFillFaces.ts`) instead of pointer
hover. `draggedVectorFillFacesRef` (`TCanvasRefs`) is set once when the drag is armed
(`selectAndArmVectorVertexDrag.ts` for a single vertex, `armVectorMultiDrag.ts` for a segment or
any other multi-vertex drag) and cleared on release (`disarmVectorVertexDrag.ts`,
`disarmVectorMultiDrag.ts`); the drag's own vertex-position updates are unaffected (already
dispatched live on every pointermove, as before).

| #   | Scenario                                                                                                | Unit |                                                       E2E                                                       |
| --- | ------------------------------------------------------------------------------------------------------- | :--: | :-------------------------------------------------------------------------------------------------------------: |
| 285 | Dragging a filled face's vertex/segment live-highlights that face; releasing clears the highlight again |  ✅  | — (see rationale below; same as the Paint tool's own hover-highlight, §"Why so few scenarios get e2e coverage") |

## Cut tool — pink hover preview, cursor, and a newly-severed vertex's own pink mark

Split's plain-click hit preview and its live crossing markers reuse the same white-center/pink-border
style as a plain unselected vector vertex (`drawVectorCutPointMarker.ts`); the whole hovered segment
gets a full-length pink outline (`drawVectorCutHoverPreview.ts`), suppressing the generic blue
highlight for Cut specifically (`resolveVectorSegmentHover.ts`). The cursor is `cut-off` any time Cut
is active and idle (forced every idle move by `resolveVectorCutHover.ts`, so no other resolver's
cursor leaks through) and `cut-on` for the whole duration a button is held
(`armVectorCutOnPointerDown.ts` → `disarmVectorCutDrag.ts`).

Separately: a vertex a Split/Divide just severed renders in that same pink (a solid pink dot at rest,
matching a plain unselected vertex's own size/style exactly — just recolored) until the user selects
it and then deselects it again, tracked via `newVectorCutVertexIdsRef`/`touchedVectorCutVertexIdsRef`
and consumed by `resolveVectorCutMarkConsumption.ts` (run on every pointermove **and** on every
pointerup, so a drag-then-deselect consumes immediately rather than waiting on an incidental later
mouse move); two vertices severed at the exact same point (a Split's own pair) consume together, since
the user can only ever click one of them. Exiting Vector Edit Mode entirely clears every mark.
Completing an actual cut (Split or a Divide that found something to cut) now also hands control back
to the Move tool (`disarmVectorCutDrag.ts`, gated on `commitVectorDivide.ts`'s own now-`boolean`
return value so a Divide drag that crossed nothing leaves the tool alone).

| #   | Scenario                                                                                                                                                                                                                              | Unit |       E2E        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------: |
| 287 | A newly cut-severed vertex renders pink until selected-then-deselected (screenshot pixel-sampled, since the mark lives only in a canvas ref, invisible to `store.getState()`); completing the cut hands control back to the Move tool |  ✅  | ✅ `cut.spec.ts` |

## Split now tears into two nodes when it genuinely disconnects the network

A Split never adds connectivity, only removes it — a closed loop survives one severed edge as a
single open chain (the remaining edges still bridge it), but severing a _second_ edge that shares no
vertex with the first cuts that chain into two genuinely disconnected pieces, same as Divide already
did. `commitVectorSplit.ts` now runs the severed network through `splitVectorNetworkIntoComponents`
(reused from Divide, §53) and, when it finds ≥2 components, commits them as separate nodes via
`commitVectorCutComponents` (also reused from Divide) instead of the old single-`updateNode` path.
Fill is resolved per component via `resolveSurvivingFilledFaceKeys` alone (no closing chord — a Split
has no drag line to add one along), so a loop cut open on two sides genuinely loses its fill on both
halves. Baking to world-space rotation is conditional: only the rare multi-node branch bakes and
resets `rotation: 0` (matching Divide's own convention); the ordinary single-piece Split stays
unbaked, exactly as before. `disarmVectorCutDrag.ts` also now updates `vectorEditingNodeIds` to
include any brand-new sibling node, and `markNewVectorCutVertices.ts` was rewritten around a global
before/after vertex-id diff (rather than per-node-id matching) so that sibling's own new vertices get
pink-marked too — a gap that previously existed for Divide's own multi-node case as well, just never
surfaced.

| #   | Scenario                                                                                                                                                                                                       | Unit |       E2E        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------: |
| 288 | Split: severing a second, opposite edge of a closed loop with nothing left to bridge the two halves tears it into two separate nodes, pink-marking each side's own new vertex, with both left open for editing |  ✅  | ✅ `cut.spec.ts` |

## Click-to-select a filled face's vertices (Move tool)

Clicking inside an already-filled face with the Move tool now selects every one of its vertices at
once (`getVectorFaceVertexIds.ts` parses the face's `pieceKeys`), replacing the current selection;
shift-click unions a second face's vertices in instead of replacing, and also arms the group drag
immediately (`armVectorGroupDrag.ts`, `pendingClickAction: null`) so a single continuous click-drag
moves the selection with no separate warm-up click required first — both asked for directly after a
live pass surfaced them. Hovering a filled face with the Move tool shows the same blue hatch
(`DRAFT_FRAME_STROKE`) as the Paint tool's own "would add" hover, and any filled face whose entire
vertex set is currently selected stays hatched permanently, not just on hover
(`drawVectorSelectedFillPreview.ts`, re-derived every frame). Full write-up:
`.claude/docs/vector-network.md` §56.

| #   | Scenario                                                                                                                                                                                                                                            | Unit |           E2E            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 289 | Clicking a filled face selects all its vertices and arms the drag immediately — one continuous click-drag moves it, no separate second gesture required first                                                                                       |  ✅  | ✅ `vector-edit.spec.ts` |
| 290 | Shift-clicking a second, adjacent filled face keeps its shared divider vertices selected, so a later group drag moves the divider along with the rest of the shape instead of leaving it behind (regression: a per-vertex toggle used to drop them) |  ✅  | ✅ `vector-edit.spec.ts` |

## Vector Edit Toolbar — "More" menu (Shape builder / Variable width)

The floating VectorEditToolbar's "More" slot starts as a plain "More" label + chevron (a
`Popover`, opening upward via `side="top"` since the toolbar itself floats near the bottom of the
canvas). Picking Shape builder or Variable width from it (or via their own shortcuts, `M` /
`Shift+W`) dispatches a real `setActiveTool` and remembers the pick in `lastMoreTool` — same
"remember the last tool used in this group" mechanic as `lastShapeTool`/`lastFrameTool`, mirrored
in `handleSetActiveTool.ts`. Once a tool has been picked, the "More" slot permanently swaps to that
tool's own icon button (blue when active, matching every other VectorEditToolbar button) plus a
small separate chevron trigger beside it for reopening the dropdown — the same
icon-button-plus-dropdown-chevron shape as the main Toolbar's `MouseModes`/`ToolDropdown` pair.
`lastMoreTool` resets to `null` on exiting Vector Edit Mode entirely (`handleSetVectorEditingNodeIds.ts`,
whenever the next id list is empty), so a later Vector Edit session starts back at the plain "More"
label rather than remembering the previous session's pick.

| #   | Scenario                                                                                                        | Unit |                  E2E                  |
| --- | --------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------------------: |
| 291 | Picking Shape builder from the More dropdown swaps its label for the tool's own icon button and activates it    |  ✅  | ✅ `vector-edit-more-toolbar.spec.ts` |
| 292 | The "M" / "Shift+W" shortcuts activate Shape builder / Variable width and update which icon the More slot shows |  ✅  | ✅ `vector-edit-more-toolbar.spec.ts` |
| 293 | Closing Vector Edit Mode resets the More slot back to its plain label, even after a tool was picked             |  ✅  | ✅ `vector-edit-more-toolbar.spec.ts` |

## Shape Builder (freeform merge/subtract of vector faces)

Figma-style Shape Builder: a freeform (or Shift-held box) drag over one or more vector faces
deletes the boundary segment(s) between the faces it touches and fills the resulting union; a
plain click (no drag) works the same way on a single face; Alt+drag/click subtracts instead —
deleting only the touched face's own _exclusive_ boundary (segments not shared with an untouched
neighbor), so a face fully enclosed by other faces is un-filled with its shared edges intact, while
an isolated face with nothing to protect has its whole boundary deleted along with its fill.
Disconnected sub-networks never need special-casing: a segment can only be "interior"/"exclusive"
relative to faces it actually borders, and two faces in different components never share one, so one
drag spanning several unrelated shapes merges each independently for free. Full write-up:
`.claude/docs/vector-network.md` §59 (feature) and §60 (a piece-identity resolver gap this feature's
mid-segment deletions exposed). E2E here specifically targets real-browser modifier-key threading
(Alt/Shift reaching the pointer gesture through actual `KeyboardEvent`/`PointerEvent` state, not a
synthetic unit-test event) and the two live-caught regressions below, both of which unit tests alone
had already pinned down at the pure-function level (`mergeVectorFaces`/`subtractVectorFaces` specs)
but had escaped a full real-gesture run once, per [[xigma-e2e-coverage]]'s standing rule for
modifier-key-dependent canvas behavior.

| #   | Scenario                                                                                                                                            | Unit |                E2E                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------------: |
| 294 | A freeform drag across a split rectangle's two halves merges them into one face, deleting the shared divider segment                                |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 295 | A plain click fills a single unfilled face; Alt+click on that same isolated face deletes its whole boundary, since it has no neighbor to protect    |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 296 | Alt+click subtracts a face by deleting only its own exclusive boundary, leaving the segment shared with an untouched, still-filled neighbor intact  |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 297 | Holding Shift while dragging still merges via a box hit-test instead of the freeform path, proving the real modifier reaches the gesture            |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 298 | Regression: dragging across two overlapping (crossing) rectangles merges all 3 resulting regions into one face, not 3 separate fills                |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 299 | A single drag spanning two disconnected split rectangles merges each one's own halves independently, without joining the two shapes into each other |  ✅  | ✅ `vector-shape-builder.spec.ts` |

## Nested/overlapping face hit-testing (Paint, Move click-select-face)

Reported directly: draw a rectangle, then a second one inside it, Paint the inner one — it filled
the outer square instead. Root cause and fix (smallest-area-wins instead of first-match) documented
in `.claude/docs/vector-network.md` §61. Two levels of the same bug, both fixed at their shared choke
point: two loops nested within one node (`getVectorFaceAtPoint`) and two separate open nodes
overlapping on screen (`getVectorFaceAtPointAcrossOpenNodes`) — the latter's e2e case opens both
nodes via a direct `setVectorEditingNodeIds` dispatch rather than the usual click-shift-click-Enter
flow, since every corner of the inner node sits inside the outer node's bounds too, making a
_selection_ click exactly as ambiguous as the _paint_ click actually under test.

| #   | Scenario                                                                                                                                           | Unit |              E2E               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------------: |
| 300 | Paint on a rectangle drawn inside another rectangle (same node) fills the smaller, innermost face, not the outer one it also sits inside           |  ✅  |    ✅ `vector-edit.spec.ts`    |
| 301 | Paint across two separate open nodes whose shapes overlap on screen fills the smaller, topmost node's face, not the bigger one it also sits inside |  ✅  | ✅ `multi-vector-edit.spec.ts` |

## Shape Builder across two genuinely different (crossing) vector nodes

Requested directly, with a screenshot: two separate rectangles, drawn as two independent vector
nodes, overlapping on screen. Shape Builder already spanned every open node for hit-testing, but
treated each touched node independently — a drag over the overlap only ever merged/filled each
node's own whole, unsplit rectangle. Fixed by materializing the crossing between the two nodes' own
segment sets (reusing the fully generic `planarizeVectorNetwork`/`persistVectorNetworkCrossings`) and
folding the crossing pair into one surviving node, deleting the other — same shape as the existing
vertex-drag node merge (§46), just triggered by genuine boundary-crossing instead of a coincident
vertex. Live-caught, shipped-and-fixed one step later, from two more screenshots: grouping only over
_touched_ nodes silently treated a touched node's untouched crossing neighbor as nonexistent —
Alt-clicking only one shape's own exclusive corner deleted its neighbor's shared chord instead of
protecting it, since the untouched neighbor was never even considered for grouping. Fixed by
resolving every currently-open node (not just the touched ones) before grouping. Full write-up:
`.claude/docs/vector-network.md` §62.

| #   | Scenario                                                                                                                                                                                 | Unit |                E2E                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-------------------------------: |
| 302 | Dragging across two genuinely overlapping, separate open nodes merges them into one — the survivor absorbs the other, deleted from rootOrder and vectorEditingNodeIds                    |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 303 | Alt+drag across two overlapping, separate open nodes subtracts only the crossing sub-region, still combining the pair into one node since the crossing had to be materialized either way |  ✅  | ✅ `vector-shape-builder.spec.ts` |
| 304 | Alt+click on only one shape's own exclusive corner — never touching the untouched, crossing neighbor at all — still protects the shared chord instead of treating that shape as isolated |  ✅  | ✅ `vector-shape-builder.spec.ts` |

## Variable Width (width points, drag gestures, eligibility gate)

Figma-style variable-thickness stroke: a click on the bare path of a single, non-branching vector
chain adds a width point (two draggable diamonds, one per side); dragging a diamond resizes the
stroke there, dragging the point itself repositions it along the path. `position` is stored as a
fraction of the whole chain's arc length, so it stays pinned through a stretch and intentionally
shifts when the chain is lengthened. The toolbar/dropdown eligibility gate (exactly one edited node,
itself a non-branching chain) now also covers the `Shift+W` keyboard shortcut, which previously
bypassed it entirely. Full write-up: `.claude/docs/vector-network.md` §63.

| #   | Scenario                                                                                                                                | Unit |                E2E                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | :--: | :--------------------------------: |
| 305 | Clicking the bare stroke at two different points adds two distinct width points, each pinned at the correct fraction of the whole chain |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 306 | Selecting a freshly added width point shows its pink value-label overlay; clicking away deselects it while the point itself stays       |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 307 | Stretching a segment by dragging its endpoint keeps an existing width point pinned to the same relative fraction, moving it on screen   |  —   | ✅ `vector-variable-width.spec.ts` |
| 308 | An edit that branches the network discards the node's width profile and disables the Variable Width option again                        |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 309 | Editing two separate nodes at once disables Variable Width (dropdown item is a no-op); merging them into one via Pen re-enables it      |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 310 | The `Shift+W` shortcut does not activate Variable Width when no node is being edited at all                                             |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 311 | The `Shift+W` shortcut does not activate Variable Width when two nodes are being edited simultaneously, even if both are eligible alone |  ✅  | ✅ `vector-variable-width.spec.ts` |
| 312 | The `Shift+W` shortcut does activate Variable Width when exactly one eligible, non-branching node is being edited                       |  ✅  | ✅ `vector-variable-width.spec.ts` |

## Sector (face) deletion — click-select any face, protect a shared neighbor's boundary on Delete

Delete/Backspace already deleted a selected vertex/segment, and clicking a _filled_ face with the
Move tool already selected all its vertices (§56) — so Delete already deleted a filled sector
transitively, by deleting every vertex bounding it. Two gaps closed here, both requested directly:
(1) the click-select resolver required fill, so an unfilled region couldn't be click-selected at
all; (2) deleting a selected sector never protected a boundary shared with an untouched neighbor —
it just deleted every selected vertex's segments outright, unlike Shape Builder's own Alt+click
subtract. `armVectorFaceSelectOnPointerDown.ts`/`resolveVectorFaceSelectHover.ts` now select/hover
any face hit regardless of fill; `getVectorFullySelectedFaces.ts` dropped its `filledFaceKeys`
requirement so the persistent selection highlight and the delete path both recognize an unfilled
fully-selected sector too. `deleteSelectedVertices.ts` now detects when the selection fully bounds
one or more faces and reuses Shape Builder's own `subtractVectorFaces` (exclusive-boundary-only
deletion) for those, falling back to the original per-vertex delete for any remaining selected
vertices outside a sector — so a plain multi-point delete is unaffected, and a sector delete now
protects a still-standing neighbor's shared edge exactly like Shape Builder's Alt+click does. Full
write-up: `.claude/docs/vector-network.md` §64.

| #   | Scenario                                                                                                                        | Unit |           E2E            |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 313 | Clicking an unfilled face with the Move tool selects its vertices, and Delete removes its whole boundary when isolated          |  ✅  | ✅ `vector-edit.spec.ts` |
| 314 | Delete on a selected sector deletes only its own exclusive boundary, leaving a segment shared with an untouched neighbor intact |  ✅  | ✅ `vector-edit.spec.ts` |
| 315 | Delete on a mixed selection (a fully-selected sector plus an unrelated extra vertex) still deletes the extra vertex too         |  ✅  |            —             |
| 316 | Deleting a filled sector drops its key from `filledFaceKeys` along with the geometry                                            |  ✅  |            —             |

## Erase tool (`.claude/docs/vector-network.md` §66)

A circular brush in Vector Edit Mode (`Shift+E`, next to Cut). Dragging it over the network is a
real boolean subtract of the swept brush capsule (`subtractCapsuleFromVectorNetwork.ts`, built on
`planarizeVectorNetwork` + `deriveVectorFaces`), not a sever-and-drop: a bite that only grazes a
filled face's boundary carves a new wall inside the fill instead of deleting it — the fill survives
everywhere it wasn't actually swept. An erase touching only unfilled geometry still degrades to a
plain gap (no wall drawn), matching the tool's original behaviour there. `[` / `]` resize the brush
(default 10 screen px, clamped 1–100). A single stroke applies to every node currently open for
editing at once, independently — see the "multi" rows below. The whole geometry (capsule
construction, planar subtract, filled-face reclassification, diameter clamp) is pinned by unit
specs; e2e covers the live pointer-capture drag and the fill-survives-a-boundary-bite behaviour a
screenshot-diff can't cheaply assert.

| #   | Scenario                                                                                                                                | Unit |               E2E               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | :--: | :-----------------------------: |
| 317 | `Shift+E` switches the active tool to Erase while a node is open for editing                                                            |  ✅  |    ✅ `vector-erase.spec.ts`    |
| 318 | Dragging the eraser across the middle of an unfilled edge splits it into two stubs (4→5 segments), leaving the node unsplit             |  ✅  |    ✅ `vector-erase.spec.ts`    |
| 319 | Growing the brush with `]` erases a visibly wider stretch of the edge in one dab                                                        |  ✅  |    ✅ `vector-erase.spec.ts`    |
| 320 | A brush that fully covers a segment deletes it outright and prunes both its vertices                                                    |  ✅  |                —                |
| 321 | `[` / `]` clamp the eraser diameter to `[1, 100]` and are ignored for any other tool                                                    |  ✅  |                —                |
| 323 | The vector data is unchanged while the brush is still moving — only a preview is drawn                                                  |  ✅  |    ✅ `vector-erase.spec.ts`    |
| 324 | The whole recorded stroke commits in one `updateNode` on pointer-up, reverting as a single undo step                                    |  ✅  |                —                |
| 325 | A dip through a filled edge (in and back out) carves a real channel — new wall segments appear and the fill survives, it doesn't vanish |  ✅  |    ✅ `vector-erase.spec.ts`    |
| 326 | With two filled nodes open at once, a brush drag that only dips into one touches just that one — the sibling stays byte-identical       |  ✅  | ✅ `vector-erase-multi.spec.ts` |
| 327 | One continuous stroke that dips through both open filled nodes carves a channel in each, and both fills survive independently           |  ✅  | ✅ `vector-erase-multi.spec.ts` |
| 328 | A single Undo after one stroke that erased through both open nodes reverts both back to their original filled state at once             |  ✅  | ✅ `vector-erase-multi.spec.ts` |

## Paint tool — freeform drag mode

A second way to use Paint alongside the original single-face click-toggle (#242 above): press and
hold, sweep the pointer across several faces, release. Starting the drag on an unfilled face arms
**add** mode — every unfilled face the stroke crosses fills with the current paint color, live as
the stroke passes through it. Starting the drag on an already-filled face arms **remove** mode for
the whole gesture instead — every already-filled face the stroke crosses gets its fill destroyed,
while an unfilled face the same stroke also sweeps over is left untouched (a remove stroke only
ever destroys fill, it never adds). The cursor pins to `paint-add`/`paint-remove`
(`drop-add.png`/`drop-remove.png`) for the whole drag via `isVectorPaintRemoveRef`, and a
persistent hatch highlight (blue while adding, orange while removing) marks every face the stroke
has touched so far, clearing on release. Mirrors Shape Builder's own freeform drag
(`armVectorShapeBuilderOnPointerDown.ts` / `continueVectorShapeBuilderDrag.ts` /
`disarmVectorShapeBuilderDrag.ts`) one-for-one — same pointer-capture arm/continue/disarm shape,
same dashed black trail while the drag is in progress (`drawVectorPaintPath.ts`, sharing
`VECTOR_SHAPE_BUILDER_STROKE`/the Lasso dash constants) — except Paint never merges geometry.

| #   | Scenario                                                                                                                                                                           | Unit |           E2E            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: | :----------------------: |
| 329 | A freeform drag across two faces (a rectangle split by a divider segment) fills both from one gesture, not just the one under the pointer at release                               |  ✅  | ✅ `vector-edit.spec.ts` |
| 330 | The dashed black trail (same stroke as Shape Builder's own drag) is actually visible on the WebGL canvas while the drag is still in progress — a real repaint only e2e can observe |  ✅  | ✅ `vector-edit.spec.ts` |
| 331 | A drag starting on an already-filled face arms remove mode for the whole gesture, destroying that face's fill along with every other already-filled face the stroke crosses        |  ✅  | ✅ `vector-edit.spec.ts` |
