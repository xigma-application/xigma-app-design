// utils
import { isPointInRect } from '../isPointInRect';

const rect = { height: 10, width: 10, x: 0, y: 0 };

describe('isPointInRect', () => {
  it('should return true for a point inside the rect', () => {
    // result
    expect(isPointInRect({ x: 5, y: 5 }, rect)).toBe(true);
  });

  it('should return true for a point on the edge of the rect', () => {
    // result
    expect(isPointInRect({ x: 10, y: 10 }, rect)).toBe(true);
  });

  it('should return false for a point outside the rect', () => {
    // result
    expect(isPointInRect({ x: 50, y: 50 }, rect)).toBe(false);
  });
});
