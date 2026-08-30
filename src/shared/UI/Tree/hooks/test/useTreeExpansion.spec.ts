import { renderHook } from '@testing-library/react';

// hooks
import { useTreeExpansion } from '../useTreeExpansion';

// types
import { TTreeItem, TTreeRow } from '../../types';

type TItem = TTreeItem & { children?: TItem[] };

const getChildren = (item: TItem): TItem[] | undefined => item.children;
const buildRow = (item: TItem): TTreeRow<TItem> => ({ depth: 0, hasChildren: true, isExpanded: false, item, parentItem: null });

describe('useTreeExpansion', () => {
  it('should manage its own set when uncontrolled', () => {
    // before
    const { rerender, result } = renderHook(() => useTreeExpansion(undefined, undefined, getChildren));

    // action
    result.current.onToggleExpand(buildRow({ children: [{ id: 'child' }], id: 'group' }));
    rerender();

    // result
    expect([...result.current.expandedIds]).toEqual(['group']);
  });

  it('should route every change through onExpandedIdsChange when controlled', () => {
    // mock
    const onExpandedIdsChange = vi.fn();

    // before
    const { result } = renderHook(() => useTreeExpansion(new Set(['group']), onExpandedIdsChange, getChildren));

    // result — reads the controlled set
    expect([...result.current.expandedIds]).toEqual(['group']);

    // action — plain toggle removes it
    result.current.onToggleExpand(buildRow({ children: [{ id: 'child' }], id: 'group' }));

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set());
  });

  it('should expand the whole subtree on a recursive toggle', () => {
    // mock
    const onExpandedIdsChange = vi.fn();
    const tree: TItem = { children: [{ children: [{ id: 'leaf' }], id: 'inner' }], id: 'outer' };

    // before
    const { result } = renderHook(() => useTreeExpansion(new Set(), onExpandedIdsChange, getChildren));

    // action
    result.current.onToggleExpand(buildRow(tree), { recursive: true });

    // result
    expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set(['outer', 'inner']));
  });
});
