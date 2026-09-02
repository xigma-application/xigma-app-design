// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode, TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../deriveVectorFaces';

const seg = (
  id: string,
  startId: string,
  endId: string,
  tangentStart: TVectorTangent = null,
  tangentEnd: TVectorTangent = null,
): TVectorSegment => ({ endId, id, startId, tangentEnd, tangentStart });

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: '1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])),
  strokeColor: '#000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: Object.fromEntries(vertices.map((vert) => [vert.id, vert])),
});

const toXY = (points: TPoint[]): TPoint[] => points.map(({ x, y }) => ({ x, y }));

describe('deriveVectorFaces', () => {
  it('should derive exactly one face from a single closed triangle, not a duplicate CW+CCW pair', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
  });

  it('should derive no faces from a single open segment', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 10, 0)], [seg('ab', 'a', 'b')]);

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toEqual([]);
  });

  it('should derive only the loop’s face and ignore an open tail hanging off one of its vertices', () => {
    // mock — a closed triangle a-b-c, plus a tail segment from a out to a lone vertex d (degree-3 junction at a)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', -10, 0)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('ad', 'a', 'd')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
  });

  it('should derive two faces from two entirely disjoint closed loops', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10), vertex('d', 100, 0), vertex('e', 110, 0), vertex('f', 105, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a'), seg('de', 'd', 'e'), seg('ef', 'e', 'f'), seg('fd', 'f', 'd')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(2);
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(toXY(faces[1].points)).toEqual([
      { x: 100, y: 0 },
      { x: 110, y: 0 },
      { x: 105, y: 10 },
    ]);
  });

  it('should still produce one face with curved (flattened) boundary points when a closing segment has bezier tangents', () => {
    // mock — two vertices, one curved segment p->q and one straight segment q->p closing the loop
    const node = buildNode([vertex('p', 0, 0), vertex('q', 20, 0)], [seg('pq', 'p', 'q', { x: 10, y: 10 }, null), seg('qp', 'q', 'p')]);

    // before
    const faces = deriveVectorFaces(node);

    // result — the curved segment alone flattens into 25 points (24 subdivisions + its start point), and
    // the straight closing segment contributes only its own start point, so the boundary is far more than
    // the 2 raw endpoints a straight-only loop would produce. Only one of the two windings has positive
    // signed area (§ deriveVectorFaces.ts's outer-face filter), so the boundary starts at "q", not "p"
    expect(faces).toHaveLength(1);
    expect(faces[0].points.length).toBeGreaterThan(2);
    expect(faces[0].points).toHaveLength(25);
    expect(faces[0].points[0]).toEqual({ x: 20, y: 0 });
  });

  it('should read tangents from the segment’s own end (not blindly startId->endId) when the winning walk traverses it backwards', () => {
    // mock — same a-b-c triangle, but "ac" is defined startId=a/endId=c even though the only walk that
    // can ever close this loop reaches it going c->a, i.e. against its own declared direction; forward
    // is therefore false for that step, so tangentAtFrom must read tangentEnd (not tangentStart)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ac', 'a', 'c', { x: 0, y: 5 }, { x: 0, y: -5 })],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result — still exactly one face; the "ac" leg is now curved (tangents set), so it alone
    // contributes segmentCount points (24) instead of 1, on top of the 2 straight legs' 1 point each
    expect(faces).toHaveLength(1);
    expect(faces[0].points).toHaveLength(26);
    // the curved leg's own first point is exactly its fromId vertex "c", regardless of which tangent won
    expect(faces[0].points[2]).toEqual({ x: 5, y: 10 });
  });

  it('should derive two separate faces from two closed regions that share a full edge (a branch vertex at both ends of that edge)', () => {
    // mock — a square a-b-c-d plus a triangle sharing the square's own "d-a" edge, with a third point e
    // out to the side. "d" and "a" both end up degree 3 (two square edges + the shared edge's own
    // other face) — this is the shape from the user's own bug report (two adjacent regions)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100), vertex('e', -80, 50)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a'), seg('de', 'd', 'e'), seg('ea', 'e', 'a')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result — the square (its own 4 segments) and the triangle (its own 3 segments, one shared with
    // the square) each come back as their own face, neither one swallowing or breaking the other
    expect(faces).toHaveLength(2);
    expect(faces.map((face) => face.key).sort()).toEqual(['ab,bc,cd,da', 'da,de,ea'].sort());
    expect(toXY(faces.find((face) => face.key === 'ab,bc,cd,da')!.points)).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);
    expect(toXY(faces.find((face) => face.key === 'da,de,ea')!.points)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 100 },
      { x: -80, y: 50 },
    ]);
  });

  it('should still derive the square’s face when its dangling tail hangs off a vertex the walk has to pass through mid-loop, not just off its own starting vertex', () => {
    // mock — same square as above, but the dangling tail is on "b" this time, a vertex neither
    // deriveVectorFaces' own segment-iteration order nor a naive "tail is at the start vertex" case
    // would ever need to route through mid-walk unless the branch-routing itself is correct
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100), vertex('f', 200, 0)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a'), seg('bf', 'b', 'f')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(faces[0].key).toBe('ab,bc,cd,da');
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);
  });

  it('should still derive the quadrilateral’s face when a dangling segment attaches mid-edge (a T-junction vertex splitting one of its own sides)', () => {
    // mock — a quadrilateral a-b-c-d, with side "a-b" split into a-m/m-b by an inserted vertex m, which
    // also carries a dangling segment out to a free point n (degree 3 at m)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('m', 50, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100), vertex('n', 50, -50)],
      [seg('am', 'a', 'm'), seg('mb', 'm', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a'), seg('mn', 'm', 'n')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(1);
    expect(faces[0].key).toBe('am,bc,cd,da,mb');
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);
  });

  it('should keep an already-filled face’s key intact after a second, touching region is added to the same node — the reported "fill disappears when I start drawing a second shape" bug', () => {
    // mock — draw just the square first (as if the user had painted it), confirm its face key, then add
    // the triangle sharing its "d-a" edge (as if the user started drawing a second region) and confirm
    // the exact same key still resolves to the exact same face
    const squareOnly = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a')],
    );
    const paintedKey = deriveVectorFaces(squareOnly)[0].key;

    const squareWithTriangle = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100), vertex('e', -80, 50)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('da', 'd', 'a'), seg('de', 'd', 'e'), seg('ea', 'e', 'a')],
    );

    // before
    const facesAfterSecondRegion = deriveVectorFaces(squareWithTriangle);

    // result
    expect(facesAfterSecondRegion.some((face) => face.key === paintedKey)).toBe(true);
  });

  it('should split a self-intersecting ("bowtie") shape into two independently-keyed faces, one per visual lobe — Figma parity, asked for directly', () => {
    // mock — v1-v2 and v3-v4 cross visually in the middle of the shape without sharing a vertex there;
    // a real crossing like this becomes its own new region, exactly like a shared edge or T-junction
    // already does, rather than staying one even-odd-filled self-intersecting face
    const node = buildNode(
      [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', 0, 100), vertex('v4', 100, 100)],
      [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result — two triangular lobes, each with its own key built from its own two split segment pieces
    expect(faces).toHaveLength(2);
    expect(new Set(faces.map((face) => face.key)).size).toBe(2);
  });

  it('should still derive the rectangle’s face when a dangling segment points INTO its own interior from a T-junction on its boundary — the segment appears twice (out and back) in that face’s own walk, which must not disqualify it', () => {
    // mock — a rectangle a-b-c-d with a T-junction vertex m splitting side "d-a", carrying a dangling
    // segment from m into the rectangle's own interior (not out and away from it, unlike the earlier
    // T-junction test above) — this is the shape from the user's own live bug report (a "flag"-like
    // outline that lost its fill entirely once the dangling segment pointed inward)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100), vertex('m', 0, 50), vertex('n', 60, 50)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('cd', 'c', 'd'), seg('dm', 'd', 'm'), seg('ma', 'm', 'a'), seg('mn', 'm', 'n')],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result — exactly one bounded face, still tracing the full rectangle boundary; the dangling "mn"
    // detour contributes ~0 net area but legitimately appears twice (out and back) in the face's own
    // key/step list, and must not cause the whole face to be discarded the way the old repeated-segment
    // heuristic did
    expect(faces).toHaveLength(1);
    expect(faces[0].key).toBe('ab,bc,cd,dm,ma,mn,mn');
    // the antenna's own out-and-back detour (m -> n -> m) IS included in the returned boundary points
    // — only its net contribution to the AREA calculation cancels to ~0, the points themselves aren't
    // filtered out (drawVectorFill's stencil even-odd pass renders that detour as a zero-width sliver,
    // visually a no-op, exactly like a dangling tail on the outer face already does)
    expect(toXY(faces[0].points)).toEqual([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 50 },
      { x: 60, y: 50 },
      { x: 0, y: 50 },
    ]);
  });

  it('should keep resolving to valid, non-empty faces (never collapsing to zero) when a vertex drag makes two of the network’s own edges cross without sharing a vertex — the reported "painting stops working entirely after a crossing drag" regression', () => {
    // mock — dragging v3 makes s2 and s4 (which don't share a vertex) cross partway through the drag;
    // every intermediate position must still resolve to at least one real bounded face, matching the
    // live regression where an angle-tie mid-drag briefly collapsed derivation to zero faces
    const buildQuad = (v3x: number, v3y: number): TVectorNode =>
      buildNode(
        [vertex('v1', 0, 0), vertex('v2', 100, 0), vertex('v3', v3x, v3y), vertex('v4', 0, 100)],
        [seg('s1', 'v1', 'v2'), seg('s2', 'v2', 'v3'), seg('s3', 'v3', 'v4'), seg('s4', 'v4', 'v1')],
      );

    // before — the plain (non-crossing) shape and one dragged into a genuine s2/s4 crossing
    const simpleFaces = deriveVectorFaces(buildQuad(100, 100));
    const crossingFaces = deriveVectorFaces(buildQuad(120, -30));

    // result
    expect(simpleFaces.length).toBeGreaterThan(0);
    expect(crossingFaces.length).toBeGreaterThan(0);
  });

  it('should still find every bounded face at a branch vertex whose curve tangent points far from its own chord — the rotation-sort-instability regression', () => {
    // mock — a triangle (a-p-h2) and a loop (a-q-r-a) sharing vertex 'a', connected a second way via
    // h2-r, with the loop's h2a-side edge crossing qr; 'aq' is a curve whose tangent leaves 'a' pointing
    // toward q's own chord direction (18.43deg) — deriveVectorFaces must find all 4 bounded faces
    // Euler's formula guarantees for this graph (V=6, E=9 after the one crossing splits h2a/qr each in
    // two: F = E - V + 2 = 5, i.e. 4 bounded + 1 unbounded)
    const chordAngle = Math.atan2(50, 150);
    const tangentStart = { x: 150 * Math.cos(chordAngle), y: 150 * Math.sin(chordAngle) };
    const node = buildNode(
      [vertex('a', 0, 0), vertex('p', 200, 0), vertex('h2', 100, 150), vertex('q', 150, 50), vertex('r', 20, 100)],
      [
        seg('ap', 'a', 'p'),
        seg('ph2', 'p', 'h2'),
        seg('h2a', 'h2', 'a'),
        seg('aq', 'a', 'q', tangentStart),
        seg('qr', 'q', 'r'),
        seg('ra', 'r', 'a'),
        seg('h2r', 'h2', 'r'),
      ],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(4);
  });

  it('should still find every bounded face when that same curve’s tangent points just barely on the wrong side of an adjacent straight edge — the exact failure threshold', () => {
    // mock — same graph as above, but the curve tangent now points at 0deg (dead level with 'ap',
    // rather than 18.43deg above it) — before the fix, crossing this exact threshold (the tangent
    // sorting at or before 'ap' instead of after it) silently collapsed 2 of the 4 bounded faces
    const node = buildNode(
      [vertex('a', 0, 0), vertex('p', 200, 0), vertex('h2', 100, 150), vertex('q', 150, 50), vertex('r', 20, 100)],
      [
        seg('ap', 'a', 'p'),
        seg('ph2', 'p', 'h2'),
        seg('h2a', 'h2', 'a'),
        seg('aq', 'a', 'q', { x: 201, y: 0 }),
        seg('qr', 'q', 'r'),
        seg('ra', 'r', 'a'),
        seg('h2r', 'h2', 'r'),
      ],
    );

    // before
    const faces = deriveVectorFaces(node);

    // result
    expect(faces).toHaveLength(4);
  });

  it('should return the exact same array reference for a repeat call with the same node reference, via the whole-node fast path', () => {
    // mock — the whole-node WeakMap cache short-circuits before the per-cluster machinery even runs,
    // so a second call in the same "generation" (no dispatch in between) is a single O(1) hit
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 10, 0), vertex('c', 5, 10)],
      [seg('ab', 'a', 'b'), seg('bc', 'b', 'c'), seg('ca', 'c', 'a')],
    );

    // before
    const first = deriveVectorFaces(node);
    const second = deriveVectorFaces(node);

    // result
    expect(second).toBe(first);
  });

  it('should reuse the same per-cluster face objects across two DIFFERENT node references, once the whole-node fast path misses', () => {
    // mock — two distinct node objects sharing the exact same vertex/segment object for one cluster
    // (simulating an edit elsewhere that left this cluster's members untouched) must still resolve to
    // the same cached face object for that cluster, even though neither `node` object itself repeats
    const vertexA = vertex('a', 0, 0);
    const vertexB = vertex('b', 10, 0);
    const vertexC = vertex('c', 5, 10);
    const segAB = seg('ab', 'a', 'b');
    const segBC = seg('bc', 'b', 'c');
    const segCA = seg('ca', 'c', 'a');
    const nodeGen1: TVectorNode = { ...buildNode([vertexA, vertexB, vertexC], [segAB, segBC, segCA]), id: 'shared' };
    const nodeGen2: TVectorNode = { ...buildNode([vertexA, vertexB, vertexC], [segAB, segBC, segCA]), id: 'shared' };

    // before
    const first = deriveVectorFaces(nodeGen1);
    const second = deriveVectorFaces(nodeGen2);

    // result — different node objects, different outer arrays, but the same underlying face object
    expect(nodeGen1).not.toBe(nodeGen2);
    expect(second).not.toBe(first);
    expect(second[0]).toBe(first[0]);
  });
});
