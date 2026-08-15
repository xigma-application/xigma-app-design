# Canvas — WebGL rendering pipeline

How the Design canvas actually renders, frame by frame — one level deeper than
`design-tool-architecture.md` (which covers how a tool is *assembled*; this covers what happens
underneath when anything gets drawn). No canvas library is used — every primitive here is hand-rolled
WebGL2.

## 1. Context setup

- `Canvas/Canvas.tsx` owns the single `<canvas>` element (`canvasRef`) plus four ephemeral
  `useRef`s (`draftRef`/`marqueeRef`/`hoverRef`/`sliceRef` — see §6) threaded into every tool hook
  and into `useCanvasRenderLoop`.
- The context itself is created in `Canvas/hooks/useCanvasRenderLoop/useCanvasRenderLoop.ts`:
  `canvas.getContext(WEBGL_CONTEXT_ID, WEBGL_CONTEXT_ATTRIBUTES)`, both constants in
  `Canvas/constants.ts`: `WEBGL_CONTEXT_ID = 'webgl2'`,
  `WEBGL_CONTEXT_ATTRIBUTES = { premultipliedAlpha: false }`. `premultipliedAlpha: false` matters
  because every fragment shader outputs straight (non-premultiplied) alpha and blending is set up to
  match: `gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)`, set once, not
  per draw call.
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

- `useCanvasRenderLoop/utils/startRenderLoop.ts` — a recursive `requestAnimationFrame` `tick`
  calling `drawScene(...)` every frame, then scheduling itself again. Returns a `stop` closure
  (`cancelAnimationFrame`) used as the `useEffect` cleanup.
- **No dirty-checking anywhere** — every frame redraws unconditionally. `drawScene` is not a
  React-subscribed component; it reads Redux fresh via `store.getState()` on every call, plus the
  four ephemeral refs' `.current`. This is a deliberate simplicity trade-off (see roadmap Etap 4/10),
  not an oversight — there's no dirty-flag/requestIdleCallback layer.
- `drawScene.ts` — the exact per-frame sequence, in order:
  ```ts
  drawSceneBackground(gl);
  drawSceneNodes(gl, program, buffer, imageContext, sceneNodes, w, h, viewport, pathOutlineStyles);
  drawHoverOutline(gl, program, buffer, hoveredNode, w, h, viewport);
  drawSelectionOutline(gl, program, buffer, selectedNodes, w, h, viewport);
  drawFrame(gl, program, buffer, imageContext, draftShape, w, h, viewport);       // dispatcher, despite the name
  drawEditingText(gl, program, buffer, imageContext, editingTextBox, ...);
  drawEditingPathTextHandle(gl, program, buffer, editingTextBox, w, h, viewport);
  drawMarquee(gl, program, buffer, marqueeRect, w, h, viewport);
  drawSliceDraft(gl, program, buffer, sliceRect, w, h, viewport);
  ```
  **background → committed nodes → hover outline → selection outline → in-progress draft →
  editing-text overlay → path-text offset handle → marquee → slice draft.** Nodes currently being
  text-edited are filtered out of both `sceneNodes` and `selectedNodes` up front
  (`node.id !== editingNodeId`), so they render exactly once, only through the dedicated editing
  path.
  `drawSceneBackground.ts` masks the alpha channel back off after clearing
  (`gl.colorMask(true,true,true,false)`) so the canvas's own backing-store alpha stays 1 post-clear
  while per-shape draws still blend on `u_color.a`.

## 3. Shader programs

Three GLSL `#version 300 es` programs, all built via `createProgram.ts`/`createShader.ts`:

| Program | Vertex source | Fragment source | Extra attrib | Used by |
|---|---|---|---|---|
| plain-color | `constant/webgl/vertexShaderSource.ts` | `fragmentShaderSource.ts` | — | `drawRect`, `drawLine`, `drawEllipse`, `drawPolygon`, `drawStar`, `drawThickOutline`, `drawArrowhead`, `drawMarquee`, `drawSliceDraft`, `drawCornerHandles`, every outline/handle primitive |
| image/texture | `imageVertexShaderSource.ts` | `imageFragmentShaderSource.ts` | `a_texCoord` | `drawImage.ts` (Media nodes + draft media) |
| MSDF text | **same vertex source as image** (reused, not a 4th file) | `msdfFragmentShaderSource.ts` | `a_texCoord` | `drawMsdfText.ts` |

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

**Why three, not one**: plain-color needs no texture unit at all. Image needs a second attribute
(`a_texCoord`) and a sampler. MSDF needs the *same* attributes/uniforms as image (hence sharing its
vertex shader) but a fragment stage doing median-of-3-channel distance-field sampling plus
`fwidth`-based antialiasing — impossible to express in the plain image fragment shader without the
extra `u_color`/`u_screenPxRange` uniforms it doesn't need. No location caching, no program
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
`drawImage`/`drawLine` (+arrowheads)/`drawPathOutline`/`drawMsdfText`/default `drawRect`.

