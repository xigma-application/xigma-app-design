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
    const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings(null, [segmentA, segmentB], vertices);

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
    const { crossingsBySegmentId } = findAllNetworkCrossings(null, [segmentA, segmentB], vertices);

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
    const { crossingsBySegmentId } = findAllNetworkCrossings(null, [segmentAP, segmentAQ], vertices);

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
    const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings(null, [segmentA, segmentB], vertices);

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
      findAllNetworkCrossings(null, [segmentA], vertices);
      findAllNetworkCrossings(null, [segmentA], vertices);

      // result — the same segment object, same vertex objects both times, so tessellation only ran once
      expect(flattenForCrossingSearchMock).toHaveBeenCalledTimes(1);
    });

    it('should re-tessellate when an endpoint vertex moves to a new object, even though the segment object itself is unchanged', () => {
      // mock — same segment reference both times, but "a2" now points at a different position
      const vertices: Record<string, TVectorVertex> = { a1: { id: 'a1', x: 0, y: 0 }, a2: { id: 'a2', x: 100, y: 0 } };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
      const movedVertices: Record<string, TVectorVertex> = { a1: vertices.a1, a2: { id: 'a2', x: 200, y: 0 } };

      // before
      findAllNetworkCrossings(null, [segmentA], vertices);
      findAllNetworkCrossings(null, [segmentA], movedVertices);

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
      const before = findAllNetworkCrossings(null, [segmentA, segmentB], vertices);

      expect(before.crossingsBySegmentId.size).toBe(0);

      // action — b2 moves down across segment A's line
      const movedVertices = { ...vertices, b2: { id: 'b2', x: 50, y: 50 } };

      // result — the crossing is now found, not silently hidden by a stale cached bbox for segment B
      const after = findAllNetworkCrossings(null, [segmentA, segmentB], movedVertices);

      expect(after.crossingsBySegmentId.size).toBe(2);
    });
  });

  describe('spatial-grid broad phase', () => {
    it('should return empty results for an empty segment list, without dividing by zero when deriving the cell size', () => {
      // result
      expect(findAllNetworkCrossings(null, [], {})).toEqual({ crossingsBySegmentId: new Map(), virtualVertices: {} });
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
      const { crossingsBySegmentId } = findAllNetworkCrossings(null, segments, vertices);

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
      const { crossingsBySegmentId } = findAllNetworkCrossings(null, segments, vertices);

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
      const { crossingsBySegmentId } = findAllNetworkCrossings(null, [segmentA, segmentB], vertices);

      // result — exactly one crossing recorded on each side, not one per shared cell
      expect(crossingsBySegmentId.get('sA')).toHaveLength(1);
      expect(crossingsBySegmentId.get('sB')).toHaveLength(1);
    });
  });

  describe('incremental tracking by node id (nodeId !== null)', () => {
    it('should reuse the exact same result object when called again for the same node id with nothing moved', () => {
      // mock
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'sA', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'sB', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before — same segment/vertex references both times, as a repeat render-loop frame would pass
      const first = findAllNetworkCrossings('node-reuse', [segmentA, segmentB], vertices);
      const second = findAllNetworkCrossings('node-reuse', [segmentA, segmentB], vertices);

      // result
      expect(second).toBe(first);
      expect(first.crossingsBySegmentId.get('sA')).toHaveLength(1);
    });

    it('should remove a stale crossing when the moved segment no longer overlaps its old partner, while an unrelated crossing elsewhere on the same segment survives untouched', () => {
      // mock — A is a long horizontal segment crossed by both B (near x=50) and C (near x=250); only
      // B then moves away, so A keeps its crossing with C but loses the one with B
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 300, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: 50 },
        c1: { id: 'c1', x: 250, y: -50 },
        c2: { id: 'c2', x: 250, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };
      const segmentC: TVectorSegment = { endId: 'c2', id: 'C', startId: 'c1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-remove', [segmentA, segmentB, segmentC], vertices);

      expect(before.crossingsBySegmentId.get('A')).toHaveLength(2);
      expect(before.crossingsBySegmentId.get('B')).toHaveLength(1);
      expect(before.crossingsBySegmentId.get('C')).toHaveLength(1);

      const cCrossingVertexIdBefore = before.crossingsBySegmentId.get('C')![0].vertexId;

      // action — b2 moves so segment B no longer reaches y=0 at all
      const movedVertices = { ...vertices, b2: { id: 'b2', x: 50, y: -40 } };

      // before
      const after = findAllNetworkCrossings('node-remove', [segmentA, segmentB, segmentC], movedVertices);

      // result — B's crossing is gone, A keeps only its (untouched) crossing with C, at the same vertex
      expect(after.crossingsBySegmentId.get('B')).toBeUndefined();
      expect(after.crossingsBySegmentId.get('A')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('A')![0].vertexId).toBe(cCrossingVertexIdBefore);
      expect(after.crossingsBySegmentId.get('C')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('C')![0].vertexId).toBe(cCrossingVertexIdBefore);
    });

    it('should discover a brand-new crossing when a moved segment enters a previously-untouched segment’s path', () => {
      // mock — B starts well clear of A, then moves to actually cross it
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: -40 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-add', [segmentA, segmentB], vertices);

      expect(before.crossingsBySegmentId.size).toBe(0);

      // action — b2 moves down across segment A's line
      const movedVertices = { ...vertices, b2: { id: 'b2', x: 50, y: 50 } };

      // before
      const after = findAllNetworkCrossings('node-add', [segmentA, segmentB], movedVertices);

      // result
      expect(after.crossingsBySegmentId.get('A')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('B')).toHaveLength(1);
    });

    it('should correctly remove a crossing between two segments that BOTH moved in the same call', () => {
      // mock — A and B cross at (50,0); both then move down together, no longer crossing anything
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-both-moved', [segmentA, segmentB], vertices);

      expect(before.crossingsBySegmentId.get('A')).toHaveLength(1);
      expect(before.crossingsBySegmentId.get('B')).toHaveLength(1);

      // action — both segments' endpoints shift down by 100, well clear of each other's old crossing,
      // and no longer crossing at all (parallel-ish shift keeps them apart)
      const movedVertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 100 },
        a2: { id: 'a2', x: 100, y: 100 },
        b1: { id: 'b1', x: 50, y: 200 },
        b2: { id: 'b2', x: 50, y: 300 },
      };

      // before
      const after = findAllNetworkCrossings('node-both-moved', [segmentA, segmentB], movedVertices);

      // result — the stale A-B crossing is fully gone from both sides, nothing left dangling
      expect(after.crossingsBySegmentId.size).toBe(0);
    });

    it('should not double-count a crossing between two segments that BOTH moved and still cross each other', () => {
      // mock — A and B cross at (50,0)
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 50, y: -50 },
        b2: { id: 'b2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };

      // before
      findAllNetworkCrossings('node-both-moved-still-crossing', [segmentA, segmentB], vertices);

      // action — both segments shift, but still cross each other at a new point; the re-scan visits
      // the A-B pair once from A's outer-loop pass and once from B's, so this is the only shape that
      // exercises the seenPairKeys dedup on the second visit
      const movedVertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 10 },
        a2: { id: 'a2', x: 100, y: 10 },
        b1: { id: 'b1', x: 60, y: -50 },
        b2: { id: 'b2', x: 60, y: 60 },
      };

      // before
      const after = findAllNetworkCrossings('node-both-moved-still-crossing', [segmentA, segmentB], movedVertices);

      // result — exactly one crossing on each side, not duplicated by being visited from both moved segments
      expect(after.crossingsBySegmentId.get('A')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('B')).toHaveLength(1);

      const vertexId = after.crossingsBySegmentId.get('A')![0].vertexId;

      expect(after.virtualVertices[vertexId].x).toBeCloseTo(60, 4);
      expect(after.virtualVertices[vertexId].y).toBeCloseTo(10, 4);
    });

    it('should fall back to a full recompute when a segment is added under the same node id, still finding the resulting new crossing', () => {
      // mock — first call has just A and B (not crossing); second call adds C, which crosses A
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 0, y: 100 },
        b2: { id: 'b2', x: 100, y: 100 },
        c1: { id: 'c1', x: 50, y: -50 },
        c2: { id: 'c2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };
      const segmentC: TVectorSegment = { endId: 'c2', id: 'C', startId: 'c1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-topology-add', [segmentA, segmentB], vertices);

      expect(before.crossingsBySegmentId.size).toBe(0);

      // before
      const after = findAllNetworkCrossings('node-topology-add', [segmentA, segmentB, segmentC], vertices);

      // result
      expect(after.crossingsBySegmentId.get('A')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('C')).toHaveLength(1);
    });

    it('should fall back to a full recompute when a segment is removed under the same node id', () => {
      // mock — first call has A, B, C (A crosses C); second call drops C entirely
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 0, y: 100 },
        b2: { id: 'b2', x: 100, y: 100 },
        c1: { id: 'c1', x: 50, y: -50 },
        c2: { id: 'c2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };
      const segmentC: TVectorSegment = { endId: 'c2', id: 'C', startId: 'c1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-topology-remove', [segmentA, segmentB, segmentC], vertices);

      expect(before.crossingsBySegmentId.get('A')).toHaveLength(1);

      // before
      const after = findAllNetworkCrossings('node-topology-remove', [segmentA, segmentB], vertices);

      // result — C (and its crossing with A) is gone, nothing left referencing it
      expect(after.crossingsBySegmentId.size).toBe(0);
    });

    it('should fall back to a full recompute when a segment id is swapped for a different one, even though the total segment count stays the same', () => {
      // mock — first call has A, B, C (A crosses C); second call has the exact same count (3), but C
      // was replaced by a differently-id'd segment D at the same crossing spot — same size, different
      // membership, must not be mistaken for "nothing new, just repositioned"
      const vertices: Record<string, TVectorVertex> = {
        a1: { id: 'a1', x: 0, y: 0 },
        a2: { id: 'a2', x: 100, y: 0 },
        b1: { id: 'b1', x: 0, y: 100 },
        b2: { id: 'b2', x: 100, y: 100 },
        c1: { id: 'c1', x: 50, y: -50 },
        c2: { id: 'c2', x: 50, y: 50 },
      };
      const segmentA: TVectorSegment = { endId: 'a2', id: 'A', startId: 'a1', tangentEnd: null, tangentStart: null };
      const segmentB: TVectorSegment = { endId: 'b2', id: 'B', startId: 'b1', tangentEnd: null, tangentStart: null };
      const segmentC: TVectorSegment = { endId: 'c2', id: 'C', startId: 'c1', tangentEnd: null, tangentStart: null };
      const segmentD: TVectorSegment = { endId: 'c2', id: 'D', startId: 'c1', tangentEnd: null, tangentStart: null };

      // before
      const before = findAllNetworkCrossings('node-topology-swap', [segmentA, segmentB, segmentC], vertices);

      expect(before.crossingsBySegmentId.get('A')).toHaveLength(1);

      // before — same 3-segment count, but C's id is gone and D's is new
      const after = findAllNetworkCrossings('node-topology-swap', [segmentA, segmentB, segmentD], vertices);

      // result — the crossing is correctly re-found under D's id, not silently kept under C's
      expect(after.crossingsBySegmentId.get('D')).toHaveLength(1);
      expect(after.crossingsBySegmentId.get('C')).toBeUndefined();
      expect(after.crossingsBySegmentId.get('A')).toHaveLength(1);
    });

    it('should fall back to a full recompute (not the incremental path) once more segments move at once than the incremental cap allows', () => {
      // mock — a grid of disjoint squares (60 segments, well past the incremental cap), all of which
      // move together — must still produce correct (empty) results, not skip or double-count anything
      const vertices: Record<string, TVectorVertex> = {};
      const segments: TVectorSegment[] = [];

      for (let i = 0; i < 15; i += 1) {
        const originX = i * 60;
        const ids = [`${i}-a`, `${i}-b`, `${i}-c`, `${i}-d`];

        vertices[ids[0]] = { id: ids[0], x: originX, y: 0 };
        vertices[ids[1]] = { id: ids[1], x: originX + 40, y: 0 };
        vertices[ids[2]] = { id: ids[2], x: originX + 40, y: 40 };
        vertices[ids[3]] = { id: ids[3], x: originX, y: 40 };

        [0, 1, 2, 3].forEach((index) => {
          const startId = ids[index];
          const endId = ids[(index + 1) % 4];

          segments.push({ endId, id: `${startId}->${endId}`, startId, tangentEnd: null, tangentStart: null });
        });
      }

      // before — 60 segments established under this node id
      const before = findAllNetworkCrossings('node-cap', segments, vertices);

      expect(before.crossingsBySegmentId.size).toBe(0);

      // action — every vertex shifts down by 500, well clear of everything, still no crossings —
      // but every one of the 60 segments now counts as "moved", past MAX_INCREMENTAL_MOVED_SEGMENTS
      const movedVertices = Object.fromEntries(Object.entries(vertices).map(([id, vertex]) => [id, { ...vertex, y: vertex.y + 500 }]));

      // before
      const after = findAllNetworkCrossings('node-cap', segments, movedVertices);

      // result
      expect(after.crossingsBySegmentId.size).toBe(0);
    });

    it('should track two different node ids independently, with no cross-contamination between them', () => {
      // mock — two unrelated 2-segment networks, tracked under different node ids
      const verticesX: Record<string, TVectorVertex> = {
        x1: { id: 'x1', x: 0, y: 0 },
        x2: { id: 'x2', x: 100, y: 0 },
        y1: { id: 'y1', x: 50, y: -50 },
        y2: { id: 'y2', x: 50, y: 50 },
      };
      const segmentX: TVectorSegment = { endId: 'x2', id: 'X', startId: 'x1', tangentEnd: null, tangentStart: null };
      const segmentY: TVectorSegment = { endId: 'y2', id: 'Y', startId: 'y1', tangentEnd: null, tangentStart: null };

      const verticesZ: Record<string, TVectorVertex> = {
        z1: { id: 'z1', x: 0, y: 0 },
        z2: { id: 'z2', x: 100, y: 100 },
      };
      const segmentZ: TVectorSegment = { endId: 'z2', id: 'Z', startId: 'z1', tangentEnd: null, tangentStart: null };

      // before — establish node "alpha" (a real crossing) and node "beta" (a single, uncrossed segment)
      const alphaFirst = findAllNetworkCrossings('node-alpha', [segmentX, segmentY], verticesX);

      findAllNetworkCrossings('node-beta', [segmentZ], verticesZ);

      // before — node "alpha" queried again, unchanged — must still hit its own cached result, not beta's
      const alphaSecond = findAllNetworkCrossings('node-alpha', [segmentX, segmentY], verticesX);

      // result
      expect(alphaSecond).toBe(alphaFirst);
      expect(alphaSecond.crossingsBySegmentId.get('X')).toHaveLength(1);
    });
  });
});
