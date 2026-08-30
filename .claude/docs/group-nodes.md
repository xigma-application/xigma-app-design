# Group nodes — data model, selection bypass, and bounds sync

Etap 12a. Companion to `design-store-architecture.md` (general store shape) and
`selection-and-manipulation.md` (hit-testing/arm-resolver mechanics this plugs into). This file is
the group-specific layer on top of both: what a `TGroupNode` actually is, how clicking/hovering
resolves between "the group" and "one specific child", and — the hardest-won part — how a group's own
`x/y/width/height` stays correct, including while rotated.

## 1. Data model

```ts
export type TGroupNode = TBaseNode & {
  childIds: string[]; // z-order within the group, bottom → top
  type: NodeType.group;
};
```

`parentId` is **no longer always `null`** (older docs said it was pure Etap-12 scaffolding — that's
stale now). Children keep **absolute world coordinates** — `x/y/width/height/rotation` are never
relative to the parent group. Only two things change when a node joins a group:
- `parentId` is set to the group's id.
- the node's id leaves `rootOrder` (top-level only) and enters the group's own `childIds` instead.

A group's own `x/y/width/height` is a derived, cached value — the tight bounding box of its children
— kept in sync by `syncGroupBounds` (§4) after every mutation that could affect it. `rotation` is the
one field on a group that is **not derived** — it's a real, user-set value (via the rotate handle,
rigid-body — §3), and it changes what "tight bounding box" even means (§4.2).

## 2. Reducers — `groupNodes` / `ungroupNodes` / delete cascade

`groupNodes` (`handleGroupNodes/handleGroupNodes.ts`) and `ungroupNodes`
(`handleUngroupNodes/handleUngroupNodes.ts`) both live in `store/design/utils/`, same
"orchestrator file + one-function-per-file helpers + `test/`" split as every other non-trivial
reducer here (`getGroupableMembers`, `buildGroupNode`, `getGroupInsertionOrder`,
`stealMembersFromOldParents`; `getUngroupableGroups`, `getUngroupedOrder`, `releaseGroup`). Both are
in `UNDOABLE_ACTION_TYPES`.

`handleGroupNodes` is more than "wrap the selection": grouping a node that already belongs to a
*different* group **steals** it out of that old group into the new one (shrinking or, if it was the
old group's last member, pruning the old group entirely — same code path as `pruneParentGroup`,
below), and the new group forms either at the top level or nested *inside* an existing group, matching
wherever the selection's members actually sit. `getIsDescendantOfMovedNodes` guards against forming a
cycle (grouping a group with one of its own descendants). See `e2e/pages/design/group.spec.ts` for the
worked-out scenarios (steal-from-existing-group, member-selected-first vs outsider-selected-first,
3-levels-deep nesting) — that file owns grouping/ungrouping *mechanics*; this doc and
`e2e/pages/design/group-nodes.spec.ts` own group-node *behavior* once a group already exists.

**Delete cascades in both directions**, unlike the plain parent→child-only cascade described in
`design-store-architecture.md` §3:
```ts
export const handleDeleteNode = (state, id) => {
  const node = getActivePage(state).nodes[id];
  if (node) {
    const { parentId } = node;
    removeNodeFromPage(state, id);
    cascadeDeleteGroupChildren(state, node); // deleting a group deletes every child too
    cascadeDeletePathTextBinding(state, node);
    pruneParentGroup(state, parentId, id); // deleting a child prunes it from its group
  }
};
```
`pruneParentGroup.ts`: removes the deleted id from `parent.childIds`; if that drops `childIds` to
`0`, the now-empty group is deleted too (recursing back into `handleDeleteNode`, which itself cascades
upward if that group was nested); otherwise it calls `syncGroupBounds` so the group's box shrinks to
fit its remaining children (§4) — including when the group is rotated (this exact case — delete one
child of a rotated group, check the box — was a live regression until `syncGroupBounds` stopped
skipping rotated groups; see §4.2).

## 3. Selection resolution — group vs. one specific child

Two independent code paths implement the *same* rule, deliberately kept parallel rather than sharing
one function because they run in different contexts (pointerdown vs. every pointermove) with
different inputs already in hand:

