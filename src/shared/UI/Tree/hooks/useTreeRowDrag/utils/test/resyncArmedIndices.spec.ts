// types
import { TArmedRowDrag } from '../../types';
import { TTreeItem, TTreeRow } from '../../../../types';

// utils
import { resyncArmedIndices } from '../resyncArmedIndices';

type TItem = TTreeItem;

const buildRow = (id: string): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth: 0,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem: null,
});

const buildArmed = (ids: string[], indices: number[]): TArmedRowDrag => ({ depth: 0, ids, indices, startY: 0 });

describe('resyncArmedIndices', () => {
  it('should re-point the indices at the dragged ids current positions', () => {
    // mock — a group expanded above the dragged row, pushing it from index 1 to index 3
    const armed = buildArmed(['c'], [1]);
    const rows = [buildRow('g'), buildRow('a'), buildRow('b'), buildRow('c')];

    // action
    resyncArmedIndices(armed, rows);

    // result
    expect(armed.indices).toEqual([3]);
  });

  it('should keep a contiguous multi-selection in order', () => {
    // mock
    const armed = buildArmed(['c', 'd'], [0, 1]);
    const rows = [buildRow('a'), buildRow('c'), buildRow('d'), buildRow('e')];

    // action
    resyncArmedIndices(armed, rows);

    // result
    expect(armed.indices).toEqual([1, 2]);
  });

  it('should leave the indices untouched when a dragged row has vanished', () => {
    // mock
    const armed = buildArmed(['c', 'gone'], [2, 3]);
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];

    // action
    resyncArmedIndices(armed, rows);

    // result
    expect(armed.indices).toEqual([2, 3]);
  });
});
