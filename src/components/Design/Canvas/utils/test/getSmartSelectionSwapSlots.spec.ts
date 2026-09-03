// types
import { TSmartSelectionGridLayout, TSmartSelectionNode, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionSwapSlots } from '../getSmartSelectionSwapSlots';

const node = (id: string): TSmartSelectionNode => ({ bounds: { height: 10, width: 10, x: 0, y: 0 }, id });

describe('getSmartSelectionSwapSlots', () => {
  it('should return the row/column nodes in their visual order', () => {
    const layout = { gaps: [], nodes: [node('a'), node('b'), node('c')], type: 'row' } as TSmartSelectionRowLayout;

    expect(getSmartSelectionSwapSlots(layout).map((slot) => slot.id)).toEqual(['a', 'b', 'c']);
  });

  it('should flatten grid cells row-major', () => {
    const layout = {
      cells: [
        [node('a'), node('b')],
        [node('c'), node('d')],
      ],
      columnCount: 2,
      columnGaps: [],
      rowCount: 2,
      rowGaps: [],
      type: 'grid',
    } as TSmartSelectionGridLayout;

    expect(getSmartSelectionSwapSlots(layout).map((slot) => slot.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});
