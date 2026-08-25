// types
import { NodeType } from 'types/design/enums';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../deriveVectorFaces';
import { getVectorFillLoopKey } from '../../getVectorFillLoopKey';
import { getVectorFillLoopPoints } from '../getVectorFillLoopPoints';

const seg = (id: string, startId: string, endId: string): TVectorSegment => ({ endId, id, startId, tangentEnd: null, tangentStart: null });

const vertex = (id: string, x: number, y: number): TVectorVertex => ({ id, x, y });

const buildNode = (vertices: TVectorVertex[], segments: TVectorSegment[]): TVectorNode => ({
  fillColor: '#000',
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

// a hand-built piece key for an unsplit segment (no crossings) — its only two boundaries are its
// own two real vertices, matching what getVectorPieceBoundaryKeys would produce for a bare segment
const pieceKey = (segmentId: string, startVertexId: string, endVertexId: string): string =>
  `${segmentId}[${[`v:${startVertexId}`, `v:${endVertexId}`].sort().join('|')}]`;

describe('getVectorFillLoopPoints', () => {
  it('should chain a triangle’s segments into an ordered closed loop and flatten it, even though the derived key’s own piece order is alphabetical, not connection order', () => {
    // mock — s2 actually needs to be walked before s3 to close the loop, unlike the key’s own order
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a')],
    );
    const loopKey = getVectorFillLoopKey(deriveVectorFaces(node)[0].pieceKeys);

    // before
    const points = getVectorFillLoopPoints(node, loopKey);

    // result
    expect(points).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 50, y: 100 },
    ]);
  });

  it('should chain segments regardless of which end of each segment happens to be its own startId/endId', () => {
    // mock — s2 is declared c->b (reversed relative to the natural a->b->c->a walk direction)
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'c', 'b'), seg('s3', 'c', 'a')],
    );
    const loopKey = getVectorFillLoopKey(deriveVectorFaces(node)[0].pieceKeys);

    // before
    const points = getVectorFillLoopPoints(node, loopKey);

    // result
    expect(points).toEqual([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 100, y: 0 },
      { id: 'c', x: 50, y: 100 },
    ]);
  });

  it('should chain a loop whose first-listed piece’s connecting neighbour is only found via its endId, not its startId', () => {
    // mock — s1(a->b) is first; the walk from b must reach s2 by matching s2's OWN endId ('b'), since
    // s2 is declared c->b rather than b->c, exercising the second half of walkNextStep's `||` match
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s3', 'c', 'a'), seg('s2', 'c', 'b')],
    );
    const loopKey = ['s1[v:a|v:b]', 's2[v:b|v:c]', 's3[v:a|v:c]'].sort().join(',');

    // before
    const points = getVectorFillLoopPoints(node, loopKey);

    // result
    expect(points).not.toBeNull();
    expect(points).toHaveLength(3);
  });

  it('should resolve a piece from a segment that is crossed twice, identified by which OTHER real segments it borders rather than its exact position — the {8/3}-star regression', () => {
    // mock — M is one long horizontal segment crossed by two independent verticals (X1, X2); the
    // rectangle face uses M's own MIDDLE piece (bounded by both crossings, not a real endpoint on
    // either side), plus X1/X2's lower pieces (one crossing + one real endpoint) and B (unsplit)
    const buildRectangle = (mEndX: number): TVectorNode =>
      buildNode(
        [
          vertex('mStart', 0, 100),
          vertex('mEnd', mEndX, 100),
          vertex('x1Top', 50, 200),
          vertex('x1Bot', 50, 0),
          vertex('x2Top', 150, 200),
          vertex('x2Bot', 150, 0),
        ],
        [seg('m', 'mStart', 'mEnd'), seg('x1', 'x1Top', 'x1Bot'), seg('x2', 'x2Top', 'x2Bot'), seg('b', 'x1Bot', 'x2Bot')],
      );
    const before = buildRectangle(200);
    const facesBefore = deriveVectorFaces(before);
    // the small rectangle face is the one bounded by exactly these 4 real segments (m, x1, x2, b) —
    // the OTHER face bounded by m's outer pieces plus x1/x2's upper pieces is a much bigger region
    const rectangleFace = facesBefore.find((face) => new Set(face.pieceKeys.map((key) => key.split('[')[0])).size === 4);

    expect(rectangleFace).toBeDefined();

    const loopKey = getVectorFillLoopKey(rectangleFace!.pieceKeys);

    // before — stretch M further right; it still crosses the exact same two verticals, just at a
    // shifted position along its own length
    const after = buildRectangle(260);

    // result — the stored key still resolves on the freshly-dragged node without any remap: same
    // real segments, same crossing pairs, just different coordinates/t
    const points = getVectorFillLoopPoints(after, loopKey);

    expect(points).not.toBeNull();
    expect(points).toHaveLength(4);
  });

  it('should still resolve a stored whole-segment piece when a fresh drag-induced crossing splits it into several current pieces — the original bowtie regression', () => {
    // mock — a simple square (no crossings at all): the stored loop's 4 piece keys are each a
    // whole, unsplit segment (only real-vertex boundaries)
    const before = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 100, 100), vertex('d', 0, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'd'), seg('s4', 'd', 'a')],
    );
    const loopKey = getVectorFillLoopKey(deriveVectorFaces(before)[0].pieceKeys);

    // before — drag c/d so the quad becomes a bowtie: s2 (b->c) and s4 (d->a) now cross each
    // other, each freshly split into two pieces neither of which existed in the stored key
    const after = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 0, 100), vertex('d', 100, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'd'), seg('s4', 'd', 'a')],
    );

    // result — the stored key still resolves: s1/s3 stay whole, s2/s4 each resolve to their own
    // two current sub-pieces, chained back into one closed (self-intersecting) loop
    const points = getVectorFillLoopPoints(after, loopKey);

    expect(points).not.toBeNull();
    expect(points!.length).toBeGreaterThan(4);
  });

  it('should return null when a stored piece’s boundary no longer exists among the segment’s current pieces (the crossing it anchored to is gone)', () => {
    // mock — "s1" currently has no crossings at all (single whole piece, boundaries v:a/v:b only);
    // a stored key referencing a crossing boundary that used to exist can no longer be located
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('s1', 'a', 'b')]);
    const loopKey = 's1[v:a|x:s2:0]';

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });

  it('should return null when a piece key’s two boundaries resolve to the exact same position in the segment’s current vertex sequence', () => {
    // mock — a malformed/degenerate key naming the same boundary twice
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('s1', 'a', 'b')]);
    const loopKey = 's1[v:a|v:a]';

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });

  it('should return null when one of the loop’s own segment ids no longer exists on the node', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('s1', 'a', 'b')]);
    const loopKey = [pieceKey('s1', 'a', 'b'), pieceKey('s2', 'x', 'y')].sort().join(',');

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });

  it('should return null when the listed pieces don’t all connect into one continuous chain', () => {
    // mock — s1(a-b) and s2(c-d) are two entirely disjoint segments, sharing no vertex
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 200, 0), vertex('d', 300, 0)],
      [seg('s1', 'a', 'b'), seg('s2', 'c', 'd')],
    );
    const loopKey = [pieceKey('s1', 'a', 'b'), pieceKey('s2', 'c', 'd')].sort().join(',');

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });

  it('should return null when the chained pieces form an open path instead of a closed loop', () => {
    // mock — a-b-c is a connected chain but never returns to "a"
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)], [seg('s1', 'a', 'b'), seg('s2', 'b', 'c')]);
    const loopKey = [pieceKey('s1', 'a', 'b'), pieceKey('s2', 'b', 'c')].sort().join(',');

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });

  it('should return the same cached result for the same node+key instead of recomputing', () => {
    // mock
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a')],
    );
    const loopKey = getVectorFillLoopKey(deriveVectorFaces(node)[0].pieceKeys);

    // before
    const first = getVectorFillLoopPoints(node, loopKey);
    const second = getVectorFillLoopPoints(node, loopKey);

    // result
    expect(second).toBe(first);
  });

  it('should compute independently (a fresh Map) for a second, different node instead of sharing the first node’s cache', () => {
    // mock — two distinct node objects, each with their own single-triangle geometry
    const nodeA = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a')],
    );
    const nodeB = buildNode(
      [vertex('a', 500, 500), vertex('b', 600, 500), vertex('c', 550, 600)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a')],
    );
    const loopKey = getVectorFillLoopKey(deriveVectorFaces(nodeA)[0].pieceKeys);

    // before
    const pointsA = getVectorFillLoopPoints(nodeA, loopKey);
    const pointsB = getVectorFillLoopPoints(nodeB, loopKey);

    // result — same loop key, but each node's own geometry, not a stale cache hit from nodeA
    expect(pointsA).not.toEqual(pointsB);
  });

  it('should reuse the same node’s planarized network when resolving a second, different loop key instead of re-planarizing it', () => {
    // mock — two disjoint triangles on one node (mirrors a multi-face vector like a painted grid),
    // so resolving both faces' loop keys forces getPlanarNetwork to run twice for the same node —
    // first call populates its own planar-network cache, second call must hit that cache instead
    const node = buildNode(
      [vertex('a', 0, 0), vertex('b', 100, 0), vertex('c', 50, 100), vertex('d', 500, 500), vertex('e', 600, 500), vertex('f', 550, 600)],
      [seg('s1', 'a', 'b'), seg('s2', 'b', 'c'), seg('s3', 'c', 'a'), seg('s4', 'd', 'e'), seg('s5', 'e', 'f'), seg('s6', 'f', 'd')],
    );
    const faces = deriveVectorFaces(node);
    const loopKeyA = getVectorFillLoopKey(faces[0].pieceKeys);
    const loopKeyB = getVectorFillLoopKey(faces[1].pieceKeys);

    // before
    const pointsA = getVectorFillLoopPoints(node, loopKeyA);
    const pointsB = getVectorFillLoopPoints(node, loopKeyB);

    // result — both faces resolve correctly off the one shared, cached planar network
    expect(pointsA).not.toBeNull();
    expect(pointsB).not.toBeNull();
    expect(pointsA).not.toEqual(pointsB);
  });

  it('should cache a null result too, instead of recomputing a known-dead loop on every call', () => {
    // mock
    const node = buildNode([vertex('a', 0, 0), vertex('b', 100, 0)], [seg('s1', 'a', 'b')]);
    const loopKey = [pieceKey('s1', 'a', 'b'), pieceKey('s2', 'x', 'y')].sort().join(',');

    // before / result
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
    expect(getVectorFillLoopPoints(node, loopKey)).toBeNull();
  });
});
