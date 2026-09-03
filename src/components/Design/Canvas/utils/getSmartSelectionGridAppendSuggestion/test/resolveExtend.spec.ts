// types
import { TSmartSelectionGap, TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { resolveExtend } from '../resolveExtend';

const cell = (id: string, x: number, y: number, width = 100, height = 100): TSmartSelectionNode => ({
  bounds: { height, width, x, y },
  id,
});

const buildGap = (value: number): TSmartSelectionGap => ({
  index: 0,
  midpoint: { x: 0, y: 0 },
  span: { x1: 0, x2: 0, y1: 0, y2: 0 },
  value,
});

// clean 2x2 grid: columns at x=0/200 (width 100), rows at y=0/200 (height 100), gap 100 both axes
const buildCleanGridLayout = (): TSmartSelectionGridLayout => ({
  cells: [
    [cell('a', 0, 0), cell('b', 200, 0)],
    [cell('c', 0, 200), cell('d', 200, 200)],
  ],
  columnCount: 2,
  columnGaps: [buildGap(100)],
  geometry: { columnWidth: [100, 100], columnX: [0, 200], rowHeight: [100, 100], rowY: [0, 200] },
  rowCount: 2,
  rowGaps: [buildGap(100)],
  type: 'grid',
});

describe('resolveExtend', () => {
  it('should append a new column after the last one when the outlier aligns with a row band past the right edge', () => {
    const layout = buildCleanGridLayout();
    const outlier = cell('x', 500, 0);

    expect(resolveExtend(outlier, layout)).toEqual({ column: 2, height: 100, row: 0, width: 100, x: 400, y: 0 });
  });

  it('should prepend a new column before the first one when the outlier aligns with a row band past the left edge', () => {
    const layout = buildCleanGridLayout();
    const outlier = cell('x', -500, 0);

    expect(resolveExtend(outlier, layout)).toEqual({ column: -1, height: 100, row: 0, width: 100, x: -200, y: 0 });
  });

  it('should append a new row after the last one when the outlier aligns with a column band past the bottom edge', () => {
    const layout = buildCleanGridLayout();
    const outlier = cell('x', 0, 500);

    expect(resolveExtend(outlier, layout)).toEqual({ column: 0, height: 100, row: 2, width: 100, x: 0, y: 400 });
  });

  it('should prepend a new row before the first one when the outlier aligns with a column band past the top edge', () => {
    const layout = buildCleanGridLayout();
    const outlier = cell('x', 0, -500);

    expect(resolveExtend(outlier, layout)).toEqual({ column: 0, height: 100, row: -1, width: 100, x: 0, y: -200 });
  });

  it('should return null when the outlier matches neither an existing row nor column band', () => {
    const layout = buildCleanGridLayout();
    const outlier = cell('x', 500, 500);

    expect(resolveExtend(outlier, layout)).toBeNull();
  });

  it('should fall back to a zero column gap when the layout carries no recorded column gap', () => {
    const layout: TSmartSelectionGridLayout = { ...buildCleanGridLayout(), columnGaps: [] };
    const outlier = cell('x', 500, 0);

    // right edge (300) + a 0 fallback gap, instead of the grid's own 100
    expect(resolveExtend(outlier, layout)).toEqual({ column: 2, height: 100, row: 0, width: 100, x: 300, y: 0 });
  });

  it('should fall back to a zero row gap when the layout carries no recorded row gap', () => {
    const layout: TSmartSelectionGridLayout = { ...buildCleanGridLayout(), rowGaps: [] };
    const outlier = cell('x', 0, 500);

    // bottom edge (300) + a 0 fallback gap, instead of the grid's own 100
    expect(resolveExtend(outlier, layout)).toEqual({ column: 0, height: 100, row: 2, width: 100, x: 0, y: 300 });
  });
});
