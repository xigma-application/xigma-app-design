// others
import { ARROWHEAD_LENGTH, ARROWHEAD_WING_ANGLE_DEGREES } from 'constant/canvas';

// utils
import { getLineEndOutlinePoints } from '../getLineEndOutlinePoints';

const WING_REACH_Y = ARROWHEAD_LENGTH * Math.sin((ARROWHEAD_WING_ANGLE_DEGREES * Math.PI) / 180);

describe('getLineEndOutlinePoints', () => {
  it('should close a plain end with a flat cap', () => {
    // result
    expect(getLineEndOutlinePoints(0.5, false)).toEqual([
      { x: 0, y: 0.5 },
      { x: 0, y: -0.5 },
    ]);
  });

  it('should wrap a thin line end in both wings meeting in one point ahead of the tip', () => {
    // before
    const points = getLineEndOutlinePoints(0.5, true);

    // result
    const ys = points.map((point) => point.y);

    expect(points).toHaveLength(7);
    expect(points[3].y).toBe(0);
    expect(points[3].x).toBeGreaterThan(0);
    expect(Math.max(...ys)).toBeGreaterThan(WING_REACH_Y);
    expect(Math.min(...ys)).toBeLessThan(-WING_REACH_Y);
  });

  it('should keep the square end of a line thicker than the wings poking out of the tip', () => {
    // before
    const points = getLineEndOutlinePoints(2, true);

    // result
    expect(points).toHaveLength(10);
    expect(points).toContainEqual({ x: 0, y: 2 });
    expect(points).toContainEqual({ x: 0, y: -2 });
  });

  it('should fall back to a flat cap when the line is so thick that it swallows the wings', () => {
    // result
    expect(getLineEndOutlinePoints(10, true)).toEqual([
      { x: 0, y: 10 },
      { x: 0, y: -10 },
    ]);
  });
});
