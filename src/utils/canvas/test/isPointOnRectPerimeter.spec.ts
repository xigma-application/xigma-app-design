// utils
import { isPointOnRectPerimeter } from '../isPointOnRectPerimeter';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

describe('isPointOnRectPerimeter', () => {
  it('should return true for a point exactly on the left edge', () => {
    expect(isPointOnRectPerimeter({ x: 0, y: 50 }, bounds, 0.5)).toBe(true);
  });

  it('should return true for a point exactly on the top edge', () => {
    expect(isPointOnRectPerimeter({ x: 50, y: 0 }, bounds, 0.5)).toBe(true);
  });

  it('should return true for a point within tolerance of an edge', () => {
    expect(isPointOnRectPerimeter({ x: 0.4, y: 50 }, bounds, 0.5)).toBe(true);
  });

  it('should return false for a point in the interior, far from any edge', () => {
    expect(isPointOnRectPerimeter({ x: 50, y: 50 }, bounds, 0.5)).toBe(false);
  });

  it('should return false for a point outside the rect entirely, even near the extended edge line', () => {
    // x=0 matches the left edge's x-coordinate, but y=200 is well past the bottom — not on the segment
    expect(isPointOnRectPerimeter({ x: 0, y: 200 }, bounds, 0.5)).toBe(false);
  });

  it('should return true for a corner', () => {
    expect(isPointOnRectPerimeter({ x: 100, y: 100 }, bounds, 0.5)).toBe(true);
  });
});
