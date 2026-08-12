---
name: xigma-test-act-wrapping
description: When a raw canvas.dispatchEvent(...) call in a hook/canvas test needs to be wrapped in act(...) from '@testing-library/react' to silence "An update to TestComponent was not wrapped in act(...)". Load before writing or reviewing a test that dispatches a pointer/keyboard event directly on a DOM node (not via fireEvent/userEvent) inside a component subscribed to Redux state.
---

# xigma `act()` Wrapping for Raw DOM Event Dispatch

## Why this comes up here specifically

Canvas interaction hooks (`useDrawShapeTool`, `useDrawLineTool`, `useSelectionTool`, ...) don't use
React synthetic events — they call `canvas.addEventListener('pointerdown', ...)` directly on the
DOM node ([[xigma-function-style]]'s "multiple DOM event handlers" pattern). Their tests mirror
that: `canvasRef.current?.dispatchEvent(new PointerEvent(...))`, not Testing Library's `fireEvent`
or `userEvent`, which auto-wrap in `act()` themselves. A raw `dispatchEvent` does not.

## When it actually warns (and when it doesn't)

The warning ("An update to TestComponent inside a test was not wrapped in act(...)") only fires
when the dispatched event's handler causes a **React re-render inside the test's render tree** —
concretely, a Redux `dispatch()` whose changed slice is read via `useAppSelector` by the hook (or
any component) currently mounted in the test. If nothing in the tree subscribes to that piece of
state, the dispatch still happens (assert on `store.getState()` as normal) but nothing re-renders,
so no warning fires and no wrapping is needed.

This is why, in `useDrawShapeTool.spec.tsx`/`useDrawLineTool.spec.tsx`, only the tests that fire a
`pointerup` warn: `handlePointerUp` unconditionally calls `dispatch(setActiveTool(ToolName.default))`,
and the hook itself calls `useAppSelector(selectActiveTool)` — so that dispatch always re-renders
the test's host component. A `dispatch(setSelection(...))` in the same file's `pointerdown` handler
does **not** warn, because nothing in that test's tree reads `selectedIds`.

## Fix: wrap the dispatchEvent call(s) in `act()`

```tsx
import { act, renderHook } from '@testing-library/react';

// action
act(() => {
  canvasRef.current?.dispatchEvent(pointerEvent('pointerdown', 10, 10));
  canvasRef.current?.dispatchEvent(pointerEvent('pointermove', 60, 40));
  canvasRef.current?.dispatchEvent(pointerEvent('pointerup', 60, 40));
});

// result
const { design } = store.getState();
```

Wrap the **whole sequence** of `dispatchEvent` calls for one user gesture in a single `act(() =>
{...})`, not each call individually — matches how the fix was actually applied (one `act()` around
`pointerdown` + `pointermove` + `pointerup` together, per [[xigma-test-conventions]]'s single
`// action` step comment covering the whole gesture).

Existing precedent for the same underlying rule, just via a direct `store.dispatch` instead of a
DOM event: `MouseModes.spec.tsx`'s `act(() => store.dispatch(setActiveTool(ToolName.ellipse)));`,
`useTheme.spec.tsx`'s `act(() => { result.current.toggleTheme(); });`. Same principle: **any**
state-changing call made directly (not through a Testing Library helper that already wraps it)
against a component currently mounted via `render`/`renderHook` needs `act()` around it.

## Don't over-wrap

Only wrap the specific `dispatchEvent` call(s) that actually change subscribed state. A
`pointerdown`+`pointermove` sequence that never reaches a subscribed dispatch (e.g. dragging
without releasing) doesn't need `act()` — check what the handler actually dispatches and whether
anything in the test's render tree reads that slice before adding the wrapper reflexively.

## Related

[[xigma-test-conventions]] — the `// action` step comment this wraps.
[[xigma-function-style]] — why these hooks use raw `addEventListener`/`dispatchEvent` instead of
React synthetic events in the first place.
