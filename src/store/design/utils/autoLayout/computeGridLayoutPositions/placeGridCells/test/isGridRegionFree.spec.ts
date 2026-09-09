// utils
import { gridCellKey } from '../gridCellKey';
import { isGridRegionFree } from '../isGridRegionFree';

describe('isGridRegionFree behaviors', () => {
  it('should accept an empty region that fits inside the column count', () => {
    // before
    const free = isGridRegionFree(new Set(), 0, 0, 2, 2, 3);

    // result
    expect(free).toBe(true);
  });

  it('should reject a region that overflows the column count', () => {
    // before
    const free = isGridRegionFree(new Set(), 0, 2, 2, 1, 3);

    // result
    expect(free).toBe(false);
  });

  it('should reject a region that overlaps an occupied cell', () => {
    // mock
    const occupied = new Set([gridCellKey(1, 1)]);

    // before
    const free = isGridRegionFree(occupied, 0, 0, 2, 2, 3);

    // result
    expect(free).toBe(false);
  });
});
