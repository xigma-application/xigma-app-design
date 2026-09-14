// utils
import { getRectPerimeterPointAtAngle } from '../getRectPerimeterPointAtAngle';

describe('getRectPerimeterPointAtAngle', () => {
  it('should hit the right edge at its vertical midpoint when the angle points straight right', () => {
    expect(getRectPerimeterPointAtAngle({ height: 50, width: 100, x: 0, y: 0 }, 0)).toEqual({ x: 100, y: 25 });
  });

  it('should hit the bottom edge at its horizontal midpoint when the angle points straight down', () => {
    expect(getRectPerimeterPointAtAngle({ height: 50, width: 100, x: 0, y: 0 }, Math.PI / 2)).toEqual({ x: 50, y: 50 });
  });

  it('should hit the left edge at its vertical midpoint when the angle points straight left', () => {
    const point = getRectPerimeterPointAtAngle({ height: 50, width: 100, x: 0, y: 0 }, Math.PI);

    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(25, 5);
  });

  it('should exit through the shorter axis edge first for a non-square rect at 45deg', () => {
    const point = getRectPerimeterPointAtAngle({ height: 50, width: 100, x: 0, y: 0 }, Math.PI / 4);

    expect(point.x).toBeCloseTo(75, 5);
    expect(point.y).toBeCloseTo(50, 5);
  });

  it('should hit the exact corner for a square rect at 45deg', () => {
    const point = getRectPerimeterPointAtAngle({ height: 100, width: 100, x: 0, y: 0 }, Math.PI / 4);

    expect(point.x).toBeCloseTo(100, 5);
    expect(point.y).toBeCloseTo(100, 5);
  });

  it('should offset by the rect origin, not just its size', () => {
    expect(getRectPerimeterPointAtAngle({ height: 50, width: 100, x: 10, y: 20 }, 0)).toEqual({ x: 110, y: 45 });
  });
});