- **Click**: `getSelectionHitAtPoint.ts` (`useSelectionTool/utils/handlePointerDown/`) — feeds
  `ctx.hit`, consumed by `armHitOnPointerDown`/`toggleSelectionOnPointerDown`/etc.
- **Hover**: `resolvePlainNodeHover.ts` (`useHoverHighlight/utils/resolveHover/hoverResolvers/`) — the
  fallback `HOVER_RESOLVERS` entry, sets `hoverRef` (drives `drawHoverOutline`).

Both apply this priority, highest first:

1. **The point lands on an already-selected node's own shape** — resolve to that node directly, no
   matter what it's a child of. `getNodeAtPoint(point, selectedNodes, viewport)` is checked *first*,
   before any group logic. This is what keeps a drag/hover continuing correctly on an
   individually-selected group child even while it's part of a *mixed* selection (a group child
   picked alongside a totally unrelated top-level node) — without this check, re-clicking that same
   child would resolve back up to its group and silently drop the mixed selection.
2. **Ctrl/⌘+point** (`isControlPressed(event)`, from `utils/isControlPressed.ts` — checks
   `ctrlKey || metaKey`, **not** just `ctrlKey`: physical Ctrl+click is macOS's system secondary-click
   gesture, so a literal `event.ctrlKey`-only check silently breaks on Mac) — bypasses straight to the
   leaf under the point, ignoring any group it's inside.
3. **The whole current selection already lives inside that same group**
   (`isSelectionInsideGroup(groupId, selectedNodes, nodesById)`, `Canvas/utils/`) — also bypasses to
   the leaf. Deliberately an **every**-check, not *some*: if you've Ctrl-clicked one child of a group
   and then, separately, select an unrelated top-level node alongside it, that group must **not** be
   treated as "entered" for its *other*, still-unselected children — hovering/clicking them should
   still resolve to the group as a whole. (`isGroupChildSelected`, an earlier `.some()`-based version
   of this same file, was replaced after exactly this mixed-selection case regressed — see the
   `e2e/pages/design/group-nodes.spec.ts` "mixed selection" tests.)
4. **Otherwise** — resolve up to the top-level ancestor (`getTopLevelAncestor`, walking `parentId`),
   i.e. the outermost group. A plain, un-modified click/hover on any group member selects the whole
   group.

`getGroupChildHitAtPoint.ts` is the leaf-level hit-test both the Ctrl-bypass and the hover path lean
on: it hit-tests `selectRenderOrderedNodes` (the flattened render list, §5) filtered to
`node.type !== NodeType.group`, so it only ever returns real shapes, never a group's own bounding
rect — critically, this means clicking/hovering **empty space inside a group's bounding box (between
two children) never matches anything**, Ctrl held or not; only where a real child shape actually is.

### 3.1 Selection invariant + the Layers-tree "selected group" highlight

`handleSetSelection` runs `dropDescendantsOfSelected` (`store/design/utils/handleSetSelection/`,
built on `getGroupSubtreeNodes`) on every `setSelection` payload: **a node and one of its ancestor
groups are never both in `selectedIds` at once** — the descendant is dropped. So Ctrl-clicking a
child in the Layers panel and then Ctrl-clicking its parent group collapses the selection to just
`[groupId]` (and, conversely, Ctrl-clicking into an already-selected group is a no-op). `groupNodes`/
`ungroupNodes` set `page.selectedIds` directly and are not affected; `handleSelectAll` already only
takes `rootOrder`, so it's a no-op there too.

The Layers tree then paints those hidden-but-implied descendants: `selectDescendantIdsOfSelected`
(selector) returns every descendant id of a selected group, `useIsRowHighlighted` feeds it to the
shared `Tree`'s new `isRowHighlighted` prop, and `Tree` renders a second `TreeSelectionBackground`
layer (`variant="highlight"`, weaker `--color-selected` mix). `getSelectionBackgroundSegments` took
an optional third `isRowAdjacent` arg so the selected block and the highlight block square the edge
where they touch (`isRowFilled = selected || highlighted`) and meet flush instead of leaving the
two rounded-inset pills with a gap between them.

