// utils
import { getGridCellRect } from '../getGridCellRect';

const COLUMN_OFFSETS = [0, 110, 220];
const ROW_OFFSETS = [0, 60, 120];
const COLUMN_SIZES = [100, 100, 100];
const ROW_SIZES = [50, 50, 50];

describe('getGridCellRect', () => {
  it('should map a single cell to its own track rect', () => {
    const rect = getGridCellRect(
      { columnSpan: 1, columnStart: 1, id: 'a', rowSpan: 1, rowStart: 2 },
      COLUMN_OFFSETS,
      ROW_OFFSETS,
      COLUMN_SIZES,
      ROW_SIZES,
    );

    expect(rect).toEqual({ height: 50, width: 100, x: 110, y: 120 });
  });

  it('should span multiple columns, absorbing the interior gap baked into the offsets', () => {
    const rect = getGridCellRect(
      { columnSpan: 2, columnStart: 0, id: 'a', rowSpan: 1, rowStart: 0 },
      COLUMN_OFFSETS,
      ROW_OFFSETS,
      COLUMN_SIZES,
      ROW_SIZES,
    );

    expect(rect).toEqual({ height: 50, width: 210, x: 0, y: 0 });
  });

  it('should span multiple rows', () => {
    const rect = getGridCellRect(
      { columnSpan: 1, columnStart: 0, id: 'a', rowSpan: 3, rowStart: 0 },
      COLUMN_OFFSETS,
      ROW_OFFSETS,
      COLUMN_SIZES,
      ROW_SIZES,
    );

    expect(rect).toEqual({ height: 170, width: 100, x: 0, y: 0 });
  });

  it('should keep the start offset when only the far edge of the span is out of range', () => {
    const rect = getGridCellRect(
      { columnSpan: 3, columnStart: 2, id: 'a', rowSpan: 1, rowStart: 1 },
      COLUMN_OFFSETS,
      ROW_OFFSETS,
      COLUMN_SIZES,
      ROW_SIZES,
    );

    expect(rect).toEqual({ height: 50, width: 0, x: 220, y: 60 });
  });

  it('should fall back to zero for track indices outside the resolved arrays', () => {
    const rect = getGridCellRect(
      { columnSpan: 1, columnStart: 5, id: 'a', rowSpan: 1, rowStart: 5 },
      COLUMN_OFFSETS,
      ROW_OFFSETS,
      COLUMN_SIZES,
      ROW_SIZES,
    );

    expect(rect).toEqual({ height: 0, width: 0, x: 0, y: 0 });
  });
});
