// utils
import { getMaxCornerRadius } from '../getMaxCornerRadius';

describe('getMaxCornerRadius', () => {
  it('should return half of the smaller dimension when width is smaller', () => {
    // result
    expect(getMaxCornerRadius({ height: 100, width: 50, x: 0, y: 0 })).toBe(25);
  });

  it('should return half of the smaller dimension when height is smaller', () => {
    // result
    expect(getMaxCornerRadius({ height: 40, width: 100, x: 0, y: 0 })).toBe(20);
  });

  it('should return half the side for a square', () => {
    // result
    expect(getMaxCornerRadius({ height: 60, width: 60, x: 0, y: 0 })).toBe(30);
  });
});
