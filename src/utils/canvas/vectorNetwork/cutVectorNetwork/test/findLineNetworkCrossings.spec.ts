// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { findLineNetworkCrossings } from '../findLineNetworkCrossings';

describe('findLineNetworkCrossings', () => {
  it('should find where a straight cut line crosses a straight segment', () => {
    // mock — segment a(0,0)->b(100,0); cut line from (50,-50) to (50,50), crossing at (50,0)
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };

    // before
    const crossings = findLineNetworkCrossings({ x: 50, y: -50 }, { x: 50, y: 50 }, segments, vertices);

    // result
    expect(crossings).toHaveLength(1);
    expect(crossings[0].segmentId).toBe('s1');
    expect(crossings[0].point.x).toBeCloseTo(50, 4);
    expect(crossings[0].point.y).toBeCloseTo(0, 4);
    expect(crossings[0].t).toBeCloseTo(0.5, 2);
    expect(crossings[0].lineT).toBeCloseTo(0.5, 2);
  });

  it('should find where a straight cut line crosses a curved segment, resolving the real curve t', () => {
    // mock — curve a(0,0)->b(100,0) bowed upward via tangentStart; cut line straight down through the bow.
    // Deliberately off-center (x=52, not the curve's exact symmetric midpoint x=50) so the line doesn't
    // land exactly on a flattened sample point, which would spuriously miss the crossing (both adjacent
    // flattened sub-segments would report it at their own excluded t=0/t=1 boundary).
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: -30, y: -60 }, tangentStart: { x: 30, y: -60 } },
    };

    // before
    const crossings = findLineNetworkCrossings({ x: 52, y: -60 }, { x: 52, y: 10 }, segments, vertices);

    // result
    expect(crossings).toHaveLength(1);
    expect(crossings[0].segmentId).toBe('s1');
    expect(crossings[0].point.x).toBeCloseTo(52, 1);
  });

  it('should return an empty array when the line misses every segment', () => {
    // mock — segment far from the cut line
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } };

    // before
    const crossings = findLineNetworkCrossings({ x: 500, y: -50 }, { x: 500, y: 50 }, segments, vertices);

    // result
    expect(crossings).toEqual([]);
  });

  it('should find two crossings when the line crosses the same segment twice', () => {
    // mock — a "V"-shaped curve dipping below and back above a horizontal cut line
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: { x: -60, y: 100 }, tangentStart: { x: 60, y: 100 } },
    };

    // before
    const crossings = findLineNetworkCrossings({ x: -20, y: 20 }, { x: 120, y: 20 }, segments, vertices);

    // result
    expect(crossings).toHaveLength(2);
    expect(crossings.every((crossing) => crossing.segmentId === 's1')).toBe(true);
  });

  it('should search every segment in the network, not just the first', () => {
    // mock — two parallel horizontal segments, cut line crosses both
    const vertices: Record<string, TVectorVertex> = {
      a: { id: 'a', x: 0, y: 0 },
      b: { id: 'b', x: 100, y: 0 },
      c: { id: 'c', x: 0, y: 100 },
      d: { id: 'd', x: 100, y: 100 },
    };
    const segments: Record<string, TVectorSegment> = {
      s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
      s2: { endId: 'd', id: 's2', startId: 'c', tangentEnd: null, tangentStart: null },
    };

    // before
    const crossings = findLineNetworkCrossings({ x: 50, y: -50 }, { x: 50, y: 150 }, segments, vertices);

    // result
    expect(crossings.map((crossing) => crossing.segmentId).sort()).toEqual(['s1', 's2']);
  });
});
