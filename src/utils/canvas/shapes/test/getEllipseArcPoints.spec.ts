// utils
import { getEllipseArcPoints } from '../getEllipseArcPoints';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getEllipseArcPoints', () => {
  it('should trace the filled majority arc, not the raw cut sweep, at the requested segment count', () => {
    // result — majorArc(0, 90) is {majorStart: 90, majorSweep: 270}; 4 segments over 270° yields 4 points
    const points = getEllipseArcPoints(BOUNDS, 0, 90, 4);

    expect(points).toHaveLength(4);
    expect(points[0]).toEqual({ x: 100, y: 50 });
    expect(points[3].x).toBeCloseTo(50, 10);
    expect(points[3].y).toBeCloseTo(0, 10);
  });

  it('should enforce a minimum of 2 segments (3 points) even for a near-zero sweep', () => {
    // result — a fully cut-away shape (majorSweep 0) would otherwise round down to 0 segments
    const points = getEllipseArcPoints(BOUNDS, 0, 360, 64);

    expect(points).toHaveLength(3);
    expect(points[0]).toEqual(points[1]);
    expect(points[1]).toEqual(points[2]);
  });

  it('should scale the radius by radiusRatio, keeping the center fixed', () => {
    // result — same 4-segment arc as above, at half radius
    const points = getEllipseArcPoints(BOUNDS, 0, 90, 4, 0.5);

    expect(points[0]).toEqual({ x: 75, y: 50 });
    expect(points[3].x).toBeCloseTo(50, 10);
    expect(points[3].y).toBeCloseTo(25, 10);
  });

  it('should scale the segment count proportionally to the sweep fraction of a full circle', () => {
    // result — a 90° sweep gets a quarter of totalSegments; here majorSweep is 270°, three quarters
    const points = getEllipseArcPoints(BOUNDS, 0, 90, 8);

    expect(points).toHaveLength(7); // round(8 * 270/360) = 6 segments -> 7 points
  });
});
