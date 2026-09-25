// utils
import { getDistanceToOutline } from '../getDistanceToOutline';

const points = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
];

describe('getDistanceToOutline', () => {
  it('should measure to the nearest side, closing the loop only for a closed outline', () => {
    // result
    expect(getDistanceToOutline({ x: 5, y: -3 }, { closed: true, points })).toBe(3);
    expect(getDistanceToOutline({ x: 0, y: 10 }, { closed: false, points })).toBe(10);
    expect(getDistanceToOutline({ x: 0, y: 10 }, { closed: true, points })).toBeCloseTo(Math.SQRT2 * 5);
  });
});
