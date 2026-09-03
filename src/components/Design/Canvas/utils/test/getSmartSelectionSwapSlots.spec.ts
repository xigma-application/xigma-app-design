// types
import { TSmartSelectionGridLayout, TSmartSelectionNode, TSmartSelectionRowLayout } from 'types/design/smartSelection/types';

// utils
import { getSmartSelectionSwapSlots } from '../getSmartSelectionSwapSlots';

const node = (id: string, x = 0, y = 0): TSmartSelectionNode => ({ bounds: { height: 50, width: 50, x, y }, id });

describe('getSmartSelectionSwapSlots', () => {
  it('should return the row/column nodes in their visual order', () => {
    const layout = { gaps: [], nodes: [node('a'), node('b'), node('c')], type: 'row' } as TSmartSelectionRowLayout;

    expect(getSmartSelectionSwapSlots(layout).map((slot) => slot.id)).toEqual(['a', 'b', 'c']);
  });

  it('should flatten grid cells row-major', () => {
    const layout = {
      cells: [
        [node('a', 0, 0), node('b', 100, 0)],
        [node('c', 0, 100), node('d', 100, 100)],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid',
    } as TSmartSelectionGridLayout;

    expect(getSmartSelectionSwapSlots(layout).map((slot) => slot.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('should emit a null-id slot with extrapolated bounds for every empty grid cell', () => {
    const layout = {
      cells: [
        [node('a', 0, 0), node('b', 100, 0)],
        [node('c', 0, 100), null],
      ],
      columnCount: 2,
      columnGaps: [],
      geometry: { columnWidth: [50, 50], columnX: [0, 100], rowHeight: [50, 50], rowY: [0, 100] },
      rowCount: 2,
      rowGaps: [],
      type: 'grid',
    } as TSmartSelectionGridLayout;

    const slots = getSmartSelectionSwapSlots(layout);

    expect(slots.map((slot) => slot.id)).toEqual(['a', 'b', 'c', null]);
    expect(slots[3].bounds).toEqual({ height: 50, width: 50, x: 100, y: 100 });
  });
});
