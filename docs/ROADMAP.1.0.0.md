# xigma — Roadmap

Goal: recreate the Figma app 1:1, step by step. Drawing engine: **Canvas** (not DOM/SVG).
Exception: during text editing a small DOM overlay (`TextEditOverlay`) is mounted — everything else
(shapes, selection, handles, guides) is drawn on the canvas, just like in the original.

**Rendering: WebGL from the very foundation**, not Canvas 2D — decided deliberately early, to avoid a
second renderer migration later once the scene grows. C++/WASM (like in the real Figma) is a
separate, distant topic, out of scope for now — only if real profiling shows the bottleneck is the JS
math (hit-testing, tessellation), not the GPU drawing itself.

Checkboxes are ticked as progress is made. Each stage = a separate, tiny chunk of work.

## Stage 0 — Project foundation

- [x] `components/Design/Canvas` — one `<canvas>` for the whole viewport, resize (`devicePixelRatio` +
      debounce), render loop (`requestAnimationFrame`, WebGL2), textured background behind the canvas

## Stage 1 — Bottom toolbar

- [x] `components/Design/Toolbar` — floating layout, `activeTool` in Redux, icons per
      [[xigma-icons]]
- [x] Select/Move, Frame, Comment + dropdown variants (Radix `DropdownMenu`)
- [x] **Hand tool** (`H`) — a variant in the Select dropdown, reuses the middle-button pan math
- [x] dropdown of variants under Rectangle (Line/Ellipse/Polygon/Star — details in Stage 6)

## Stage 2 — Scene data model

- [x] `TSceneNode` as a discriminated union (`types/design/types.ts`), starting with just `TFrameNode`
- [x] scene store (`store/design`): `nodes: Record<string, TSceneNode>` + `rootOrder: string[]`,
      reducers `addNode`/`updateNode`
- [x] `TViewport { x, y, zoom }` in Redux — real pan/zoom in Stage 4

## Stage 3 — Frame tool

- [x] click-drag creates a frame, `addNode` on release (with a minimum size), the tool returns
      to Select
- [x] first real WebGL rendering (`drawRect`, a simple shader) — the name above the frame deferred to
      Stage 6/7 (text rendering)

## Stage 4 — Pan & zoom

- [x] scroll = pan, Ctrl/Cmd+scroll (or pinch) = zoom around the cursor, zoom in `[ZOOM_MIN, ZOOM_MAX]`
- [x] viewport transform computed on the GPU (uniforms in the shader), not in JS — deliberately, the
      same kind of decision as WebGL instead of Canvas 2D

## Stage 5 — Selection

- [x] hit-testing (AABB, topmost wins) + drawing the selection outline/resize handles
- [x] dragging the selected node (or several) — resize by handles deferred to Stage 10
- [x] shared outline + shared bbox for a selection of 2+ (groups/nested frames return in Stage 12)
- [x] marquee selection (drag a rectangle), with a "touches" vs Ctrl/Cmd "full containment" mode,
      live-update while dragging
- [x] hover highlight (outline without handles, thickened via a triangle trick, because `gl.lineWidth()`
      is locked to 1px in this environment)
- [x] full click/shift-click/click-in-group/click-in-gap semantics, matching Figma/x-design (write-up in
      `.claude/docs/selection-and-manipulation.md`)

## Stage 6 — More drawing tools

- [x] **Rectangle**, **Ellipse** — shared `useDrawShapeTool.ts`, fixed fill per type (a real
      color picker is Stage 8)
- [x] **Line** — its own geometry (`x1/y1/x2/y2`), editable endpoints after creation
- [x] **Polygon** (`sides`), **Star** (`points`, `ratio`) — the hover outline actually tracks the shape
- [x] **Media** (image + video) — a separate texture program, cache, file picker/queue, video
      converted to 1 frame before placement
- [x] **Text** — creation coupled with content editing (full write-up in Stage 7)
- [x] **Text on Path** — text along a curve (an ellipse), layout from an arc-length table, a handle
      to move the start, flip/mirror respected in the glyph geometry
- [x] **Slice** — selecting an area for a future export; deliberately never reaches
      `store/design` (pure `useRef`), its own resize/rotate/move
- [x] **Arrow** — `TLineNode` with optional `startPoint`/`endPoint: 'arrow'`, reuses Line 1:1;
      the head is purely visual (hit-test/bbox unchanged)
- [x] **Pen / Vector Network** (`NodeType.vector`) — a real graph of vertices/segments with
      cubic tangents on the segment, a multi-click/multi-session tool, fill computed with a
      stencil buffer. Built alongside Stage 11 (undo/redo) as a foundation. Full write-up:
      `.claude/docs/vector-network.md`
