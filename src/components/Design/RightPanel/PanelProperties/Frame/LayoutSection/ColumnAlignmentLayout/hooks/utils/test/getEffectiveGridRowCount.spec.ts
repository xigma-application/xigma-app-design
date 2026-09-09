// utils
import { getEffectiveGridRowCount } from '../getEffectiveGridRowCount';

describe('getEffectiveGridRowCount', () => {
  it('should ceil the child count over the column count', () => {
    expect(getEffectiveGridRowCount(5, 2)).toBe(3);
    expect(getEffectiveGridRowCount(4, 2)).toBe(2);
  });

  it('should never return less than one row', () => {
    expect(getEffectiveGridRowCount(0, 3)).toBe(1);
  });

  it('should treat a zero or negative column count as a single column', () => {
    expect(getEffectiveGridRowCount(4, 0)).toBe(4);
  });
});
