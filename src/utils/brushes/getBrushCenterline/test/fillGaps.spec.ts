// utils
import { fillGaps } from '../fillGaps';

describe('fillGaps', () => {
  it('should carry the previous value across empty columns within the range', () => {
    // result
    expect(fillGaps([null, 4, null, null, 8, null], 1, 4)).toEqual([4, 4, 4, 8]);
  });

  it('should start from zero when the first column is empty', () => {
    // result
    expect(fillGaps([null, null, 5], 0, 2)).toEqual([0, 0, 5]);
  });
});
