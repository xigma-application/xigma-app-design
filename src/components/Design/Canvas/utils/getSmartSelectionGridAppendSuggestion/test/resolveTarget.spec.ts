// types
import { TSmartSelectionGap, TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { resolveTarget } from '../resolveTarget';

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

const baseGeometry = { columnWidth: [100, 100], columnX: [0, 200], rowHeight: [100, 100], rowY: [0, 200] };

describe('resolveTarget', () => {
  it('should place the outlier into a hole when the grid has one', () => {
    const layout: TSmartSelectionGridLayout = {
      cells: [
        [cell('a', 0, 0), null],
        [cell('c', 0, 200), cell('d', 200, 200)],
      ],
      columnCount: 2,
      columnGaps: [buildGap(100)],
      geometry: baseGeometry,
      rowCount: 2,
      rowGaps: [buildGap(100)],
      type: 'grid',
    };
    const outlier = cell('x', 500, 500);

    expect(resolveTarget(outlier, layout)).toEqual({ column: 1, height: 100, row: 0, width: 100, x: 200, y: 0 });
  });

  it('should extend the grid when it has no holes', () => {
    const layout: TSmartSelectionGridLayout = {
      cells: [
        [cell('a', 0, 0), cell('b', 200, 0)],
        [cell('c', 0, 200), cell('d', 200, 200)],
      ],
      columnCount: 2,
      columnGaps: [buildGap(100)],
      geometry: baseGeometry,
      rowCount: 2,
      rowGaps: [buildGap(100)],
      type: 'grid',
    };
    const outlier = cell('x', 500, 0);

    expect(resolveTarget(outlier, layout)).toEqual({ column: 2, height: 100, row: 0, width: 100, x: 400, y: 0 });
  });
});
