# Constraints — the `alignment` model, the reflow, and the canvas guide overlay

Figma-style constraints: a frame child records how it should stay pinned to its parent frame as
the frame's box changes. This is a **separate axis** from auto-layout's `layoutAlignment` (the
9-way slot alignment of a flow child) — a node can only meaningfully carry one or the other at a
time, decided by `isConstraintEligibleFrameChild` (§2).

## 1. Data model

`alignment?: TNodeAlignment` on every `TBoxSceneNode`:

```ts
type TNodeAlignment = { horizontal?: AlignmentHorizontal; vertical?: AlignmentVertical };
// AlignmentHorizontal = 'left' | 'center' | 'right'
// AlignmentVertical   = 'top'  | 'center' | 'bottom'
```

An **unset axis** has an effective default of `left` / `top` (Figma's implicit "Left + Top") —
both the reflow (`getAxisConstraintDelta` returns the left/top behaviour for `undefined`) and the
guide overlay (`getConstraintGuideSegments`'s `?? AlignmentHorizontal.left` / `?? …top`) apply
that same fallback, so they never disagree. Set via the RightPanel Alignment buttons, the
expandable Constraints panel's dropdowns, or a direct `updateNode({ changes: { alignment } })`.
The RightPanel shows an aligned axis' Position input as a disabled `auto`.

## 2. Shared eligibility predicate — `isConstraintEligibleFrameChild`

`src/utils/canvas/signals/isConstraintEligibleFrameChild.ts` — `(node, nodesById) => boolean`.
The **single source of truth** for "does this node's `alignment` do anything", read by both the
reflow (§3) and the overlay (§4) so they can never diverge:

```
parent = nodesById[node.parentId]
parent is a frame  AND  isBoxSceneNode(node)  AND
  ( isFreeformFrame(parent)                                  // freeform frame → always
    OR (isAutoLayoutFrame(parent) AND node.ignoreAutoLayout) // absolute child of an h/v auto-layout frame
  )
```

Grid parents, plain flow children, and non-frame parents are all excluded — their own engine owns
child positions. A leaf **inside** a group/mask is excluded (its parent is the group, not the
frame); the group/mask node **itself** is the frame's child, carries `alignment`, and is eligible.

## 3. The reflow — `syncConstrainedFrameChildren`

`src/store/design/utils/handleUpdateNode/syncConstrainedFrameChildren.ts`, called once from
`handleUpdateNode` with the frame's **pre-update** box snapshot (`TFrameBoxSnapshot`). For each
`isConstraintEligibleFrameChild` child:

1. `oldLocal = getNodePositionInParent(child, previousBox)` — child's top-left in the frame's
   pre-resize local (un-rotated) space.
2. per axis, `getAxisConstraintDelta(alignment.horizontal, widthDelta)`:
   - `left` / unset → `0` (rides with the origin, gap on the left preserved)
   - `right` → the full delta (gap on the right preserved)
   - `center` → half the delta (stays centred)
3. `targetAbsolute = getNodeAbsoluteFromParentPosition(targetLocal, frame)` (current, post-resize
   frame box → handles frame rotation), rounded, diffed against `child.x/y`.
4. non-zero delta → translate the child **and its whole subtree** (`getGroupSubtreeNodes`) by
   `getGeometryDeltaChanges` — a pure translation, correct regardless of child rotation.

`syncAutoLayoutChildren` runs *before* this in `handleUpdateNode`; an `ignoreAutoLayout` child is
skipped by the flow engine (`isAutoLayoutFlowChild` is false for it), so the constraint delta
applies to a child the auto-layout pass already left alone — no fight.

## 4. Canvas guide overlay — `drawConstraintGuides`

`src/components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawConstraintGuides/`.
Drawn right after `drawSelectionOutline` in `drawScene.ts`, **only when exactly one** node is
selected and it is `isConstraintEligibleFrameChild`. Two parts:

- **`drawConstraintGuideLines`** — one dashed blue (`CONSTRAINT_GUIDE_STROKE = '#0d99ff'`) line
  per axis, from `getConstraintGuideSegments(node, parent, node.alignment)`. The lines run along
  the **parent frame's own axes** (never tilt with the child; they do tilt with the frame). For
  an edge constraint the line spans from the child's edge to the matching frame edge; for a
  `center` constraint it is a short line through the child centre.
- **`drawConstraintGuideCentreMarker`** — an `×` marker + centre dot, drawn only when
  `alignment.horizontal === 'center' || alignment.vertical === 'center'`. The `×` is rotated by
  `parent.rotation` (new optional last arg on the shared `drawXMarker`; defaults to `0`, so the
  other two callers — `drawMatchedPairGuides`, `drawShapeContactGuides` — are unaffected).

### 4.1 Rotation — `getChildLocalExtent`

`getConstraintGuideSegments/getChildLocalExtent.ts` is where child **and** frame rotation are
resolved. It maps the child's box centre into frame-local space and then computes, per frame
axis, how far the guide line reaches before it crosses the child's **current rotated** edge:

```
θ    = child.rotation − parent.rotation           // child's tilt relative to the frame
halfX = min( (w/2) / |cos θ|, (h/2) / |sin θ| )    // getAxisHalfExtent, Infinity when a term is 0
halfY = min( (w/2) / |sin θ|, (h/2) / |cos θ| )
```

At `θ = 0` this is exactly `w/2` / `h/2` — identical to the un-rotated behaviour. The edge
segment then continues from `centre ± half…` to the frame edge (`getHorizontalLocalSegment` /
`getVerticalLocalSegment`), and `toWorldSegment` maps back through
`getNodeAbsoluteFromParentPosition` (frame rotation). `center` lines span half that extent each
side of the centre. `getConstraintGuideCentre` just returns the child's world box centre —
rotation-invariant, so it needs no frame/child rotation handling.

**Earlier wrong approaches, in order:** (1) raw `child.x/width` ignoring rotation entirely —
lines froze on the phantom un-rotated edges; (2) the rotated child's axis-aligned **bounding
box** — the line then ended at the AABB corner, still short of where the tilted edge actually
crosses the guide. The cast-to-the-rotated-edge form above is what matched the design intent.

## Tests

- Unit: `.../drawConstraintGuides/**/test/` (segments, extent, axis-half-extent, centre, the two
  local-segment builders, the orchestrator, the centre marker), `src/utils/canvas/test/drawXMarker.spec.ts`
  (the rotation arg), `syncConstrainedFrameChildren.spec.ts`,
  `src/utils/canvas/signals/test/isConstraintEligibleFrameChild.spec.ts`.
- e2e: `e2e/design/selection/frame-child-constraints.spec.ts` — reflow on frame resize, the guide
  lines shifting on a constraint change, multi-select suppression, and the rotated-child /
  rotated-frame guide facets. Catalog: `e2e/design/docs/test-cases-selection.md` §"Constraints
  anchor a freeform-frame child".

## Related

[[auto-layout]] — `ignoreAutoLayout` absolute children and the ancestor-reflow mechanism.
[[group-nodes]] — a group/mask node is itself a constraint-eligible frame child.
