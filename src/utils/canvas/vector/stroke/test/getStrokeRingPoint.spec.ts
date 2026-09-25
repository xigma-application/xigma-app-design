// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getStrokeRingPoint } from '../getStrokeRingPoint';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
  2,
);

describe('getStrokeRingPoint', () => {
  it('should place a point along the path, shifted sideways by the ratio of the half width', () => {
    // result
    expect(getStrokeRingPoint(ring, 5, 1)).toEqual({ x: 5, y: 2 });
    expect(getStrokeRingPoint(ring, 5, -0.5)).toEqual({ x: 5, y: -1 });
  });

  it('should carry on straight past the ends of the path', () => {
    // result
    expect(getStrokeRingPoint(ring, 12, 0)).toEqual({ x: 12, y: 0 });
    expect(getStrokeRingPoint(ring, -3, 0)).toEqual({ x: -3, y: 0 });
  });

  it('should not move past the end of a path without width', () => {
    // mock
    const flat = buildOpenPolylineStrokeRing(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
      0,
    );

    // result
    expect(getStrokeRingPoint(flat, 12, 0)).toEqual({ x: 10, y: 0 });
  });
});
