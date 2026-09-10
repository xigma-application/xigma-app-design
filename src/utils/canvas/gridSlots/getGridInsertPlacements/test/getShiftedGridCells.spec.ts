// utils
import { getShiftedGridCells } from '../getShiftedGridCells';

describe('getShiftedGridCells', () => {
  it('should leave children before the insert index untouched', () => {
    // action
    const shifted = getShiftedGridCells([{ id: 'a', readingIndex: 0 }], 1, 1, 2);

    // result
    expect(shifted).toEqual([]);
  });

  it('should push consecutive children at or after the insert index into the freed run', () => {
    // mock — two children right after the insert point, one dragged node making room
    const existing = [
      { id: 'b', readingIndex: 1 },
      { id: 'c', readingIndex: 2 },
    ];

    // action
    const shifted = getShiftedGridCells(existing, 1, 1, 2);

    // result — both slide one cell further than where the dragged run ends
    expect(shifted).toEqual([
      { cell: { column: 0, row: 1 }, id: 'b' },
      { cell: { column: 1, row: 1 }, id: 'c' },
    ]);
  });

  it('should keep a child in its own later cell instead of pulling it back when a gap leaves it past the freed run', () => {
    // mock — a lone child far past the insert point, with nothing between it and the insert index
    const existing = [{ id: 'c', readingIndex: 4 }];

    // action
    const shifted = getShiftedGridCells(existing, 1, 1, 2);

    // result — "c" stays at its own reading index rather than collapsing next to the insert point
    expect(shifted).toEqual([{ cell: { column: 0, row: 2 }, id: 'c' }]);
  });

  it('should return an empty list when there is nothing to shift', () => {
    // action
    const shifted = getShiftedGridCells([], 0, 1, 2);

    // result
    expect(shifted).toEqual([]);
  });
});
