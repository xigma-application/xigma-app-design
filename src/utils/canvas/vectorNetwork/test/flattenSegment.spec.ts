// utils
import { flattenSegment } from '../flattenSegment';

describe('flattenSegment', () => {
  it('should return exactly the two endpoints when neither tangent is set', () => {
    // before
    const points = flattenSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, null, null, 8);

    // result
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);
  });

  it('should subdivide into segmentCount + 1 points when only the start tangent is set', () => {
    // before
    const points = flattenSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }, null, 4);

    // result
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[4]).toEqual({ x: 10, y: 0 });
  });

  it('should subdivide into segmentCount + 1 points when only the end tangent is set', () => {
    // before
    const points = flattenSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, null, { x: 0, y: 10 }, 4);

    // result
    expect(points).toHaveLength(5);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[4]).toEqual({ x: 10, y: 0 });
  });

  it('should subdivide into segmentCount + 1 points and match the hand-derived midpoint when both tangents are set', () => {
    // before — P0=(0,0) P1=start+tangentStart=(0,10) P2=end+tangentEnd=(10,10) P3=(10,0); at t=0.5 the
    // cubic bezier blend weights are 0.125/0.375/0.375/0.125, giving midpoint (5, 7.5) by hand
    const points = flattenSegment({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 10 }, 2);

    // result
    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[2]).toEqual({ x: 10, y: 0 });
    expect(points[1].x).toBeCloseTo(5);
    expect(points[1].y).toBeCloseTo(7.5);
  });
});
