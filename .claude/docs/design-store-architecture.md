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

**`parentId` is always `null` today** — confirmed by grepping every node-construction call site
(every `useDraw<X>Tool`, `commitTextNode.ts`, `drawEditingText.ts`) — all hardcode `parentId: null`.
The only code that reads it is `Canvas/utils/haveSameParent.ts`
(`nodes.every((n) => n.parentId === nodes[0].parentId)`), used by `isGroupSelection.ts` to decide
whether 2+ selected nodes get one shared outline. The field exists purely as forward-looking
scaffolding for Etap 12 (grouping/nested frames) — real nesting is entirely unimplemented; don't
assume any node is ever actually nested today.

## 3. Reducers — `store/design/slice.ts`

Per the `xigma-store-slice-logic` convention (one-statement bodies stay inline, multi-statement
bodies delegate to `utils/handle<ReducerName>.ts`):

| Reducer | Inline / delegated | What it does |
|---|---|---|
| `addComment` | delegated → `handleAddComment.ts` | id via `nanoid()` in `prepare` (same pattern as `addNode`) — see below |
| `addNode` | delegated → `handleAddNode.ts` | id via `nanoid()` in `prepare`, not the reducer body — see below |
| `cancelCommentDraft` | inline (`state.commentDraftPosition = null`) | |
| `deleteComment` | inline (`delete state.comments[action.payload]`) | wired to a store action, but no UI dispatches it today — comment deletion is intentionally disabled in `CommentPin` for now |
| `deleteNode` | delegated → `handleDeleteNode.ts` | path+text cascade — see below |
| `setActiveTool` | delegated → `handleSetActiveTool.ts` | `lastXTool` bucket switch — see below |
| `setSelection` | inline (`state.selectedIds = action.payload`) | |
| `setViewport` | inline (`state.viewport = action.payload`) | |
| `startCommentDraft` | inline (`state.commentDraftPosition = action.payload`) | |
| `startTextEdit` | delegated → `handleStartTextEdit.ts` | seeds editing fields, selects all existing content |
| `stopTextEdit` | delegated → `handleStopTextEdit.ts` | resets all 6 editing fields |
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
`createHistoryMiddleware()` is a **factory**, not a module-level singleton, so every store (the real
one and every test store) gets its own isolated `past`/`future` stacks — each entry a
`{ nodes, rootOrder, selectedIds }` snapshot (`TDesignSnapshot`, `store/design/types.ts`), deliberately
narrower than full `TDesignState`: viewport, active tool, comments, and the two new Pen-session fields
below are UI state, not document state, matching Figma's own undo scope (undo restores content and
selection, never pan/zoom or which tool is active).

Four plain actions (`store/history/actions.ts`): `beginHistoryGesture`/`endHistoryGesture` (bracket one
undo-able gesture), `undo`/`redo`. The coalescing trick that avoids "every drag frame becomes its own
undo step" (§5's own dispatch-per-pointermove nuance, previously flagged as a **future** problem for
whichever history system eventually landed):
- `beginHistoryGesture` records the current snapshot as `pendingSnapshot` but does **not** push to
  `past` yet.
- The first `addNode`/`updateNode`/`deleteNode` dispatched while a gesture is open pushes
  `pendingSnapshot` once; every further one inside the same open gesture pushes nothing more.
- A dispatch **outside** any open gesture (a keyboard Delete, a plain draw-tool `addNode` — these
  already fire exactly once per gesture) pushes its own pre-action snapshot immediately, unchanged
  one-shot behavior.
- A gesture that opens and closes with no undoable dispatch in between (a plain click, a resolver that
  turned out to be a no-op) pushes nothing — correct empty-undo-step avoidance.

Wired at exactly two points, not per-mechanism: `useSelectionTool`'s `handlePointerDown.ts` dispatches
`beginHistoryGesture()` unconditionally at the top (primary button only) and `handlePointerUp.ts`
dispatches `endHistoryGesture()` unconditionally at the bottom — covering all dozen-plus
arm/continue/disarm mechanisms in [[selection-and-manipulation]] (move, resize, rotate, every
corner-radius/vertex-count/ellipse-arc/Vector-Edit-Mode handle) with zero changes to any individual
`continue*.ts` file, since the middleware is unconditionally safe to bracket a gesture that turns out
to dispatch nothing undoable. `useDrawPenTool` (multi-click, its own hook — see [[vector-network]])
wraps its own pointerdown/pointerup the same way, since it isn't part of `useSelectionTool`.

`undo`/`redo` pop/push between `past`/`future` and dispatch a new `design` reducer action,
`replaceDesignSnapshot` (`handleReplaceDesignSnapshot.ts`, assigns exactly the three snapshot fields),
via `next(...)` directly rather than `store.dispatch(...)` — deliberately bypassing the middleware's
own undoable-action branch so an undo/redo application is never itself pushed onto the history stack.

Two new plain fields on `TDesignState` — `penActiveVertexId` (`string | null`) and, since
[[vector-network]] §48's multi-node conversion, `vectorEditingNodeIds` (`string[]`, was a single
`string | null`) — drive the Pen tool session and are explicitly **excluded** from history snapshots;
full detail in [[vector-network]] §4-5, §48.

## Related

[[design-tool-architecture]] — the toolbar/canvas-hook layer that dispatches into this store.
[[canvas-rendering-pipeline]] — what `drawScene.ts` reads out of `store.getState()` every frame, and
the render-loop side of the ref-vs-Redux split described in §5 here.
[[selection-and-manipulation]] — the single biggest consumer of the ref-vs-Redux pattern (6 separate
drag-state refs) and of `updateNode`/`setSelection` dispatch-per-pointermove — also §8's own biggest
consumer, since every one of its drag mechanisms gets undo/redo for free from the same two dispatch
points.
[[vector-network]] — the Pen tool / Vector Network feature §8's history middleware was built for.
