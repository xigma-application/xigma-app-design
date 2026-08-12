// utils
import { getStarPoints } from '../getStarPoints';

describe('getStarPoints', () => {
  it('should return twice the requested number of points as vertices', () => {
    // result
    expect(getStarPoints({ height: 20, width: 10, x: 0, y: 0 }, 6, 0.5)).toHaveLength(12);
  });

  it('should place the first (outer) vertex at the top of the bounding rect, apex up', () => {
    // before
    const points = getStarPoints({ height: 20, width: 10, x: 0, y: 0 }, 3, 0.5);

    // result
    expect(points[0].x).toBeCloseTo(5);
    expect(points[0].y).toBeCloseTo(0);
  });

  it('should scale odd-indexed (inner) vertices by the ratio', () => {
    // before
    const points = getStarPoints({ height: 10, width: 10, x: 0, y: 0 }, 4, 0.5);

    // result
    expect(points[1].x).toBeCloseTo(6.77, 2);
    expect(points[1].y).toBeCloseTo(3.23, 2);
  });

  it('should collapse to a regular 2n-sided polygon when ratio is 1', () => {
    // before
    const center = { x: 5, y: 5 };
    const points = getStarPoints({ height: 10, width: 10, x: 0, y: 0 }, 3, 1);

    // result
    points.forEach((point) => {
      const distance = Math.hypot(point.x - center.x, point.y - center.y);
      expect(distance).toBeCloseTo(5);
    });
  });

  it('should offset points by the rect origin', () => {
    // before
    const points = getStarPoints({ height: 10, width: 10, x: 5, y: 5 }, 4, 0.5);

    // result
    expect(points[0]).toEqual({ x: 10, y: 5 });
  });
});
