// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { buildVectorHalfEdgeAdjacency } from '../buildVectorHalfEdgeAdjacency';

describe('buildVectorHalfEdgeAdjacency', () => {
  it('should add two directed half-edges per segment, one for each traversal direction, keyed by fromId', () => {
    // mock
    const segments: TVectorSegment[] = [{ endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null }];
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments, vertices);

    // result
    expect(adjacency.get('a')).toEqual([{ segmentId: 's1', toId: 'b' }]);
    expect(adjacency.get('b')).toEqual([{ segmentId: 's1', toId: 'a' }]);
  });

  it('should accumulate half-edges from multiple segments sharing a vertex rather than overwriting them', () => {
    // mock
    const segments: TVectorSegment[] = [
      { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 's2', startId: 'a', tangentEnd: null, tangentStart: null },
    ];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 0, y: 100 },
    };

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments, vertices);

    // result
    expect(adjacency.get('a')).toEqual([
      { segmentId: 's1', toId: 'b' },
      { segmentId: 's2', toId: 'c' },
    ]);
  });

  it("should sort each vertex's half-edges by their own outgoing angle, regardless of insertion order", () => {
    // mock — added in the order b(90deg), c(0deg), d(180deg); angle-sorted ascending should be c, b, d
    const segments: TVectorSegment[] = [
      { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'c', id: 'ac', startId: 'a', tangentEnd: null, tangentStart: null },
      { endId: 'd', id: 'ad', startId: 'a', tangentEnd: null, tangentStart: null },
    ];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 0, y: 100 },
      c: { id: 'c', x: 100, y: 0 },
      d: { id: 'd', x: -100, y: 0 },
    };

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments, vertices);

    // result
    expect(adjacency.get('a')).toEqual([
      { segmentId: 'ac', toId: 'c' },
      { segmentId: 'ab', toId: 'b' },
      { segmentId: 'ad', toId: 'd' },
    ]);
  });

  it("should use a curved segment's own tangent (an offset relative to its vertex) instead of the straight endpoint direction when sorting", () => {
    // mock — b sits straight right of a (0deg), but ab's tangentStart points almost straight down
    // (close to 90deg) instead, which should sort ab after ac (0deg) even though b itself is at 0deg
    const segments: TVectorSegment[] = [
      { endId: 'b', id: 'ab', startId: 'a', tangentEnd: null, tangentStart: { x: 1, y: 100 } },
      { endId: 'c', id: 'ac', startId: 'a', tangentEnd: null, tangentStart: null },
    ];
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 50, y: 0 },
    };

    // before
    const adjacency = buildVectorHalfEdgeAdjacency(segments, vertices);

    // result
    expect(adjacency.get('a')).toEqual([
      { segmentId: 'ac', toId: 'c' },
      { segmentId: 'ab', toId: 'b' },
    ]);
  });
});
