// utils
import { getRoundedVertexPoints } from '../getRoundedVertexPoints';

const TRIANGLE = [
  { x: 50, y: 0 },
  { x: 93.301, y: 75 },
  { x: 6.699, y: 75 },
];

const DART = [
  { x: 0, y: 0 }, // A
  { x: 10, y: 10 }, // B
  { x: 20, y: 0 }, // C
  { x: 10, y: 4 }, // D — reflex
];

describe('getRoundedVertexPoints', () => {
  it('should emit segmentsPerVertex + 1 points for each vertex', () => {
    // before
    const points = getRoundedVertexPoints(TRIANGLE, 10, 4);

    // result
    expect(points).toHaveLength(3 * 5);
  });

  it('should collapse every arc onto the sharp vertex itself when the radius is 0', () => {
    // before
    const points = getRoundedVertexPoints(TRIANGLE, 0, 4);

    // result — the first vertex's arc (5 points) all sit exactly on TRIANGLE[0] (50, 0)
    points.slice(0, 5).forEach((point) => {
      expect(point.x).toBeCloseTo(50, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });
  });

  it('should trace a tangent arc around a convex vertex, symmetric about it', () => {
    // before — top vertex (50, 0), radius 10; tangent points sit 17.32 world units along each edge
    const points = getRoundedVertexPoints(TRIANGLE, 10, 1);

    // result
    expect(points[0].x).toBeCloseTo(41.34, 1);
    expect(points[0].y).toBeCloseTo(15, 1);
    expect(points[1].x).toBeCloseTo(58.66, 1);
    expect(points[1].y).toBeCloseTo(15, 1);
  });

  it('should round a reflex (concave) vertex too, bulging the arc into the notch instead of away from it', () => {
    // before — D (10, 4) is reflex; the tangent-arc construction is purely local to its own two
    const points = getRoundedVertexPoints(DART, 1, 1);
    const dArcStart = points[6]; // D is index 3 of 4 vertices, each contributing 2 points at segments=1
    const dArcEnd = points[7];

    // result — verified independently against the same tangent-length/bisector construction
    expect(dArcStart.x).toBeCloseTo(10.371, 2);
    expect(dArcStart.y).toBeCloseTo(3.851, 2);
    expect(dArcEnd.x).toBeCloseTo(9.629, 2);
    expect(dArcEnd.y).toBeCloseTo(3.851, 2);
  });
});
