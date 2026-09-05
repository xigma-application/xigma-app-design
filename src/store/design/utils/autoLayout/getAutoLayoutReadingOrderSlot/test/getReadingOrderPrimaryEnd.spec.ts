// utils
import { getReadingOrderPrimaryEnd } from '../getReadingOrderPrimaryEnd';

const BOUNDS = { height: 20, width: 30, x: 10, y: 40 };

describe('getReadingOrderPrimaryEnd', () => {
  it('should return the right edge (x + width) for a horizontal frame', () => {
    expect(getReadingOrderPrimaryEnd(true, BOUNDS)).toBe(40);
  });

  it('should return the bottom edge (y + height) for a vertical frame', () => {
    expect(getReadingOrderPrimaryEnd(false, BOUNDS)).toBe(60);
  });
});
