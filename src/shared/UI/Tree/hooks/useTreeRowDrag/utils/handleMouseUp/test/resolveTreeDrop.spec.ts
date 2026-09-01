// types
import { TTreeItem, TTreeRow } from '../../../../../types';

// utils
import { resolveTreeDrop } from '../resolveTreeDrop';

type TItem = TTreeItem;

const buildRow = (id: string, depth = 0, parentItem: TItem | null = null): TTreeRow<TItem> => ({
  canHaveChildren: false,
  depth,
  hasChildren: false,
  isExpanded: false,
  item: { id },
  parentItem,
});

describe('resolveTreeDrop', () => {
  it('should resolve a flat top-level reorder — rows are front-to-back, the array is back-to-front, so the ui-order index gets mirrored', () => {
    // mock — dragging the front-most row ('a') past 'b' sends it to the back of the array (index 0)
    const rows = [buildRow('a'), buildRow('b')];

    // action & result
    expect(resolveTreeDrop(rows, [0], 1, 0)).toEqual({ draggedItems: [{ id: 'a' }], targetIndex: 0, targetParentItem: null });
  });

  it('should resolve moving a nested child out of its group back to the top level', () => {
    // mock — dropped at the very end of the row list (the new back-most row) mirrors to array index 0
    const group = { id: 'group' };
    const rows = [buildRow('group'), buildRow('child', 1, group), buildRow('sibling')];

    // action & result
    expect(resolveTreeDrop(rows, [1], 3, 0)).toEqual({ draggedItems: [{ id: 'child' }], targetIndex: 0, targetParentItem: null });
  });

  it('should resolve moving a top-level node into a group, at the target depth resolved from the nearest shallower ancestor', () => {
    // mock — dropped right after the group row (as its new front-most/first-shown child)
    const group = { id: 'group' };
    const rows = [buildRow('a'), buildRow('group'), buildRow('x', 1, group)];

    // action & result — 'group' already has one rendered child ('x'), so landing as the first
    // shown child mirrors to array index 1 (after 'x', i.e. in front of it)
    expect(resolveTreeDrop(rows, [0], 1, 1)).toEqual({ draggedItems: [{ id: 'a' }], targetIndex: 1, targetParentItem: group });
  });

  it('should preserve the dragged block’s own relative front-to-back order when reordering a multi-selection', () => {
    // mock — 'a' (front-most/row 0) and 'b' (row 1) dragged together; the array they get spliced
    // into is back-to-front, so the block must come back reversed to keep 'a' in front of 'b'
    const rows = [buildRow('a'), buildRow('b'), buildRow('c')];

    // action & result
    const resolved = resolveTreeDrop(rows, [0, 1], 3, 0);

    expect(resolved?.draggedItems).toEqual([{ id: 'b' }, { id: 'a' }]);
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
