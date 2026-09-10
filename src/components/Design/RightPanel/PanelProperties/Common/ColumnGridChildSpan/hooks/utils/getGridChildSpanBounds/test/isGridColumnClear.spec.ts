// utils
import { isGridColumnClear } from '../isGridColumnClear';

describe('isGridColumnClear', () => {
  it('should be clear when nothing occupies the column across the row range', () => {
    expect(isGridColumnClear(new Set(), 0, 0, 2)).toBe(true);
  });

  it('should be blocked when any row in range occupies that column', () => {
    const occupied = new Set(['1:0']);

    expect(isGridColumnClear(occupied, 0, 0, 2)).toBe(false);
  });

  it('should ignore an occupied cell outside the row range', () => {
    const occupied = new Set(['5:0']);

    expect(isGridColumnClear(occupied, 0, 0, 2)).toBe(true);
  });
});
