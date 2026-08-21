// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { evaluateCubicBezier } from '../evaluateCubicBezier';
import { getSubArcPoints } from '../getSubArcPoints';

describe('getSubArcPoints', () => {
  it('should extract the exact [tLow, tHigh] sub-window of a straight segment as its own two endpoints', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null };

    // result
    expect(getSubArcPoints(segment, vertices, 0.25, 0.75, 2)).toEqual([
      { x: 25, y: 0 },
      { x: 75, y: 0 },
    ]);
  });

  it('should start and end a curved segment’s sub-arc exactly at the curve’s own point at tLow/tHigh', () => {
    // mock
    const vertices: Record<string, TVectorVertex> = { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } };
    const segment: TVectorSegment = {
      endId: 'b',
      id: 's1',
      startId: 'a',
      tangentEnd: { x: 0, y: -50 },
      tangentStart: { x: 0, y: 50 },
    };

    // before
    const points = getSubArcPoints(segment, vertices, 0.2, 0.8, 10);
    const expectedStart = evaluateCubicBezier(vertices.a, vertices.b, segment.tangentStart, segment.tangentEnd, 0.2);
    const expectedEnd = evaluateCubicBezier(vertices.a, vertices.b, segment.tangentStart, segment.tangentEnd, 0.8);

    // result
    expect(points.length).toBeGreaterThan(2);
    expect(points[0].x).toBeCloseTo(expectedStart.x, 5);
    expect(points[0].y).toBeCloseTo(expectedStart.y, 5);
    expect(points[points.length - 1].x).toBeCloseTo(expectedEnd.x, 5);
    expect(points[points.length - 1].y).toBeCloseTo(expectedEnd.y, 5);
  });
});
