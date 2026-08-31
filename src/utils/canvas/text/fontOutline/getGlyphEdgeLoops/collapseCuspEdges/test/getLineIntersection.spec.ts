// utils
import { getLineIntersection } from '../getLineIntersection';

describe('getLineIntersection', () => {
  it('finds the intersection of two non-parallel lines', () => {
    // a line through (0,0) heading right, and a line through (2,-2) heading up — meet at (2,0)
    const result = getLineIntersection({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: -2 }, { x: 0, y: 1 });

    expect(result).toEqual({ x: 2, y: 0 });
  });

  it('finds the intersection point beyond either segment’s own endpoints (treats them as infinite lines)', () => {
    // both directions point away from where the lines actually cross
    const result = getLineIntersection({ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 1 });

    expect(result).toEqual({ x: 5, y: 0 });
  });

  it('returns null for parallel lines', () => {
    const result = getLineIntersection({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 5 }, { x: 2, y: 2 });

    expect(result).toBeNull();
  });

  it('returns null for nearly-parallel lines within the epsilon', () => {
    const result = getLineIntersection({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 5 }, { x: 1, y: 0.0001 });

    expect(result).toBeNull();
  });
});
