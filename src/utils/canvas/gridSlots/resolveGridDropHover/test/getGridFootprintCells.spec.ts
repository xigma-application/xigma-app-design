// utils
import { getGridFootprintCells } from '../getGridFootprintCells';

describe('getGridFootprintCells', () => {
  it('should return the single anchor cell for a 1x1 span', () => {
    expect(getGridFootprintCells({ column: 2, row: 1 }, 1, 1, 4)).toEqual([{ column: 2, row: 1 }]);
  });

  it('should walk row-major across the whole span', () => {
    expect(getGridFootprintCells({ column: 1, row: 0 }, 2, 2, 4)).toEqual([
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 1, row: 1 },
      { column: 2, row: 1 },
    ]);
  });

  it('should slide the start column left so the span fits the column count', () => {
    expect(getGridFootprintCells({ column: 3, row: 0 }, 3, 1, 4)).toEqual([
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 3, row: 0 },
    ]);
  });

  it('should leave rows unclamped — they can run past the grid', () => {
    expect(getGridFootprintCells({ column: 0, row: 2 }, 1, 3, 4)).toEqual([
      { column: 0, row: 2 },
      { column: 0, row: 3 },
      { column: 0, row: 4 },
    ]);
  });

  it('should clamp the start column to 0 when the span is wider than the grid', () => {
    expect(getGridFootprintCells({ column: 2, row: 0 }, 6, 1, 4)).toEqual([
      { column: 0, row: 0 },
      { column: 1, row: 0 },
      { column: 2, row: 0 },
      { column: 3, row: 0 },
      { column: 4, row: 0 },
      { column: 5, row: 0 },
    ]);
  });
});
