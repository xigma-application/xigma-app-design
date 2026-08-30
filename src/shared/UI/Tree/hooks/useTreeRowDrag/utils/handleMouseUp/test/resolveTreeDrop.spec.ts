// types
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { resolveTreeDrop } from '../resolveTreeDrop';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null): TTreeRow<TItem> => ({
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
});

describe('resolveTreeDrop', () => {
  it('should resolve a flat top-level reorder', () => {
    // mock
    const rows = [buildRow('a'), buildRow('b')];

    // action & result
    expect(resolveTreeDrop(rows, [0], 1, 0)).toEqual({ draggedItems: [{ id: 'a' }], targetIndex: 1, targetParentItem: null });
  });

  it('should resolve moving a nested child out of its group back to the top level', () => {
    // mock
    const group = { id: 'group' };
    const rows = [buildRow('group'), buildRow('child', 1, group), buildRow('sibling')];

    // action & result — dropped at the very end, past every row
    expect(resolveTreeDrop(rows, [1], 3, 0)).toEqual({ draggedItems: [{ id: 'child' }], targetIndex: 2, targetParentItem: null });
  });

  it('should resolve moving a top-level node into a group, at the target depth resolved from the nearest shallower ancestor', () => {
    // mock
    const group = { id: 'group' };
    const rows = [buildRow('a'), buildRow('group'), buildRow('x', 1, group)];

    // action & result — dropped right after the group row, at depth 1
    expect(resolveTreeDrop(rows, [0], 1, 1)).toEqual({ draggedItems: [{ id: 'a' }], targetIndex: 0, targetParentItem: group });
  });

  it('should reject a multi-drag whose rows do not share the same current parent', () => {
    // mock
    const group = { id: 'group' };
    const rows = [buildRow('a'), buildRow('group'), buildRow('b', 1, group)];

    // action & result
    expect(resolveTreeDrop(rows, [0, 2], 3, 0)).toBeNull();
  });

  it('should return null when no ancestor row exists at the resolved target depth', () => {
    // mock
    const rows = [buildRow('a')];

    // action & result
    expect(resolveTreeDrop(rows, [0], 0, 1)).toBeNull();
  });

  it('should return null for out-of-range dragged indices', () => {
    // mock
    const rows = [buildRow('a')];

    // action & result
    expect(resolveTreeDrop(rows, [5], 0, 0)).toBeNull();
  });
});
