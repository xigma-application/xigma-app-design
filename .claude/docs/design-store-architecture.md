# Design store (Redux) — architecture

How the app's central state (`store/design`) is shaped and the conventions around it. Companion to
`design-tool-architecture.md` (how a tool is assembled) — this is the state layer underneath
everything, including the ref-vs-Redux split that most interaction code relies on.

## 1. Overall shape

`store/design` is **the only slice** — `src/store/store.ts` registers a single reducer key:
```ts
export const store = configureStore({ reducer: { design: designReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
```
No custom middleware — RTK's defaults (including dev-mode `serializableCheck`/`immutableCheck`) are
used as-is.

`src/store/hooks.ts`:
```ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```
`src/store/index.ts` re-exports both barrels, so app code imports everything —
`useAppDispatch`/`useAppSelector`/`useAppStore`/`store`/`RootState`/`AppDispatch` — from the single
`'store'` path. Non-component/non-hook code (event handlers, drag-continuation utils that aren't
React) calls `store.getState()` directly plus the plain selector functions from
`store/design/selectors`, since `useAppSelector` isn't available outside a component.

`TDesignState` (`store/design/types.ts`), fields grouped thematically (the actual source keeps them
alphabetical):
```ts
type TDesignState = {
  // tool state
  activeTool: ToolName;
  lastFrameTool: ToolName;
  lastMouseTool: ToolName;
  lastShapeTool: ToolName;
  lastTextTool: ToolName;

  // scene data
  nodes: Record<string, TSceneNode>;
  rootOrder: string[];

  // comments
  commentDraftPosition: TPoint | null;
  comments: Record<string, TComment>;

  // selection
  selectedIds: string[];

  // viewport
  viewport: TViewport;

  // text-editing
  editingNodeId: string | null;
  editingSelectionChangedAt: number;
  editingSelectionEnd: number;
  editingSelectionStart: number;
  editingTextBox: TEditingTextBox | null;
  editingTextContent: string;
};
```

## 2. Scene data model — `nodes` + `rootOrder`

Both exist so z-order never depends on JS object key iteration order (roadmap Etap 2). `rootOrder`
maintenance:
- `handleAddNode.ts` pushes the new id to the **end** — new nodes are always topmost:
  ```ts
  export const handleAddNode = (state, node) => {
    state.nodes[node.id] = node;
    state.rootOrder.push(node.id);
  };
  ```
- `handleDeleteNode.ts` filters the id out (see §3).
- Hit-testing relies on this directly: `getNodeAtPoint.ts` does
  `[...selectOrderedNodes(state)].reverse().find(...)` — topmost-wins = last-in-`rootOrder`-wins.
- No "bring to front/send to back" UI exists yet (Etap 15 backlog) — `rootOrder` today only ever
  changes via creation/deletion order.

**`parentId` is real as of Etap 12a (groups)** — no longer the always-`null` scaffolding this note
used to describe. A node's `parentId` is set to a `TGroupNode`'s id once it joins that group; it
still holds absolute world coordinates (`x/y/width/height/rotation` are never relative to the
parent). Full writeup — the group reducers, the click/hover selection-bypass rules, and the group's
own bounds-sync (including the rotated case) — lives in `group-nodes.md`, not here.