- [x] **Pencil** — one drag = one `TVectorNode`, progressive path simplification +
      Catmull-Rom, rounded ends, Shift holds the axis. Full write-up: `.claude/docs/pencil-tool.md`
- [x] a click without a drag places an element of the default 100×100 size (centered for shapes,
      top-left corner at the click point for text), the "movement too small" threshold measured in
      screen space

## Stage 7 — Text editing (DOM overlay) + text rendering in WebGL

- [x] `useDrawTextTool.ts` — the node reaches Redux only after editing ends, and only with
      non-empty content
- [x] `TextEditOverlay` — a real `contentEditable` div, positioned via `worldToScreen`
- [x] **text rendering — MSDF atlas** (not a bitmap) — crisp edges at any zoom,
      generated offline (`msdf-bmfont-xml`, `npm run generate:font-atlas`) from Inter, layout from
      the atlas metrics (not `canvas.measureText`), geometry batched and cached with no dependency
      on zoom/DPI. Tuning the atlas weight, mipmaps, and gamma correction for small text — pending,
      see `.claude/docs/canvas-rendering-pipeline.md`

## Stage 8 — Side panels

- [x] **navigation rail in `LeftPanel`** (`NavRail`, 56px) — logo + 5 toggling icons
      (File/Agents/Assets/Tools/Variables), `@radix-ui/react-toggle-group` (like `MouseModes`), the
      `activeNavItem` state held in `LeftPanel` (controlled `NavRail`), for now just toggling with no
      panel content wired up. Icons and logo (`xigma-logo-shape.svg`, a static asset outside
      `Icon`) in `@xigma/components`/`@xigma/assets`.
- [x] **File panel** (`LeftPanel/PanelContent` → `File`) — `Header` with the file name
      (`EditableInput` + chevron, `UITools`, default "Untitled", local state), `FileMeta` with a
      "Drafts" link and a subscription chip (`Chip` `UITools`, `free` variant). The `PanelLeft` icon
      in `@xigma/components`. For now purely visual changes — one file, no persistence.
- [ ] layers panel (node tree, reorder, visible/locked)
- [ ] properties panel (X/Y/W/H, Fill, Stroke, Opacity/blend mode)
- [ ] text properties (size/weight/alignment/line-height/letter-spacing)
- [ ] Start/End point dropdowns for Line/Arrow

## Stage 9 — Multiple fonts, an atlas per font from the server

Deliberately deferred until a real font choice exists (part of Stage 8) — today one font is baked
into the bundle.

- [x] font atlases on a CDN, loaded dynamically (`fetch`) instead of a static import
- [x] cache per `fontFamily`, a manifest of available fonts
- [x] the atlas generator moves to a separate repo (fetches TTFs on demand instead of keeping
      binaries in git)

## Stage 10 — Finishing node manipulation

- [x] **resize by handles** — 8 directions, single node and group, Shift = aspect-lock on corners,
      rotated resize computed by projecting the scale vector onto the node's local axes (rotated
      cursor, no shear)
- [x] **mirror/flip when crossing zero** — dragging "through" the anchor mirrors the bbox
      instead of getting stuck at the minimum size; Media/Text/Polygon/Star got a real
      `flipX`/`flipY` (UV flip for Media, geometric glyph/vertex mirror for the rest)
- [x] **rotation** — CPU-side post-processing of points (`rotatePoint`), works for a single
      node and a group (orbit around the shared center), rotating handles and cursor
- [x] **double-click enters editing an existing text** — all content selected, editing rotated/
      mirrored text renders correctly (cursor/selection drawn on the canvas, not the
      native DOM, so it doesn't drift from the MSDF glyphs)
- [x] **corner radius** for Rectangle (4 independent corners), Polygon and Star (one shared radius,
      concave vertices too). Full write-up: `.claude/docs/selection-and-manipulation.md` §11-16
- [x] **cutting a fragment of an ellipse** — Sweep/Start/Ratio, 1:1 with Figma's Arc tool (ring,
      fill inversion). Full write-up: ibid. §19
- [x] **Ratio handle for Star** (a third handle, inner/outer radius). Ibid. §20
- [x] **Delete/Backspace** — removes the selection (or a single vertex in Vector Edit Mode)
- [x] **remaining editing shortcuts** — Duplicate, Copy/Paste (also at the vertex/segment level in
      Vector Edit Mode), Select All, arrow-key nudge — every multi-element operation is a single
      Ctrl+Z step. Full write-up: `.claude/docs/design-tool-architecture.md` §6,
      `.claude/docs/vector-network.md` §65
