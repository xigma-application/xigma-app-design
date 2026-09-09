// utils
import { gridCellKey } from '../gridCellKey';

describe('gridCellKey behaviors', () => {
  it('should join the row and column with a colon', () => {
    // result
    expect(gridCellKey(2, 3)).toBe('2:3');
  });

  it('should give distinct keys for transposed coordinates', () => {
    // result
    expect(gridCellKey(1, 0)).not.toBe(gridCellKey(0, 1));
  });
});
