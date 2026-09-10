// types
import { TGridTrackLayout } from '../../getGridTrackLayout';

// utils
import { getHoveredGridCell } from '../getHoveredGridCell';

const layout = (overrides: Partial<TGridTrackLayout> = {}): TGridTrackLayout => ({
  columnCount: 2,
  columnGap: 0,
  columnSizes: [100, 100],
  padding: { paddingBottom: 0, paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
  rowCount: 2,
  rowGap: 0,
  rowSizes: [100, 100],
  ...overrides,
});

describe('getHoveredGridCell', () => {
  it('should resolve the column/row under the point from the resolved track sizes', () => {
    expect(getHoveredGridCell({ x: 150, y: 50 }, layout())).toEqual({ column: 1, row: 0 });
  });

  it('should resolve the column when the tracks are not all the same width', () => {
    // columns 40 / 160: x=100 is inside the second column
    expect(getHoveredGridCell({ x: 100, y: 50 }, layout({ columnSizes: [40, 160] }))).toEqual({ column: 1, row: 0 });
  });

  it('should account for the leading padding before the first track', () => {
    const withPadding = layout({ padding: { paddingBottom: 0, paddingLeft: 20, paddingRight: 0, paddingTop: 20 } });

    expect(getHoveredGridCell({ x: 25, y: 25 }, withPadding)).toEqual({ column: 0, row: 0 });
  });

  it('should clamp the column into range when the point is past the last track', () => {
    expect(getHoveredGridCell({ x: 999, y: 50 }, layout())).toEqual({ column: 1, row: 0 });
  });

  it('should clamp the column to the first track when the point is before it', () => {
    expect(getHoveredGridCell({ x: -50, y: 50 }, layout())).toEqual({ column: 0, row: 0 });
  });

  it('should not clamp the row, since the grid can grow additional rows', () => {
    expect(getHoveredGridCell({ x: 50, y: 999 }, layout())).toEqual({ column: 0, row: 9 });
  });

  it('should clamp the row to 0 when the point is above the first track', () => {
    expect(getHoveredGridCell({ x: 50, y: -50 }, layout())).toEqual({ column: 0, row: 0 });
  });
});
