// utils
import { roundPolygonCorners } from '../roundPolygonCorners';

const square = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

describe('roundPolygonCorners', () => {
  it('should replace the chosen corners with rounded arcs of the given radius', () => {
    // before
    const points = roundPolygonCorners(square, [0, 1, 2, 3], 10, 8);

    // result
    expect(points).toHaveLength(36);
    expect(points).not.toContainEqual({ x: 0, y: 0 });
    expect(points[0].x).toBeCloseTo(10);
    expect(points[0].y).toBe(0);
    expect(points.some((point) => Math.abs(Math.hypot(point.x - 90, point.y - 10) - 10) < 0.1 && point.x > 95)).toBe(true);
  });

  it('should keep the corners that are not chosen sharp', () => {
    // before
    const points = roundPolygonCorners(square, [0, 2], 10, 8);

    // result
    expect(points).toContainEqual({ x: 100, y: 0 });
    expect(points).not.toContainEqual({ x: 0, y: 0 });
  });

  it('should limit the rounding to half of each edge next to a corner', () => {
    // before
    const points = roundPolygonCorners(square, [0, 1, 2, 3], 1000, 8);

    // result
    expect(Math.min(...points.map((point) => point.x))).toBeCloseTo(0);
    expect(points).toContainEqual({ x: 50, y: 0 });
  });

  it('should leave a straight run through a chosen point untouched', () => {
    // before
    const points = roundPolygonCorners(
      [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 50 },
      ],
      [0, 1, 2, 3],
      10,
      8,
    );

    // result
    expect(points).toContainEqual({ x: 50, y: 0 });
  });
});
