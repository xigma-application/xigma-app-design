// utils
import { getRoundedPolygonPoints } from '../getRoundedPolygonPoints';

const TRIANGLE = { height: 100, width: 100, x: 0, y: 0 };

describe('getRoundedPolygonPoints', () => {
  it('should emit segmentsPerVertex + 1 points for each vertex', () => {
    // before
    const points = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: 10, sides: 3 }, 4);

    // result
    expect(points).toHaveLength(3 * 5);
  });

  it('should trace a tangent arc around the top vertex, symmetric about it', () => {
    // before — top vertex (50, 0), radius 10; tangent points sit 17.32 world units along each edge
    const points = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: 10, sides: 3 }, 1);

    // result — first vertex's arc: start (toward the previous/left edge) then end (toward the next/right edge)
    expect(points[0].x).toBeCloseTo(41.34, 1);
    expect(points[0].y).toBeCloseTo(15, 1);
    expect(points[1].x).toBeCloseTo(58.66, 1);
    expect(points[1].y).toBeCloseTo(15, 1);
  });

  it('should collapse every arc onto the sharp vertex itself when the radius is 0', () => {
    // before
    const points = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: 0, sides: 3 }, 4);

    // result — the first vertex's arc (5 points) all sit exactly on the top vertex (50, 0)
    points.slice(0, 5).forEach((point) => {
      expect(point.x).toBeCloseTo(50, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });
  });

  it('should clamp an oversized radius to the polygon max instead of overlapping corners', () => {
    // before — max radius for a 100x100 triangle is 25
    const clamped = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: 1000, sides: 3 }, 1);
    const atMax = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: 25, sides: 3 }, 1);

    // result
    expect(clamped[0].x).toBeCloseTo(atMax[0].x, 5);
    expect(clamped[0].y).toBeCloseTo(atMax[0].y, 5);
  });

  it('should clamp a negative radius to 0', () => {
    // before
    const points = getRoundedPolygonPoints({ ...TRIANGLE, cornerRadius: -10, sides: 3 }, 1);

    // result
    expect(points[0].x).toBeCloseTo(50, 5);
    expect(points[0].y).toBeCloseTo(0, 5);
  });
});
