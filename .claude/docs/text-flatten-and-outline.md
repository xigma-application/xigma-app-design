# Flattening and outlining text — font extraction, vector assembly, and destructive commands

Companion to `vector-network.md` (the general DCEL/face-derivation machinery this reuses) and
`design-tool-architecture.md`. This file is the text-specific layer on top: how a `TTextNode`'s
MSDF-rendered glyphs get turned into real, editable `TVectorNode` geometry for **Flatten** and
**Outline as stroke**, and every non-obvious bug that surfaced building it.

Text renders from a pre-baked MSDF bitmap atlas (`src/assets/fonts/inter/inter-msdf.json` + PNG) —
there is no glyph vector data at runtime by default. Turning text into real vector geometry means
parsing the actual font file (`assets/fonts/inter/source/Inter-Regular.ttf`, the only font bundled)
at runtime via `opentype.js`. `fontFamily` on `TTextNode` stays vestigial; every glyph always comes
from Inter.

## 1. Font outline extraction — `src/utils/canvas/text/fontOutline/`

Two independent placement strategies feed the same edge-loop extraction, because straight text and
text-on-path anchor glyphs completely differently:

- **`loadInterFont.ts`** — fetches + parses the TTF once via opentype.js, caches the `Promise<Font>`.
  Every other file in this folder awaits this.
- **`getStraightTextGlyphPlacements.ts`** — reuses `getWrappedTextLines`/`getGlyphAdvance` (the exact
  MSDF-atlas pen-walk `buildGlyphQuads` uses for rendering) to get each visible character's
  `(penX, baselineY)`. `baselineY = node.y + lineIndex*lineHeight + atlas.common.base*scale`, since
  opentype's `getPath(x, y, ...)` wants the baseline, while the MSDF pen-walk's own `y` is a line's
  top edge — this offset is the one place the two coordinate conventions get reconciled.
- **`getCurvedTextGlyphContours.ts`** — the text-on-path variant. For each visible glyph: fetch its
  **local-space** outline via `font.charToGlyph(char).getPath(0, 0, fontSize)` (no placement baked
  in), then rigidly transform it — rotate around the origin by `sample.angleDegrees`, translate by
  `anchor = textBoxCenter + sample.{x,y}` — using `sampler.sampleAtLength(cumulativeLength)` from
  `getTextPathSampler` (same path sampler `buildCurvedGlyphQuads` uses for the live MSDF preview, so
  the flattened result lines up with what was on screen). `transformEdge` applies this to every
  point **and** every tangent (tangents rotate, but don't get the anchor translation — they're
  relative vectors, same convention as `rotateVectorNodeOrigin`, §5). `pathFlip` adds 180° to the
  angle; `getVisibleCurvedContent`/`cumulativeLength` walk mirrors the on-path advance logic used
  for rendering.
- **`getGlyphEdgeLoops/`** — walks an opentype.js `Path`'s commands (`applyPathCommand.ts` dispatches
  M/L/C/Q/Z to `appendMoveCommand`/`appendLineCommand`/`appendCubicCommand`/`appendQuadraticCommand`/
  `appendCloseCommand`) into one `TLoopEdge[]` per subpath (e.g. "o" → 2 loops: outer + counter).
  `getQuadraticAsCubicTangents.ts` raises each quadratic (TrueType-native) control point to the
  equivalent cubic tangent pair `TVectorSegment.tangentStart/End` expects — TrueType glyphs are
  quadratic, this codebase's vector model is cubic-tangent-only, so every glyph curve is upconverted
  once at the source.
- **`getTextGlyphContours.ts`** — combines placements + edge loops for **straight** text into one
  `TLoopEdge[][][]`: per glyph, per contour. Bakes `flipX`/`flipY` into the edges via `flipTextPoint`
  (mirrors endpoints, negates the matching tangent-offset axis) — `rotation` is deliberately left off
  entirely here; it's applied later, at the whole-node level (§4) or per-letter (§6.2), never baked
  into these raw contours.

### 1.1 The cusp-collapse bug (`collapseCuspEdges/`)

Font hinting sometimes represents a sharp glyph corner (a "cusp", e.g. the point of "(" or ")") as
two flanking curves bridged by a short straight run instead of one clean corner point.
`collapseCuspEdges.ts` finds straight runs (`findStraightRunEnd`/`isStraightEdge`) bridging two
curves, and — when `isDegenerateBridgeRun` judges the run genuinely degenerate (too short to be a
real intentional edge) — replaces the whole run with a single sharpened miter point
(`collapseBridgeRun.ts` → `getMiterPoint.ts`), via a straight-line intersection of the two curves'
own flanking tangent directions.

