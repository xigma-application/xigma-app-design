// types
import { TPoint } from 'types/canvas';

// utils
import { getPointInsideFace } from '../getPointInsideFace';

describe('getPointInsideFace', () => {
  it('should return a point just off an edge’s midpoint, offset toward the polygon’s interior', () => {
    // mock — a simple square
    const square: TPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ];

    // result
    const point = getPointInsideFace(square);

    expect(point.x).toBeGreaterThan(0);
    expect(point.x).toBeLessThan(10);
    expect(point.y).toBeGreaterThan(0);
    expect(point.y).toBeLessThan(10);
  });

  it('should fall back to the centroid when the points form a degenerate (zero-area) polygon with no true interior', () => {
    // mock — three collinear points: every edge-offset candidate lands exactly on the same line, so
    // neither ever tests as "inside" this zero-area shape
    const collinear: TPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ];

    // result
    expect(getPointInsideFace(collinear)).toEqual({ x: 10, y: 0 });
  });
});
