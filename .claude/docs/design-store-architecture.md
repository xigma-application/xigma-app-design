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
| `addNode` | delegated → `handleAddNode.ts` | id via `nanoid()` in `prepare`, not the reducer body — see below |
| `deleteNode` | delegated → `handleDeleteNode.ts` | path+text cascade — see below |
| `setActiveTool` | delegated → `handleSetActiveTool.ts` | `lastXTool` bucket switch — see below |
| `setSelection` | inline (`state.selectedIds = action.payload`) | |
| `setViewport` | inline (`state.viewport = action.payload`) | |
| `startTextEdit` | delegated → `handleStartTextEdit.ts` | seeds editing fields, selects all existing content |
| `stopTextEdit` | delegated → `handleStopTextEdit.ts` | resets all 6 editing fields |
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

## 4. Selectors — `store/design/selectors.ts`

All 13 selectors are plain `(state: RootState) => ...` — **no memoization anywhere** (no
`reselect`/`createSelector`, despite RTK shipping it). Two do real computation on every call:
```ts
export const selectOrderedNodes = (state) => state.design.rootOrder.map((id) => state.design.nodes[id]);
export const selectSelectedNodes = (state) => state.design.selectedIds.map((id) => state.design.nodes[id]);
```
Both re-materialize a new array reference every call, so any `useAppSelector` consumer re-renders
whenever *any* part of `design` changes reference equality on `nodes`/`rootOrder`/`selectedIds`, not
just when the derived output actually differs. This is an as-is observation (no evidence it was ever
flagged/fixed), not a documented trade-off — worth knowing before assuming these are cheap to call
from a frequently-rendering component.

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
  rootOrder: [],
  selectedIds: [],
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

## Related

[[design-tool-architecture]] — the toolbar/canvas-hook layer that dispatches into this store.
[[canvas-rendering-pipeline]] — what `drawScene.ts` reads out of `store.getState()` every frame, and
the render-loop side of the ref-vs-Redux split described in §5 here.
[[selection-and-manipulation]] — the single biggest consumer of the ref-vs-Redux pattern (6 separate
drag-state refs) and of `updateNode`/`setSelection` dispatch-per-pointermove.
