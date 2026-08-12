---
name: xigma-store-slice-logic
description: File naming and reducer-body-extraction rules for Redux slices in xigma — the slice file is named slice.ts (not <feature>Slice.ts), and any reducer body longer than one statement moves to a handle<ReducerName> util instead of living inline. Mirrors x-design's store/pageBuilder/slice.ts. Load before adding or editing a reducer in any store/<feature>/slice.ts, or creating a new store feature slice.
---

# xigma Store Slice Logic

Mirrors x-design's `store/pageBuilder/slice.ts` + `store/pageBuilder/utils/handleX.ts` split,
confirmed by reading that file directly (not every reducer there is inlined — every single one,
even trivial-looking setters, delegates to a `handleX` util).

## File naming

The slice file is `slice.ts`, not `designSlice.ts`/`pageBuilderSlice.ts`/etc. — the containing
folder (`store/design/`, `store/pageBuilder/`) already says which feature it is, so repeating the
name in the filename is redundant. Same for the test file: `store/<feature>/test/slice.spec.ts`,
not `test/designSlice.spec.ts`.

The **internal** `createSlice({...})` variable inside the file keeps the descriptive name (e.g.
`designSlice`, matching x-design's `pageBuilderSlice`) — only the file/import path drops the
prefix, not every identifier:

```ts
// store/design/slice.ts
const designSlice = createSlice({ name: 'design', /* ... */ });

export default designSlice.reducer;
```

## The one-line rule

A reducer body gets to stay inline in `slice.ts` **only if it's a single statement**:

```ts
// stays inline — one line
setActiveTool: (state, action: PayloadAction<ToolName>) => {
  state.activeTool = action.payload;
},
```

The moment a reducer needs more than one statement (a lookup, a conditional, multiple field
writes, anything beyond a direct assignment), extract it to `store/<feature>/utils/handle
<ReducerName>.ts`, exported as `handle<ReducerName>`, and call it as a single-expression arrow
from the slice:

```ts
// store/design/utils/handleUpdateNode.ts
export const handleUpdateNode = (state: TDesignState, payload: { changes: Partial<TSceneNode>; id: string }): void => {
  const node = state.nodes[payload.id];

  if (node) {
    Object.assign(node, payload.changes);
  }
};

// store/design/slice.ts
updateNode: (state, action: PayloadAction<{ changes: Partial<TSceneNode>; id: string }>) =>
  handleUpdateNode(state, action.payload),
```

For an RTK `{ prepare, reducer }` pair, only the `reducer` half is subject to this rule — `prepare`
shapes the action payload (not state), and stays inline in the slice even when it spans a few
lines (matches x-design's own `addVariant`/`resizeElement`-style entries, where `prepare` is
always inline and only `reducer` delegates to `handleX`):

```ts
addNode: {
  prepare: (node: Omit<TSceneNode, 'id'>) => ({ payload: { ...node, id: nanoid() } as TSceneNode }),
  reducer: (state, action: PayloadAction<TSceneNode>) => handleAddNode(state, action.payload),
},
```

## `handleX` signature

Parameter order is **`(state, payload)`** — state first, matching the reducer's own `(state,
action)` order (x-design itself is inconsistent between `(payload, state)` and `(state, payload)`
across different `handleX` files; xigma picks `(state, payload)` consistently, always).

```ts
export const handle<ReducerName> = (state: T<Feature>State, payload: <PayloadType>): void => { ... };
```

Type the `state` param as the plain state type (`TDesignState`), not `Draft<TDesignState>` —
Immer's draft is structurally assignable, and this matches every `handleX` util in x-design (typed
as `TPageBuilderState`, never `Draft<TPageBuilderState>`).

## Tests

- `store/<feature>/test/slice.spec.ts` — tests the slice's `reducer` export end-to-end (dispatch an
  action, assert on the resulting state), same as before this convention existed. Still the right
  place for "does dispatching this action produce the right end-to-end state" coverage.
- `store/<feature>/utils/test/handle<ReducerName>.spec.ts` — tests the extracted util directly
  (call it with a hand-built state object, assert the mutation), for the reducers that got
  extracted. Both layers of test coexist; extracting the logic doesn't remove the slice-level test,
  it just also gives the logic its own focused, faster unit test.

## Worked example: `store/design/`

- `slice.ts` — `setActiveTool`/`setSelection`/`setViewport` stay inline (one-line assignments).
  `addNode`/`updateNode` delegate to `utils/handleAddNode.ts`/`utils/handleUpdateNode.ts`.
- `utils/handleAddNode.ts`, `utils/handleUpdateNode.ts` + their `utils/test/` specs.
