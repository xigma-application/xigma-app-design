import { TSmartSelectionNode } from 'types/design/smartSelection/types';

import { getSmartSelectionLayoutNodes } from '../getSmartSelectionLayoutNodes';

const node = (id: string, x: number, y: number): TSmartSelectionNode => ({ bounds: { height: 40, width: 40, x, y }, id });

describe('getSmartSelectionLayoutNodes', () => {
  it('should return the nodes of a row or column layout as they are', () => {
    // mock
    const nodes = [node('a', 0, 0), node('b', 100, 0)];

    // before
    const result = getSmartSelectionLayoutNodes({ gaps: [], nodes, type: 'row' });

    // result
    expect(result).toBe(nodes);
  });

  it('should flatten the cells of a grid layout and drop the empty ones', () => {
    // mock
    const a = node('a', 0, 0);
    const c = node('c', 0, 100);

    // before
    const result = getSmartSelectionLayoutNodes({
      cells: [
        [a, null],
        [c, null],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [40, 40], columnX: [0, 100], rowHeight: [40, 40], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid',
    });

    // result
    expect(result).toEqual([a, c]);
  });
});