## 4. Bounds sync — `syncGroupBounds`

`store/design/utils/syncGroupBounds.ts`, called from `handleUpdateNode` after every `updateNode`
dispatch on a node that has a `parentId`, and recursively up through nested groups:

```ts
export const syncGroupBounds = (state, groupId) => {
  if (!groupId) return;
  const group = getActivePage(state).nodes[groupId];
  if (!group || group.type !== NodeType.group) return;
  const children = group.childIds.map((childId) => nodes[childId]).filter(Boolean);
  if (children.length > 0) {
    const bounds = group.rotation === 0 ? getNodesBoundingBox(children) : getRotatedGroupBounds(children, group.rotation);
    group.height = bounds.height; group.width = bounds.width; group.x = bounds.x; group.y = bounds.y;
  }
  syncGroupBounds(state, group.parentId); // bubble to any outer group
};
```

Runs **unconditionally on every child update** — move, resize, delete, whatever — recomputing a
tight fit every time. That "always recompute, never skip" shape is deliberate and was arrived at the
hard way (§4.3); don't reintroduce a rotation-based skip.

### 4.1 The un-rotated case

`getNodesBoundingBox.ts` — per child, `getNodeAxisAlignedBounds` (own `x/y/width/height`, or the
endpoint box for a line, or `getVectorNodeBounds` for a vector) rotated by the child's *own*
`rotation` around its own center (`getNodeWorldCorners`-equivalent inline), then min/maxed across
every child's corners. Standard AABB union.

### 4.2 The rotated case — fit the box in its own rotated frame

A rotated group is conceptually a rigid body: its own `rotation` isn't derived from anything, so
"tight fit" has to mean *tight in the box's own rotated frame*, not tight axis-aligned (which would
either not contain a rotated child, or hugely overshoot). `getRotatedGroupBounds.ts`:

```ts
export const getRotatedGroupBounds = (children, rotation) => {
  const localCorners = children.flatMap((child) => getNodeWorldCorners(child).map((corner) => rotatePoint(corner, ORIGIN, -rotation)));
  const xs = localCorners.map((c) => c.x), ys = localCorners.map((c) => c.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const width = Math.max(...xs) - minX, height = Math.max(...ys) - minY;
  const worldCenter = rotatePoint({ x: minX + width / 2, y: minY + height / 2 }, ORIGIN, rotation);
  return { height, width, x: worldCenter.x - width / 2, y: worldCenter.y - height / 2 };
};
```

The technique (minimum bounding box at a fixed angle): collect every child's **real world corners**
(`getNodeWorldCorners.ts` — each child's own axis-aligned bounds, rotated around its own center by
its own `rotation`; a line/vector just contributes its plain AABB corners, same simplification
`getNodesBoundingBox` already uses), rotate all of them by `-rotation` around a fixed pivot (the
origin — any fixed point works, it only has to be the *same* pivot both directions) to land in the
group's own "un-rotated" frame, fit a plain AABB there, then rotate that fitted box's center back by
`+rotation` around the same pivot to place it correctly in world space. The box's own `width`/`height`
come straight from the de-rotated frame; only the *center* needs the return trip.

**Use every child's own corners, not an intermediate axis-aligned union box.** An earlier version of
this function called `getNodesBoundingBox(children)` first (the world-space AABB *union*) and rotated
*that* box's 4 corners — much simpler, and wrong: an axis-aligned union of two diagonally-placed
children is already loose, and fitting a rotated box around an already-loose box's corners inflates it
further (~2-3x oversized in the regression that surfaced it). Rotating every child's *own* corners
individually before the min/max fixes this — it's the difference between `getNodeWorldCorners` (per
child) and `getNodesBoundingBox` (already-unioned) as the input.

### 4.3 Why "always recompute" and not "skip while rotated" — the actual regression

Groups aren't always moved/resized as one rigid unit — since Ctrl+click (§3) lets a single child be
selected and dragged independently, a rotated group's rigid-body shape can be broken at any time.
`syncGroupBounds` used to skip its recompute entirely whenever `group.rotation !== 0`, on the
(reasonable-looking) theory that a rotated group only ever moves as a whole, so its box never needs
resyncing. Once children could move independently, that skip meant a rotated group's box silently
froze at whatever it was before the child moved — the box no longer contained its own children.