**`locked?: boolean` / `hidden?: boolean`** (added for the Layers panel, `LeftPanel/File/Layers`) —
optional on every `TSceneNode` variant (added to `TBaseNode`, plus separately to `TLineNode`/
`TVectorNode` since those two don't extend it), same "retrofit as optional, `?? false`/falsy-check
at read sites" pattern as `TRectangleNode.cornerRadius?: number`, chosen over `TMediaNode`-style
required-per-type fields because locked/hidden apply to every node type, not a shape-specific
feature — making them required would force every node-construction call site to set them. Toggled by
`toggleNodeLocked`/`toggleNodeHidden` (below). Consumed by `Canvas/utils/getNodeAtPoint.ts` and
`Canvas/utils/getCollidedNodes.ts` (both skip a `hidden`/`locked` node outright, before the per-type
test), and by `drawScene.ts` (filters `hidden` nodes out of `sceneNodes` before they ever reach
`drawSceneNodes`, so they never render). **Deliberately not wired into any `arm*Drag`** — a locked
node already selected via the panel itself (not clicked on canvas) can still be moved/resized/
rotated; only *acquiring* a locked/hidden node via a canvas click or marquee is blocked.

## 3. Reducers — `store/design/slice.ts`

Per the `xigma-store-slice-logic` convention (one-statement bodies stay inline, multi-statement
bodies delegate to `utils/handle<ReducerName>.ts`):

| Reducer | Inline / delegated | What it does |
|---|---|---|
| `addComment` | delegated → `handleAddComment.ts` | id via `nanoid()` in `prepare` (same pattern as `addNode`) — see below |
| `addNode` | delegated → `handleAddNode.ts` | id via `nanoid()` in `prepare`, not the reducer body — see below |
| `cancelCommentDraft` | inline (`state.commentDraftPosition = null`) | |
| `createMaskGroup` | delegated → `handleUseNodesAsMask/handleUseNodesAsMask.ts` | id via `nanoid()` in `prepare`; runs `handleGroupNodes` then renames the group `'Mask group'` and sets `isMask` on the **last** `childIds` entry — see `masks.md` |
| `deleteComment` | inline (`delete state.comments[action.payload]`) | wired to a store action, but no UI dispatches it today — comment deletion is intentionally disabled in `CommentPin` for now |
| `deleteNode` | delegated → `handleDeleteNode.ts` | path+text cascade, plus group cascade both directions — see `group-nodes.md` §2 |
| `groupNodes` | delegated → `handleGroupNodes/handleGroupNodes.ts` | id via `nanoid()` in `prepare`, same pattern as `addNode` — see `group-nodes.md` §2 |
| `setActiveTool` | delegated → `handleSetActiveTool.ts` | `lastXTool` bucket switch — see below |
| `setSelection` | inline (`state.selectedIds = action.payload`) | |
| `setViewport` | inline (`state.viewport = action.payload`) | |
| `startCommentDraft` | inline (`state.commentDraftPosition = action.payload`) | |
| `startTextEdit` | delegated → `handleStartTextEdit.ts` | seeds editing fields, selects all existing content |
| `stopTextEdit` | delegated → `handleStopTextEdit.ts` | resets all 6 editing fields |
| `toggleNodeHidden` | delegated → `handleToggleNodeHidden.ts` | flips `hidden` by id (no-op on unknown id) — see above |
| `toggleNodeLocked` | delegated → `handleToggleNodeLocked.ts` | flips `locked` by id (no-op on unknown id) — see above |
| `toggleNodeMask` | delegated → `handleToggleNodeMask/handleToggleNodeMask.ts` | flips `isMask` by id (no-op on unknown id); the menu's "Remove mask" — see `masks.md` |
| `ungroupNodes` | delegated → `handleUngroupNodes/handleUngroupNodes.ts` | payload is group ids — see `group-nodes.md` §2 |
| `updateCommentContent` | delegated → `handleUpdateCommentContent.ts` | patch by id (no-op on unknown id) — wired to a store action, but no UI dispatches it today, same as `deleteComment` |
| `updateEditingTextBoxPathStartOffset` | delegated → `handleUpdateEditingTextBoxPathStartOffset.ts` | guarded single-field mutation on nested `editingTextBox` |
| `updateNode` | delegated → `handleUpdateNode.ts` | patch + path/text sync — see below |
| `updateTextEditContent` | inline | |
| `updateTextEditSelection` | delegated → `handleUpdateTextEditSelection.ts` | also stamps `editingSelectionChangedAt` |

**`addNode`'s `prepare` callback** — id generation happens outside the reducer body so the reducer
itself stays a pure function of `(state, action)`:
```ts
addNode: {
  prepare: (node: TNewSceneNode) => ({ payload: { ...node, id: nanoid() } as TSceneNode }),
  reducer: (state, action: PayloadAction<TSceneNode>) => handleAddNode(state, action.payload),
},
```

**`updateNode`** (`handleUpdateNode.ts`) — partial patch by id (no-op on unknown id), plus
bidirectional path↔text sync for text-on-path pairs:
```ts
export const handleUpdateNode = (state, payload) => {
  const node = state.nodes[payload.id];
  if (node) {
    Object.assign(node, payload.changes);
    if (node.type === NodeType.path) syncPathTextNodes(state, node);
    else if (node.type === NodeType.text && node.pathId) syncPathNodeFromText(state, node);
  }
};
```
`syncPathTextNodes.ts` propagates a path node's box (`x/y/width/height/rotation`) to every text node
bound to it via `pathId`; `syncPathNodeFromText.ts` does the reverse (editing the bound text node's
box moves/resizes the path it rides on), then re-syncs siblings through `syncPathTextNodes` again.

**A `NodeType.vector` can also be a text-on-path guide** — `text.pathId` may reference either the
auto-generated ellipse `NodeType.path` (unchanged) or an existing, eligible vector (Text on Path
tool: a plain click on a vector satisfying `getVectorChainOrder(node) !== null`, the same condition
Variable Width uses). There is no mode flag on the node; "is this vector bound as a text path?" is
derived by scanning for a text node whose `pathId` matches (`isVectorBoundAsTextPath.ts`). A third
`handleUpdateNode.ts` branch, `else if (node.type === NodeType.vector) syncPathTextNodesFromVector`,
mirrors `syncPathTextNodes` one layer over: it pushes the vector's own `getVectorNodeBounds` (baked
via `getRenderedVectorNode`) onto every bound text node's box, forcing `rotation: 0` (the vector's
rotation is already baked into its vertices). Unlike an ellipse path, `syncPathNodeFromText` is
**not** extended to push the text box back onto a bound vector — a user's vector network is never
reshaped by dragging its offset handle. On attach, the tool also clears the vector's fill
(`filledFaceKeys: []`, `fillByKey: {}`, `defaultFill: null`) and the vector becomes inert
as an independent hit-test target (`getNodeAtPoint.ts`'s `case NodeType.vector` returns `false` for
any id a text node's `pathId` names, the same treatment `case NodeType.path` already got) — so it is
neither selectable nor re-enterable into Vector Edit Mode while bound; the cascade-delete pair above
handles it exactly like an ellipse path, no special-casing needed. See `canvas-rendering-pipeline.md`
for the ellipse-vs-vector curved-text rendering split (`pathSampler` module).

**`deleteNode`** (`handleDeleteNode.ts`) — recursive cascade, one direction only:
```ts
export const handleDeleteNode = (state, id) => {
  const node = state.nodes[id];
  if (node) {
    delete state.nodes[id];
    state.rootOrder = state.rootOrder.filter((nodeId) => nodeId !== id);
    state.selectedIds = state.selectedIds.filter((nodeId) => nodeId !== id);
    if (node.type === NodeType.text && node.pathId) handleDeleteNode(state, node.pathId); // cascade
  }
};
```
Deleting a text-on-path node cascade-deletes its bound path node (self-recursive call); deleting the
**path** directly does **not** cascade-delete its text — the cascade only runs one direction. Also
strips the deleted id from `selectedIds` in the same pass.

**`setActiveTool`** (`handleSetActiveTool.ts`) — the "last used tool per toolbar group" switch that
makes a shared dropdown button remember/display whichever variant was last picked:
```ts
switch (tool) {
  case ToolName.arrow: case ToolName.ellipse: case ToolName.line:
  case ToolName.media: case ToolName.polygon: case ToolName.rectangle: case ToolName.star:
    state.lastShapeTool = tool; break;
  case ToolName.default: case ToolName.hand: case ToolName.scale:
    state.lastMouseTool = tool; break;
  case ToolName.frame: case ToolName.section: case ToolName.slice:
    state.lastFrameTool = tool; break;
  case ToolName.text: case ToolName.textOnPath:
    state.lastTextTool = tool; break;
  default: break; // Comment tool: updates none of the four buckets
}
```
A new tool joining an existing dropdown group must be added to the matching `case` — forgetting this
doesn't break drawing, it just means the toolbar button never updates its shown icon after picking
the new tool. See `design-tool-architecture.md` §3 for the toolbar-UI side of this mechanism.

**Text-editing reducers**: `startTextEdit` seeds `editingTextBox`/`editingTextContent` (`''` default)/
`editingNodeId` (`payload.id ?? null`), resets selection to `[0, content.length]` (selects all
existing content when re-editing, else an empty caret), stamps `editingSelectionChangedAt = Date.now()`.
`stopTextEdit` resets all editing fields to their initial values. `updateTextEditSelection` re-stamps
that same timestamp on every call — it exists purely so consumers can detect "selection changed
externally" even when `start`/`end` values happen to repeat (re-selecting the same range).

**Comment state**: `addComment`'s `prepare` mirrors `addNode`'s id-generation pattern, but the reducer
itself (`handleAddComment.ts`) reads the actual `x`/`y` from `commentDraftPosition` rather than the
action payload, and no-ops entirely if no draft is open:
```ts
export const handleAddComment = (state, payload) => {
  if (state.commentDraftPosition) {
    state.comments[payload.id] = {
      author: MOCK_COMMENT_AUTHOR,
      content: payload.content,
      createdAt: Date.now(),
      id: payload.id,
      x: state.commentDraftPosition.x,
      y: state.commentDraftPosition.y,
    };
    state.commentDraftPosition = null;
  }
};
```
`author` is a hardcoded `MOCK_COMMENT_AUTHOR` (`store/design/constants.ts`) — there's no user/auth
system wired in yet. Comments render as plain DOM overlay elements (`Comment.tsx`/`CommentPin.tsx`),
not WebGL scene nodes, so they never touch `nodes`/`rootOrder` and aren't part of hit-testing,
selection, or the rendering pipeline described in `canvas-rendering-pipeline.md`. `setActiveTool`'s
`lastXTool` bucket switch (above) intentionally has no case for `ToolName.comment` — it's a one-shot
tool, not part of any dropdown group that needs to remember its last pick.

## 4. Selectors — `store/design/selectors.ts`

18 exported selectors. Most are plain `(state: RootState) => ...` field reads with no memoization,
but three now go through RTK's `createSelector` (`selectOrderedNodes`, `selectSelectedNodes`,
`selectComments`) — each derives a fresh array from a record/ordering, and memoizing avoids
re-materializing that array (and re-rendering every consumer) unless the actual inputs changed:
```ts
export const selectOrderedNodes = createSelector([selectRootOrder, selectNodes], (rootOrder, nodes) => rootOrder.map((id) => nodes[id]));
export const selectSelectedNodes = createSelector([selectSelectedIds, selectNodes], (selectedIds, nodes) =>
  selectedIds.map((id) => nodes[id]),
);
export const selectComments = createSelector([selectCommentsRecord], (comments) => Object.values(comments));
```
`selectRootOrder`/`selectCommentsRecord` are unexported helper selectors that only exist to give
`createSelector` a stable input reference. Every other selector (including `selectNodes`,
`selectCommentDraftPosition`, all the `lastXTool`/editing-field reads) is still a plain unmemoized
field access — the memoization here is specifically for the "derive an array from a record" shape,
not a blanket policy.

