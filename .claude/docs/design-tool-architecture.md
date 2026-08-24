# Design canvas — how a draw tool is built

Reference for adding a new drawing tool to the Design page (`src/pages/DesignPage`). Written from
the Arrow tool implementation (a `TLineNode` variant with an arrowhead), which touched every layer
described here. Read this before starting instead of re-discovering the architecture via `grep`.

Every draw tool is assembled from the same ~8 concerns, each owned by a different, consistent set
of files. Most of the work in adding a tool is wiring these together correctly, not writing new
algorithms — reuse an existing hook/primitive whenever the new tool's geometry matches an existing
one (Arrow reused `useDrawLineTool` entirely, just with a different config).

## 1. Data model

- `src/types/design/enums.ts` — two separate enums, easy to conflate:
  - `NodeType` — what a node **is** on the scene (`frame`, `rectangle`, `line`, ...). A new tool
    does **not** always need a new `NodeType` — Arrow has no `NodeType.arrow`, it produces a
    `NodeType.line` node with a style field set differently.
  - `ToolName` — what's selectable in the **toolbar** (`frame`, `rectangle`, `line`, `arrow`, ...).
    Every tool needs an entry here regardless of whether it introduces a new `NodeType`.
- `src/types/design/types.ts` — one type per node shape (`TLineNode`, `TRectangleNode`, ...), built
  from `TBaseNode` (`id/name/x/y/width/height/rotation/parentId`) for box-shaped nodes, or a
  standalone shape for anything else (`TLineNode` has `x1/y1/x2/y2` instead). Also holds the
  `TDraft*` types (the shape used for the **in-progress**, not-yet-committed drag preview — usually
  `Omit<TXNode, 'id' | 'name' | 'parentId'>`) and the three big unions every node type must be added
  to: `TSceneNode`, `TNewSceneNode` (`Omit<T, 'id'>`, what `addNode` accepts), `TSceneNodeChanges`
  (`Partial<T>`, what `updateNode` accepts).
- **Adding an optional field to an existing node type** (like Arrow's `startPoint`/`endPoint` on
  `TLineNode`) is far cheaper than it looks: make it optional (`startPoint?: TLineEndpointStyle`),
  and every existing test fixture/mock across the codebase that builds that node type as an object
  literal keeps compiling untouched, since TS doesn't require optional fields. Making it
  **required** instead forces you to touch every file that ever constructs that node type as a
  literal — for `TLineNode` alone that was 15+ test files. Only go required if every legitimate
  instance genuinely must set the field explicitly.

## 2. Store (Redux, `store/design`)

