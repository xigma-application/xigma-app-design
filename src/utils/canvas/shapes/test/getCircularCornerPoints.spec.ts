// utils
import { getCircularCornerPoints } from '../getCircularCornerPoints';

describe('getCircularCornerPoints', () => {
  it('should trace a quarter circle around the given center', () => {
    // before
    const points = getCircularCornerPoints(0, 0, 10, 0, 2);

    // result
    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ x: 10, y: 0 });
    expect(points[1].x).toBeCloseTo(7.0710678);
    expect(points[1].y).toBeCloseTo(7.0710678);
    expect(points[2].x).toBeCloseTo(0);
    expect(points[2].y).toBeCloseTo(10);
  });

  it('should collapse to the center itself when the radius is 0', () => {
    // before
    const points = getCircularCornerPoints(5, 5, 0, 0, 1);

    // result
    expect(points).toEqual([
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]);
  });
});