## 5. The ref-vs-Redux split for ephemeral interaction state

`Canvas.tsx` (via `useCanvasRefs()`, `canvas-rendering-pipeline.md` §1) holds four `useRef`s read
directly by the render loop each frame instead of going through Redux+re-render — see
`canvas-rendering-pipeline.md` §5 for the full table and reasoning
(verbatim roadmap quote: "żeby przeciąganie nie dispatchowało do store'u przy każdym pixelu" — so
dragging doesn't dispatch to the store every pixel).

**Important nuance — confirmed true, easy to assume otherwise**: the ref treatment applies to
*preview-only visuals*, not to real state mutations that happen to occur mid-drag. Two things that
sound like they'd be ref-only are **not**:

- **Marquee selection**: the marquee *rectangle* is ref-only (`marqueeRef`), but the *selection it
  produces* dispatches to Redux on **every** `pointermove`, not just on release —
  `continueMarqueeDrag.ts`:
  ```ts
  marqueeRef.current = rect;                                     // visual rect → ref
  dispatch(setSelection(collidedNodes.map(({ id }) => id)));     // selectedIds → Redux, every move
  ```
  Confirmed deliberate, matching x-design's behavior (roadmap Etap 5): selection updates live during
  the drag, not only after release.
- **Moving an already-selected node/group**: `continueDrag.ts` (`useSelectionTool/utils/handlePointerMove/`)
  dispatches `updateNode` for every dragged node on **every** `pointermove` too, not just on
  `pointerup`.

So the actual rule: **preview-only rendering artifacts** (in-progress drawn shape, marquee rectangle,
hover outline, slice draft) live in refs; **committed scene mutations that other app state depends
on** (a node's real `x/y`, `selectedIds`) go through Redux on every tick of the gesture that changes
them, because they're real state other parts of the app could read. `addNode` itself is still the
one truly single-dispatch case — the shape being drawn stays ref-based (`draftRef`) the whole time
and only becomes a real `addNode` dispatch once, on `pointerup`.

This per-pointermove dispatch rate is explicitly flagged as a **future** cost, not a current bug —
Etap 11 (undo/redo, not yet built) notes: "historia nie powinna zapisywać **każdej** klatki drag'a
[...] tylko stan po puszczeniu, tak jak `addNode` już dziś dispatchuje dopiero na pointerup, nie co
pixel" (history shouldn't record every drag frame, only post-release state, the way `addNode` already
only dispatches once) — i.e. whichever undo/redo implementation lands eventually needs to coalesce
these per-move `updateNode` dispatches into one history entry per gesture, itself.

## 6. Viewport state

`TViewport = { x, y, zoom }`, one `setViewport` reducer (inline, full replace). **Unthrottled** —
no ref/RAF batching, unlike drag state:
- `useCanvasPanZoom.ts` (`wheel` listener, `{ passive: false }`) dispatches `setViewport` on every
  native `wheel` event — `event.ctrlKey` distinguishes zoom (Ctrl/Cmd+scroll or trackpad pinch,
  which browsers report as `wheel` with `ctrlKey: true`) from plain pan.
- `useCanvasDragPan.ts` (middle-mouse drag) dispatches `setViewport` on every `pointermove` while the
  middle button is held; only the *previous* pointer position (`lastPointRef`, needed for delta math)
  is a ref — the viewport value itself is always read fresh via `store.getState()` and always
  dispatched. So viewport is the one continuous-drag value **not** given the ref treatment; every
  pan/zoom tick is a real dispatch (the WebGL side also receives `viewport` as GPU uniforms directly,
  per `canvas-rendering-pipeline.md` §4, so this dispatch drives both the JS-side selector consumers
  and (indirectly, via the next `drawScene` call) the shader uniforms).

A third family of `setViewport` dispatchers is one-shot rather than continuous: the View menu's
Zoom section (`LeftPanel/NavRail/LogoMenu/ViewMenu/ViewMenu.tsx`) and the matching global keyboard
shortcuts (`Canvas/hooks/useKeyboardShortcuts/useKeyboardShortcuts.ts`, `shortcuts.ts`'s `zoomIn`/
`zoomOut`/`zoomTo100`/`zoomToFit`/`zoomToSelection`/`zoomToNextFrame`/`zoomToPreviousFrame`) both
funnel through the same `handleZoom*.ts` utils under `useKeyboardShortcuts/utils/` — one
implementation shared by menu-click and shortcut, not two. Two pure-math primitives back every
variant, both in `Canvas/utils/`:
- `getZoomToViewport(viewport, targetZoom, anchor)` — generalizes `applyZoom.ts`'s
  cursor-anchored zoom formula to an explicit target zoom instead of a wheel delta. Used by
  zoom in/out (via `getSteppedZoomViewport`, which snaps to the next/previous value in
  `ZOOM_STEP_PRESETS`), zoom-to-100%, and the percentage-preset menu (`ZoomToMenu`,
  `handleZoomToPercentage.ts`) — anchored on the panel-aware visible-rect center in every case.
- `getFitViewport(bounds, visibleRect, paddingPx)` — solves for the zoom/pan that fits a world
  rect into a screen rect. Used by zoom-to-fit (`handleZoomToFit.ts` — fits the selection when one
  exists, else all top-level nodes), zoom-to-selection, and zoom-to-previous/next-frame
  (`handleZoomToAdjacentFrame.ts`, using `getAdjacentFrameBounds.ts` to pick the next/previous
  top-level `NodeType.frame` node, ordered left-to-right, wrapping, anchored off whichever frame
  currently contains — or is nearest to — the viewport center).

Both primitives take a `visibleRect` from `getVisibleCanvasRect(canvasRect, leftPanelWidth,
rightPanelWidth)` rather than the raw canvas element size — the canvas spans the full app width
(`LeftPanel`/`RightPanel` are separate absolute overlays on top of it, not children that shrink
it), so panel width must be subtracted explicitly. `refs.layout.leftPanelWidthRef`/
`rightPanelWidthRef` already read `0` when a panel is hidden or minimized (`useReportPanelWidth`),
so no separate minimized-state check is needed.

## 7. Test conventions for this layer

A recurring (not universally enforced) `buildState(overrides: Partial<TDesignState> = {}) => TDesignState`
helper returns a full, valid state with every field defaulted, spread with `...overrides`:
```ts
const buildState = (overrides: Partial<TDesignState> = {}): TDesignState => ({
  activeTool: ToolName.default,
  editingNodeId: null,
  editingSelectionChangedAt: 0,
  editingSelectionEnd: 0,
  editingSelectionStart: 0,
  editingTextBox: null,
  editingTextContent: '',
  lastFrameTool: ToolName.frame,
  lastMouseTool: ToolName.default,
  lastShapeTool: ToolName.rectangle,
  lastTextTool: ToolName.text,
  nodes: {},
  penActiveVertexId: null,
  rootOrder: [],
  selectedIds: [],
  vectorEditingNodeIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  ...overrides,
});
```
Not every spec factors this out (`handleAddNode.spec.ts` inlines the full literal twice instead), so
treat it as a common pattern to reuse, not a hard rule. `slice.spec.ts` (the top-level slice test)
instead calls the exported action creators + default reducer directly
(`slice(undefined, setActiveTool(...))`), verifying wiring end-to-end rather than duplicating each
handler's own unit tests. `selectors.spec.ts` builds one shared `state = { design: {...} } as any`
and asserts every selector against it. All follow the `// mock` / `// before` / `// action` /
`// result` step-comment convention (`xigma-test-conventions`).

## 8. History middleware — `store/history/` (global undo/redo)

Built from scratch as [[vector-network]]'s own foundation — no history mechanism existed anywhere
before it (ROADMAP Etap 11 was unstarted, undecided even on approach). Deliberately **not** a
`redux-undo`-style reducer wrapper (which would change `state.design.*` to `state.design.present.*`
and touch every selector in this file) — a plain `Middleware`, registered once in `store.ts`:
```ts
export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(createHistoryMiddleware()),
  reducer: { design: designReducer },
});
```
`createHistoryStack()` is instantiated **once in `store.ts`**, not inside the middleware factory — the
same instance is shared between `createHistoryMiddleware(historyStack)` (which now takes it as a
parameter) and Redux thunk middleware's **`extraArgument`**:
```ts
const historyStack = createHistoryStack();

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: { extraArgument: historyStack } }).concat(createHistoryMiddleware(historyStack)),
  reducer: { design: designReducer },
});
```
Every store (the real one and every test store) that builds its own `historyStack` this way still gets
full isolation — nothing module-level is shared across stores.

Each history entry is a `THistorySnapshot = { design: TDesignSnapshot; vectorSelection:
TVectorSelectionSnapshot }` (`createHistoryStack.ts`) — **not** just the document any more.
`TDesignSnapshot` (`{ activePageId, pages, selectedIds }`, `store/design/types.ts`) captures the **whole
`pages` record plus which page is active** (not just the active page's `nodes`/`rootOrder`), so
undo/redo covers page-level operations: `renamePage`, `setActivePage`, `addPage`, `deletePage`,
`duplicatePage` all joined `UNDOABLE_ACTION_TYPES`, and `handleReplaceDesignSnapshot` now assigns
`state.pages`/`state.activePageId`/`state.selectedIds` wholesale before the vector-editing cleanup.
`deletePage` (`handleDeletePage.ts`) no-ops on the last remaining page and re-points `activePageId`
to the previous page in order when the active one is removed; `duplicatePage`
(`handleDuplicatePage.ts`) deep-clones the source page inserted right after it (mirrors
`handleAddPage`'s insert-after-active ordering) and makes the copy active — undoing either restores
the prior `pages` record wholesale. Both now have a UI: the `PageRow` right-click menu
(`PageRowMenu.tsx` — a controlled `@radix-ui/react-popover` positioned at the cursor via a virtual
anchor from `usePageRowContextMenu.ts`; reuses `PopoverCompound.PopoverItem`). The reducer stays pure
— `duplicatePage`'s payload carries the pre-generated `newPageId` + a `nodeIdMap` (`nanoid()` per
source node id, built in `useDuplicatePage.ts`); `handleDuplicatePage` remaps every node `id`,
`parentId` and text-node `pathId` through that map (vector-internal vertex/segment ids stay
node-scoped and are not remapped), and calls `getDuplicatePageName` for the `"<name> copy"` /
`"<name> copy 2"` naming. `getActivePage`/draft note: the util does `current(draftSource)` before
`structuredClone`, since `structuredClone` throws on an Immer draft. A new page name is generated
by `getNextPageName` (add) / `getDuplicatePageName` (duplicate). Separately, a `?page=<id>` query
param (the app has no client-side router — every URL param is read directly off
`window.location.search`, see [[app-shell]]) is read once on mount by
`components/App/hooks/useSyncActivePageFromUrl.ts` → `setActivePage` if the id resolves (the one
history entry this leaves is the accepted tradeoff). Still deliberately out of the snapshot: per-page `viewport`/`paint`/`comments` and
`activeTool` are UI state, not document state. `TVectorSelectionSnapshot` (`types/design/canvas/types.ts`) is the
newer half — `{ selectedVectorVertexIds, selectedVectorSegmentIds, selectedVectorHandles }` — added so
undo/redo also restores which vertex/segment/tangent-handle was selected inside Vector Edit Mode; see
[[vector-network]] §8 for why that was a real gap (that state lives entirely in `TCanvasRefs`, outside
Redux) and how it's captured/restored.

Actions (`store/history/actions.ts`): `beginHistoryGesture` (`createAction<TVectorSelectionSnapshot>`,
payload = the vector-selection captured by the caller at gesture-start) / `endHistoryGesture` (bracket
one undo-able gesture, unchanged), plus **`undo`/`redo` as thunks**, not plain actions —
`(currentVectorSelection = EMPTY_VECTOR_SELECTION_SNAPSHOT) => (dispatch, getState, historyStack) =>
{...}`, returning the popped `TVectorSelectionSnapshot | null` so the caller can write it back onto the
refs (a plain action can't carry a return value out through `dispatch()`; a thunk can). `historyStack`
reaches the thunk via the `extraArgument` wired above. The coalescing trick that avoids "every drag
frame becomes its own undo step" (§5's own dispatch-per-pointermove nuance) is unchanged:
- `beginHistoryGesture` records the current `{design, vectorSelection}` pair as `pendingSnapshot` but
  does **not** push to `past` yet.
- The first `addNode`/`updateNode`/`deleteNode`/`setSelection` dispatched while a gesture is open pushes
  `pendingSnapshot` once; every further one inside the same open gesture pushes nothing more.
- A dispatch **outside** any open gesture (a plain draw-tool `addNode` — fires exactly once per
  gesture) pushes its own pre-action snapshot immediately, paired with `EMPTY_VECTOR_SELECTION_SNAPSHOT`
  (safe: nothing that reaches this branch is ever a vector-editing mutation — see [[vector-network]] §8).
- A gesture that opens and closes with no undoable dispatch in between (a plain click, a resolver that
  turned out to be a no-op) pushes nothing — correct empty-undo-step avoidance.

**`toggleNodeLocked`/`toggleNodeHidden` also joined `UNDOABLE_ACTION_TYPES`** (`historyMiddleware.ts`) —
plain single-dispatch reducers with no gesture of their own (the Layers panel's lock/eye buttons are
a single click, not a drag), so each toggle is automatically its own undo step with no
`beginHistoryGesture`/`endHistoryGesture` bracketing needed, unlike `setSelection` below.
`createMaskGroup` and `toggleNodeMask` (masks, `masks.md`) joined the same way — each is one
dispatch from a menu click / shortcut, so each is its own undo step with no bracketing.

**`setSelection` joined `UNDOABLE_ACTION_TYPES`** (asked for directly — plain click-to-select/deselect,
with no other edit, must be its own undo step, Illustrator/Photoshop-style, not just restored as a
byproduct of undoing real content changes). This is a one-line addition to the `Set` in
`historyMiddleware.ts`, but it has a real consequence: **every** tool hook that dispatches `setSelection`
*and* another undoable action (typically `addNode`) across its own pointerdown/pointerup cycle now needs
that cycle bracketed in `beginHistoryGesture`/`endHistoryGesture`, or the coalescing rule above has
nothing to coalesce *against* and each dispatch becomes its own entry — turning "draw one rectangle" into
2-3 separate undo steps (clear-selection-at-pointerdown, add-the-node, auto-select-it) instead of one.
Before this change only `useSelectionTool`/`useDrawPenTool` wrapped their own gestures (§ above); now
every one of the plain shape-draw hooks that clears the selection on pointerdown and commits
`addNode`+auto-select on pointerup also wraps that same cycle:
`useDrawShapeTool`/`useDrawStarTool`/`useDrawLineTool`/`useDrawPolygonTool`/`useDrawTextOnPathTool` (in
the hook itself, spanning `handlePointerDown`→`handlePointerUp`), `useDrawMediaTool`'s own
`utils/handlePointerUp/handlePointerUp.ts` (around just its `addNode`+`appendLastCreatedNodeToSelection`
pair, since its own `handlePointerDown` dispatches nothing), and `TextEditOverlay`'s
`useCommitTextEdit.ts` (around its whole commit body, since it's a blur-event handler, not a canvas
pointer gesture — the abstraction doesn't require an actual pointer drag, just "make N dispatches inside
this handler look like one undo step"). `useDrawTextTool.ts`'s pointerdown-only `setSelection([])`,
`useSliceTool`'s single `setSelection([])`, `useCommentTool`, `useVectorEditOnDoubleClick`,
`useTextEditOnDoubleClick` and the `handleLeave.ts` Escape handler were all confirmed to dispatch exactly
one undoable action in their own scope (no `addNode`/`updateNode`/`deleteNode` alongside), so each is
already safe as a standalone one-shot push, matching the pre-existing keyboard-Delete pattern — no wrap
needed there.

Wired at exactly two points, not per-mechanism: `useSelectionTool`'s `handlePointerDown.ts` dispatches
`beginHistoryGesture(getVectorSelectionSnapshot(canvasRefs))` unconditionally at the top (primary button
only) and `handlePointerUp.ts` dispatches `endHistoryGesture()` unconditionally at the bottom — covering
all dozen-plus arm/continue/disarm mechanisms in [[selection-and-manipulation]] (move, resize, rotate,
every corner-radius/vertex-count/ellipse-arc/Vector-Edit-Mode handle) with zero changes to any individual
`continue*.ts` file, since the middleware is unconditionally safe to bracket a gesture that turns out
to dispatch nothing undoable. `useDrawPenTool` (multi-click, its own hook — see [[vector-network]])
wraps its own pointerdown/pointerup the same way, since it isn't part of `useSelectionTool`.

`undo`/`redo` thunks pop/push between `past`/`future` and `dispatch(replaceDesignSnapshot(popped.design))`
through the ordinary injected `dispatch` (re-entering the same middleware's `default` branch harmlessly,
since `replaceDesignSnapshot.type` isn't in `UNDOABLE_ACTION_TYPES` — no re-push, same
never-history-the-undo-itself invariant as before, just achieved structurally instead of via a
`next(...)`-bypass trick). `replaceDesignSnapshot`'s reducer (`handleReplaceDesignSnapshot.ts`) assigns
the three `TDesignSnapshot` fields (`pages`, `activePageId`, `selectedIds`) plus its existing
`vectorEditingNodeIds`/`penActiveVertexId` sanitization — **with one added gotcha worth knowing before touching this function
again**: `state.vectorEditingNodeIds = state.vectorEditingNodeIds.filter(...)` always returns a *new*
array, even when nothing was actually filtered out, and any component reading `vectorEditingNodeIds` via
`useSelector` treats that as "changed" (reference equality) and re-renders — which used to spuriously
re-run [[vector-network]]'s `useVectorEditOnDoubleClick.ts` cleanup effect (deps include
`vectorEditingNodeIds`) on **every** undo/redo, wiping the very vector-selection refs this section's own
restore mechanism had just written. Fixed by only reassigning when the filtered length actually differs,
keeping the same array reference (and therefore the same `useSelector` identity) on the common no-op path.

Two plain fields on `TDesignState` — `penActiveVertexId` (`string | null`) and `vectorEditingNodeIds`
(`string[]`) — drive the Pen tool session and are still excluded from `TDesignSnapshot` itself (sanitized
against the restored snapshot instead, per the paragraph above); full detail in [[vector-network]] §4-5,
§48.

## Related

[[design-tool-architecture]] — the toolbar/canvas-hook layer that dispatches into this store.
[[canvas-rendering-pipeline]] — what `drawScene.ts` reads out of `store.getState()` every frame, and
the render-loop side of the ref-vs-Redux split described in §5 here.
[[selection-and-manipulation]] — the single biggest consumer of the ref-vs-Redux pattern (6 separate
drag-state refs) and of `updateNode`/`setSelection` dispatch-per-pointermove — also §8's own biggest
consumer, since every one of its drag mechanisms gets undo/redo for free from the same two dispatch
points.
[[vector-network]] — the Pen tool / Vector Network feature §8's history middleware was built for.
[[group-nodes]] — the group reducers, `parentId` reality, and bounds-sync detail this file's §2/§3
now just point to instead of duplicating.