- `slice.ts` — the reducers (`addNode`, `updateNode`, `setActiveTool`, `setSelection`, ...). A new
  tool rarely needs a new reducer unless it introduces genuinely new state shape (Slice did, because
  it's deliberately never persisted to `nodes`).
- `utils/handleSetActiveTool.ts` — a `switch` deciding which "last used" bucket a `ToolName` updates:
  `lastShapeTool` / `lastFrameTool` / `lastMouseTool` / `lastTextTool`. This is what makes a shared
  toolbar button "remember" which of its dropdown variants was picked last. **A new tool that shares
  a dropdown with existing tools must be added to the matching `case` block** — forgetting this
  doesn't break drawing, it just means the toolbar button never updates to show the new tool's icon
  after picking it.
- `selectors.ts` — trivial selectors for the above, rarely needs changes.

## 3. Toolbar UI (`components/Design/Toolbar`)

All of `MouseModes.tsx` and `ToolDropdown.tsx` are **fully generic** — they iterate
`TOOLBAR_ORDER`/`TOOL_GROUP_ITEMS` and read `TOOL_ICON`/`TOOL_LABEL`/`TOOL_ICON_SIZE` by `ToolName`
key. For wiring an ordinary new tool you should never need to edit either component file; only
`constants.ts` (the one exception is Vector Edit Mode's own tool-switch handling — see
`vector-network.md` §45 — which both components now route through via a handler-hook instead of
dispatching `setActiveTool` inline; irrelevant unless the new tool needs its own decision there):

- `TOOL_ICON: Record<ToolName, keyof typeof Icons>` — **exhaustive** `Record`, TS will refuse to
  compile until every `ToolName` has an entry.
- `TOOL_LABEL: Record<ToolName, string>` — also exhaustive; values are translation keys
  (`${translationNameSpace}.tool.<name>`), not literal text — see §5.
- `TOOL_GROUP_ITEMS: Partial<Record<ToolName, ToolName[]>>` — **only set for the group's own key
  tool**. E.g. `[ToolName.rectangle]: [rectangle, line, arrow, ellipse, polygon, star, media]` means
  clicking the Rectangle toolbar slot opens a dropdown listing all of those; Line/Arrow/etc. have no
  entry of their own here, they're just members of Rectangle's array. A tool with no group at all
  (not a key, not a member of anyone else's array) just renders as a single plain button.
  **A tool joins an existing dropdown by being appended to that group's array** — this is almost
  always the right call over inventing a new dropdown group; a brand-new group needs a new
  `lastXTool` store field, a `getGroupDisplayedTool.ts` case, a `TOOLBAR_ORDER`/`TOOLS_WITH_DROPDOWN`
  slot, and touches both `MouseModes.tsx` and `ToolDropdown.tsx`'s hardcoded 4 "last tool" selector
  props — reserve it for a genuinely new toolbar-level concept.
- `TOOL_ICON_SIZE: Partial<Record<ToolName, number>>` — override only for icons whose natural size
  differs from the toolbar default (Line/Arrow are both 24, most are the default).
- `utils/getGroupDisplayedTool.ts` — the `switch` mapping a group-key `ToolName` to whichever
  `lastXTool` selector applies. Only needs a new `case` when inventing a brand-new dropdown group
  (see above) — joining an existing group needs no change here.

## 4. Icons

- SVG source lives in `src/assets/svg/<kebab-name>.svg`, `data-svg-property="fill"` on the path for
  runtime recoloring (see the `xigma-icons` skill).
- `src/assets/svg.ts` is the single registry: one `import X from './svg/x.svg?react'` line
  (alphabetically ordered) feeding into one alphabetically-ordered `Icons = { ... }` object. An SVG
  file existing on disk does **nothing** until both lines are added here.

## 5. Translations

- `src/translations/resources/{en,pl}.json` — flat dot-key JSON, alphabetically ordered. Toolbar
  labels are `design.toolbar.tool.<toolName>`. Never hardcode label text in `constants.ts` — it
  holds the translation **key**, resolved via `t()` at render time (see `xigma-translation-namespace`
  skill).

## 6. Keyboard shortcuts — two separate registries, easy to update only one

- `components/Design/keys.ts` (`KEYBOARD_SHORTCUTS`) — **display only**. Feeds the tooltip text and
  the dropdown item's shortcut hint (`MouseModes.tsx`/`ToolDropdown.tsx` both do
  `KEYBOARD_SHORTCUTS[tool].join('')`). Updating only this makes the UI *claim* a shortcut exists
  without it actually working.
- `Canvas/hooks/useKeyboardShortcuts/shortcuts.ts` + `useKeyboardShortcuts.ts` (moved here from
  `pages/DesignPage/hooks/useToolbarShortcuts/` at some point — same two-file shape, just relocated) — the
  real keydown-to-`dispatch(setActiveTool(...))` wiring, via a shared `useKeyboardHandler` hook. A
  modifier-combo shortcut (Arrow's `Shift+L`, Section's `Shift+S`) needs `primaryKeys: ['shift']` in
  `shortcuts.ts` so it doesn't also fire on the bare key already bound to a sibling tool (Line's
  plain `L`).

**Both registries must be updated together** for a shortcut to actually work and be discoverable.

