// utils
import { getLinePoints } from '../getLinePoints';

describe('getLinePoints', () => {
  it('should read an unrotated line from the left to the right edge of its box', () => {
    // result
    expect(getLinePoints({ height: 0, rotation: 0, width: 100, x: 10, y: 20 })).toEqual({ x1: 10, x2: 110, y1: 20, y2: 20 });
  });

  it('should turn the line around the middle of its box', () => {
    // before
    const points = getLinePoints({ height: 0, rotation: 90, width: 100, x: 0, y: 0 });

    // result
    expect(points.x1).toBeCloseTo(50);
    expect(points.y1).toBeCloseTo(-50);
    expect(points.x2).toBeCloseTo(50);
    expect(points.y2).toBeCloseTo(50);
  });

  it('should drop floating point noise from the turned endpoints', () => {
    // result
    expect(getLinePoints({ height: 0, rotation: 45, width: Math.hypot(100, 100), x: 50 - Math.hypot(100, 100) / 2, y: 50 })).toEqual({
      x1: 0,
      x2: 100,
      y1: 0,
      y2: 100,
    });
  });
});
