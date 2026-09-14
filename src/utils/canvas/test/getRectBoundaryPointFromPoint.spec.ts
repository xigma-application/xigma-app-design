// utils
import { getRectBoundaryPointFromPoint } from '../getRectBoundaryPointFromPoint';

describe('getRectBoundaryPointFromPoint', () => {
  it('should hit the right edge when the origin is the center and the angle points right', () => {
    expect(getRectBoundaryPointFromPoint({ x: 50, y: 25 }, 0, { height: 50, width: 100, x: 0, y: 0 })).toEqual({ x: 100, y: 25 });
  });

  it('should match the center-based formula when the origin is exactly the rect center', () => {
    const bounds = { height: 50, width: 100, x: 0, y: 0 };
    const center = { x: 50, y: 25 };
    const angle = Math.PI / 8;
    const point = getRectBoundaryPointFromPoint(center, angle, bounds);

    // shallow enough angle (below atan(halfHeight/halfWidth) = atan(0.5) ≈ 26.6deg) to exit
    // through the right edge rather than top/bottom
    expect(point.x).toBeCloseTo(100, 5);
  });

  it('should exit through whichever wall is closer for an off-center origin', () => {
    // origin near the bottom edge of a square; pointing straight down should hit the bottom wall
    // almost immediately, not the far side
    const point = getRectBoundaryPointFromPoint({ x: 50, y: 90 }, Math.PI / 2, { height: 100, width: 100, x: 0, y: 0 });

    expect(point).toEqual({ x: 50, y: 100 });
  });

  it('should reach the left wall from an off-center origin pointing left', () => {
    const point = getRectBoundaryPointFromPoint({ x: 70, y: 50 }, Math.PI, { height: 100, width: 100, x: 0, y: 0 });

    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(50, 5);
  });

  it('should account for a non-zero rect origin', () => {
    const point = getRectBoundaryPointFromPoint({ x: 60, y: 45 }, 0, { height: 100, width: 200, x: 10, y: 20 });

    expect(point).toEqual({ x: 210, y: 45 });
  });
});
