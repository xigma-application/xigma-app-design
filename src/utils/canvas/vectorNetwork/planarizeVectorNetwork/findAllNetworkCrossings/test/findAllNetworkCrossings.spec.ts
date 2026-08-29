// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { findAllNetworkCrossings } from '../findAllNetworkCrossings';

const flattenForCrossingSearchMock = vi.fn();

// Delegates to the real implementation so every existing geometry-correctness test below still gets
// real tessellated points — only the call-count assertions in the caching describe block below care
// about this spy at all.
vi.mock('../../flattenForCrossingSearch', async () => {
  const actual = await vi.importActual<typeof import('../../flattenForCrossingSearch')>('../../flattenForCrossingSearch');

  return {
    flattenForCrossingSearch: (...args: Parameters<typeof actual.flattenForCrossingSearch>): unknown => {
      flattenForCrossingSearchMock(...args);

      return actual.flattenForCrossingSearch(...args);
    },
  };
});

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

  describe('per-segment flatten/bounds caching', () => {
    beforeEach(() => {
      flattenForCrossingSearchMock.mockClear();
    });

    it('should not re-tessellate an untouched segment on a second call, reusing the cached points/bounds', () => {
      // mock
      const vertices: Record<string, TVectorVertex> = { a1: { id: 'a1', x: 0, y: 0 }, a2: { id: 'a2', x: 100, y: 0 } };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };

      // before
      findAllNetworkCrossings([segmentA], vertices);
      findAllNetworkCrossings([segmentA], vertices);

      // result — the same segment object, same vertex objects both times, so tessellation only ran once
      expect(flattenForCrossingSearchMock).toHaveBeenCalledTimes(1);
    });

    it('should re-tessellate when an endpoint vertex moves to a new object, even though the segment object itself is unchanged', () => {
      // mock — same segment reference both times, but "a2" now points at a different position
      const vertices: Record<string, TVectorVertex> = { a1: { id: 'a1', x: 0, y: 0 }, a2: { id: 'a2', x: 100, y: 0 } };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
      const movedVertices: Record<string, TVectorVertex> = { a1: vertices.a1, a2: { id: 'a2', x: 200, y: 0 } };

      // before
      findAllNetworkCrossings([segmentA], vertices);
      findAllNetworkCrossings([segmentA], movedVertices);

      // result
      expect(flattenForCrossingSearchMock).toHaveBeenCalledTimes(2);
    });

    it('should not let a stale cached bounding box hide a crossing created by moving an endpoint into another segment’s path', () => {
      // mock — segment B starts far away (no crossing with A); then B's far endpoint moves to actually
      // cross A — this only proves correct if the cached bbox for B's unmoved endpoint was invalidated
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: -40 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before — no crossing yet
      const before = findAllNetworkCrossings([segmentA, segmentB], vertices);

      expect(before.crossingsBySegmentId.size).toBe(0);

      // action — b2 moves down across segment A's line
      const movedVertices = { ...vertices, b2: { id: 'b2', x: 50, y: 50 } };

      // result — the crossing is now found, not silently hidden by a stale cached bbox for segment B
      const after = findAllNetworkCrossings([segmentA, segmentB], movedVertices);

      expect(after.crossingsBySegmentId.size).toBe(2);
    });
  });

  describe('spatial-grid broad phase', () => {
    it('should return empty results for an empty segment list, without dividing by zero when deriving the cell size', () => {
      // result
      expect(findAllNetworkCrossings([], {})).toEqual({ crossingsBySegmentId: new Map(), virtualVertices: {} });
    });

    it('should find no crossings across a grid of many disjoint squares (same-column, different-row bounding boxes never actually overlap)', () => {
      // mock — a small grid mirroring the stress-test scaffold's shape: same-column squares share an
      // X range but not a Y range, exactly the case a 1D X-only sweep line handles poorly
      const vertices: Record<string, TVectorVertex> = {};
      const segments: TVectorSegment[] = [];

      for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 5; col += 1) {
          const originX = col * 60;
          const originY = row * 60;
          const ids = [`${row}-${col}-a`, `${row}-${col}-b`, `${row}-${col}-c`, `${row}-${col}-d`];

          vertices[ids[0]] = { id: ids[0], x: originX, y: originY };
          vertices[ids[1]] = { id: ids[1], x: originX + 40, y: originY };
          vertices[ids[2]] = { id: ids[2], x: originX + 40, y: originY + 40 };
          vertices[ids[3]] = { id: ids[3], x: originX, y: originY + 40 };

          [0, 1, 2, 3].forEach((index) => {
            const startId = ids[index];
            const endId = ids[(index + 1) % 4];

            segments.push({ endId, id: `${startId}->${endId}`, startId, tangentEnd: null, tangentStart: null });
          });
        }
      }

      // before
      const { crossingsBySegmentId } = findAllNetworkCrossings(segments, vertices);

      // result — 25 fully disjoint squares, real gaps between every one, must find zero crossings
      expect(crossingsBySegmentId.size).toBe(0);
    });

    it('should find a crossing between two segments placed in different grid cells whose bounding boxes still genuinely overlap', () => {
      // mock — a long diagonal-ish pair of segments whose bounding boxes span multiple spatial-hash
      // cells (small segments elsewhere keep the derived cell size small), so this only passes if a box
      // spanning several cells is correctly matched against a box in any one of them, exactly once
      const vertices: Record<string, TVectorVertex> = {
        // a long segment spanning many cells, crossed by a short one near its far end
        long1: { id: 'long1', x: 0, y: 500 },
        long2: { id: 'long2', x: 1000, y: 500 },
        // many small, tightly-packed segments elsewhere in the network — keeps the derived cell size small
        s1: { id: 's1', x: 0, y: 0 },
        s2: { id: 's2', x: 1, y: 1 },
        s3: { id: 's3', x: 100, y: 100 },
        s4: { id: 's4', x: 101, y: 101 },
        short1: { id: 'short1', x: 950, y: 480 },
        short2: { id: 'short2', x: 950, y: 520 },
      };
      const segments: TVectorSegment[] = [
        { endId: 's2', id: 'small1', startId: 's1', tangentEnd: null, tangentStart: null },
        { endId: 's4', id: 'small2', startId: 's3', tangentEnd: null, tangentStart: null },
        { endId: 'long2', id: 'long', startId: 'long1', tangentEnd: null, tangentStart: null },
        { endId: 'short2', id: 'short', startId: 'short1', tangentEnd: null, tangentStart: null },
      ];

      // before
      const { crossingsBySegmentId } = findAllNetworkCrossings(segments, vertices);

      // result
      expect(crossingsBySegmentId.get('long')).toHaveLength(1);
      expect(crossingsBySegmentId.get('short')).toHaveLength(1);
      expect(crossingsBySegmentId.get('long')![0].vertexId).toBe(crossingsBySegmentId.get('short')![0].vertexId);
    });

    it('should never report the same crossing pair twice, even when both segments share several spatial-hash cells', () => {
      // mock — two segments that both span several cells and cross once — a naive per-cell pairing
      // without dedup would report this same crossing multiple times (once per shared cell)
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 300, y: 300 },
        b1: { id: 'b1', x: 0, y: 300 },
        b2: { id: 'b2', x: 300, y: 0 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before
      const { crossingsBySegmentId } = findAllNetworkCrossings([segmentA, segmentB], vertices);

      // result — exactly one crossing recorded on each side, not one per shared cell
      expect(crossingsBySegmentId.get('sA')).toHaveLength(1);
      expect(crossingsBySegmentId.get('sB')).toHaveLength(1);
    });
  });
});
