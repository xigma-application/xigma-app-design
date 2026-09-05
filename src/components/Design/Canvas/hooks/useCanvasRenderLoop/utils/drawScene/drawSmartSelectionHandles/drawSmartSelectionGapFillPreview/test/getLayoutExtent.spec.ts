// types
import { TSmartSelectionGridLayout, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { getLayoutExtent } from '../getLayoutExtent';

const node = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
): { bounds: { height: number; width: number; x: number; y: number }; id: string } => ({
  bounds: { height, width, x, y },
  id,
});

describe('getLayoutExtent', () => {
  it('should return the bounding extent of every node in a row/column layout', () => {
    const layout: TSmartSelectionRowLayout = {
      gaps: [],
      nodes: [node('a', 0, 0, 50, 50), node('b', 100, 20, 50, 50)],
      type: 'row',
    };

    expect(getLayoutExtent(layout)).toEqual({ height: 70, width: 150, x: 0, y: 0 });
  });

  it('should return the bounding extent of every non-null cell in a grid layout, ignoring empty cells', () => {
    const layout: TSmartSelectionGridLayout = {
      cells: [
        [node('a', 0, 0, 50, 50), null],
        [node('c', 0, 100, 50, 50), node('d', 100, 100, 50, 50)],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid',
    };

    expect(getLayoutExtent(layout)).toEqual({ height: 150, width: 150, x: 0, y: 0 });
  });
});