**In-progress/ephemeral visuals** never touch Redux — they live in plain `useRef`s on `Canvas.tsx`,
written directly by native pointer listeners (so dragging never dispatches per pixel), and read by
`drawScene` via `.current` every frame:

| Ref | Set by | Rendered by |
|---|---|---|
| `draftRef` (`TDraftEntity \| null`) | every `useDraw<X>Tool` hook | `drawFrame.ts` (dispatcher) → `drawDraftLine.ts` (Line/Arrow) or `drawDraftShape.ts` (switch: ellipse/polygon/star/media/text/path, default = box) |
| `marqueeRef` (`TDraftRect \| null`) | `useSelectionTool`'s `armMarqueeDrag`/`continueMarqueeDrag`/`disarmMarqueeDrag` | `utils/canvas/drawMarquee.ts` |
| `hoverRef` (`string \| null`, node id) | `useHoverHighlight.ts` | `drawScene/drawHoverOutline.ts` (per-`NodeType` dispatch) |
| `sliceRef` (`TSliceDraft \| null`) | `useSliceTool.ts`'s own arm/continue/disarm set | `utils/canvas/drawSliceDraft.ts` |

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
   every call (no persistent VBO reuse/partial updates anywhere; `STATIC_DRAW` is a slight misnomer
   since the data changes every frame, but it's what's used throughout).
7. Set the fill/stroke/texture uniform (`u_color` via `hexToRgbaFloat`, or bind a texture unit).
8. `gl.drawArrays(<mode>, 0, <count>)`.

Draw modes by primitive:
- **`TRIANGLES`**: `drawRect` (6 verts), `drawLine` (perpendicular-offset quad, 6 verts), `drawImage`,
  `drawMsdfText`, `drawThickOutline` (4 quads = 24 verts, a rectangular ring), `drawThickEllipseOutline`/
  `drawThickPolygonOutline`/`drawThickStarOutline` (inner/outer-ring trick — see below).
- **`TRIANGLE_FAN`**: `drawEllipse`/`drawPolygon`/`drawStar` **fills** (`[center, ...points, points[0]]`).
- **`LINE_LOOP`**: `drawEllipse`/`drawPolygon`/`drawStar` **stroke** outlines — 1px only.
- `gl.lineWidth()` is capped at 1px in this WebGL implementation (confirmed via
  `gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)` → `[1, 1]`), which is *why* the "thick outline"
  primitives exist as a separate triangle-ring hack rather than just widening a `LINE_LOOP`.
- Composite primitives build entirely from the above rather than adding new GL boilerplate — e.g.
  `drawArrowhead.ts` is two `drawLine` calls (the wings) plus three `drawEllipse` fill calls
  (tip + wing-end round caps, since there's no dedicated rounded-polyline primitive).

**To add a new primitive**: copy the shape of the closest existing one (rect-like → `drawRect.ts`;
curve-like → `drawEllipse.ts`; composite → `drawArrowhead.ts`) and change only the vertex-generation
math (step 2) and the `drawArrays` mode/count (step 8) — copy steps 1, 3-7 verbatim.

## File index

- Context/setup: `Canvas/Canvas.tsx`, `Canvas/constants.ts`,
  `Canvas/hooks/useCanvasRenderLoop/useCanvasRenderLoop.ts`,
  `Canvas/hooks/useCanvasResize/{useCanvasResize,utils/resizeCanvas}.ts`
- Render loop: `useCanvasRenderLoop/utils/{startRenderLoop,createProgram,createShader}.ts`,
  `.../utils/drawScene/drawScene.ts`, `.../types.ts` (`TImageRenderContext`)
- Shaders: `constant/webgl/{vertexShaderSource,fragmentShaderSource,imageVertexShaderSource,
  imageFragmentShaderSource,msdfFragmentShaderSource,msdfAtlas}.ts`
- Coordinate systems: `Canvas/utils/{screenToWorld,worldToScreen}.ts`
- Draft/committed split: `.../drawScene/{drawSceneNodes,drawFrame,drawDraftShape,drawDraftLine}.ts`;
  ephemeral-ref targets: `utils/canvas/drawMarquee.ts`, `.../drawScene/drawHoverOutline.ts`,
  `utils/canvas/drawSliceDraft.ts`, `.../drawScene/drawEditingText.ts` + `drawEditingCaretAndSelection/`
- Texture pipeline: `utils/canvas/getOrLoadTexture.ts`, `utils/canvas/drawImage.ts`
- MSDF pipeline: `utils/canvas/text/{drawMsdfText,getMsdfAtlasTexture,buildGlyphQuads,buildGlyphQuad,
  buildCurvedGlyphQuads,getOrBuildTextGeometry}.ts`, `package.json`'s `generate:font-atlas` script
- Primitives: `src/utils/canvas/*.ts` and `src/utils/canvas/shapes/*.ts`
- Roadmap corroboration: `docs/ROADMAP.md` Etap 4 (GPU transform migration), Etap 7 (MSDF rationale)

## Related

[[design-tool-architecture]] — one level up: how a draw tool is assembled using the primitives
described here. [[design-store-architecture]] — what `drawScene.ts` reads out of `store.getState()`
every frame.