**Real regression, not caught by unit tests, found via a pasted screenshot**: `getMiterPoint`
originally had no distance limit on the computed intersection point. Near-parallel tangents (which
happen on real cusps) produce a line intersection arbitrarily far away — for "(" and ")" specifically,
this spiked one side of the glyph into a twisted shape. Fixed with a `MITER_LIMIT = 4` check, mirroring
the same constant used elsewhere for real stroke joins (`getPolylineJoinVertices`) — but the *scale*
it's checked against matters: the first attempt compared the miter distance to the flanking edges'
own lengths and was still too permissive (let one of "("'s two spikes through by a hair). The fix that
actually holds compares against the **bridge run's own gap length** instead
(`Math.hypot(nextEdge.start - prevEdge.end)`) — `getMiterPoint.ts`:
```ts
const gapLength = Math.hypot(nextEdge.start.x - prevEdge.end.x, nextEdge.start.y - prevEdge.end.y);
const distance = Math.hypot(point.x - prevEdge.end.x, point.y - prevEdge.end.y);
return distance <= gapLength * MITER_LIMIT ? point : null;
```
`null` means "don't collapse this cusp" — the original blunt bridge stays, safe but slightly less
sharp; better than a spike. Regression tests use exact real tangent data extracted from the Inter
font (`getMiterPoint.spec.ts`).

## 2. From edge loops to vector nodes — `buildVectorNodeFromLoops/`

Three assembly entry points share one derivation core, split apart specifically because glyph
geometry has a constraint plain shape-flattening never had: **two different letters' contours must
never bridge to each other**, even when spatially close (tight kerning, a script font) — a solid "I"
sitting next to a ringed "o" must never fuse into one connected face.

- **`buildVectorNodeFromLoops(points[][], base, fill)`** — original, straight-segment loops (shapes).
- **`buildVectorNodeFromEdgeLoops(edgeLoops[][], base, fill)`** — same assembly, for loops of curved
  `TLoopEdge`s; preserves real glyph curves instead of flattening them to points first. Used per
  **contour** (one call per loop) when building a single glyph's own outline.
- **`assembleVectorNodeFromLoopGeometries/`** (shared core both of the above call into) — bridges
  loops within *one* call into a connected network and derives faces via the DCEL machinery in
  `vector-network.md`.
  - **Two-face hole bug**: given "outer contour + inner hole contour" (e.g. "o"), the generic
    bridge-and-filter logic used to trust that bridging would naturally produce one ring face.
    A real nested-loop test showed **two** faces instead: bridging joins the loops into one cluster,
    but the small inner loop is *still*, on its own, a second valid bounded face (Euler's formula
    guarantees it) — so both the annulus face *and* the plain hole-interior face got derived, and
    filling both silently cancelled the hole back out. Fixed in
    `assembleVectorNodeFromLoopGeometries.ts` by keeping only the derived face whose boundary
    actually crosses a bridge segment.
- **`mergeVectorNodeGeometriesWithHoleDetection(nodes[], base, fill)`** — combines several
  **already-assembled, independently-faced** vector nodes (e.g. one glyph's separate contour
  vectors) into one, running real hole-detection (`getContainingFace`/`isFullyContained`/
  `getHoleParentByKey`) to recognize when one loop is genuinely a hole of another and should join its
  color group. This is what turns "o"'s two independent contour vectors into one properly-ringed
  glyph.
- **`mergeVectorNodeGeometries(nodes[], base, fill)`** — the "no bridging, no hole-detection" merge:
  a flat `Object.assign` of vertices/segments/`filledFaceKeys` across nodes that are each already
  fully self-consistent. This is the one used to combine **independent glyphs** (§3) — deliberately
  dumb, since two different letters' faces must never be tested against each other for containment.

### 2.1 The non-determinism bug (`getVectorFillLoopPoints/chainIntoSteps/`)

Not text-specific, but the bug that made multi-character flatten randomly lose letter faces
(~31% failure rate on real multi-glyph text before the fix) lives one layer below, in the general
DCEL walk-reconstruction `vector-network.md` describes. `chainIntoSteps`'s search from an unordered,
alphabetically-sorted loop key needs to try multiple next-half-edge candidates and **backtrack** on
failure rather than greedily committing to the first twin-ordered candidate — because that ordering
depends on random nanoid piece IDs, and the "right" candidate isn't always first.
`getNextUnitHalfEdge.ts` returns *all* twin-ordered candidates; `searchClosedStepChain.ts` tries each,
backtracking on failure, bounded by `SEARCH_BUDGET = 20000`. Verified via stress test: 0/500 and 0/300
failures after the fix (was 155/500, 43/300 before). `chainIntoSteps.spec.ts` has a hand-computed
regression test for the specific self-touching-vertex case that used to pick the wrong candidate.

## 3. Per-glyph vector builders — the shared middle layer

`getGlyphFillVectors.ts` and `getGlyphStrokeVectors.ts` both return an array **index-aligned with
`glyphContours`** (`(TVectorNode | null)[]`, one slot per glyph, `null` for a glyph with no
resolvable contours e.g. a space) — this alignment contract is what lets a caller zip a glyph's fill
and its stroke band together by index without losing track of which glyph a `null` belongs to (§5).
Neither one merges *across* glyphs — that's left to the caller, which chooses `mergeVectorNodeGeometries`
(§4, keep letters independent) or lets glyphs get further combined depending on the command.

- **`getGlyphFillVectors(glyphContours, fill)`** — per glyph: `buildVectorNodeFromEdgeLoops` per
  contour, then `mergeVectorNodeGeometriesWithHoleDetection` across that glyph's own contours (rings
  "o", leaves "I" as one plain face).
