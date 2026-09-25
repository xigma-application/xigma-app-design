// utils
import { fitGridTrackCount } from '../fitGridTrackCount';

describe('fitGridTrackCount', () => {
  it('should grow the other track count until the required cells fit', () => {
    // result
    expect(fitGridTrackCount(3, 2, 10)).toBe(4);
  });

  it('should keep a larger other count, and treat a zero fixed count as one', () => {
    // result
    expect(fitGridTrackCount(3, 5, 10)).toBe(5);
    expect(fitGridTrackCount(0, 1, 3)).toBe(3);
  });
});
