// utils
import { getCircleArrowEndPoints } from '../getCircleArrowEndPoints';

describe('getCircleArrowEndPoints', () => {
  it('should put a filled circle centered on the line end, joined to the line edges', () => {
    // before
    const points = getCircleArrowEndPoints(2);
    const first = points[0];
    const last = points[points.length - 1];

    // result
    expect(first.y).toBeCloseTo(2);
    expect(last.y).toBeCloseTo(-2);
    expect(first.x).toBeCloseTo(-Math.sqrt(36 - 4));
    expect(Math.max(...points.map(({ x }) => x))).toBeCloseTo(6);
    expect(points.every(({ x, y }) => Math.abs(Math.hypot(x, y) - 6) < 1e-9)).toBe(true);
  });
});
