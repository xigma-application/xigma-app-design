# Auto-layout — engine, drag-reorder, guides, rotation

Figma-style auto-layout for `TFrameNode`s with `layoutMode: horizontal | vertical`. This file maps
the three separate subsystems that make it work end-to-end — the real layout engine, the live
drag-reorder preview, and the drag-snap-guide suppression that runs alongside it — plus the one
cross-cutting gotcha (rotated children) that bit all three at once.

## 1. The real, committed layout engine — `src/store/design/utils/autoLayout/`

`syncAutoLayoutChildren(state, frameId)` is the single entry point that actually repositions
children and, when `primaryAxisSizingMode`/`counterAxisSizingMode` is `hug`, resizes the frame
itself. Called from `handleMoveNodes.ts` (add/reorder/reparent), `handleUpdateNode.ts` (**any**
property change on a child, including `rotation`, `width`, `height`), and `pruneParentGroup.ts` —
i.e. on every edit that could plausibly change the layout, not just structural ones.

```
syncAutoLayoutChildren
  → bounds = children.map(getRotatedNodeBounds)     // §4 below — NOT getNodeAxisAlignedBounds
  → sizes  = bounds.map({width, height, id})
  → computeAutoLayoutPositions(frame, ..., sizes)
      → wrapEnabled?
          groupAutoLayoutChildrenIntoLines → (counter-axis hug: getAutoLayoutWrapCounterHugSize) → getAutoLayoutWrappedChildPositions
        : applyAutoLayoutHugSize (primary/counter hug) → getAutoLayoutChildPositions
  → for each child: delta = targetPosition - bounds[i] (rotated-AABB space, see §4)
    getGeometryDeltaChanges(child, deltaX, deltaY) applied to the child AND its whole subtree
    (getGroupSubtreeNodes) — a pure translation, so it's correct regardless of the child's own rotation
```

`getAutoLayoutChildPositions.ts` is the plain (no-wrap) packer: walks children in order, accumulates
`offset += size + itemSpacing` along the primary axis, and centers/aligns each on the counter axis via
`getAlignmentComponents`/`getAxisOffset` (`layoutAlignment`, default `topLeft`). Wrap
(`getAutoLayoutWrappedChildPositions.ts` + `groupAutoLayoutChildrenIntoLines.ts` +
`getAutoLayoutLineLength.ts`/`getAutoLayoutLineThickness.ts`/`getAutoLayoutBlockCounterLength.ts`) is
the same idea one level up: pack children into lines that fit `availablePrimary`, then stack the
lines on the counter axis with `counterAxisSpacing` (falls back to `itemSpacing` if unset).

**Every function below `computeAutoLayoutPositions` takes a `TAutoLayoutChildSize[]`
(`{id, width, height}`), never a scene node** — they're pure geometry, agnostic to node type or
rotation. All rotation/type-specific measurement happens once, at the very top, in
`syncAutoLayoutChildren`'s `bounds = children.map(getRotatedNodeBounds)` call. If a future change
needs a child's "size" to mean something else (e.g. a stroke-inclusive box), that's the one place to
change — everything downstream just consumes whatever `TAutoLayoutChildSize[]` it's handed.

## 2. Live drag-reorder preview — `useSelectionTool/.../continueDrag/updateDragDropTarget/`

Separate code path from §1 — this only *previews* (refs, not dispatched state) while a pointer drag
is in progress; the real reorder is committed by `handleMoveNodes` → `syncAutoLayoutChildren` on
drop.

`resolveDragReparentTarget` → `armAutoLayoutDropTarget` (only when the hovered drop frame is
auto-layout) does, per pointer-move:

1. `getAutoLayoutSiblingEntries` — the frame's `childIds` **minus** the dragged node(s), each with
   its real `bounds` (`getRotatedNodeBounds`, §4).
2. `getAutoLayoutOriginalIndex(childIds, movedNodeIds)` — where the dragged node **used to sit**
   among the remaining siblings (only computed for a same-parent reorder; `null` for dropping into a
   different/new auto-layout frame).