- [ ] zoom from keyboard shortcuts (Cmd +/−, Shift+0/1/2)

## Stage 11 — Undo / redo

- [x] built as a foundation for the Pen Tool (Stage 6) — snapshots (`nodes`/`rootOrder`/
      `selectedIds`), not a command stack; a custom `historyMiddleware`, not `redux-undo`. Cmd/Ctrl+Z,
      Cmd/Ctrl+Shift+Z
- [x] `beginHistoryGesture`/`endHistoryGesture` bracket a gesture so that N mutations in one
      drag (move/resize/rotate/handles) are a single history step. Full write-up:
      `.claude/docs/design-store-architecture.md` §8

## Stage 12 — Groups and nested frames

The single largest structural gap versus Figma.

- [ ] group/ungroup (Cmd/Ctrl+G / Shift+G)
- [ ] real nesting in `TFrameNode` (`parentId` via drag, not just visual
      overlap)
- [ ] hit-testing/selection with a hierarchy (the deepest nested hit node, double-click "enters"
      deeper)
- [ ] moving/resizing a parent moves/scales its children

## Stage 13 — Guides and snapping (smart guides)

- [ ] rulers scaling with zoom
- [x] **snap to the pixel grid** — `x/y/width/height`/`rotation` rounded on dispatch (creation,
      drag, resize, rotation), not in intermediate computations
- [ ] smart guides (snap to edges/centers of other nodes, with the distance shown)
- [ ] snap to the viewport/parent frame
- [x] **pixel grid** on the canvas, visible from 400% zoom — a procedural fragment shader
      (`fract`/`fwidth`), not per-line geometry. Full write-up:
      `.claude/docs/canvas-rendering-pipeline.md` §3, §10

## Stage 15 — Toolbar and canvas UX details

- [x] **Comment tool** — a click opens `CommentDraftInput`, Ctrl/Cmd+Enter saves a `CommentPin`;
      pins are a DOM overlay (`worldToScreen`), fixed size regardless of zoom. Editing/deleting an
      existing comment deliberately still disabled
- [x] **`VectorEditToolbar`** — a floating panel (Move/Lasso/Paint/Bend/Cut) visible only in Vector
      Edit Mode
- [x] **Lasso tool** (`Q`) — selecting vertices with a freeform outline in Vector Edit Mode
- [x] **Paint tool** (`Shift+B`) — filling individual faces of the vector network
      (`filledFaceKeys`), instead of the whole shape at once. Full write-up:
      `.claude/docs/vector-network.md` §43
- [x] **region detection rewritten to a real half-edge (DCEL)** + full planarization of
      segment crossings — Figma parity for self-intersecting shapes. Ibid. §44
- [x] **dragging a vertex onto a vertex merges them** — within one shape and between
      different vectors. Ibid. §46
- [x] **Bend** as a permanent toolbar tool (not just the Ctrl modifier). Ibid. §47
- [x] **editing several vectors at once** (`vectorEditingNodeIds: string[]`, entered via Enter) —
      hit-testing/hover/marquee/lasso/Paint work on the whole open set. Ibid. §48, e2e:
      `multi-vector-edit.spec.ts`
- [x] **clicking a filled face immediately selects all its vertices** (Move tool). Ibid. §56
- [x] **Shape Builder** (`M`) — merging/subtracting faces by actually deleting boundary
      segments (Alt = subtract), also between different vector nodes. Ibid. §59-62, e2e:
      `vector-shape-builder.spec.ts`
- [x] **Variable Width** (`Shift+W`) — variable stroke thickness, control points as a fraction of
      the chain's arc length; works only on a single, unbranched vector. Ibid. §63,
      e2e: `vector-variable-width.spec.ts`
- [x] **Erase tool** (`Shift+E`) — a round brush, boolean-subtract of a capsule from the vector
      network (fill survives brushing the boundary, a real notch instead of disappearing); Shift = axis-lock,
      `[`/`]` = brush size. v1 limitations: a rotated node is flattened, no real hole
      after erasing a clean fill interior. Ibid. §66, e2e: `vector-erase.spec.ts`,
      `vector-erase-multi.spec.ts`
- [ ] context menu (right-click) on nodes and the empty canvas
- [ ] zoom control in the canvas corner (Zoom to fit/selection/100%)
- [ ] z-order from the UI (Bring to front/Send to back/Forward/Backward)
- [ ] right toolbar group (draw/scale/actions/dev mode)
- [ ] size presets in the Frame tool

---

Stages further in the future (components/instances, auto-layout, effects like blur/shadow,
multiplayer, etc.) — to be added as we get there.
