// utils
import { getReadingOrderCounterEnd } from '../getReadingOrderCounterEnd';

const BOUNDS = { height: 20, width: 30, x: 10, y: 40 };

describe('getReadingOrderCounterEnd', () => {
  it('should return the bottom edge (y + height) for a horizontal frame', () => {
    expect(getReadingOrderCounterEnd(true, BOUNDS)).toBe(60);
  });

  it('should return the right edge (x + width) for a vertical frame', () => {
    expect(getReadingOrderCounterEnd(false, BOUNDS)).toBe(40);
  });
});