3. `getAutoLayoutDropTarget(..., realPositions, originalIndex, draggedSize, cursorPoint)` →
   `getAutoLayoutDropInsertionIndex` picks the landing index:
   - **`originalIndex === null`** (reparent into a frame this node wasn't already in): plain
     symmetric midpoint threshold — `cursor vs. sibling.start + sibling.size / 2`. Unchanged, simple,
     no "which side" concept applies since there's no "original side" for a node that wasn't there.
   - **`originalIndex` given** (reordering within the same frame): **touch-edge, not midpoint**.
     For each sibling, `getInsertionThreshold` uses the edge nearest the dragged item's *original*
     side — a sibling that was originally *before* the dragged node uses its own **far** edge
     (`start + size`); a sibling that was originally *after* it uses its own **near** edge (`start`).
     Net effect: the swap fires **the instant the cursor touches the next sibling**, in either
     direction, at the same single boundary for advancing and reverting (confirmed with the user
     against a concrete pixel example — no extra hysteresis/dead-zone beyond that one edge). This
     matches Figma's felt behavior; a naive "cursor > sibling midpoint" threshold (this repo's
     original implementation) waits for 50% overlap, which feels sluggish and, worse, was *provably
     wrong* for a sibling positioned after the dragged node's original slot (see History below).
4. `getAutoLayoutChildPositions` (yes, the real §1 packer) runs again on `[...siblings, synthetic
   __dragged__ placeholder]` inserted at that index, to produce the **simulated final layout** —
   `dropTarget.siblingPositions` (what each sibling animates to) and the drop indicator's bar
   position. `armAutoLayoutReorderPreview` feeds `siblingPositions` into
   `animateAutoLayoutReorder.ts`'s eased tween (`AUTO_LAYOUT_REORDER_ANIMATION_DURATION_MS`), stored
   on `canvasRefs.transform.autoLayoutReorderPreviewRef`.
5. `updateAutoLayoutReorderGhostPosition.ts` positions the **dragged node itself** (not a sibling) at
   `bounds(draggedNode) + delta` in that same ref, so it visually follows the cursor without being
   dispatched into the store; `getAutoLayoutReorderRenderNode.ts` is what `drawScene.ts` actually
   calls per-frame to read a node's *effective* (possibly ref-overridden) render position — both use
   `getRotatedNodeBounds` (§4) as the reference frame, matching what `siblingPositions` was computed
   in.

`isAutoLayoutDropTargetActive(canvasRefs)` (`src/utils/canvas/signals/`) is just
`autoLayoutReorderPreviewRef.current !== null || autoLayoutDropTargetRef.current !== null` — the one
shared signal for "is this drag currently being handled by the auto-layout system" that §3 reads.

## 3. Drag-snap-guide suppression during an auto-layout drag

While dragging into/within an auto-layout frame, the frame's own reorder-preview/drop-indicator is
the only feedback that should show — the ordinary free-drag guides (alignment snap, chain-gap/
equal-spacing, matched-pair, shape-contact) are redundant clutter on top of it and were visibly
distracting in practice (user-reported: "mnóstwo linii się pokazuje... trzeba je wyłączyć").
`continueDrag.ts` computes `isAutoLayoutDropTargetActive(canvasRefs)` **after** calling
`updateDragDropTarget` (so the refs are already armed for this frame) and passes it into
`armDragSnapGuides.ts`, which nulls `alignmentGuideRef`/`equalSpacingGuidesRef`/
`matchedPairGuidesRef` whenever it's true (same short-circuit `axisLock`/`matchedPairGuides` already
used). `resolveShapeContactGuides.ts` (a separate call in `handlePointerMove.ts`) checks the same
signal itself and skips its own computation entirely, clearing `contactGuidesRef`.

## 4. Rotation — two different "bounds" concepts, don't mix them up

There are genuinely **two same-purpose, differently-scoped functions** in this codebase, both named
around "rotated bounds" — know which one a given file needs:

- **`src/components/Design/Canvas/utils/getRotatedNodeBounds.ts`** — excludes only `line` from
  rotation math (vectors DO get rotated-AABB treatment). Used by selection/snapping/hit-testing code.
