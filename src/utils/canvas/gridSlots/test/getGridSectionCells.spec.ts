// utils
import { getGridSectionCells } from '../getGridSectionCells';

describe('getGridSectionCells', () => {
  it('should build one cell per row for each selected column index', () => {
    // action
    const cells = getGridSectionCells('column', [1], 3);

    // result
    expect(cells).toEqual([
      { column: 1, row: 0 },
      { column: 1, row: 1 },
      { column: 1, row: 2 },
    ]);
  });

  it('should build one cell per column for each selected row index', () => {
    // action
    const cells = getGridSectionCells('row', [0], 2);

    // result
    expect(cells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
    ]);
  });

  it('should combine cells across every selected index, in order', () => {
    // action
    const cells = getGridSectionCells('column', [0, 2], 2);

    // result
    expect(cells).toEqual([
      { column: 0, row: 0 },
      { column: 0, row: 1 },
      { column: 2, row: 0 },
      { column: 2, row: 1 },
    ]);
  });

  it('should return an empty array when there are no selected indices', () => {
    // action
    const cells = getGridSectionCells('column', [], 3);

    // result
    expect(cells).toEqual([]);
  });

  it('should return an empty array when the cross axis has no tracks', () => {
    // action
    const cells = getGridSectionCells('column', [0, 1], 0);

    // result
    expect(cells).toEqual([]);
  });
});
