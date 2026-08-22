// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { findAllNetworkCrossings } from '../findAllNetworkCrossings';

describe('findAllNetworkCrossings', () => {
  it('should record a crossing on both involved segments, at a shared, deterministically-keyed virtual vertex', () => {
    // mock — two straight segments crossing at (50,0), sharing no vertex
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 50, y: -50 },
      b2: { id: 'b2', x: 50, y: 50 },
    };
    const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
    const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

    // before
    const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings([segmentA, segmentB], vertices);

    // result
    const crossingsA = crossingsBySegmentId.get('sA');
    const crossingsB = crossingsBySegmentId.get('sB');

    expect(crossingsA).toHaveLength(1);
    expect(crossingsB).toHaveLength(1);
    expect(crossingsA![0].vertexId).toBe(crossingsB![0].vertexId);
    expect(virtualVertices[crossingsA![0].vertexId].x).toBeCloseTo(50, 4);
    expect(virtualVertices[crossingsA![0].vertexId].y).toBeCloseTo(0, 4);
  });

  it('should never record a crossing between two segments that already share a vertex, even if their lines would otherwise cross', () => {
    // mock — two segments sharing vertex "a", whose extended lines cross well past that shared point
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 100 },
      c: { id: 'c', x: 100, y: -100 },
    };
    const segmentA: TVectorSegment = { endId: 'b', id: 'sA', startId: 'a', tangentEnd: null, tangentStart: null };
    const segmentB: TVectorSegment = { endId: 'c', id: 'sB', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const { crossingsBySegmentId } = findAllNetworkCrossings([segmentA, segmentB], vertices);

    // result
    expect(crossingsBySegmentId.size).toBe(0);
  });

  it('should still record a genuine crossing between two segments that share a vertex, when they cross again elsewhere entirely', () => {
    // mock — a curve leaves 'a' heading almost straight up (away from its own endpoint 'q'), loops
    // around, and crosses the straight sibling edge 'a'->'p' partway along — a real, separate crossing
    // far from the shared vertex, not the trivial touch at 'a' itself; regression for the live bug
    // where sharing a vertex made findAllNetworkCrossings skip the pair entirely, silently losing a
    // real crossing (and, downstream, a whole bounded face nothing could ever paint)
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      p: { id: 'p', x: 200, y: 0 },
      q: { id: 'q', x: 150, y: 50 },
    };
    const segmentAP: TVectorSegment = { endId: 'p', id: 'ap', startId: 'a', tangentEnd: null, tangentStart: null };
    const segmentAQ: TVectorSegment = {
      endId: 'q',
      id: 'aq',
      startId: 'a',
      tangentEnd: null,
      tangentStart: { x: -20, y: -200 },
    };

    // before
    const { crossingsBySegmentId } = findAllNetworkCrossings([segmentAP, segmentAQ], vertices);

    // result
    expect(crossingsBySegmentId.get('ap')).toHaveLength(1);
    expect(crossingsBySegmentId.get('aq')).toHaveLength(1);
  });

  it('should return empty results when no two segments in the network cross at all', () => {
    // mock — two parallel, non-touching segments
    const vertices: Record<string, TVectorVertex> = {
      a1: { id: 'a1', x: 0, y: 0 },
      a2: { id: 'a2', x: 100, y: 0 },
      b1: { id: 'b1', x: 0, y: 100 },
      b2: { id: 'b2', x: 100, y: 100 },
    };
    const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
    const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

    // before
    const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings([segmentA, segmentB], vertices);

    // result
    expect(crossingsBySegmentId.size).toBe(0);
    expect(virtualVertices).toEqual({});
  });
});
