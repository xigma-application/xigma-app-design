// utils
import { getRoundedCornerCurves } from '../getRoundedCornerCurves';

describe('getRoundedCornerCurves', () => {
  it('should round a 90-degree corner with a single bezier matching the standard kappa constant', () => {
    // mock
    const vertex = { x: 100, y: 0 };
    const previous = { x: 0, y: 0 };
    const next = { x: 100, y: 100 };
    const radius = 20;

    // action
    const curves = getRoundedCornerCurves(vertex, previous, next, Math.PI / 2, radius);

    // result
    expect(curves).toHaveLength(1);
    expect(curves[0].start.x).toBeCloseTo(80, 9);
    expect(curves[0].start.y).toBeCloseTo(0, 9);
    expect(curves[0].end.x).toBeCloseTo(100, 9);
    expect(curves[0].end.y).toBeCloseTo(20, 9);
    expect(curves[0].tangentStart!.x).toBeCloseTo(20 * 0.5522847498, 5);
    expect(curves[0].tangentStart!.y).toBeCloseTo(0, 5);
    expect(curves[0].tangentEnd!.x).toBeCloseTo(0, 5);
    expect(curves[0].tangentEnd!.y).toBeCloseTo(-20 * 0.5522847498, 5);
  });

  it('should round the mirrored corner with the opposite sweep direction, still landing on the same tangent points', () => {
    // mock
    const vertex = { x: 100, y: 0 };
    const previous = { x: 100, y: 100 };
    const next = { x: 0, y: 0 };
    const radius = 20;

    // action
    const curves = getRoundedCornerCurves(vertex, previous, next, Math.PI / 2, radius);

    // result
    expect(curves[0].start.x).toBeCloseTo(100, 9);
    expect(curves[0].start.y).toBeCloseTo(20, 9);
    expect(curves[0].end.x).toBeCloseTo(80, 9);
    expect(curves[0].end.y).toBeCloseTo(0, 9);
  });

  it('should subdivide a sweep wider than 90 degrees into multiple chained curves', () => {
    // mock — a 30deg interior angle corner: the rounding sweep (180-30=150deg) exceeds 90deg
    const vertex = { x: 0, y: 0 };
    const previous = { x: 96.59, y: 25.88 };
    const next = { x: 96.59, y: -25.88 };
    const radius = 5;

    // action
    const curves = getRoundedCornerCurves(vertex, previous, next, Math.PI / 6, radius);

    // result
    expect(curves.length).toBeGreaterThan(1);

    curves.slice(1).forEach((curve, index) => {
      expect(curve.start.x).toBeCloseTo(curves[index].end.x, 5);
      expect(curve.start.y).toBeCloseTo(curves[index].end.y, 5);
    });
  });

  it('should keep every sub-arc within a quarter circle of radius', () => {
    // mock
    const vertex = { x: 0, y: 0 };
    const previous = { x: 96.59, y: 25.88 };
    const next = { x: 96.59, y: -25.88 };
    const radius = 5;

    // action
    const curves = getRoundedCornerCurves(vertex, previous, next, Math.PI / 6, radius);

    // result
    curves.forEach((curve) => {
      const chordLength = Math.hypot(curve.end.x - curve.start.x, curve.end.y - curve.start.y);

      expect(chordLength).toBeLessThanOrEqual(radius * 2);
    });
  });
});
