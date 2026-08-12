---
name: xigma-function-style
description: How functions and effects are shaped in xigma — positive `if` guards instead of early-return negative guards, and named helper functions instead of inline closures inside useEffect/callbacks. Load before writing or reviewing a function with a null/undefined check, or a non-trivial useEffect/callback body.
---

# xigma Function Style

## Positive guard over early-return

Prefer wrapping the dependent logic in a positive `if (x)` block instead of an early-return negative
guard (`if (!x) { return; }`) followed by unindented code below it.

Avoid:

```ts
if (!canvas) {
  return;
}

doSomething(canvas);
```

Prefer:

```ts
if (canvas) {
  doSomething(canvas);
}
```

This applies even though it costs an extra indentation level — "this block only runs when the value
is present" being visible at the `if` wins over saving an indent.

### Variant: guard returns a value (not just `void`)

The same rule applies when the negative branch returns a fallback value instead of bare `return;` —
e.g. inside a `reduce`/`map`/`find` callback, or any function whose "nothing changed" case is a
value like an accumulator. Don't early-return the fallback behind a negative guard and leave the
real logic unindented below it; move the real logic into the positive `if` block (including its own
`return`) and put the fallback as a single trailing `return` after the `if`.

Avoid:

```ts
vertices.reduce((isInside, vertex, index) => {
  const crossesRay = /* ... */;

  if (!crossesRay) {
    return isInside;
  }

  const intersectionX = /* ...uses vertex/point */;

  return point.x < intersectionX ? !isInside : isInside;
}, false);
```

Prefer:

```ts
vertices.reduce((isInside, vertex, index) => {
  const crossesRay = /* ... */;

  if (crossesRay) {
    const intersectionX = /* ...uses vertex/point */;
    return point.x < intersectionX ? !isInside : isInside;
  }

  return isInside;
}, false);
```

See `components/Design/Canvas/utils/isPointInPolygon.ts` for this applied — the `crossesRay` guard
wraps the whole ray-intersection computation, with the unchanged-accumulator case as the trailing
`return isInside;`.

## Named functions instead of inline closures in effects/callbacks

