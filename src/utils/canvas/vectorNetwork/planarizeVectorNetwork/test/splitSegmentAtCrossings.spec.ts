// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { evaluateCubicBezier } from '../evaluateCubicBezier';
import { splitCubicBezier } from '../../splitCubicBezier';
import { splitSegmentAtCrossings } from '../splitSegmentAtCrossings';

describe('splitSegmentAtCrossings', () => {
  it('should split a straight segment into two pieces at a single crossing, straddling the correct point', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const pieces = splitSegmentAtCrossings(segment, vertices, [{ t: 0.5, vertexId: 'x1' }]);

    // result
    expect(Object.keys(pieces).sort()).toEqual(['s1#0', 's1#1']);
    expect(pieces['s1#0']).toMatchObject({ endId: 'x1', startId: 'a' });
    expect(pieces['s1#1']).toMatchObject({ endId: 'b', startId: 'x1' });
  });

  it('should split a straight segment into three pieces at two crossings, in the correct order', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 300, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // before
    const pieces = splitSegmentAtCrossings(segment, vertices, [
      { t: 0.3, vertexId: 'x1' },
      { t: 0.7, vertexId: 'x2' },
    ]);

    // result
    expect(Object.keys(pieces).sort()).toEqual(['s1#0', 's1#1', 's1#2']);
    expect(pieces['s1#0']).toMatchObject({ endId: 'x1', startId: 'a' });
    expect(pieces['s1#1']).toMatchObject({ endId: 'x2', startId: 'x1' });
    expect(pieces['s1#2']).toMatchObject({ endId: 'b', startId: 'x2' });
  });

  it('should preserve the exact original curve shape across every piece when a curved segment has two crossings — regression check for the tail-tangent-scaling bug (De Casteljau scales a split’s own end-tangent by (1-t) on every cut; reusing the unscaled original tangent past the first cut corrupts every later piece)', () => {
    // mock — an S-curve with two crossings at t=0.3 and t=0.7
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 300, y: 0 } };
    const tangentStart = { x: 100, y: -90 };
    const tangentEnd = { x: -100, y: 90 };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd, tangentStart };

    // before
    const pieces = splitSegmentAtCrossings(segment, vertices, [
      { t: 0.3, vertexId: 'x1' },
      { t: 0.7, vertexId: 'x2' },
    ]);
    const originalAtT1 = evaluateCubicBezier(vertices.a, vertices.b, tangentStart, tangentEnd, 0.3);
    const originalAtT2 = evaluateCubicBezier(vertices.a, vertices.b, tangentStart, tangentEnd, 0.7);
    const originalAtHalf = evaluateCubicBezier(vertices.a, vertices.b, tangentStart, tangentEnd, 0.5);

    // the middle piece's own start/end are the true split points (originalAtT1/originalAtT2); evaluated
    // at its own local t=0.5 (the midpoint between t1 and t2), it must land exactly where the ORIGINAL,
    // unsplit curve sits at global t=0.5
    const middlePiece = pieces['s1#1'];
    const middleFromPiece = evaluateCubicBezier(originalAtT1, originalAtT2, middlePiece.tangentStart, middlePiece.tangentEnd, 0.5);

    // result
    expect(middleFromPiece.x).toBeCloseTo(originalAtHalf.x, 4);
    expect(middleFromPiece.y).toBeCloseTo(originalAtHalf.y, 4);

    // the last piece's own tangentEnd must match splitting the ORIGINAL curve directly at t2=0.7 in one
    // step (De Casteljau's own secondTangentEnd) — NOT the raw, unscaled original tangentEnd, since the
    // tail's tangent is scaled by (1 - t) on every cut, sequential or not
    const directSplitAtT2 = splitCubicBezier(vertices.a, vertices.b, tangentStart, tangentEnd, 0.7);
    const lastPiece = pieces['s1#2'];

    expect(lastPiece.tangentEnd?.x).toBeCloseTo(directSplitAtT2.secondTangentEnd!.x, 4);
    expect(lastPiece.tangentEnd?.y).toBeCloseTo(directSplitAtT2.secondTangentEnd!.y, 4);
    expect(lastPiece.tangentEnd).not.toEqual(tangentEnd);
  });
});
