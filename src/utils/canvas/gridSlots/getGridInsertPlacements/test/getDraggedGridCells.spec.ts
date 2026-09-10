// utils
import { getDraggedGridCells } from '../getDraggedGridCells';

describe('getDraggedGridCells', () => {
  it('should lay out consecutive cells starting at the insert index', () => {
    // action
    const cells = getDraggedGridCells(0, 3, 2);

    // result
    expect(cells).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 0, row: 1 },
    ]);
  });

  it('should offset the run when the insert index is not at the start of a row', () => {
    // action
    const cells = getDraggedGridCells(1, 2, 2);

    // result
    expect(cells).toEqual([
      { column: 1, row: 0 },
      { column: 0, row: 1 },
    ]);
  });
});
