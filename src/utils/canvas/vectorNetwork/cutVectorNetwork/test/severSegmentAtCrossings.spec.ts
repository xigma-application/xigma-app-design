// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { severSegmentAtCrossings } from '../severSegmentAtCrossings';

describe('severSegmentAtCrossings', () => {
  it('should split a straight segment at a single crossing into two pieces that do NOT share a vertex id', () => {
    // mock — a(0,0)->b(100,0), crossed at t=0.5, point (50,0)
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const result = severSegmentAtCrossings(segment, vertices, [{ lineT: 0.75, point: { x: 50, y: 0 }, t: 0.5 }]);

    // result
    expect(Object.keys(result.segments)).toEqual(['s1#0', 's1#1']);
    expect(result.segments['s1#0']).toMatchObject({ startId: 'a' });
    expect(result.segments['s1#1']).toMatchObject({ endId: 'b' });

    const firstPieceEndId = result.segments['s1#0'].endId;
    const secondPieceStartId = result.segments['s1#1'].startId;

    // the whole point of severing (vs. planarization's splitSegmentAtCrossings): the two new vertices are
    // coincident in position but genuinely distinct ids, so the pieces are not connected to each other
    expect(firstPieceEndId).not.toBe(secondPieceStartId);
    expect(result.vertices[firstPieceEndId]).toEqual({ id: firstPieceEndId, x: 50, y: 0 });
    expect(result.vertices[secondPieceStartId]).toEqual({ id: secondPieceStartId, x: 50, y: 0 });
    expect(Object.keys(result.vertices)).toHaveLength(2);
    // both coincident vertices at one crossing share the same lineT — they're the same point on the cut line
    expect(result.vertexLineT[firstPieceEndId]).toBe(0.75);
    expect(result.vertexLineT[secondPieceStartId]).toBe(0.75);
  });

  it('should split a segment at multiple crossings into N+1 pieces, in order', () => {
    // mock — a(0,0)->b(300,0), crossed at t=1/3 and t=2/3
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 300, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const result = severSegmentAtCrossings(segment, vertices, [
      { lineT: 0.1, point: { x: 100, y: 0 }, t: 1 / 3 },
      { lineT: 0.2, point: { x: 200, y: 0 }, t: 2 / 3 },
    ]);

    // result
    expect(Object.keys(result.segments)).toEqual(['s1#0', 's1#1', 's1#2']);
    expect(result.segments['s1#0'].startId).toBe('a');
    expect(result.segments['s1#2'].endId).toBe('b');
    expect(Object.keys(result.vertices)).toHaveLength(4);
    // middle piece connects two of its own, distinct vertex ids (not shared with either neighbor)
    expect(result.segments['s1#1'].startId).not.toBe(result.segments['s1#0'].endId);
    expect(result.segments['s1#1'].endId).not.toBe(result.segments['s1#2'].startId);
  });

  it('should preserve correct tangents on both pieces of a curved segment', () => {
    // mock — a curve with a genuine tangentStart/tangentEnd, crossed once at t=0.5
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = {
      endId: 'b',
      id: 's1',
      startId: 'a',
      tangentEnd: { x: -30, y: -60 },
      tangentStart: { x: 30, y: -60 },
    };

    // before
    const result = severSegmentAtCrossings(segment, vertices, [{ lineT: 0.5, point: { x: 50, y: -45 }, t: 0.5 }]);

    // result — De Casteljau splitting at t=0.5 halves each half's own tangent magnitude (standard,
    // same behavior splitCubicBezier already has elsewhere), so each piece keeps its ORIGINAL side's
    // tangent direction, scaled down, not the unscaled original offset
    expect(result.segments['s1#0'].tangentStart).toEqual({ x: 15, y: -30 });
    expect(result.segments['s1#1'].tangentEnd).toEqual({ x: -15, y: -30 });
  });

  it('should return the segment unchanged (as a single piece) when there are no crossings', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const result = severSegmentAtCrossings(segment, vertices, []);

    // result
    expect(Object.keys(result.segments)).toEqual(['s1#0']);
    expect(result.segments['s1#0']).toEqual({ ...segment, id: 's1#0' });
    expect(result.vertices).toEqual({});
    expect(result.vertexLineT).toEqual({});
  });
});
