// types
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { getDraggedBlockRange } from '../getDraggedBlockRange';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem: null,
});

describe('getDraggedBlockRange', () => {
  it('should span a single dragged leaf row', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];

    // action
    const range = getDraggedBlockRange(rows, ['b']);

    // result
    expect(range).toEqual([1, 2]);
  });

  it('should extend the block over the dragged row descendants', () => {
    // mock — dragging group "b" which is expanded with two children
    const rows = [buildRow('a'), buildRow('b'), buildRow('b-1', 1), buildRow('b-2', 1), buildRow('c')];

    // action
    const range = getDraggedBlockRange(rows, ['b']);

    // result — rows 1..3 (group + both children), stopping at "c"
    expect(range).toEqual([1, 4]);
  });

  it('should keep contiguous multi-selected siblings in one block', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b'), buildRow('c'), buildRow('d')];

    // action
    const range = getDraggedBlockRange(rows, ['b', 'c']);

    // result
    expect(range).toEqual([1, 3]);
  });

  it('should return an empty range when none of the ids are present', () => {
    // action
    const range = getDraggedBlockRange([buildRow('a')], ['x']);

    // result
    expect(range).toEqual([-1, -1]);
  });

  it('should run the block to the end of the list when nothing shallower follows', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b'), buildRow('b-1', 1)];

    // action
    const range = getDraggedBlockRange(rows, ['b']);

    // result
    expect(range).toEqual([1, 3]);
  });
});