Don't define non-trivial logic as an inline arrow function directly inside `useEffect` (or another
callback) that closes over effect-local variables. Extract it as a named function declared outside
the effect (module scope in the same file, or a dedicated file under `utils/` once it's reused),
taking the values it needs as explicit parameters instead of relying on the closure.

Avoid:

```ts
useEffect(() => {
  const canvas = canvasRef.current;

  if (canvas) {
    const resize = (): void => {
      // ...uses `canvas` via closure
    };

    resize();
  }
}, [canvasRef]);
```

Prefer:

```ts
const resizeCanvas = (canvas: HTMLCanvasElement): void => {
  // ...
};

export const useCanvasResize = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      resizeCanvas(canvas);
    }
  }, [canvasRef]);
};
```

Passing the value explicitly as a parameter (rather than reaching for it through the closure) keeps
the helper readable on its own and keeps the effect body itself short — the effect just wires
lifecycle (when to call it, when to observe/clean up), the named function holds the actual logic.

See `components/Design/Canvas/hooks/useCanvasResize/useCanvasResize.ts` for both rules applied
together: the positive `if (canvas)` guard, and `resizeCanvas` extracted to its own
`utils/resizeCanvas.ts` (see [[xigma-module-structure]] for when a hook gets its own folder like
this).

### Recursive loops (`requestAnimationFrame`, `setInterval`, ...)

The same rule applies when the inline closure recurses on itself and closes over several
effect-local values (a GL context, a program, a buffer, ...), not just one. Splitting it into two
utils keeps each piece testable on its own:

- a pure "do one unit of work" function (e.g. `drawScene(gl, program, buffer, canvas, ...)`) —
  no recursion, no scheduling, just draws/computes.
- a "run the loop" function (e.g. `startRenderLoop(gl, program, buffer, canvas, ...)`) that owns the
  `tick`/`requestAnimationFrame` recursion and returns a stop callback, mirroring the
  `resizeObserver.observe(...)` / `resizeObserver.disconnect()` shape from the resize example above.

Avoid:

```ts
useEffect(() => {
  if (canvas && gl && program && buffer) {
    let frameId: number;

    const tick = (): void => {
      // ...draws one frame using gl/program/buffer/canvas via closure
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return (): void => cancelAnimationFrame(frameId);
  }
}, [canvasRef]);
```

Prefer:

```ts
// utils/drawScene.ts
export const drawScene = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer, canvas: HTMLCanvasElement): void => {
  // ...draws one frame
};

// utils/startRenderLoop.ts
export const startRenderLoop = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer, canvas: HTMLCanvasElement): (() => void) => {
  let frameId: number;

  const tick = (): void => {
    drawScene(gl, program, buffer, canvas);
    frameId = requestAnimationFrame(tick);
  };

  frameId = requestAnimationFrame(tick);

  return (): void => cancelAnimationFrame(frameId);
};
```

```ts
useEffect(() => {
  if (canvas && gl && program && buffer) {
    const stopRenderLoop = startRenderLoop(gl, program, buffer, canvas);

    return (): void => stopRenderLoop();
  }
}, [canvasRef]);
```

See `components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawScene.ts` and
`.../utils/startRenderLoop.ts`, used from
`components/Design/Canvas/hooks/useCanvasRenderLoop/useCanvasRenderLoop.ts` — the effect body no
longer defines any function itself.

The rule reapplies one level down: `startRenderLoop` itself must not nest `tick` in its own body
either — "don't keep a function inside a function" isn't just about `useEffect`, it's about any
function whose body defines another non-trivial named function. Hoist `tick` to module scope too.
Since `tick` recurses (`requestAnimationFrame` calls it again) and needs to update the current
frame id for `startRenderLoop`'s returned stop callback to cancel the right frame, pass a small
mutable ref object (`{ current: number }`) as an explicit parameter instead of closing over a `let`
declared in the outer function — the same "closure vs. explicit parameter" preference as above,
just applied to a value that changes over time instead of a static one:

```ts
type TFrameIdRef = { current: number };

const tick = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer, canvas: HTMLCanvasElement, frameIdRef: TFrameIdRef): void => {
  drawScene(gl, program, buffer, canvas);
  frameIdRef.current = requestAnimationFrame(() => tick(gl, program, buffer, canvas, frameIdRef));
};

export const startRenderLoop = (gl: WebGL2RenderingContext, program: WebGLProgram, buffer: WebGLBuffer, canvas: HTMLCanvasElement): (() => void) => {
  const frameIdRef: TFrameIdRef = { current: 0 };

  frameIdRef.current = requestAnimationFrame(() => tick(gl, program, buffer, canvas, frameIdRef));

  return (): void => cancelAnimationFrame(frameIdRef.current);
};
```

The `() => tick(...)` wrapper passed to `requestAnimationFrame` is fine to stay inline — it's pure
forwarding with no logic of its own (same as `debounce(() => resizeCanvas(canvas), ...)` in the
resize example), unlike a `tick` body that both draws and reschedules, which is exactly what must
not be nested.

### Multiple DOM event handlers (`pointerdown`/`pointermove`/`pointerup`, ...)

Not every extracted function belongs in `utils/`. When the logic needs several pieces of
hook-local state that don't reduce to one or two explicit parameters — a dispatch function, a ref
the hook owns, another ref passed in as an argument — keep the named function in the hook's own
body instead of forcing it out to a pure utility. The dividing line is reusability: if the function
is genuinely parameterizable and pure (no hook-local closures at all), it goes in `utils/`; if it
fundamentally needs multiple pieces of this hook's own state, it stays as a sibling function inside
the hook, just not nested inside `useEffect`.

Avoid — handlers nested inside the effect, closing over a `let` for drag state:

```ts
useEffect(() => {
  if (canvas && activeTool === ToolName.frame) {
    let start: TPoint | null = null;

    const handlePointerDown = (event: PointerEvent): void => {
      start = getPointerPosition(canvas, event);
      // ...
    };
    // ...pointermove/pointerup nested the same way, closing over `start`, `canvas`, `dispatch`

    canvas.addEventListener('pointerdown', handlePointerDown);
    // ...
  }
}, [activeTool, canvasRef, dispatch, draftRef]);
```

Prefer — handlers live in the hook body, take the values they need as explicit parameters where
that's cheap (`canvas`), and use a `useRef` instead of an effect-local `let` for state that must
survive across events:

```ts
const startRef = useRef<TPoint | null>(null);

const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
  startRef.current = getPointerPosition(canvas, event);
  // ...
};
// ...handlePointerMove/handlePointerUp defined the same way, still in the hook body

useEffect(() => {
  if (canvas && activeTool === ToolName.frame) {
    const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
    // ...

    canvas.addEventListener('pointerdown', onPointerDown);

    return (): void => canvas.removeEventListener('pointerdown', onPointerDown);
  }
}, [activeTool, canvasRef, dispatch, draftRef]);
```

`getPointerPosition(canvas, event)` and `toDraftRect(start, current)` themselves *are* pure and
parameterizable (no hook state at all), so those moved to
`components/Design/Canvas/hooks/useFrameTool/utils/getPointerPosition.ts` and `.../utils/toDraftRect.ts`
— see `components/Design/Canvas/hooks/useFrameTool/useFrameTool.ts` for the full split: pure
helpers in `utils/`, stateful handlers in the hook body, and `useEffect` doing nothing but
add/remove listeners.

**Refinement — a handler can still move to `utils/` even if it needs `dispatch` or ref-backed
state, as long as it only needs a *callback*, not the raw ref itself.** The dividing line above
("needs a ref → stays in the hook") is about who owns the ref, not who's allowed to trigger it.
`useSelectionTool.ts`'s `handlePointerDown` grew real "ifologia" (5-way branch: shift+hit,
hit-in-multi-selection, hit-not-in-selection, gap-inside-group-bounds, empty click) and moved out
to `utils/handlePointerDown/handlePointerDown.ts`, even though its logic needs both `dispatch` and
`armDrag` (a closure the hook defines around its own `dragStateRef`). The ref (`dragStateRef`)
itself never leaves the hook — only the handler that *calls* `armDrag` moved out, taking `dispatch`
and `armDrag` as explicit parameters (`handlePointerDown(canvas, event, dispatch, armDrag)`),
exactly like `canvas`/`event` are already passed explicitly. `armDrag`'s own type
(`TArmDrag = (armIds: string[], pendingClickAction: TPendingClickAction | null, point: TPoint) =>
void`) lives in the hook's `types.ts` since it's a hook-shaped callback signature, not a generic
value type. The two heaviest branches (hit-in-multi-selection vs. gap-inside-group-bounds) split
further into their own sibling files (`armHitDrag.ts`, `armGroupBoundsDrag.ts`) per the "ifologia"
rule below — each is independently unit-tested (mocking `armDrag`/`dispatch` as plain `vi.fn()`s)
in addition to the hook's own end-to-end `useSelectionTool.spec.tsx` coverage. The two remaining
one-line branches (shift-toggle, empty-click-clears) stayed inline in the orchestrator — extracting
a single `dispatch(...)` call into its own file would be indirection without reducing complexity.

