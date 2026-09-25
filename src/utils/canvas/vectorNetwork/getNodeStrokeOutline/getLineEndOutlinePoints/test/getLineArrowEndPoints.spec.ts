// others
import { LINE_ARROW_WING_ANGLE_DEGREES } from 'constant/canvas';

// utils
import { getLineArrowEndPoints } from '../getLineArrowEndPoints';

const SIN = Math.sin((LINE_ARROW_WING_ANGLE_DEGREES * Math.PI) / 180);

describe('getLineArrowEndPoints', () => {
  it('should wrap the line end in two wings meeting in a point ahead of the tip', () => {
    // before
    const points = getLineArrowEndPoints(0.5);

    // result
    expect(points).toHaveLength(7);
    expect(points[3]).toEqual({ x: 0.5 / SIN, y: 0 });
    expect(points[0].y).toBe(0.5);
    expect(points[6].y).toBe(-0.5);
    expect(points[2].y).toBeCloseTo(6 * SIN + 0.5 * Math.cos((LINE_ARROW_WING_ANGLE_DEGREES * Math.PI) / 180));
  });

  it('should keep the wings symmetric around the line', () => {
    // before
    const points = getLineArrowEndPoints(2);

    // result
    points.slice(0, 3).forEach((point, index) => {
      expect(points[6 - index].x).toBeCloseTo(point.x);
      expect(points[6 - index].y).toBeCloseTo(-point.y);
    });
  });
});
