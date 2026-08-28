# Canvas — WebGL rendering pipeline

How the Design canvas actually renders, frame by frame — one level deeper than
`design-tool-architecture.md` (which covers how a tool is *assembled*; this covers what happens
underneath when anything gets drawn). No canvas library is used — every primitive here is hand-rolled
WebGL2. One deliberate exception: Comment pins/drafts (`Comment/CommentPin`, `Comment/CommentDraftInput`)
are plain absolutely-positioned DOM `<div>`s laid over the canvas via `worldToScreen`, not drawn through
any of the machinery below — see `design-store-architecture.md`'s "Comment state" note.

## 1. Context setup

- `Canvas/Canvas.tsx` owns the single `<canvas>` element (`canvasRef`) plus every other ephemeral
  interaction ref (`draftRef`/`sliceRef` and ~65 more), all assembled by
  `pages/DesignPage/core/CanvasRefsProvider/CanvasRefsProvider.tsx` into one `TCanvasRefs` object
  (`types/design/canvas/types.ts` — the drag-state types themselves, e.g. `TCornerRadiusDragState`/
  `TEllipseArcDragState`, live there too, not under `components/`, since a type consumed from the
  global `types/` layer can't reach back into a feature folder). `TCanvasRefs` is **not** one flat
  bag of ~65 keys — it's grouped into ~16 domain sub-objects (`cornerRadius`, `ellipseArc`, `hover`,
  `pen`, `pencil`, `slice`, `transform`, `vectorEdit`, `vectorMultiSelect`, `vectorSnapshots`, etc.),
  each with its own `use<Domain>Refs()` hook + `create<Domain>Refs()` test-factory pair under
  `Canvas/hooks/useCanvasRefs/hooks/use<Domain>Refs/` — e.g. the corner-radius trio
  (`cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef`, which exist so
  `useCanvasRenderLoop` can tell a corner-radius drag is actively in progress, see
  `selection-and-manipulation.md` §13) lives at `refs.cornerRadius.*`, and the ellipse-arc trio
  (`ellipseArcDragRef`/`ellipseArcRotateDragRef`/`ellipseArcRatioDragRef`, which exist so the
  Sweep/Start/Ratio handles can render mid-drag at their live pointer-projected position instead of
  jumping, §19) lives at `refs.ellipseArc.*`. A handful of refs are genuinely cross-domain and get
  imported across group boundaries by design — `refs.transform.rotateDragRef` is shared by both the
  Selection tool and `useSliceTool`, and `refs.vectorEdit.vectorAlignmentGuideRef` is written by both
  vector-drag continuation and the Pen tool's own preview. `CanvasRefsProvider.tsx` calls each
  `use<Domain>Refs()` once and composes them into a single `refs` object via `useMemo`, which
  `Canvas.tsx` reads via `useCanvasRefsContext()` and passes into every tool hook and into
  `useCanvasRenderLoop` as one param, instead of threading each ref through as its own positional
  argument.
- The context itself is created in `Canvas/hooks/useCanvasRenderLoop/useCanvasRenderLoop.ts`:
  `canvas.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES)`, both constants in
  `Canvas/constants.ts`: `WEBGL_CONTEXT_ID = 'webgl2'`,
  `WEBGL_CONTEXT_ATTRIBUTES = { premultipliedAlpha: false, stencil: true }`. `premultipliedAlpha: false`
  matters because every fragment shader outputs straight (non-premultiplied) alpha and blending is set
  up to match: `gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)`, set once, not
  per draw call. `stencil: true` is the one context-setup change [[vector-network]] needed — without it
  the backing store has no stencil buffer at all, and `drawVectorFill.ts`'s even-odd fill technique
  (§ that doc, "Rendering") silently no-ops.
- Three GL programs + their vertex buffers are created **once** in this hook, not per frame (see §3
  for what they are), bundled into a `TImageRenderContext` (`hooks/useCanvasRenderLoop/types.ts`)
  that also carries the texture cache, the MSDF text-geometry cache, and an ellipse-arc-length cache
  (curved text-on-path). Cleanup on unmount deletes all three buffers.
- **Resize/DPR**: `useCanvasResize/useCanvasResize.ts` resizes once on mount, then a `ResizeObserver`
  wrapped in `lodash/debounce` (`RESIZE_DEBOUNCE_MS = 500`). The actual math
  (`useCanvasResize/utils/resizeCanvas.ts`):
  ```ts
  const { width, height } = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const nextWidth = Math.round(width * dpr);
  const nextHeight = Math.round(height * dpr);
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    gl?.viewport(0, 0, canvas.width, canvas.height);
  }
  ```
  The dirty-check avoids clearing the canvas when a debounced observer fires with no real size
  change. `gl` is re-fetched via `getContext` here rather than threaded in (idempotent, cheap).

## 2. The render loop

- `useCanvasRenderLoop/utils/setupRenderLoop.ts` — enables straight-alpha blending once, builds the
  `TImageRenderContext` from the compiled programs/buffers, and calls `startRenderLoop`, returning
  its stop callback straight through. This is the piece pulled out of
  `useCanvasRenderLoop.ts`'s own `useEffect` body so the effect itself stays a thin
  "is everything ready → wire it up" check with no drawing logic inline (`xigma-function-style`'s
  "don't nest non-trivial logic in an effect" rule).
