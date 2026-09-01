# Masks — data model + offscreen alpha compositing

Figma-style masks. "Use as mask" always wraps the selection in a group ("Mask group"); the group's
**last** child (bottom row of the group in the Layers panel) becomes the mask and clips the
siblings **above it** to its own painted alpha (fill **and** stroke for a vector, glyph coverage
for live text, image alpha, gradients). Nesting groups scopes the effect; dragging the mask to the
top of the panel makes it a no-op.

## 1. Data model

`isMask?: boolean`, optional, on every node — same retrofit spots as `locked?`/`hidden?`
(`TBaseNode` + `TLineNode` + `TVectorNode`, `types/design/types.ts`). No new `NodeType`;
"Mask group" is a plain `TGroupNode` named `DEFAULT_MASK_GROUP_NAME` (`'Mask group'`,
`store/design/constants.ts`).

**Mask-scope rule.** `LayersTree` renders `childIds` in array order with no reversal, so
`childIds[0]` is the **top** row of the group in the panel and `childIds[last]` is the **bottom**
row. The first `isMask` child (`findIndex`) opens a scope covering every sibling **before** it in
`childIds` (`childIds[0 .. maskIndex-1]` — the rows shown *above* it in the panel). Those siblings
are the masked content; the `isMask` child is the alpha source and is never painted to screen
directly. Siblings *after* the mask (rare) render plain, unmasked. A mask that is `childIds[0]`
(top of the panel) has an empty scope → paints nothing, masks nothing. Only the first `isMask`
child in a group is honored — multiple masks per group are not v1 (the creation flow never
produces that). NB: `childIds`/`rootOrder` are z-ordered last-on-top, so this panel ordering is
inverted from Figma's (panel-bottom = frontmost here), but the *visual* result — mask at the
bottom of its rows, clipping the rows above it — matches Figma.

## 2. Store

- `createMaskGroup` (`slice.ts`, `prepare` → `{ groupId: nanoid() }`) → `handleUseNodesAsMask`
  (`store/design/utils/handleUseNodesAsMask/`): calls `handleGroupNodes` verbatim, then renames the
  group to `DEFAULT_MASK_GROUP_NAME` and sets `isMask = true` on
  `group.childIds[group.childIds.length - 1]` (the last child / bottom panel row). No-ops on an
  empty selection (no group gets built).
- `toggleNodeMask` (payload = node id) → `handleToggleNodeMask` (mirrors `handleToggleNodeHidden`,
  no cascade). This is what the menu's "Remove mask" dispatches — it clears the flag only, the
  group stays.
- `buildGroupNode.ts` grew an optional 5th `name` param (defaults to `DEFAULT_GROUP_NAME`).
- Both `createMaskGroup.type` and `toggleNodeMask.type` are in `UNDOABLE_ACTION_TYPES`
  (`store/history/historyMiddleware.ts`) — single-dispatch, each its own undo step, like the
  lock/hide toggles.

## 3. Menu + shortcut

- `NodeContextMenu.tsx`: the previously-disabled `USE_AS_MASK` item is now live — "Use as mask"
  (`onUseAsMask`) when `!node.isMask`, "Remove mask" (`NODE_MENU_REMOVE_MASK_KEY`, `onRemoveMask`)
  when `node.isMask`. Still gated `!isSection`.
- `onUseAsMask` comes from `useNodeMenuActions` → `useUseSelectionAsMask` →
  `handleUseSelectionAsMask` (mirror of `handleGroupSelection`: guards `vectorEditingNodeIds`, then
  `dispatch(createMaskGroup())`). `onRemoveMask` is built in the `LayerContextMenu` adapter via
  `useRemoveNodeMask(node.id)`.
- Shortcut ⌃⌘M (mac) / Ctrl+Alt+M (win): `shortcuts.ts` `useAsMask` entry
  (`primaryKeys: [CONTROL_PRIMARY_KEY, MASK_MODIFIER_KEY]`, `MASK_MODIFIER_KEY` in
  `constant/mainKeys.ts`), wired in `useKeyboardShortcuts.ts`'s `keysMap`; the `keys.ts` display
  entry pre-existed.

## 4. Rendering — offscreen framebuffer + alpha compositing

New 5th GL program + a framebuffer pool, both built once and carried on `TImageRenderContext`
(`useCanvasRenderLoop.ts` → `setupRenderLoop.ts`):

- **`maskCompositeProgram`** — `constant/webgl/maskComposite{Vertex,Fragment}ShaderSource.ts`. A
  passthrough clip-space quad; fragment outputs `vec4(content.rgb, content.a * mask.a)`.
