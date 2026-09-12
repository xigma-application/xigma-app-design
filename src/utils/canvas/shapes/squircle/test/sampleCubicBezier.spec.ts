// utils
import { sampleCubicBezier } from '../sampleCubicBezier';

describe('sampleCubicBezier', () => {
  it('should start at p0 and end at p3', () => {
    // before
    const points = sampleCubicBezier({ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }, 2);

    // result
    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[2]).toEqual({ x: 10, y: 0 });
  });

  it('should fall back to the straight-line midpoint when both control points sit on the endpoints', () => {
    // before
    const points = sampleCubicBezier({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 10 }, { x: 10, y: 10 }, 2);

    // result
    expect(points[1].x).toBeCloseTo(5);
    expect(points[1].y).toBeCloseTo(5);
  });
});
