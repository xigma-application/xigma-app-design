// utils
import { getAdjacentGapValue } from '../getAdjacentGapValue';

describe('getAdjacentGapValue', () => {
  it('should return the horizontal gap between two rects', () => {
    expect(getAdjacentGapValue({ height: 10, width: 100, x: 0, y: 0 }, { height: 10, width: 100, x: 150, y: 0 }, 'x')).toBe(50);
  });

  it('should return the vertical gap between two rects', () => {
    expect(getAdjacentGapValue({ height: 100, width: 10, x: 0, y: 0 }, { height: 100, width: 10, x: 0, y: 130 }, 'y')).toBe(30);
  });

  it('should return a negative value when the rects overlap', () => {
    expect(getAdjacentGapValue({ height: 10, width: 100, x: 0, y: 0 }, { height: 10, width: 100, x: 80, y: 0 }, 'x')).toBe(-20);
  });
});