- **`renderTargetPool`** — `utils/canvas/renderTarget/createRenderTargetPool/`
  (`createRenderTargetPool.ts` + one-file-per-helper `createTarget.ts`/`disposeTarget.ts`/
  `types.ts`). `acquire()`/`release()`/`dispose()` over `{ framebuffer, texture, stencil }` sized
  to `gl.drawingBufferWidth/Height` (DPR-scaled, matching the main framebuffer's viewport). Each
  target has a `DEPTH24_STENCIL8` renderbuffer so a vector mask's own `drawVectorFill` even-odd
  stencil pass still works inside a target. Every target is dropped and rebuilt when the drawing
  buffer resizes; `setupRenderLoop`'s cleanup calls `pool.dispose()`.

**`drawSceneNodes.ts`** now takes `rootOrder` and splits:

- **No `isMask` node anywhere** → `sceneNodes.forEach(drawLeafNode)` — byte-identical to the old
  flat pass (the old per-`NodeType` switch is `drawLeafNode.ts`, unchanged; `case group` is a
  no-op, so iterating the pre-flattened list is the same as before). Nothing touches framebuffer /
  viewport / blend / colour-mask state.
- **Some `isMask` node present** → build a `TMaskRenderer` (`drawSceneNodes/types.ts`) and walk the
  tree from `rootOrder` (`drawSceneNodes/renderIds.ts` → `renderNode.ts` → `renderMaskGroup.ts`,
  each `TMaskRenderer`-threaded, per `xigma-function-style`'s split-heavy-branching rule). Nodes
  absent from `sceneNodes` (hidden / the editing text node) are skipped — a hidden group already
  cascades `hidden` to its children, so subtree consistency holds.
  - `renderMaskGroup`: render `childIds[0 .. maskIndex-1]` (the siblings *before* the mask) into
    `contentTarget` (`pool.acquire()`), the mask node into `maskTarget`, then `bindTarget(previous)`
    and `compositeMask(content, mask)` — a full-screen quad multiplying content by mask alpha onto
    whatever framebuffer the group was being drawn into (screen, or an outer mask's content target
    when nested). `pool.release` both. Siblings *after* the mask (`childIds[maskIndex+1 ..]`) are
    then rendered plain on top. An empty content slice (mask is `childIds[0]`) skips the whole
    offscreen dance.
  - `bindTarget(null)` restores the screen: default framebuffer, `viewport` back to
    `drawingBufferWidth/Height`, `colorMask(t,t,t,false)` (the alpha-locked state
    `drawSceneBackground` establishes). `bindTarget(target)` flips `colorMask` to `(t,t,t,true)` so
    the offscreen texture actually accumulates alpha.
  - The whole mask pass runs under `blendFuncSeparate(SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE,
    ONE_MINUS_SRC_ALPHA)` (correct straight-alpha accumulation into the offscreen textures),
    restored to the plain `blendFunc` at the end.

Alpha mask only in v1 — no luminance / vector / image *mask-type* modes (a future `maskType`
field). Selection / hover / handle passes are unchanged and run in screen space after the node
pass, so a masked node still shows its full selection outline and the mask node keeps an ordinary
outline (Figma's dashed mask outline is a follow-up).

## 5. Hit-testing (v1 simplification)

`getNodeAtPoint` / `getCollidedNodes` are **unchanged** — a masked-away region still selects the
masked node (hit-test stays on raw geometry, same precedent as arrowheads/handles). The mask node
itself stays normally selectable and movable; only its on-screen fill is suppressed. Clipping the
masked-sibling hit region to mask coverage is a follow-up.

## 6. Layers tree

The icon/badge/connector logic for a row lives entirely in
`components/Design/LeftPanel/File/Layers/LayersTree/LayerRow/` — the shared `TreeItem` (`shared/UI/Tree/`)
knows nothing about node types or masks. It takes two render-prop-style slots: `renderIcon: (node) =>
ReactNode` (required — `LayerRow` supplies `LayerRowIcon`) and `children` (optional row decorations,
hidden while the row is being renamed; `LayerRow` supplies `LayerRowMaskDecorations`).

- **`LayerRowIcon`** (moved out of shared as `TreeItemIcon` → `LayerRowIcon`, same folder shape:
  `NodeShapeIcon`/`BaseNodeIcon`/`getNodeOutlinePath`/`getNodeTypeIconName`/`constants.ts`) — its
  `getNodeTypeIconName` returns the `MaskGroup` icon (`@xigma/components`, `mask-group.svg`) for any
  `node.isMask` row, and the component skips the shape-outline preview (`NodeShapeIcon`) for a mask
  even when one would otherwise be drawable.
- **`LayerRowMaskDecorations`** — renders the "Mask" badge (`node.isMask`) plus the connector: a
  `LeadArrow` (`lead-arrow.svg`) arrowhead above the mask's icon when `selectMaskConnectorRoleById`
  (`store/design/selectors.ts`) marks it `'mask'`, and a 1px gradient line (breaking around each
  row's own icon, `--fpl-tree-grid-icon-size`-style) on every row `selectMaskConnectorRoleById` marks
  `'masked'` (the rows the mask actually clips — `childIds[0 .. maskIndex-1]`, same rule as rendering,
  §1). `useRenderRow.tsx` reads the selector once per render pass and passes each row's role down
  through `LayerRow`.
- Both icons live in `xigma-app-shared` (`packages/components/src/Icon/svg/{mask-group,lead-arrow}.svg`,
  registered in `Icon/constants.ts` as `MaskGroup`/`LeadArrow`) — pulled via `npm run xigma:pull`.
- The line/arrowhead offsets (`left: 36px` etc., `layer-row-mask-decorations.module.scss`) were set
  from the row's known layout constants (`TREE_ITEM_INDENT_PX`, `LAYERS_TREE_ROW_HEIGHT`, icon size
  12px) without a live visual check — treat as a starting point to tune once the app is running.

## 7. Not covered by unit tests — needs the running app

The offscreen compositing is verified only at the GL-call-sequence level (mock `gl`,
`drawSceneNodes.spec.ts` "mask groups", `compositeMask.spec.ts`, `createRenderTargetPool.spec.ts`).
Actual pixel correctness — a rect clipped to a rect, an image clipped to its alpha, live text as a
mask, a stroked vector as a mask, nested mask groups — needs a screenshot-diff e2e in
`e2e/design/selection/mask.spec.ts` (see `xigma-e2e-coverage`) and/or a Playwright-MCP visual pass.

## Related

[[canvas-rendering-pipeline]] — the render loop and the (now stale) "no FBO layer" note; §4 above
is that layer.
[[design-store-architecture]] §3/§8 — the reducer table and `UNDOABLE_ACTION_TYPES`.
[[group-nodes]] — "Mask group" is an ordinary `TGroupNode`.
