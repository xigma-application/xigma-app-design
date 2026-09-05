// utils
import { getReadingOrderCounterStart } from '../getReadingOrderCounterStart';

const BOUNDS = { height: 20, width: 30, x: 10, y: 40 };

describe('getReadingOrderCounterStart', () => {
  it('should return the top edge (y) for a horizontal frame', () => {
    expect(getReadingOrderCounterStart(true, BOUNDS)).toBe(40);
  });

  it('should return the left edge (x) for a vertical frame', () => {
    expect(getReadingOrderCounterStart(false, BOUNDS)).toBe(10);
  });
});