- `useCanvasRenderLoop/utils/startRenderLoop.ts` — a recursive `requestAnimationFrame` `tick`
  calling `drawScene(gl, program, buffer, imageContext, canvas, refs)` every frame (the whole
  `TCanvasRefs` object forwarded straight through, no per-ref unpacking at this layer), then
  scheduling itself again. Returns a `stop` closure (`cancelAnimationFrame`) used as the `useEffect`
  cleanup.
- **No dirty-checking anywhere** — every frame redraws unconditionally. `drawScene` is not a
  React-subscribed component; it reads Redux fresh via `store.getState()` on every call, plus every
  ephemeral ref's `.current` off the `refs` object it's given. This is a deliberate simplicity
  trade-off (see roadmap Etap 4/10), not an oversight — there's no dirty-flag/requestIdleCallback
  layer.
- `drawScene.ts` — first derives its own locals straight off `refs` (`draftShape`, `marqueeRect`,
  `hoveredNodeId`, `sliceRect`, the three `*DraggedHandlePosition ?? null` ellipse-arc values, and
  `isDraggingCornerRadius` via the sibling `hasCornerRadiusDragMoved(refs)` — its own file, since
  it's an OR across three separate drag refs, not a one-liner), then runs the exact per-frame
  sequence, in order:
  ```ts
  drawSceneBackground(gl);
  drawSceneNodes(gl, program, buffer, imageContext, sceneNodes, w, h, viewport, pathOutlineStyles);
  drawHoverOutline(gl, program, buffer, hoveredNode, w, h, viewport);
  drawSelectionOutline(gl, program, buffer, selectedNodes, w, h, viewport);
  drawCornerRadiusHandlesLayer(gl, program, buffer, hoveredNode, selectedNodes, w, h, viewport, isDraggingCornerRadius);
  drawVertexCountHandlesLayer(gl, program, buffer, hoveredNode, selectedNodes, w, h, viewport);
  drawEllipseArcHandleLayer(gl, program, buffer, hoveredNode, selectedNodes, w, h, viewport, ...draggedPositions);
  drawFrame(gl, program, buffer, imageContext, draftShape, w, h, viewport);       // dispatcher, despite the name
  drawEditingText(gl, program, buffer, imageContext, editingTextBox, ...);
  drawEditingPathTextHandle(gl, program, buffer, editingTextBox, w, h, viewport);
  drawMarquee(gl, program, buffer, marqueeRect, w, h, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, w, h, viewport);
  ```
  **background → committed nodes → hover outline → selection outline → corner-radius handles →
  vertex-count handles → ellipse arc-cutting handles → in-progress draft → editing-text overlay →
  path-text offset handle → marquee → slice draft.** `drawCornerRadiusHandlesLayer.ts`/
  `drawVertexCountHandlesLayer.ts`/`drawEllipseArcHandleLayer/drawEllipseArcHandleLayer.ts`
  (`selection-and-manipulation.md` §11/§12/§15, §18, §19) each self-gate (selected+hovered single
  node of the relevant type, large enough on screen) rather than `drawScene.ts` deciding when to call
  them, same "thin wrapper decides nothing, the layer decides" shape as `drawHoverOutline.ts` — three
  separate, deliberately non-unified layer functions even though their gating logic looks almost
  identical, so each mechanism (`cornerRadius`, `sides`/`points`, `arcStartAngle`/`arcEndAngle`/
  `arcRatio`) stays fully decoupled from the others rather than sharing a switch that would need to
  know about all three at once. `drawEllipseArcHandleLayer` itself moved from a single flat file into
  its own folder, split by the same "ifologia" rule as `drawScene.ts` was: the orchestrator
  (`drawEllipseArcHandleLayer.ts`) just sequences three siblings that each own their own guard as
  their entire body — `drawFullyCutAwayGuideLine.ts` (the `isFullyCutAway` guide line),
  `drawArcRatioGuide.ts` (the `arcRatio >= 1 && hasEllipseArc(...)` guide arc), and
  `drawHoveredArcHandles.ts` (the `isHovered` Sweep/Start/Ratio handles). It additionally takes three
  `...draggedPositions` (one per Sweep/Start/Ratio handle, `TPoint | null`) sourced from
  `ellipseArcDragRef`/`ellipseArcRotateDragRef`/`ellipseArcRatioDragRef.current?.draggedHandlePosition`
  directly inside `drawScene.ts` — same ref-drilling shape the `cornerRadiusDragRef`-trio row below
  already uses, just three refs feeding three independent optional params instead of one boolean OR.
  Nodes currently being
  text-edited are filtered out of both `sceneNodes` and `selectedNodes` up front
  (`node.id !== editingNodeId`), so they render exactly once, only through the dedicated editing
  path.
  `drawSceneBackground.ts` masks the alpha channel back off after clearing
  (`gl.colorMask(true,true,true,false)`) so the canvas's own backing-store alpha stays 1 post-clear
  while per-shape draws still blend on `u_color.a`.

## 3. Shader programs

Four GLSL `#version 300 es` programs, all built via `createProgram.ts`/`createShader.ts`:

| Program | Vertex source | Fragment source | Extra attrib | Used by |
|---|---|---|---|---|
| plain-color | `constant/webgl/vertexShaderSource.ts` | `fragmentShaderSource.ts` | — | `drawRect` (dispatches to `drawStandardRect`/`drawRoundedRect`), `drawPolygon` (dispatches to `drawStandardPolygon`/`drawRoundedPolygon`), `drawStar` (dispatches to `drawStandardStar`/`drawRoundedStar`), `drawLine`, `drawEllipse`, `drawEllipseNode` (dispatches to `drawEllipse`/`drawEllipseArc`, `selection-and-manipulation.md` §19), `drawThickOutline`, `drawThickEllipseNodeOutline` (dispatches to `drawThickEllipseOutline`/`drawThickEllipseArcOutline`), `drawArrowhead`, `drawMarquee`, `drawSliceDraft`, `drawCornerHandles`, `drawCornerRadiusHandles`, `drawPolygonCornerRadiusHandle`, `drawStarCornerRadiusHandle`, `drawPolygonVertexCountHandle`/`drawStarVertexCountHandle`, `drawEllipseArcHandle`/`drawEllipseArcGuideLine`/`drawEllipseArcRatioGuideArc`, every outline/handle primitive |
| image/texture | `imageVertexShaderSource.ts` | `imageFragmentShaderSource.ts` | `a_texCoord` | `drawImage.ts` (Media nodes + draft media) |
| MSDF text | **same vertex source as image** (reused, not a 4th file) | `msdfFragmentShaderSource.ts` | `a_texCoord` | `drawMsdfText.ts` |
| pixel grid | `gridVertexShaderSource.ts` (not world-space like the other three — see §10) | `gridFragmentShaderSource.ts` | — | `drawPixelGrid.ts` |

Plain-color vertex shader (every program's transform math is identical, only the fragment stage
differs per program):
```glsl
#version 300 es
in vec2 a_position;
uniform vec2 u_viewportOffset;
uniform float u_zoom;
uniform vec2 u_resolution;
void main() {
  vec2 screenPos = a_position * u_zoom + u_viewportOffset;
  vec2 clip = vec2(
    (screenPos.x / u_resolution.x) * 2.0 - 1.0,
    1.0 - (screenPos.y / u_resolution.y) * 2.0
  );
  gl_Position = vec4(clip, 0.0, 1.0);
}
```
MSDF fragment shader (the interesting one):
```glsl
#version 300 es
precision mediump float;
uniform sampler2D u_texture;
uniform vec4 u_color;
uniform float u_screenPxRange;
in vec2 v_texCoord;
out vec4 outColor;
float median(float r, float g, float b) { return max(min(r, g), min(max(r, g), b)); }
void main() {
  vec3 msdf = texture(u_texture, v_texCoord).rgb;
  float signedDist = median(msdf.r, msdf.g, msdf.b) - 0.5;
  float aa = max(fwidth(signedDist), 1e-4);
  float opacity = clamp(signedDist / aa + 0.5, 0.0, 1.0);
  outColor = vec4(u_color.rgb, u_color.a * opacity);
}
```

**Why four, not one**: plain-color needs no texture unit at all. Image needs a second attribute
(`a_texCoord`) and a sampler. MSDF needs the *same* attributes/uniforms as image (hence sharing its
vertex shader) but a fragment stage doing median-of-3-channel distance-field sampling plus
`fwidth`-based antialiasing — impossible to express in the plain image fragment shader without the
extra `u_color`/`u_screenPxRange` uniforms it doesn't need. The grid program's vertex stage is
different in kind, not just degree, from the other three (§10) — its `a_position` skips the
world→clip transform entirely, so it couldn't share any existing vertex source even though its
fragment stage is a plain `u_color` fill like the first program. No location caching, no program
manager/batching — every primitive calls `getAttribLocation`/`getUniformLocation`/`useProgram` fresh
per draw call; draw order is simply whatever `drawScene` calls in sequence.

## 4. Coordinate systems

- **World space** = node coordinates as stored in Redux — zoom/device independent.
- **Screen space** = CSS pixels relative to the canvas, *pre*-DPR-scaling
  (`u_resolution` is fed `canvas.clientWidth/clientHeight`, not the DPR-scaled `canvas.width/height`
  — DPR is handled purely by `gl.viewport(0,0,canvas.width,canvas.height)` in `resizeCanvas.ts`
  mapping that CSS-pixel clip space onto the larger physical backing store).
- `Canvas/utils/screenToWorld.ts` / `worldToScreen.ts` — the CPU-side conversions, used by
  hit-testing, pointer-position math, and DOM overlay positioning (`TextEditOverlay`) — **not** by
  the renderer itself:
  ```ts
  screenToWorld = (point, viewport) => ({ x: (point.x - viewport.x) / viewport.zoom, y: (point.y - viewport.y) / viewport.zoom });
  worldToScreen = (point, viewport) => ({ x: point.x * viewport.zoom + viewport.x, y: point.y * viewport.zoom + viewport.y });
  ```
- **The world→clip-space transform runs on the GPU** (§3's vertex shader), via `u_viewportOffset`
  (`{viewport.x, viewport.y}`), `u_zoom`, `u_resolution`. Every `utils/canvas/draw*.ts` primitive
  uploads raw world-space vertices and sets those three uniforms — there is no CPU-side
  `toClipSpace` anywhere in the primitives. Confirmed deliberate (roadmap Etap 4): moved off CPU
  specifically because the per-vertex transform runs through every draw call, "better done right
  once than migrated later at scene scale." Known trade-off from the same change: corner/resize
  handles now scale with zoom (they go through the same GPU transform as real content) — a
  fixed-on-screen-size UI layer would need its own separate transform, deliberately deferred.

## 5. Draft-ref vs. committed-Redux rendering — two independent passes

**Committed nodes** (`store.design.nodes`, read via `selectOrderedNodes`) render through
`drawSceneNodes.ts` — one `switch (node.type)` dispatching to `drawEllipse`/`drawPolygon`/`drawStar`/
`drawImage`/`drawLine` (+arrowheads)/`drawPathOutline`/`drawMsdfText`/default `drawRect`. Rectangle
has no dedicated `case` — it falls through the same `default: drawRect(node, ...)` as Frame/Section,
because `drawRect.ts` itself branches on the node's own optional `cornerRadius` field (structural
typing: passing a `TRectangleNode` through satisfies `TDrawableRect`'s optional `cornerRadius?:
number` with no cast needed) rather than the dispatcher needing to know a rectangle can be rounded.
`drawPolygon.ts` (its own `utils/canvas/drawPolygon/` folder, not `shapes/` anymore) branches the
same way on `TPolygonNode.cornerRadius?: number`, dispatching to `drawStandardPolygon.ts` (the
original flat fan, byte-for-byte moved) or `drawRoundedPolygon.ts` — the second instance of the
`drawRect/`-shaped "dispatcher + one file per concrete path" folder (see §8). `drawStar.ts`
(`utils/canvas/drawStar/`) is the third instance, same shape: dispatches on `TStarNode.cornerRadius?:
number` to `drawStandardStar.ts` or `drawRoundedStar.ts`.

**In-progress/ephemeral visuals** never touch Redux — they live in plain `useRef`s created by
`useCanvasRefs()` (§1) and held on `Canvas.tsx`'s `refs` object, written directly by native pointer
listeners (so dragging never dispatches per pixel), and read by `drawScene` via `.current` every
frame:

| Ref | Set by | Rendered by |
|---|---|---|
| `draftRef` (`TDraftEntity \| null`) | every `useDraw<X>Tool` hook | `drawFrame.ts` (dispatcher) → `drawDraftLine.ts` (Line/Arrow) or `drawDraftShape.ts` (switch: ellipse/polygon/star/media/text/path, default = box) |
| `marqueeRef` (`TDraftRect \| null`) | `useSelectionTool`'s `armMarqueeDrag`/`continueMarqueeDrag`/`disarmMarqueeDrag` | `utils/canvas/drawMarquee.ts` |
| `hoverRef` (`string \| null`, node id) | `useHoverHighlight.ts` | `drawScene/drawHoverOutline.ts` (per-`NodeType` dispatch) |
| `sliceRef` (`TSliceDraft \| null`) | `useSliceTool.ts`'s own arm/continue/disarm set | `utils/canvas/drawSliceDraft.ts` |
| `cornerRadiusDragRef`/`polygonCornerRadiusDragRef`/`starCornerRadiusDragRef` (drag-state `\| null`) | `useSelectionTool.ts`'s `arm*CornerRadiusDrag`/`disarm*CornerRadiusDrag` trio per shape | dereferenced to a single `isDraggingCornerRadius` boolean (OR of all three) by `drawScene/hasCornerRadiusDragMoved.ts`, called from `drawScene.ts` itself (not `startRenderLoop.ts`'s `tick`, which just forwards the whole `refs` object through unchanged), consumed by `drawCornerRadiusHandlesLayer.ts` — not rendered directly, just gates the zero-state-offset fallback (`selection-and-manipulation.md` §13) |
| `ellipseArcDragRef`/`ellipseArcRotateDragRef`/`ellipseArcRatioDragRef` (drag-state `\| null`) | `useSelectionTool.ts`'s `armEllipseArc*Drag`/`disarmEllipseArc*Drag` trio per handle | each dereferenced to its own `.current?.draggedHandlePosition ?? null` directly inside `drawScene.ts`, passed straight through as one of `drawEllipseArcHandleLayer.ts`'s three optional position params — rendered directly (unlike the corner-radius boolean), since this is the live pointer-projected handle position itself, not just an in-progress flag (`selection-and-manipulation.md` §19) |

`TDraftEntity` (`types/design/types.ts`) unions one draft variant per geometry
(`TDraftShape | TDraftLine | TDraftPath | TDraftPolygon | TDraftStar | TDraftMedia | TDraftText`),
each built from `TDraftRect`.

**One deliberate exception**: in-progress **text-edit content/caret/selection is not a ref** — it
lives in Redux (`editingTextContent`, `editingSelectionStart/End/ChangedAt`, `editingTextBox`,
`editingNodeId`), dispatched per keystroke (`TextEditOverlay/hooks/useTextEditInput.ts`), read
straight off `store.getState()` by `drawScene.ts` and rendered via `drawEditingText.ts` →
`drawEditingTextBoxOutline.ts` + `drawMsdfText.ts` + `drawEditingCaretAndSelection.ts`. This is fine
as Redux state (not a ref) because keystroke frequency is orders of magnitude lower than pointermove
frequency — the per-dispatch cost that matters for a drag gesture is a non-issue here.

## 6. Texture/image pipeline (Media nodes)

`utils/canvas/getOrLoadTexture.ts` — cache + placeholder-then-swap:
```ts
export const getOrLoadTexture = (gl, cache, src) => {
  const cached = cache.get(src);
  if (cached) return cached;
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0])); // 1×1 transparent placeholder
  cache.set(src, texture);
  loadTextureImage(gl, texture, src);   // async: on real Image() load, rebinds the SAME texture and re-uploads
  return texture;
};
```
Called every frame from `drawSceneNodes.ts`/`drawDraftShape.ts` for `NodeType.media`; the cache
(`Map<string, WebGLTexture>`) lives on the shared `TImageRenderContext` so textures survive across
frames. Because `image.onload` re-binds the **same** `WebGLTexture` object rather than creating a
new one, any draw call that already captured that reference just starts rendering the swapped-in
pixels on the next frame with zero coordination needed.

`drawImage.ts` differs from the plain-color pipeline three ways: (1) a second interleaved vertex
attribute stream (`[x,y,u,v]`), (2) `bindTexture`/`u_texture` sampler setup instead of a flat
`u_color`, (3) texture creation/caching (`getOrLoadTexture`) is a prerequisite the color pipeline
has no equivalent of. UV coordinates are flipped per-axis for `flipX`/`flipY` before upload; rotation
goes through `rotateVertices.ts` same as other primitives.

## 7. MSDF text pipeline (overview — not a full tutorial)

**MSDF = Multi-channel Signed Distance Field.** A first cut rendered text once to an offscreen
Canvas 2D and uploaded it as an ordinary bitmap texture (same pipeline as Media) — irreversibly
blurred on zoom-in (a fixed-resolution bitmap can't be "sharpened"), mipmaps only partially fixed
zoom-*out* aliasing. MSDF instead encodes distance-to-glyph-edge in the atlas's RGB channels; the
fragment shader (§3) reconstructs a crisp edge procedurally at *any* zoom via
`median(r,g,b) - 0.5` thresholding + `fwidth` antialiasing — verified live from 500% to ~25600% zoom.

- **Atlas is build-time, not runtime**: `npm run generate:font-atlas` runs `msdf-bmfont` against a
  static (non-variable) TTF, frozen at weight 400 via `fonttools varLib.instancer` (Inter ships as a
  variable font). Output (`inter-msdf.{json,png}`) is imported as static assets in
  `constant/webgl/msdfAtlas.ts`. Currently one font/weight — multi-font/atlas-per-font is Etap 9,
  deliberately deferred (each extra font is +150-300KB unconditionally bundled otherwise).
- The atlas texture gets its **own** loader, `getMsdfAtlasTexture.ts` — structurally identical
  placeholder-then-swap to `getOrLoadTexture.ts` but not shared with it, because it additionally
  calls `gl.generateMipmap` after load (`LINEAR_MIPMAP_LINEAR` vs. plain `LINEAR` for Media) —
  minifying a distance field without mipmaps corrupts the median threshold more visibly than an
  ordinary photo texture.
- **Glyph-quad batching**: `text/buildGlyphQuads.ts` walks each wrapped line/character, looks up
  metrics (`getGlyph.ts`/`getGlyphAdvance.ts`), emits one interleaved `[x,y,u,v]` vertex set per
  character into one flat array — a whole node's text becomes **one `bufferData` + one
  `drawArrays`** per frame, not a draw call per glyph (same "batch into one buffer" pattern as
  `drawPolygon`/`drawStar`). `getOrBuildTextGeometry.ts` caches the built geometry per node, keyed
  **without** zoom/DPI — MSDF geometry stays correct at any zoom without rebuilding, unlike the old
  bitmap approach. A parallel `buildCurvedGlyphQuads.ts` handles text-on-a-path (arc-length table
  instead of a straight baseline) — start there for curved-text work specifically.
- `text/drawMsdfText.ts` is the runtime entry point — computes
  `u_screenPxRange = distanceRange * effectiveFontSize * zoom / atlas.info.size` per draw (this is
  what keeps edges pixel-sharp across zoom), otherwise follows the same boilerplate as `drawImage.ts`.

## 8. Primitive drawing utilities — the shared boilerplate

Every `src/utils/canvas/draw*.ts` (and `shapes/draw*.ts`) follows the same shape:

1. `gl.getAttribLocation`/`getUniformLocation` — looked up **fresh every call**, never cached.
2. Compute vertex positions in **world space** on the CPU (rotation via `rotatePoint`/
   `rotateVertices`, flipping via `flipPoint`, stroke-width offsets) — never converted to
   screen/clip space here.
3. `gl.useProgram(program)`.
4. Set the three transform uniforms (`u_viewportOffset`, `u_zoom`, `u_resolution`) — identical in
   every primitive, color or textured.
5. `bindBuffer`/`enableVertexAttribArray`/`vertexAttribPointer` (interleaved stride for
   image/text primitives, tight `[x,y]` for color primitives).
6. `bufferData(..., new Float32Array([...]), gl.STATIC_DRAW)` — re-uploads the **entire** buffer
   every call (no persistent VBO reuse/partial updates anywhere **except** committed vector nodes' fill
   faces, `drawVectorFill.ts` via `getOrCreateFaceBuffer.ts` — see [[canvas-vector-performance]] §5.7's
   closing note; `STATIC_DRAW` is a slight misnomer since the data changes every frame, but it's what's
   used throughout everywhere else).
7. Set the fill/stroke/texture uniform (`u_color` via `hexToRgbaFloat`, or bind a texture unit).
8. `gl.drawArrays(<mode>, 0, <count>)`.

Draw modes by primitive:
- **`TRIANGLES`**: `drawStandardRect` (unrounded `drawRect`, 6 verts), `drawLine`
  (perpendicular-offset quad, 6 verts), `drawImage`, `drawMsdfText`, `drawThickOutline` (its own
  `utils/canvas/drawThickOutline/` folder, same "dispatcher + one file per concrete path" shape as
  `drawRect/`: `drawThickOutline.ts` picks `getSharpRingVertices.ts` (4 quads = 24 verts, a
  rectangular ring) or `getRoundedRingVertices.ts` (same inner/outer-ring trick as
  `getRoundedRectPoints` once `cornerRadius > 0`, so the hover/selection outline for a rounded
  Rectangle actually traces the rounded boundary instead of a sharp one) then rotates the result via
  `rotateFlatVertices.ts`), `drawThickEllipseOutline`/`drawThickPolygonOutline`/
  `drawThickStarOutline` (inner/outer-ring trick — see below; also `cornerRadius`-aware the same way,
  swapping in `getRoundedPolygonPoints`/`getRoundedStarPoints`). All four "thick outline" primitives
  (`getRoundedRingVertices` included) share `getRingVertices.ts` (`utils/canvas/`, same
  shared-utility placement as `toFanVertices.ts`) — takes the outer/inner point lists and does the
  whole "quad per point pair, wrapping the last back to the first" loop, itself built on the even
  smaller `getQuadVertices.ts` (one point pair → two triangles). `getSharpRingVertices.ts` is the one
  exception, since its 4 named edges (top/bottom/left/right) aren't a uniform point ring.
- **`TRIANGLE_FAN`**: `drawEllipse`/`drawPolygon`/`drawStar` **fills**
  (`[center, ...points, points[0]]`) — `drawRoundedRect` (rounded `drawRect`) and `drawRoundedPolygon`
  (rounded `drawPolygon`) both reuse the exact same fan shape via the shared `toFanVertices.ts`
  (`utils/canvas/`, one level up from `drawRect/`/`drawPolygon/` since both folders share it), fed
  from `getRoundedRectPoints.ts`/`getRoundedPolygonPoints.ts` instead of `getEllipsePoints.ts`.
- **`LINE_LOOP`**: `drawEllipse`/`drawPolygon`/`drawStar` **stroke** outlines — 1px only.
- `gl.lineWidth()` is capped at 1px in this WebGL implementation (confirmed via
  `gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)` → `[1, 1]`), which is *why* the "thick outline"
  primitives exist as a separate triangle-ring hack rather than just widening a `LINE_LOOP`.
- Composite primitives build entirely from the above rather than adding new GL boilerplate — e.g.
  `drawArrowhead.ts` is two `drawLine` calls (the wings) plus three `drawEllipse` fill calls
  (tip + wing-end round caps, since there's no dedicated rounded-polyline primitive).

**To add a new primitive**: copy the shape of the closest existing one (rect-like → `drawRect/`
folder; curve-like → `drawEllipse.ts`; composite → `drawArrowhead.ts`) and change only the
vertex-generation math (step 2) and the `drawArrays` mode/count (step 8) — copy steps 1, 3-7
verbatim. `drawRect/` is itself the worked example of "one primitive family, one folder": a plain
dispatcher (`drawRect.ts`) plus one file per concrete rendering path (`drawStandardRect.ts`,
`drawRoundedRect.ts`) plus a shared tiny helper (`toFanVertices.ts`), each with its own
`test/*.spec.ts` sibling — same "folder named after its main file" shape as a hook folder like
`useSelectionTool/useSelectionTool.ts`. `drawPolygon/` and `drawStar/` both copy this shape verbatim
for their own optional-`cornerRadius` split (`drawPolygon.ts`/`drawStar.ts` dispatcher,
`drawStandardPolygon.ts`/`drawStandardStar.ts`, `drawRoundedPolygon.ts`/`drawRoundedStar.ts`) —
confirms the pattern generalizes past Rectangle, not a one-off.

## 9. Text-edit overlay — the invisible contentEditable input surface

`TextEditOverlay.tsx` is a real `contentEditable` `<div>` positioned over the canvas (`caretColor:
transparent`, `color: transparent`) — it exists purely to capture native browser text-input/IME/
selection behavior; nothing it renders is ever seen, since the actual glyphs/caret/selection
highlight are canvas-drawn from Redux (§5's "one deliberate exception"). This means every DOM↔Redux
conversion the overlay does has to independently reconstruct the same "what line is this character
on" model a real browser's `Enter` key produces, which is genuinely two different shapes depending on
*how* the content got there:

- **Freshly typed** (a new node, or continuing to type in an existing session): pressing `Enter`
  natively is never intercepted for plain Text (only for text-on-path, where `useBlockShortcutPropagation`
  substitutes a space) — Chrome's own default contentEditable behavior wraps every line after the
  first in its own `<div>` (`hi<div>there</div><div>you</div>`), not `<br>`.
- **Re-seeded on entry** (`setEditableTextContent.ts`, called by `useSeedEditableTextOnEntry` only
  when re-editing an existing node): deliberately flat, `text<br>text<br>text` — no `<div>` at all.

Both shapes (plus the empty-line case, `<div><br></div>`, and any mix of the two once a user edits
further) have to resolve to the *identical* logical character index a plain `\n`-joined string would
use. `getEditableLines.ts` (`TextEditOverlay/utils/`) is the single BR/DIV/text state machine both
directions share — `getEditableTextContent.ts` (DOM → string, for `onInput`) maps each line's text
nodes to a string and joins with `\n`; `setEditableSelectionRange.ts` (index → DOM node/offset, for
click-to-position-caret and select-all-on-entry) walks the same lines to locate the exact `Text` node
and in-node offset. This used to be two independently hand-rolled implementations of the same
BR/DIV bookkeeping (`hasPendingLine` state machine included) that quietly drifted apart — the "read"
direction handled `<div>`-wrapped lines correctly from early on, but the "write" direction
(`setEditableSelectionRange`'s original `getPositionForCharacterIndex`) walked a plain
`document.createTreeWalker(element, NodeFilter.SHOW_TEXT)` that skipped every `<br>` and mishandled
every `<div>` entirely, undercounting the index by exactly the number of line breaks before the
target line (line 2 off by 1, line 3 off by 2 — worse the more lines involved, and only masked on a
freshly-seeded re-edit session because that flat structure happens to have no `<div>`s to trip over).
Extracting `getEditableLines` as the one shared source of truth is what keeps the two directions from
being able to drift apart again, rather than re-fixing each hand-rolled copy in turn.

**Gotcha — the "select all on entry" double-click races its own word-select handler.**
`useSeedEditableTextOnEntry` seeds content, focuses the overlay, then calls
`selectEditableTextContent` (`range.selectNodeContents`) to select everything — correct on its own.
But the *same* native `dblclick` that triggers entry (`useTextEditOnDoubleClick`, listening on the
canvas) still bubbles on up to `document`, where `useStraightCaretEditing`'s own `handleDoubleClick`
listens for "double-click a word/line **while already editing**" (`getWordRangeAtIndex`) — a listener
that can still be attached from a text-edit session that hasn't finished tearing down yet. If it
catches this same originating event, it immediately re-narrows the just-set "select all" down to
whichever word/line sat under the pointer, before the user ever sees the full selection. Fixed with
`event.stopPropagation()` in `useTextEditOnDoubleClick`'s handler (alongside the pre-existing
`preventDefault()`) — the entry-into-edit-mode double-click never reaches the still-editing
double-click handler at all, regardless of teardown timing.

## 10. Pixel grid — a zoom-gated, shader-only full-viewport overlay

`drawPixelGrid.ts` (`utils/canvas/`) draws a helper grid at every integer world coordinate — visible
only once `viewport.zoom >= GRID_MIN_ZOOM` (4, i.e. 400%, matching Figma's own threshold) —
`drawScene.ts` calls it unconditionally every frame and the gate lives inside the function itself
(same "no branch in the orchestrator" shape as every other optional layer here). Since world space is
already "1 unit = 1px" (§4; most node types snap to whole pixels — Vector Network points are the one
exception, snapping to the half-pixel grid instead, [[vector-network]] §13), a grid line drawn at every
integer world coordinate makes a 1×1 node's edges land exactly on the grid with no separate snapping logic
needed.

**Why a shader, not `GL_LINES`**: at 400%+ zoom the visible world spans hundreds of grid cells;
drawing one vertex pair per row/column would mean regenerating and re-clipping thousands of line
vertices every frame, plus every visible cell recomputed on every pan. Instead the grid is a single
static 6-vertex full-viewport quad (`FULL_VIEWPORT_QUAD`, drawn once, `STATIC_DRAW`), and the actual
line pattern is computed **per fragment**: `gridFragmentShaderSource.ts` reconstructs world position
from the quad's screen position, takes `fract(worldPos - 0.5) - 0.5` to get distance to the nearest
integer coordinate on each axis, and divides by `fwidth(worldPos)` (the screen-space derivative) to
get a coverage value that's ~1 right on a line and 0 a pixel or two away — the standard
constant-screen-width-regardless-of-zoom procedural grid technique, same `fwidth`-based antialiasing
idea §3's MSDF text fragment shader already uses for a different purpose.

**Why the vertex shader is the odd one out**: every other vertex shader here takes `a_position` in
*world* space and transforms it to clip space via `u_viewportOffset`/`u_zoom`/`u_resolution` (§3's
plain-color vertex shader). The grid's `gridVertexShaderSource.ts` does the opposite split: its
`a_position` **is already** a clip-space quad corner (`-1..1`), passed straight to `gl_Position` with
no transform at all, so the quad always exactly covers the viewport at every zoom/pan. Pan/zoom is
applied in the *fragment* shader instead, reconstructing world position from a screen-space varying
(`v_screenPos`, computed once per vertex from `a_position`/`u_resolution`) — the inverse of the usual
`worldPos → screenPos` transform. This split (transform-free vertex stage, all the real math in the
fragment stage) is what makes "cover the whole screen regardless of pan/zoom" trivial without needing
to compute a world-space rect big enough to cover the visible area at the current zoom.

**Draw order**: right after `drawSceneBackground`, before `drawSceneNodes` — the grid sits behind
node fills, same layer relationship as the canvas background itself. This is a pure paint-order
choice with no hit-testing consequence either way: nothing in this app hit-tests by DOM/paint
layering (§4's own note on `TextEditOverlay` being paint-invisible makes the same point from the
opposite direction) — every pointer interaction resolves via math against node geometry
(`getNodeAtPoint.ts` and friends), so the grid can never intercept or shadow a click regardless of
where it sits in the paint order.

## File index

- Context/setup: `Canvas/Canvas.tsx`, `Canvas/constants.ts`,
  `Canvas/hooks/useCanvasRenderLoop/useCanvasRenderLoop.ts`,
  `Canvas/hooks/useCanvasResize/{useCanvasResize,utils/resizeCanvas}.ts`
- Render loop: `useCanvasRenderLoop/utils/{setupRenderLoop,startRenderLoop,createProgram,
  createShader}.ts`, `.../utils/drawScene/{drawScene,hasCornerRadiusDragMoved}.ts`, `.../types.ts`
  (`TImageRenderContext`)
- Shaders: `constant/webgl/{vertexShaderSource,fragmentShaderSource,imageVertexShaderSource,
  imageFragmentShaderSource,msdfFragmentShaderSource,msdfAtlas,gridVertexShaderSource,
  gridFragmentShaderSource}.ts`
- Pixel grid: `utils/canvas/drawPixelGrid.ts`, `constant/canvas.ts`'s `GRID_COLOR`/`GRID_MIN_ZOOM`
- Coordinate systems: `Canvas/utils/{screenToWorld,worldToScreen}.ts`
- Draft/committed split: `.../drawScene/{drawSceneNodes,drawFrame,drawDraftShape,drawDraftLine}.ts`;
  ephemeral-ref targets: `utils/canvas/drawMarquee.ts`, `.../drawScene/drawHoverOutline.ts`,
  `utils/canvas/drawSliceDraft.ts`, `.../drawScene/drawEditingText.ts` + `drawEditingCaretAndSelection/`
- Texture pipeline: `utils/canvas/getOrLoadTexture.ts`, `utils/canvas/drawImage.ts`
- MSDF pipeline: `utils/canvas/text/{drawMsdfText,getMsdfAtlasTexture,buildGlyphQuads,buildGlyphQuad,
  buildCurvedGlyphQuads,getOrBuildTextGeometry}.ts`, `package.json`'s `generate:font-atlas` script
- Primitives: `src/utils/canvas/*.ts`, `src/utils/canvas/shapes/*.ts` (incl. `getRoundedRectPoints.ts`,
  `getRoundedPolygonPoints.ts`, `getRoundedStarPoints.ts`, and the shape-agnostic
  `getRoundedVertexPoints.ts` both of those wrap), `src/utils/canvas/drawRect/*.ts`,
  `src/utils/canvas/drawPolygon/*.ts`, and `src/utils/canvas/drawStar/*.ts` (each its own folder —
  see above)
- Corner-radius handles: `utils/canvas/cornerRadius/*.ts` (Rectangle math, still its own — the 90°
  case is simple enough not to generalize) + `utils/canvas/cornerRadius/{getMaxCornerRadiusForVertices,
  getCornerRadiusHandleSetbackMultiplier}.ts` and `utils/math/getVertexAngles.ts` (shape-agnostic math
  shared by Polygon and Star, wrapped by thin `utils/canvas/cornerRadius/{polygon,star}/*.ts` per-shape
  files), `utils/canvas/drawCornerRadiusHandles.ts` + `utils/canvas/drawPolygonCornerRadiusHandle.ts` +
  `utils/canvas/drawStarCornerRadiusHandle.ts`, all gated by
  `.../drawScene/drawCornerRadiusHandlesLayer.ts` (rendering) — full mechanism in
  `selection-and-manipulation.md` §11, §12, §15-16
- Roadmap corroboration: `docs/ROADMAP.md` Etap 4 (GPU transform migration), Etap 7 (MSDF rationale)

## Related

[[design-tool-architecture]] — one level up: how a draw tool is assembled using the primitives
described here. [[design-store-architecture]] — what `drawScene.ts` reads out of `store.getState()`
every frame.
[[vector-network]] — the one feature so far needing a context-setup change (`stencil: true` on
`WEBGL_CONTEXT_ATTRIBUTES`, §1) and a genuinely new WebGL technique (stencil-buffer even-odd fill,
`drawVectorFill.ts`) not covered by anything else described here.
[[canvas-vector-performance]] — why `drawSceneVectorNode.ts` (§2/§5) checks a frozen-snapshot map
before ever calling the plain `drawVectorNode.ts` path, and why GPU-buffer-level caching isn't a quick
follow-up for vector nodes at scale in general (§3/§8's "no persistent VBO reuse anywhere" is still true
for stroke tessellation and every non-vector primitive) — a first, narrow slice now exists for stable
committed vector nodes' fill faces specifically (that doc's §5.7 closing note,
`utils/canvas/drawVectorNode/getOrCreateFaceBuffer.ts`), the one exception to "no persistent VBO reuse
anywhere" in this codebase so far.
