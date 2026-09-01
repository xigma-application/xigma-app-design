import { renderHook } from '@testing-library/react';

// hooks
import { useSpringLoadExpand } from '../useSpringLoadExpand';

// types
import { TTreeItem, TTreeRow } from '../../types';

type TItem = TTreeItem;

const buildRow = (id: string, isExpanded = false): TTreeRow<TItem> => ({
  canHaveChildren: true,
  depth: 0,
  hasChildren: true,
  isExpanded,
  item: { id },
  parentItem: null,
});

describe('useSpringLoadExpand', () => {
  it('should toggle a collapsed row open when its id is passed', () => {
    // mock
    const onToggleExpand = vi.fn();
    const rows = [buildRow('a'), buildRow('g')];

    // action
    const { result } = renderHook(() => useSpringLoadExpand(rows, onToggleExpand));
    result.current('g');

    // result
    expect(onToggleExpand).toHaveBeenCalledWith(rows[1]);
  });

  it('should leave an already-expanded row alone', () => {
    // mock
    const onToggleExpand = vi.fn();
    const rows = [buildRow('g', true)];

    // action
    const { result } = renderHook(() => useSpringLoadExpand(rows, onToggleExpand));
    result.current('g');

    // result
    expect(onToggleExpand).not.toHaveBeenCalled();
  });

  it('should do nothing when the id is no longer in the row list', () => {
    // mock
    const onToggleExpand = vi.fn();

    // action
    const { result } = renderHook(() => useSpringLoadExpand([buildRow('a')], onToggleExpand));
    result.current('gone');

    // result
    expect(onToggleExpand).not.toHaveBeenCalled();
  });
});