- **`getGlyphStrokeVectors(glyphContours, halfWidth, strokeColor)`** — per glyph: each contour
  independently flattened (`flattenEdgeLoop.ts` — drops the loop's closing point to match
  `getStrokeOutlinePolygons`' closed-loop contract) and offset into a stroke band
  (`getStrokeOutlinePolygons`, `vector-network.md` §on stroke offsetting), then those bands merge via
  plain `mergeVectorNodeGeometries` (not hole-detection — a stroke band around a hole doesn't need to
  register as anyone's "hole", it's just another independent band). This matches real
  `-webkit-text-stroke` behavior: an outlined "o" gets a band around its outer silhouette **and** its
  own separate band around the counter, not one ring spanning both.

## 4. Flatten — one fused vector (`getTextFlattenVector.ts`)

```ts
const glyphContours = node.pathId ? await getCurvedTextGlyphContours(atlas, node, pathNode) : await getTextGlyphContours(atlas, node);
const glyphVectors = getGlyphFillVectors(glyphContours, node.fill).filter((v): v is TVectorNode => v !== null);
return mergeVectorNodeGeometries(glyphVectors, { id: nanoid(), name: node.name, parentId: node.parentId, rotation: node.rotation }, node.fill);
```
Matches Figma's real Flatten behavior: the whole text collapses into **one** vector layer, rotation
kept as a plain field (safe here — the fused vector's own bounding box coincides with the original
text's, so baking rotation around "its own center" later, §5, produces the same visual result as the
original text had). `node.pathId && !pathNode` (path unresolvable) returns `null`.

**Text-on-path Flatten also deletes the now-orphaned path node** — matching Figma, which gets rid of
the path vector and just flattens the letters. Wired in `handleFlattenSelection.ts`: after replacing
the text node with its flattened vector, any target whose `node.pathId` was set gets
`dispatch(deleteNode(node.pathId))` in the same history gesture. This reuses the pre-existing
bidirectional cascade (`cascadeDeletePathTextBinding.ts` already deletes a text's bound path when the
text itself is deleted) rather than reimplementing it — `deleteNode` alone was enough.

## 5. Outline as stroke — per-letter, then grouped (`getTextOutlineAsStrokeGlyphVectors.ts`)

**Deliberately does not reuse Flatten's "fuse everything" shape.** Figma keeps every letter its own
object after outlining stroked text — not fused into one shape — so users can still select/recolor
individual letters afterward. `getTextOutlineAsStrokeGlyphVectors` returns `TVectorNode[]`, **one per
glyph**, merging that glyph's own fill (`getGlyphFillVectors`) and stroke band
(`getGlyphStrokeVectors`, only when `node.strokeColor` and a positive `strokeWidth` are actually set)
by index:
```ts
const parts = [fillVectors[index], strokeVectors[index]].filter((v): v is TVectorNode => Boolean(v));
return mergeVectorNodeGeometries(parts, { id: nanoid(), name: node.name, parentId: null, rotation: 0 }, node.fill);
```
No stroke set at all → `parts` is just the fill vector, i.e. this degrades gracefully into "per-letter
flatten" with nothing lost. **This is intentional, not a fallback to design around**: there is still
no properties-panel UI to ever set a real `strokeColor`/`strokeWidth` on a `TTextNode` (RightPanel has
no property sections at all yet), so gating "Outline as stroke" on an actually-configured stroke would
make the menu item permanently dead for text. `NodeContextMenu.tsx`'s `canOutlineStroke` reflects this
explicitly: `node.type === NodeType.text ? true : hasStrokeWidth && hasStrokeColor` — text is always
eligible, same as Flatten; only non-text shapes still gate on a real stroke.

### 5.1 Rotation needs a shared pivot, not a field

A `TVectorNode`'s `rotation` field is baked around **its own bounding box center** at render/drag
time (`bakeVectorNodeRotation.ts`, called from e.g. `captureVectorNodeDragSnapshot.ts`) — this works
for Flatten's one fused vector (its bbox *is* the whole text's bbox) but breaks the moment letters
become independent sibling nodes: each letter's own bbox center differs from its neighbors', so
setting `rotation: node.rotation` on every letter independently would spin each one in place around
its own center instead of rotating the whole word as a rigid unit — letters would fly apart from
their intended relative positions. `getTextOutlineAsStrokeGlyphVectors.ts`'s `bakeSharedRotation`
sidesteps this entirely by baking the rotation into every letter's vertices **up front**, around one
pivot shared by the whole word (the bounding box of all letters combined), leaving `rotation: 0` on
every letter:
```ts
const bounds = letters.map(getVectorNodeBounds);
const pivot = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }; // union of every letter's bounds
return letters.map((letter) => ({ ...letter, rotation: 0, ...rotateVectorNodeOrigin(letter, pivot, degrees) }));
```
Regression test (`getTextOutlineAsStrokeGlyphVectors.spec.ts`, "should rotate every letter rigidly
around one shared pivot") uses two symmetric squares specifically because a *wrong*, per-letter-own-
center rotation would leave both exactly where they started (rotationally symmetric shapes don't
visibly move around their own center) — a shared-pivot rotation moves them to a new, still
mutually-separated location, so the two outcomes can't be confused by accident.

### 5.2 Store wiring — grouping instead of fusing

`handleOutlineStroke/getTextOutlineTargets.ts` builds the per-letter arrays (passing `pathNode` for
text-on-path, same as Flatten); `handleOutlineStroke.ts` decides fuse-vs-group per text node:
```ts
const [first, ...rest] = letters;
dispatch(replaceNode({ id: node.id, node: { ...first, id: node.id, parentId: node.parentId } }));
if (rest.length > 0) {
  const restNodes = rest.map((letter, i) => ({ ...letter, id: restIds[i], parentId: null }));
  dispatch(addNodes({ nodes: restNodes, rootIds: restIds }));
  dispatch(setSelection([node.id, ...restIds]));
  dispatch(groupNodes());
}
if (node.pathId) dispatch(deleteNode(node.pathId));
```
Single-letter text ("I") never wraps in a group — just `replaceNode`, same precedent as everything
else. Multi-letter text reuses the **exact same mechanism a manual multi-select-and-group gesture
uses** (`groupNodes`, `store/design/utils/handleGroupNodes/`, see `group-nodes.md`) rather than
building bespoke grouping logic:
- The first letter reuses the text's own id and is `replaceNode`d into the text's exact old slot —
  this is also what anchors the group's final position: `handleGroupNodes` computes insertion index
  from whichever selected member is already present in the target container, and the first letter,
  still under the text's original id, is the only one that already is.
- The remaining letters are added via `addNodes` (which always pushes into `page.rootOrder` — same
  as duplicate/paste), then `setSelection([node.id, ...restIds])` + `groupNodes()` **steals** them
  out of root into the new group (`stealMembersFromOldParents`, `group-nodes.md` §2) — this is the
  established pattern for "add new nodes, then fold them into the right container," not a workaround.
- Text-on-path deletion cascade is identical to Flatten's (§4): `deleteNode(node.pathId)` in the same
  gesture once the group/replace above lands.

## 6. Vertex-rotation precision — don't round per-point

`rotateVectorNodeOrigin.ts` (used by both `bakeVectorNodeRotation` and `bakeSharedRotation` above)
and `resizeVectorVertices.ts` used to `Math.round` every resulting vertex coordinate independently.
This is the same bug class fixed for plain node **drag** earlier
(`f95296ec "Fix vector vertex translation rounding each point instead of the shared shift"`) —
except rotation and scale have no "shared shift" to round once: by design, every point moves by a
*different* amount (its own distance from the pivot/anchor). Rounding each result independently after
that inherently non-uniform transform reintroduces up to 0.5px of *uncorrelated* error per point,
which for a small glyph curve (control points close together) visibly distorts the shape — melted or
spiked-looking letters after rotating or resizing a flattened letter. Fixed by not rounding at all in
either file, matching how tangent offsets were already left unrounded in `rotateVectorNodeOrigin`
(tests use `toBeCloseTo` rather than exact equality, since e.g. `Math.cos(90deg)` isn't an exact `0`
in floating point). `resizeVectorNode.ts`'s `resizeVectorVertices` call dropped the now-dead `round`
boolean parameter entirely rather than always passing `false`.

## 7. Known limitations

- **No properties-panel UI** for `strokeColor`/`strokeWidth` on any node type, text included (§5) —
  `RightPanel` has no property sections at all yet. Stroke is only ever settable via `updateNode`
  dispatch (tests, fixtures, devtools console) until that panel exists.
- A known, previously-recorded bug (tracked in this session's cross-conversation memory, not in this
  repo): flattened text's letter outlines render jagged/melted when selected/zoomed in some cases;
  unresolved as of that note, not caught by unit tests. Check whether it's still reproducible before
  assuming it shares a root cause with any *new* rendering complaint — several precision/face-
  derivation bugs in this exact area have already been found and fixed since that note was written
  (§2.1, §6).
- Multi-selection **Flatten** across several *different* overlapping layers (true boolean union)
  doesn't exist — only single-node flatten (shape→vector, text→vector) is wired.
- The stroke-outline offset (`getStrokeOutlinePolygons`, used by §3) uses the same offset side
  uniformly on both the outer and inner loop of a closed contour, so a very sharp inward (reflex)
  corner can self-overlap slightly on the inner loop — accepted, not something typical glyph curves
  hit.
- **Performance**: confirmed noticeably slow in practice on real multi-letter text (2026-09-01), not
  yet optimized. The whole pipeline — opentype.js parsing, per-glyph edge-loop extraction, hole
  detection (§2), and the `chainIntoSteps` backtracking search (§2.1) — runs synchronously on the main
  thread on every single Flatten/Outline-as-stroke call, and nothing is cached: the same
  character+fontSize gets its glyph outline re-extracted and re-assembled from scratch every time,
  even across repeated calls in the same session. The two real levers, neither started: (1) cache
  parsed/assembled glyph outlines keyed by character+fontSize instead of recomputing per call, and
  (2) move extraction/assembly off the main thread (Web Worker), since it currently blocks. Tracked
  in ROADMAP.2.0.0.md Stage 2.

## 8. Test coverage map

- Font extraction: `fontOutline/test/*.spec.ts` — one file per builder, plus
  `getGlyphEdgeLoops/collapseCuspEdges/test/` for the miter-limit regression and
  `getTextFlattenVector.determinism.spec.ts` for the backtracking stress test.
- Vector assembly: `buildVectorNodeFromLoops/**/test/`, `getVectorFillLoopPoints/chainIntoSteps/test/`.
- Store wiring: `handleFlattenSelection.spec.ts` (real store dispatch, including the text-on-path
  path-delete case), `handleOutlineStroke/test/*.spec.ts` (shape replace, single-letter replace,
  multi-letter group, text-on-path group + path delete).
- Precision: `rotateVectorNodeOrigin.spec.ts`, `bakeVectorNodeRotation.spec.ts`,
  `resizeVectorVertices.spec.ts`, `getRotatedNodeChanges.spec.ts`.
- End-to-end: `e2e/design/transform/flatten.spec.ts` (all shapes, full-alphabet + Polish-diacritics
  text, text-on-path), `e2e/design/transform/outline-as-stroke.spec.ts` (shapes with a real stroke;
  text single-letter / multi-letter-grouped / text-on-path-grouped, all without ever setting a real
  stroke — see §7).
