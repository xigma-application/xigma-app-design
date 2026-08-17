// utils
import { getRoundedStarPoints } from '../getRoundedStarPoints';

const STAR = { height: 100, points: 5, ratio: 0.382, width: 100, x: 0, y: 0 };

describe('getRoundedStarPoints', () => {
  it('should emit segmentsPerVertex + 1 points for each of the star vertices (outer + inner)', () => {
    // before
    const points = getRoundedStarPoints({ ...STAR, cornerRadius: 2 }, 4);

    // result — 5 outer + 5 inner = 10 vertices
    expect(points).toHaveLength(10 * 5);
  });

  it('should trace a tangent arc around the top outer vertex, symmetric about it', () => {
    // before — top vertex (50, 0), radius 5; verified independently against the same
    // tangent-length/bisector construction
    const points = getRoundedStarPoints({ ...STAR, cornerRadius: 5 }, 1);

    // result
    expect(points[0].x).toBeCloseTo(45.245, 2);
    expect(points[0].y).toBeCloseTo(14.633, 2);
    expect(points[1].x).toBeCloseTo(54.755, 2);
    expect(points[1].y).toBeCloseTo(14.633, 2);
  });

  it('should collapse every arc onto the sharp vertex itself when the radius is 0', () => {
    // before
    const points = getRoundedStarPoints({ ...STAR, cornerRadius: 0 }, 4);

    // result — the first vertex's arc (5 points) all sit exactly on the top vertex (50, 0)
    points.slice(0, 5).forEach((point) => {
      expect(point.x).toBeCloseTo(50, 5);
      expect(point.y).toBeCloseTo(0, 5);
    });
  });

  it('should clamp an oversized radius to the star max instead of overlapping adjacent vertices', () => {
    // before — max radius for this 100x100/5-point/ratio-0.382 star is ~9.55
    const clamped = getRoundedStarPoints({ ...STAR, cornerRadius: 1000 }, 1);
    const atMax = getRoundedStarPoints({ ...STAR, cornerRadius: 9.550028 }, 1);

    // result
    expect(clamped[0].x).toBeCloseTo(atMax[0].x, 4);
    expect(clamped[0].y).toBeCloseTo(atMax[0].y, 4);
  });

  it('should clamp a negative radius to 0', () => {
    // before
    const points = getRoundedStarPoints({ ...STAR, cornerRadius: -10 }, 1);

    // result
    expect(points[0].x).toBeCloseTo(50, 5);
    expect(points[0].y).toBeCloseTo(0, 5);
  });

  it('should round the inner (concave) vertices too, not just the outer points', () => {
    // before — an inner vertex's arc must differ from its own sharp position once radius is nonzero
    const sharp = getRoundedStarPoints({ ...STAR, cornerRadius: 0 }, 1);
    const rounded = getRoundedStarPoints({ ...STAR, cornerRadius: 3 }, 1);
    const innerVertexArcStart = 2; // vertex index 1 (the first inner vertex) starts at points[2] (segments=1 -> 2 points per vertex)

    // result
    expect(rounded[innerVertexArcStart].x).not.toBeCloseTo(sharp[innerVertexArcStart].x, 3);
  });
});
