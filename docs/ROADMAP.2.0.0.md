# xigma — Roadmap 2.0.0

Continuation of [ROADMAP.1.0.0.md](./ROADMAP.1.0.0.md) — that document ends on the exact,
implemented history of building the app from scratch. This file collects the next, larger stages of
work, each big enough (multi-session) that it no longer fits the "Stage = tiny chunk of work"
convention from 1.0.0.

## Stage 1 — Performance: scaling to large, many-shape vector scenes

Context: a profiling session (2026-08-26/27) on a stress test with thousands of shapes in a single
`TVectorNode` (`scripts/generateStressTestVectorGrid.ts`) landed the cluster cache (fill/stroke/
crossing detection) and a few concrete, pointed bugs (`getRemainingVertices`, three in the
cut tool, the vertex-dot classification cache, three places baking rotation outside the cache) — full
write-up in [[canvas-vector-performance]]. Two big things were deliberately deferred, described there
in §5.6/§5.7 as not yet started:

- [ ] **Incremental/differential topology tracking** — today every edit of a single shape in a
      many-shape node still recomputes the graph structure (`computeClusters`) and crossing search
      (`findAllNetworkCrossings`) over the **whole** node from scratch, even when the edit only
      touches one small fragment — an architectural ceiling that none of the current caches (cluster
      or any other) removes, because a cache guards against recomputing the same thing, not against
      computing a thousand different things once. Goal: track which specific
      clusters/vertices/segments an edit actually touched, and recompute only those. Requires
      diffing the old/new graph (`segments`/`vertices` before/after the edit) and safely detecting
      cases where an edit merges or splits clusters (e.g. moving a shape so it starts touching a
      neighbour it didn't touch before). High regression risk — it touches the core the whole vector
      pipeline stands on, and its history is full of subtle bugs in exactly this spot (bowtie
      regression, lens shape, self-intersection fill loss — see [[vector-network]]).
      **First, narrow slice done (2026-08-28)**: raw/stroke clustering skips the full graph walk for
      edits that don't change segment topology (vertex move, curve handle edit) — provably safe, not
      approximate. Full write-up in [[canvas-vector-performance]] §5.8.
      **Second, independent slice (2026-08-29)**: `getPlanarVectorNetwork.ts` cached by
      `segments`/`vertices`, not by the whole node — edits that don't touch geometry (color, stroke
      width) no longer pay for full crossing detection + clustering. Write-up in
      [[canvas-vector-performance]] §5.9.
      **Third slice (2026-08-30)**: the first slice's skip extended to the planar clustering path
      (fill derivation + the has-crossings stroke case) — closes the gap that made it a no-op on the
      disjoint-shapes stress scene, confirmed live (0 further `computeClusters` calls across 40
      drag frames). Crossing detection itself is still unincremental.
      **Fourth slice (2026-08-30), the actual "droższa" half**: incremental crossing detection for the
      small-moved-set case (a single dragged vertex/curve handle, up to 8 touched segments) — always
      falls back to the original full recompute for topology changes or larger moved sets, never a
      silently slower frame (tuned from two real regressions found live, not assumed). Write-up in
      [[canvas-vector-performance]] §8.
- [ ] **GPU-buffer-level caching** — the renderer today re-uploads every node's geometry to the GPU
      (`bufferData`) every frame, whether or not it actually changed; the whole app shares only 4 GL
      buffers, rebound per-primitive (see [[canvas-rendering-pipeline]] §3/§8). Goal: persistent
      per-node buffers (`WebGLBuffer` created once, re-uploaded only when the geometry actually
      changed) instead of constant re-upload. Requires buffer lifecycle management
      (`gl.createBuffer`/`gl.deleteBuffer` on node create/delete — which nothing in the code does
      today) and restructuring the draw cycle itself (bind → _conditional_ `bufferData` →
      `drawArrays`). Touches the whole rendering pipeline, not just vectors — broader scope than
      topology tracking, but lower risk of logical regressions (closer to "plumbing" than subtle
      geometry).
      **Two narrow slices done (2026-08-28)**: persistent buffers for fill faces
      (`getOrCreateFaceBuffer.ts`) and for fixed-width stroke (`getOrCreateStrokeBuffer.ts`) of
      committed, stable vector nodes. Full write-up, scope, and deliberate exclusions in
      [[canvas-vector-performance]] §5.7's closing note.
      **Third slice (2026-08-29)**: vertex-dot batch buffers in the Vector Edit Mode overlay, bounded
      to 2 entries per centers array with explicit `gl.deleteBuffer` on eviction — an earlier unbounded
      version genuinely leaked JS heap and GPU memory during a zoom/pan session, caught and fixed live
      the same day. Write-up in [[canvas-vector-performance]] §7.

The two items are independent of each other — do one, the other, both, or neither; there is no
ordering dependency between them.

## Stage 2 — Performance: text Flatten / Outline as stroke

Confirmed noticeably slow in practice on real multi-letter text (2026-09-01), right after the
Flatten/Outline-as-stroke-for-text feature itself landed. Not yet started. Full pipeline + rationale
in [[text-flatten-and-outline]] §7 — in short: opentype.js parsing, per-glyph edge-loop extraction,
hole detection, and the `chainIntoSteps` backtracking search all run synchronously on the main thread
with nothing cached across calls.

- [ ] **Cache parsed/assembled glyph outlines** keyed by character+fontSize, instead of
      re-extracting and re-assembling from scratch on every Flatten/Outline-as-stroke call.
- [ ] **Move extraction/assembly off the main thread** (Web Worker) — it currently blocks.

## Stage 3 — Performance: large documents (many shapes)

Goal: handle documents with tens of thousands of shapes as smoothly as Figma does. Today the app
already slows down well before that — clicking, hovering, and rendering all check or draw every
shape on the page, even the ones far outside the visible area, so everything gets slower the more
shapes a document has. Not yet started (2026-09-03).

- [ ] Skip shapes that are off-screen instead of drawing them every frame.
- [ ] Speed up click/hover detection so it stays fast no matter how many shapes are on the page.

## Related

[[canvas-vector-performance]] — full write-up of what's already done (cluster cache, spatial hash
instead of sweep-line, reusing the rotation-bake cache, pointed fixes in the cut tool and vertex
dots) plus a more detailed rationale for why these two items were deferred to a separate stage.

[[text-flatten-and-outline]] — the text Flatten/Outline-as-stroke pipeline Stage 2 targets: font
extraction, per-glyph vector assembly, and the destructive commands built on top of them.