- **`src/store/design/utils/getRotatedNodeBounds.ts`** — excludes both `line` **and** `vector`
  (vectors bake their geometry into absolute vertex coordinates already; a separate `rotation` field
  on them isn't given rotated-AABB treatment here). This is the one every auto-layout file in §1/§2
  uses, matching the pre-existing local convention in `getNodesBoundingBox.ts` (which now delegates
  to it instead of duplicating the corner-rotation math a third time).

Both wrap the **actually-raw** `src/store/design/utils/getNodeAxisAlignedBounds.ts` — which, despite
its name, does **not** rotate anything; it's the plain local `{x, y, width, height}` (with line/vector
special-casing only). `getNodeWorldCorners.ts` and `getNodesBoundingBox.ts`'s pre-refactor local
helper both call it and apply their *own* corner rotation afterward — this is deliberate, not a bug,
because those callers need the raw box as an intermediate step (e.g. `getNodeWorldCorners` returns
the rotated **quadrilateral**, not its AABB — rotating it again after already having a rotated AABB
would double-rotate). **Do not "fix" `getNodeAxisAlignedBounds` itself to rotate** — multiple callers
correctly depend on it staying raw.

**Why it matters for auto-layout specifically**: a node rotated to anything other than
0/90/180/270deg has a true on-screen footprint (its rotated AABB) that's larger than, and offset
from, its raw `{x, y, width, height}` box. Measuring/positioning by the raw box (what every
`getNodeAxisAlignedBounds`-based call site did before this fix) under-measures the child and lets its
neighbor overlap it — exactly the visual overflow bug that motivated this whole file. For exactly
0/90/180/270deg the rotated-corner math still gives the mathematically exact answer (no
special-casing needed in code — a 90° rotation's corner min/max naturally comes out as the
width/height-swapped box), so there's a single code path for "any angle", not an
if-0/90/180/270-else-other branch.

## Tests

- Unit: `src/store/design/utils/autoLayout/test/` (engine — padding, alignment, hug, wrap, the
  rotated-child regression in `syncAutoLayoutChildren.spec.ts`), `.../updateDragDropTarget/test/`
  (drop-target/insertion-index/original-index), `src/store/design/utils/test/getRotatedNodeBounds.spec.ts`.
- e2e: `e2e/design/auto-layout/flow.spec.ts` (Flow toggle, drag-into-frame, wrap sizing),
  `reorder.spec.ts` (drag-reorder within a frame, the near-edge-not-midpoint threshold),
  `rotated-child.spec.ts` (a child rotated via `updateNode` is packed by its rotated footprint).
  Catalog with per-scenario detail: `e2e/design/docs/test-cases-auto-layout.md`.

## History (so it isn't repeated)

1. **2026-09-05, drag-reorder threshold used the wrong sibling positions.** The insertion-index
   comparison recomputed sibling positions by *closing the gap* the dragged node left (i.e. as if it
   had already been removed and the remaining siblings repacked from the frame origin), then compared
   the **real, uncompacted** cursor position against those compacted positions — a mismatch that made
   a sibling positioned *after* the dragged node's original slot swap far too early (at roughly the
   dragged node's own midpoint, not the sibling's). A sibling positioned *before* happened to be
   unaffected (nothing was removed ahead of it), which is why only one drag direction looked broken.
   Fixed by comparing against each sibling's **real**, undisturbed bounds instead.
2. **2026-09-05, same-day follow-up: midpoint felt wrong even after the position fix.** The
   *threshold itself* — even correctly computed — waited for 50% overlap before swapping, which
   doesn't match Figma's felt "swap as soon as you touch it" behavior. Confirmed the exact intended
   boundary with the user via a concrete pixel example before implementing (see §2 above) — landed on
   "same single edge for both directions", not a separate hysteresis band (an earlier internal
   proposal for edge-based hysteresis was found to be under-specified/self-contradictory before
   writing any code, and dropped in favor of the simpler, explicitly-confirmed rule).
3. **2026-09-05, rotated children overflowed their frame.** Root-caused from a real screenshot (a
   frame's rotated child visibly stuck out past the frame edge). `getNodeAxisAlignedBounds` never
   rotates (see §4) but its name and the call sites' intent implied it should have — every
   auto-layout size/position call site was silently rotation-naive. Fixed by introducing the
   store-layer `getRotatedNodeBounds.ts` and wiring it into every one of those call sites (not just
   the real applier — the drag-reorder sibling/ghost/render-preview code shares the exact same bug
   class and was fixed in the same change).
