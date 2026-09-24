// utils
import { getGridColumnCount } from '../getGridColumnCount';

describe('getGridColumnCount', () => {
  it('should keep the column count of regular rows, whose last row may be shorter', () => {
    // result
    expect(getGridColumnCount([3, 3, 2])).toBe(3);
    expect(getGridColumnCount([2, 2])).toBe(2);
  });

  it('should fall back to a square-ish grid for irregular rows', () => {
    // result
    expect(getGridColumnCount([1, 3])).toBe(2);
    expect(getGridColumnCount([1, 2])).toBe(2);
    expect(getGridColumnCount([2, 3, 4])).toBe(3);
  });
});
