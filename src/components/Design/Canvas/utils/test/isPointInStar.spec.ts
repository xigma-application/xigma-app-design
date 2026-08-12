// utils
import { isPointInStar } from '../isPointInStar';

const star = { height: 100, points: 5, ratio: 0.382, width: 100, x: 0, y: 0 };

describe('isPointInStar', () => {
  it('should return true for the center point', () => {
    // result
    expect(isPointInStar({ x: 50, y: 50 }, star)).toBe(true);
  });

  it('should return true for a point near an outer tip', () => {
    // result
    expect(isPointInStar({ x: 50, y: 5 }, star)).toBe(true);
  });

  it('should return false for a point in a concave notch between two arms but inside the bounding box', () => {
    // result — this point sits along a valley direction, beyond the inner radius reached there
    expect(isPointInStar({ x: 73.51, y: 17.64 }, star)).toBe(false);
  });

  it('should return false for a point far outside the star', () => {
    // result
    expect(isPointInStar({ x: 200, y: 200 }, star)).toBe(false);
  });
});
