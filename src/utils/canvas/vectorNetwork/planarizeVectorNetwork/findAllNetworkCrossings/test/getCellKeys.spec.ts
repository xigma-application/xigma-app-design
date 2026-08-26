// utils
import { getCellKeys } from '../getCellKeys';

describe('getCellKeys', () => {
  it('should return a single cell key for a box smaller than the cell size', () => {
    const box = { maxX: 5, maxY: 5, minX: 0, minY: 0 };

    expect(getCellKeys(box, 10)).toEqual(['0:0']);
  });

  it('should return every cell key a box spans when it crosses several cells', () => {
    const box = { maxX: 25, maxY: 5, minX: 0, minY: 0 };

    expect(getCellKeys(box, 10)).toEqual(['0:0', '1:0', '2:0']);
  });
});
