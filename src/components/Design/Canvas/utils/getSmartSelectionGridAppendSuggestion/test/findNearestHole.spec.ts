// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { findNearestHole } from '../findNearestHole';

const cell = (id: string, x: number, y: number, width = 50, height = 50): TSmartSelectionNode => ({ bounds: { height, width, x, y }, id });

const buildGridLayout = (cells: (TSmartSelectionNode | null)[][]): TSmartSelectionGridLayout => ({
  cells,
  columnCount: cells[0].length,
  columnGaps: [],
  geometry: {
    columnWidth: cells[0].map(() => 50),
    columnX: cells[0].map((_, index) => index * 100),
    rowHeight: cells.map(() => 50),
    rowY: cells.map((_, index) => index * 100),
  },
  rowCount: cells.length,
  rowGaps: [],
  type: 'grid',
});

describe('findNearestHole', () => {
  it('should find the single empty cell in the grid', () => {
    // 2x3 grid with (row 0, column 1) left empty
    const layout = buildGridLayout([
      [cell('a', 0, 0), null, cell('c', 200, 0)],
      [cell('d', 0, 100), cell('e', 100, 100), cell('f', 200, 100)],
    ]);
    const outlier = cell('x', 500, 500);

    expect(findNearestHole(outlier, layout)).toEqual({ column: 1, height: 50, row: 0, width: 50, x: 100, y: 0 });
  });

  it('should pick whichever empty cell sits closest to the outlier when there are several', () => {
    // holes at (row 0, col 0), (row 1, col 2), (row 2, col 1); the outlier sits exactly on the second
    // one — closer than the first (already picked) and, once picked, not displaced by the third either
    // (which sits farther away still), exercising both the "first hole found" and "not closer, skip" paths
    const layout = buildGridLayout([
      [null, cell('b', 100, 0), cell('c', 200, 0)],
      [cell('d', 0, 100), cell('e', 100, 100), null],
      [cell('g', 0, 200), null, cell('i', 200, 200)],
    ]);
    const outlier = cell('x', 200, 100);

    expect(findNearestHole(outlier, layout)).toEqual({ column: 2, height: 50, row: 1, width: 50, x: 200, y: 100 });
  });

  it('should return null when the grid has no empty cells', () => {
    const layout = buildGridLayout([
      [cell('a', 0, 0), cell('b', 100, 0)],
      [cell('c', 0, 100), cell('d', 100, 100)],
    ]);
    const outlier = cell('x', 500, 500);

    expect(findNearestHole(outlier, layout)).toBeNull();
  });
});