The fix that actually stuck is "recompute every time, unconditionally, using the corner-based tight
fit above" — reapplying it directly in `syncGroupBounds`, not routed through a narrower helper. An
earlier attempt hooked a *separate* recompute only into `disarmDrag` (pointer-up), gated to "did this
drag move a child without moving its rotated-group parent too" — safe, but incomplete: it silently
missed delete (§2) and any other future rotation-breaking mutation, since each one would need its own
matching hook. That helper (`disarmDrag/resyncRotatedGroupBounds.ts`) is still present and still runs
after every drag — now redundant with `syncGroupBounds`'s own unconditional recompute, since both fire
on the same underlying `updateNode` dispatches. It hasn't been removed; if you're touching this area,
it's a legitimate cleanup, just confirm `syncGroupBounds` alone still gets it right for every case
(drag *and* delete) before deleting the duplicate.

A live-in-the-editor symptom worth knowing if it resurfaces: while iterating on the rotated-fit math,
an *earlier, mathematically wrong* version of "always recompute" looked like it had broken normal
group rotation itself (dragging a rotated group live, watching its box visibly deform) — it hadn't;
the recompute-every-frame *shape* of the fix was fine, the corner-fit *math* underneath it
(§4.2's "union-first" bug) was the actual bug, and it showed up on literally every frame since the
group now resynced every frame. Rule out the math before reverting the "always recompute" shape again.

## 5. Multi-select outline/resize/rotate for a *mixed* selection

`Canvas/utils/isGroupSelection.ts` decides whether 2+ selected nodes get ONE combined
outline+resize+rotate-handle treatment (`drawGroupSelectionOutline`, `getResizeHandleAtPoint`,
`getRotateHandleAtPoint`, `isPointInGroupBounds`'s "click empty space inside the combined bounds to
keep dragging" continuation) versus per-node handling:

```ts
export const isGroupSelection = (nodes: TSceneNode[]): boolean => nodes.length > 1;
```

Despite the name, this predates real groups entirely and has nothing to do with `TGroupNode` — it's
asking "is this a flat multi-select that should act as one rigid unit for transforms", which is
`true` for **any** 2+ selection. It used to additionally require every selected node to share the same
literal `parentId` (`haveSameParent.ts`, now deleted) — harmless back when every node's `parentId` was
always `null`, but once group children have a real `parentId`, that check started incorrectly
splintering a perfectly normal mixed selection (one group's child + an unrelated top-level node) into
two independent per-node outlines/transforms instead of one combined box. Dropped entirely; a mixed
selection resizes/rotates/drags as one unit exactly like any other 2+ selection.

## 6. e2e coverage

`e2e/pages/design/group.spec.ts` — grouping/ungrouping mechanics (Ctrl+G, Ctrl+Shift+G, stealing a
member from an existing group in both selection orderings, nesting, Layers-panel drag in/out, delete
cascades, deep-nesting click-select). `e2e/pages/design/group-nodes.spec.ts` — node-level *behavior*
once a group already exists: plain-click-selects-group vs. Ctrl-click-selects-child vs.
Ctrl+Shift-toggle, rigid move/resize/rotate, mixed-selection drag/resize (§5) including starting the
drag from the empty gap between the two selected nodes, delete-shrinks-the-group and
delete-last-child-removes-it (including while rotated, §4.2), marquee touching one child selecting the
whole group, and undo of a rigid-body-breaking child move. `group.spec.ts` also covers the §3.1
invariant: Ctrl-click a child then its parent in the Layers panel → selection collapses to
`[groupId]`, the group row alone reads `aria-selected`, and the children get the flush highlight
background.

## Related

[[design-store-architecture]] §2/§3 — general scene-data-model and reducer conventions this extends;
its "`parentId` is always `null`" note is stale, corrected in §1 above.
[[selection-and-manipulation]] — the arm-resolver/hit-testing machinery §3 plugs into.
