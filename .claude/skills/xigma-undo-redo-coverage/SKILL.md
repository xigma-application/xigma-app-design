---
name: xigma-undo-redo-coverage
description: When implementing any change that mutates Design document state (a new reducer, a new dispatched action, a new ref-based selection/interaction state that should survive undo) — check whether Ctrl+Z needs to revert it, and whether it actually will. Load before calling any Design-store-touching change "done", the same way xigma-e2e-coverage and xigma-unit-coverage gate their own concerns.
---

# xigma Undo/Redo Coverage

## The rule

Adding or changing anything that mutates **document state** on the Design page — a new reducer, a
new place that dispatches an existing one, a new piece of selection/interaction state — is not
automatically undoable just because it goes through Redux. This codebase's undo/redo
(`store/history/`) is opt-in per action type, and per-gesture coalescing is opt-in per call site.
Both gaps have shipped for real, more than once, in this exact codebase:

- **Plain node selection (`setSelection`) had no undo step at all**, for a long time — clicking a
  node, then another, then pressing Ctrl+Z did nothing, even though deselecting-via-undo is
  standard Figma/Illustrator/Photoshop behavior. Fixed only after the user explicitly pushed back
  on the initial assumption that this was intentional ("Figma has this — don't talk nonsense").
- **Vector vertex/segment/handle selection — `TCanvasRefs`, not Redux — was never captured or
  restored by undo at all.** Undoing a vertex-editing gesture reverted the node's geometry but left
  the selection refs pointing at now-stale/deleted ids.
- **A Pencil stroke committed via one release path but not another silently failed to draw at
  all** — not strictly an undo bug, but the same *general* failure mode: `handlePointerUp` and
  `handlePointerMove`'s Shift branch each needed their own explicit handling of the same pending
  state, and only one of the two originally had it. Same lesson: don't assume one code path's
  handling covers every way a gesture can end.

## Where the mechanism actually lives

- `store/history/historyMiddleware.ts` — `UNDOABLE_ACTION_TYPES`, a hardcoded `Set` (currently
  `addNode`, `updateNode`, `deleteNode`, `setSelection`). **A new reducer that mutates persisted
  design state and isn't in this set pushes no undo snapshot at all**, silently — dispatching it
  works, the state changes, and Ctrl+Z just does nothing for it. Check this set every time a new
  reducer is added to `store/design/slice.ts`.
- `beginHistoryGesture(vectorSelectionSnapshot)` / `endHistoryGesture()` — wraps a **multi-dispatch
  sequence that should undo as one step**, not one step per dispatched action. `beginGesture` only
  *stages* a snapshot; it's the *first* undoable action dispatched while the gesture is open that
  actually commits it to the undo stack (`pushIfUndoable`'s `snapshotPushedThisGesture` flag) — a
  gesture that begins but where nothing undoable happens before the matching `endHistoryGesture()`
  leaves nothing on the stack for that gesture at all. This one bit developers on this exact
  codebase: `handlePointerUp` needing to fold pending Shift-lock state into the tail *before* the
  first `addNode`/`setSelection` dispatch of the gesture, not after — see `pencil-tool.md` §5.
- `getVectorSelectionSnapshot(refs)` / `applyVectorSelectionSnapshot(...)` — the bridge for
  **non-Redux, `TCanvasRefs`-based interaction state** (selected vector vertices/segments/handles).
  Redux's own undo only ever restores `nodes`/`rootOrder`/`selectedIds`; anything living in a plain
  `useRef` needs to be explicitly captured into the gesture's `vectorSelection` payload and
  explicitly re-applied on undo/redo, or it just goes stale.

## Checklist for any new Design-store-mutating change

1. **Should this be undoable at all?** Transient UI state (a hover ref, a live drag preview, which
   panel tab is open) should *not* be — only document-shape state a user would expect Ctrl+Z to
   revert (nodes, their properties, selection) belongs in the undo stack.
2. If yes: is the dispatched action type already in `UNDOABLE_ACTION_TYPES`? If it's a brand-new
   reducer, add it there explicitly — don't assume "it's in the Redux store" is enough.
3. Does this change involve **more than one dispatch that should revert together** (e.g. creating a
   node and then selecting it)? Wrap the whole gesture in `beginHistoryGesture(...)` /
   `endHistoryGesture()`, and make sure the *first* undoable dispatch inside the gesture happens
   somewhere that's actually guaranteed to run — not skipped on some code path.
4. Does this change touch **any ref-based (non-Redux) interaction state** — a new kind of
   vertex/segment/handle/point selection living outside `design.selectedIds`? If a user would
   expect it to survive an undo/redo round-trip, it needs its own capture/restore, following
   `getVectorSelectionSnapshot`/`applyVectorSelectionSnapshot`'s shape — don't assume the generic
   design-snapshot mechanism reaches it.
5. **Enumerate every path that can end the gesture**, not just the "normal" one — a drag that ends
   via mouseup vs. via a modifier-keyup vs. via Escape vs. via switching tools mid-gesture are all
   separate code paths that each need to independently do the right thing with any pending
   ref-based state, exactly like Pencil's `advancePencilTail.ts` vs. `foldPendingAxisLock.ts` both
   needing the same fold-in check.
6. Add or extend a test that actually drives `undo()`/`redo()` and asserts on the *restored* state
   (not just "the action dispatched without throwing") — see `handlePointerUp.spec.ts`'s
   "coalesce the node creation and its selection into a single undoable gesture" test for the
   pattern: full down-then-up cycle, then `store.dispatch(undo())`, asserting both the design state
   and the returned `vectorSelection` snapshot.

## Related

[[xigma-e2e-coverage]] / [[xigma-unit-coverage]] — same "don't let the next session/change
re-discover this the hard way" motivation, applied to undo/redo instead of browser tests or
coverage percentage; a single change can owe more than one of these three.
