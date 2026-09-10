// utils
import { isGridRowClear } from '../isGridRowClear';

describe('isGridRowClear', () => {
  it('should be clear when nothing occupies the row across the column range', () => {
    expect(isGridRowClear(new Set(), 0, 0, 2)).toBe(true);
  });

  it('should be blocked when any column in range occupies that row', () => {
    const occupied = new Set(['0:1']);

    expect(isGridRowClear(occupied, 0, 0, 2)).toBe(false);
  });

  it('should ignore an occupied cell outside the column range', () => {
    const occupied = new Set(['0:5']);

    expect(isGridRowClear(occupied, 0, 0, 2)).toBe(true);
  });
});