## Split a function once its branching gets heavy ("ifologia")

Not just effects/callbacks — a plain function that accumulates several `if`/`else` concerns in one
body (e.g. "draw the background, then every node, then branch group-selection vs. per-node
selection, then the draft rect") should be split one concern per named function, with the original
function reduced to a thin orchestrator that just calls each in sequence. Each extracted piece
becomes independently testable and readable on its own, instead of one long function requiring a
reader to hold every branch in their head at once.

Avoid — one function mixing every concern and its branching inline:

```ts
export const drawScene = (gl, program, buffer, canvas, draftRect) => {
  gl.colorMask(true, true, true, true);
  drawBackground(gl);
  gl.colorMask(true, true, true, false);

  selectOrderedNodes(store.getState()).forEach((node) => drawRect(gl, program, buffer, node, ...));

  const selectedNodes = selectSelectedNodes(store.getState());

  if (isGroupSelection(selectedNodes)) {
    // ...compute shared bounds, draw one outline + handles
  } else {
    selectedNodes.forEach((node) => {
      // ...draw one outline + handles per node
    });
  }

  if (draftRect) {
    // ...draw draft outline + handles
  }
};
```

Prefer — each concern extracted to its own named function, orchestrator just sequences them:

```ts
export const drawScene = (gl, program, buffer, canvas, draftRect) => {
  const state = store.getState();
  const viewport = selectViewport(state);
  const { clientHeight, clientWidth } = canvas;

  drawSceneBackground(gl);
  drawSceneNodes(gl, program, buffer, selectOrderedNodes(state), clientWidth, clientHeight, viewport);
  drawSelectionOutline(gl, program, buffer, selectSelectedNodes(state), clientWidth, clientHeight, viewport);
  drawFrame(gl, program, buffer, draftRect, clientWidth, clientHeight, viewport);
};

// drawSelectionOutline itself still branches, but the branch is the *entire* body — nothing else
// competes with it for the reader's attention:
export const drawSelectionOutline = (gl, program, buffer, selectedNodes, canvasWidth, canvasHeight, viewport) => {
  if (isGroupSelection(selectedNodes)) {
    drawGroupSelectionOutline(gl, program, buffer, selectedNodes, canvasWidth, canvasHeight, viewport);
  } else {
    drawPerNodeSelectionOutlines(gl, program, buffer, selectedNodes, canvasWidth, canvasHeight, viewport);
  }
};
```

See `components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawScene.ts` and its
siblings (`drawSceneNodes.ts`, `drawSelectionOutline.ts`, `drawGroupSelectionOutline.ts`,
`drawPerNodeSelectionOutlines.ts`, `drawFrame.ts` — the draft-frame-preview drawer, renamed from
`drawDraftFrame` once the orchestrator itself stopped being called `drawFrame`, since "frame" as a
bare name was ambiguous between a render-loop tick and a Design `NodeType.frame`; see
[[xigma-module-structure]]'s naming note) for the full split — `drawSceneBackground` itself ended
up promoted one step further, to the global `utils/canvas/`, since it (like
`drawBackground`/`drawCornerHandles`/`drawRect` before it) doesn't reference any Design-domain
concept, unlike its siblings which all take `TSceneNode[]`/selection state; see
[[xigma-module-structure]] for that distinction. Once a function earns this split, that skill's
folder-promotion rule kicks in too: the split-out pieces sit flat as siblings in their own folder
(not a further nested `utils/`), and the original function's spec moves into a nested `test/`
alongside them.

## Related

[[xigma-module-structure]] — once a helper like this is reused from more than one place, it moves
out of the hook's file into its own `utils/<functionName>.ts`; once a function itself earns a split
per the "ifologia" rule above, that skill also covers where the resulting files (and their own
promoted folder) live.
