// types
import { TGridTrackLayout } from '../getGridTrackLayout';

// utils
import { getGridDropCell } from '../getGridDropCell';

const layout: TGridTrackLayout = {
  columnCount: 3,
  columnGap: 0,
  columnSize: 40,
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 2,
  rowGap: 0,
  rowSize: 30,
};

describe('getGridDropCell', () => {
  it('should map a point in the first cell to column 0, row 0', () => {
    expect(getGridDropCell(layout, { x: 10, y: 10 })).toEqual({ column: 0, row: 0 });
  });

  it('should map a point to the exact cell it is over', () => {
    expect(getGridDropCell(layout, { x: 95, y: 45 })).toEqual({ column: 2, row: 1 });
  });

  it('should clamp the column to the last one when the point is past the right edge', () => {
    expect(getGridDropCell(layout, { x: 500, y: 10 })).toEqual({ column: 2, row: 0 });
  });

  it('should let the row grow unbounded past the last row', () => {
    expect(getGridDropCell(layout, { x: 10, y: 905 })).toEqual({ column: 0, row: 30 });
  });

  it('should never return a negative cell for a point above or left of the grid', () => {
    expect(getGridDropCell(layout, { x: -50, y: -50 })).toEqual({ column: 0, row: 0 });
  });

  it('should return the first cell when a degenerate track size leaves no stride', () => {
    expect(getGridDropCell({ ...layout, columnSize: 0 }, { x: 10, y: 10 })).toEqual({ column: 0, row: 0 });
  });
});