**Shipped-and-fixed real instance of "updated only one"**: the Pen tool (`ToolName.pen`, `P`) and Pencil
(`ToolName.pencil`, `Shift+P`) both had correct entries in `keys.ts` (display) *and* in `shortcuts.ts`
(the `{ secondaryKey, primaryKeys }` definitions) from the start — but `useKeyboardShortcuts.ts`'s own
`keysMap` array (the actual list iterated by `useKeyboardHandler`, built as
`{ action: () => dispatch(setActiveTool(ToolName.x)), ...shortcuts[ToolName.x] }` per tool) never got an
entry for either. So the tooltip showed "P" correctly, `shortcuts.ts` had the right key definition sitting
right there — and pressing P did nothing, because nothing in the array actually paired that definition with
a `dispatch` call. This is a **third** place hiding inside what the two-registry framing above treats as
one unit (`shortcuts.ts` supplies the key definition, but `useKeyboardShortcuts.ts`'s array is what actually
activates it) — worth checking explicitly, not just "is it in `shortcuts.ts`", whenever a shortcut is
reported as visually present but non-functional.

**Non-tool shortcuts** (Escape, Undo/Redo, Delete/Backspace, and — added later — Select All, Duplicate,
Copy/Paste, Arrow-key nudge) don't switch `activeTool`, so they skip `keys.ts` entirely (nothing to
show a tooltip for) and live only as extra entries in `useKeyboardShortcuts.ts`'s `keysMap`, each
pulling its `{ secondaryKey, primaryKeys }` from a same-named (non-`ToolName`) key in `shortcuts.ts`
(`escape`, `undo`, `redo`, `selectAll`, `duplicate`, `copy`, `paste`, `nudgeUp`/`nudgeUpLarge`/...).
Cmd/Ctrl+D (duplicate), Cmd/Ctrl+C/V (copy/paste), Cmd/Ctrl+A (select all), and the arrow-key nudge
(`NUDGE_STEP`/`NUDGE_STEP_LARGE` with Shift, `Canvas/constants.ts`) all read/write `selectedIds` and
`nodes` off the real store singleton directly (`store.getState()`, not `useAppSelector`, matching
`handleDeleteSelection`'s existing style) and each brackets its own multi-dispatch in a single
`beginHistoryGesture`/`endHistoryGesture` pair so N moved/duplicated/pasted nodes collapse into one
undo step (`design-store-architecture.md` §8). Select All and Nudge skip entirely while a vector node
is open for editing (`vectorEditingNodeIds.length > 0`) — mixing scene-node-level `selectedIds` with
Vector Edit Mode's own vertex/segment selection would select/move the wrong thing. Duplicate/Copy/Paste
instead **branch**: with a vertex or segment selected (`selectedVectorVertexIdsRef`/
`selectedVectorSegmentIdsRef` non-empty), they delegate to a parallel vertex/segment-level
implementation (`vector-network.md` §65) instead of no-opping — added as a direct follow-up request
once the whole-node version shipped. Copy/paste's whole-node clipboard is a plain module-level array
(`utils/clipboard.ts`, `getClipboardNodes`/
`setClipboardNodes`) — no OS clipboard integration, lost on reload, deep-cloned on both write and the
shared `cloneNodeWithOffset.ts` read path (also used by duplicate) so later mutation of the live nodes
can't corrupt what's sitting in the clipboard. Both duplicate and paste offset the clone by
`DUPLICATE_OFFSET` world units via a new shared `Canvas/utils/getGeometryDeltaChanges.ts` (extracted,
unchanged, from what used to be `continueDrag.ts`'s private `getOriginChanges` — the same per-node-shape
delta switch, on `x`/`y` vs `x1..y2` vs `vertices`, now reused a third way for the nudge handler too).
One deliberate node-shape special-case: cloning a text-on-path node clears its `pathId` — leaving it
attached would mean two text nodes both bound to (and repositioned by) the *same* original path.

## 7. Canvas interaction (the actual drag gesture)

- `Canvas/Canvas.tsx` — one `useDraw*Tool(refs, <TOOL>_SETTINGS)` call per tool, where `refs` is the
  single `TCanvasRefs` object from `useCanvasRefs()` (`canvas-rendering-pipeline.md` §1) — the hook
  destructures just the `canvasRef`/`draftRef` pair it needs off it. Multiple tools can share the
  **same hook** with different config objects (Arrow and Line both call `useDrawLineTool`, each
  gated internally on its own `config.tool === activeTool`) — check whether an existing hook's
  geometry already matches the new tool before writing a new one.
- `Canvas/toolSettings.ts` — the `<TOOL>_TOOL_SETTINGS` config objects consumed above.
- `Canvas/hooks/useDraw<X>Tool/` — the actual `pointerdown`/`pointermove`/`pointerup` native
  listeners (attached only while `activeTool === tool`), building the live draft object into a
  `useRef` (never Redux — the render loop reads it directly every frame so dragging doesn't dispatch
  per pixel) and dispatching `addNode` on release. `useDrawShapeTool` is the shared hook for any
  plain `{x,y,width,height}` box (Frame/Section/Rectangle/Ellipse); anything with different geometry
  (Line, Polygon, Star, Media, Text) gets its own hook.

## 8. Rendering (WebGL)

Two independent render passes, both need updating for a visual change to show up in both states:

- `drawScene/drawSceneNodes.ts` — the committed-node pass, one `switch (node.type)` case per
  `NodeType`, called every frame for every node currently on the scene.
- `drawScene/drawFrame.ts` (dispatcher, despite the name) → `drawDraft<X>.ts` — the **live**,
  in-progress drag preview, reading the `draftRef` from §7.
- `drawScene/drawPerNodeSelectionOutlines.ts` — the extra overlay drawn **on top** for selected
  nodes (outline + handles). Only needs a change if the new visual should differ specifically while
  selected — a plain content addition (like Arrow's arrowhead) usually only touches the two passes
  above, since the base pass already draws for every node regardless of selection.
- `src/utils/canvas/*` — the actual low-level WebGL primitives (`drawRect`, `drawLine`, `drawEllipse`,
  `drawPolygon`, `drawArrowhead`, ...). Check here first before writing new vertex/buffer boilerplate
  — a new primitive can usually be composed from existing ones (`drawArrowhead` is just two
  `drawLine` calls for the wings plus three `drawEllipse` calls for round caps/joints, since there's
  no dedicated rounded-polyline primitive).
- `src/constant/canvas.ts` — every magic number (stroke widths, hit-test tolerances, handle sizes,
  dash lengths) lives here, not inline. Roughly alphabetical but not strictly enforced.

## 9. Hit-testing / selection — deliberately decoupled from rendering

- `Canvas/utils/getNodeAtPoint.ts` dispatches per `NodeType` to a geometry-specific test
  (`isPointNearLine.ts`, `isPointInEllipse.ts`, plain AABB for boxes). `getNodeBounds.ts` computes
  each type's bounding box for marquee/group-selection.
- **A purely visual addition (like an arrowhead) should not change hit-testing or bounds** unless
  explicitly asked for — the clickable area stays the raw geometry (e.g. the line segment) even if
  the rendered shape visually overflows it slightly, same as corner/rotate handles already do.

## 10. Tests

- Unit: co-located `.spec.ts(x)` next to every file above. Render-layer tests share one convention —
  a `createGlMock()` building a fake `WebGL2RenderingContext` as `{ CONST: number, ...vi.fn() per
  method }`, then asserting on `gl.drawArrays`/`gl.bufferData` call shape/count, never real GPU
  state. Copy an existing sibling test file's mock rather than writing one from scratch.
- Optional fields (§1) mean most existing tests need **zero** changes when adding a style field to
  an existing node type — only the new tool's own dedicated tests need to set it.
- e2e (`e2e/pages/design/`): only owed when the change is genuine browser+rendering+timing behavior
  a unit test can't see (see the `xigma-e2e-coverage` skill for the exact bar). Use the shared
  `DesignPage.ts` page object; a new tool usually needs 2-4 tests — draw-and-verify-toolbar-state,
  a visual diff proving the new rendering actually differs from the closest existing tool (compare
  two of your own screenshots, not a golden file), and the shortcut(s). Update the scenario table in
  `TEST_CASES.md` in the same change.

## Checklist for a new tool that reuses an existing node type + hook (Arrow-shaped change)

1. `types/design/enums.ts` — add the `ToolName` member.
2. `types/design/types.ts` — add any new optional field(s) to the node type, if needed.
3. `Toolbar/constants.ts` — `TOOL_ICON`, `TOOL_LABEL`, append to the right `TOOL_GROUP_ITEMS` array,
   `TOOL_ICON_SIZE` if the icon needs a size override.
4. `assets/svg.ts` — register the icon (create the SVG first if it doesn't exist).
5. `translations/resources/{en,pl}.json` — add the label key.
6. `store/design/utils/handleSetActiveTool.ts` — add the tool to the right `lastXTool` case.
7. `components/Design/keys.ts` **and** `useToolbarShortcuts/shortcuts.ts` **and**
   `useToolbarShortcuts.ts` — the shortcut, in all three places.
8. `Canvas/toolSettings.ts` + `Canvas/Canvas.tsx` — a new `<TOOL>_TOOL_SETTINGS` config and hook
   registration (reusing the existing hook if geometry matches).
9. Rendering — extend the relevant `drawSceneNodes.ts` case and the matching `drawDraft*.ts`, adding
   a new `utils/canvas/` primitive only if nothing existing composes into the new visual.
10. `docs/ROADMAP.md` — a bullet under the etap that owns tool additions (Etap 6 in this codebase),
    describing what's reused vs. genuinely new, plus a forward-reference note in whichever future
    etap will eventually build UI for any new fields (Etap 8 for line-style fields → future
    properties panel).
11. Tests — unit tests for every touched file per §10, plus an e2e spec per §10 if the bar is met.

## Full worked example

The Arrow tool (`XG-APP: add Arrow tool`, see `git log`) is the concrete instance of every step
above: `ToolName.arrow`, `TLineNode.startPoint`/`endPoint` (optional, `'default' | 'arrow'`),
`ARROW_TOOL_SETTINGS` reusing `useDrawLineTool`, joining Line's slot in the Rectangle dropdown,
`Shift+L`, a new `drawArrowhead.ts` primitive composed from `drawLine`/`drawEllipse`, wired into
`drawSceneNodes.ts` and `drawDraftLine.ts` via a shared `drawLineEndpointArrowheads.ts` helper, zero
changes to hit-testing, and `e2e/pages/design/create-arrow.spec.ts`. Read that commit's diff
alongside this doc for the concrete shape of every piece described here.

## A one-shot tool that doesn't fit this checklist: Comment

Not every `ToolName` is a draw tool in the sense above. The Comment tool (`ToolName.comment`) never
produces a `NodeType` — clicking the canvas opens a `CommentDraftInput`, and submitting dispatches
`addComment` into its own `comments`/`commentDraftPosition` state (§2/§3 don't apply). Comments render
as plain DOM overlay `<div>`s positioned via `worldToScreen`, not WebGL scene nodes — no draft-fill
step (§7), no shader/draw call (§8), no hit-testing entry (§9). Its pointer-listener shape does mirror
§7's "attach only while this tool is active" pattern (`useCommentTool.ts`, same style as
`useHandTool.ts`), and it does get a normal toolbar radio + `KEYBOARD_SHORTCUTS` entry (§3/§6), but
stop here if you came looking for how its "shape" is drawn — there isn't one. See
`design-store-architecture.md`'s "Comment state" note for the actual state/reducer shape.

## Related

[[canvas-rendering-pipeline]] — one level deeper: the actual WebGL mechanics underneath §8/§9 here
(shader programs, the render loop, coordinate transforms, the primitive-drawing boilerplate).
[[design-store-architecture]] — the state layer underneath §2 here (full `TDesignState` shape,
reducer conventions, the ref-vs-Redux split §7 only touches briefly).
[[selection-and-manipulation]] — what happens to a node *after* this doc's tools create it: hit-testing,
selection, drag/resize/rotate.
[[vector-network]] — the Pen tool / Vector Network, a genuinely different "shape" of tool this doc's
8-concern checklist only partially covers (multi-click, multi-session, no draft-then-commit).
