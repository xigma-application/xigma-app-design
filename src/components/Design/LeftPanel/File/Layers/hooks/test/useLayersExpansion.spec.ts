import { renderHook } from '@testing-library/react';

// hooks
import { useLayersExpansion } from '../useLayersExpansion';

describe('useLayersExpansion', () => {
  it('should start with an empty set and hasExpanded false', () => {
    // before
    const { result } = renderHook(() => useLayersExpansion());

    // result
    expect(result.current.expandedIds.size).toBe(0);
    expect(result.current.hasExpanded).toBe(false);
  });

  it('should report hasExpanded true once onExpandedIdsChange receives a non-empty set', () => {
    // before
    const { rerender, result } = renderHook(() => useLayersExpansion());

    // action
    result.current.onExpandedIdsChange(new Set(['group-1']));
    rerender();

    // result
    expect([...result.current.expandedIds]).toEqual(['group-1']);
    expect(result.current.hasExpanded).toBe(true);
  });

  it('should reset expandedIds to empty when collapseAll is called', () => {
    // before
    const { rerender, result } = renderHook(() => useLayersExpansion());
    result.current.onExpandedIdsChange(new Set(['group-1', 'group-2']));
    rerender();

    // action
    result.current.collapseAll();
    rerender();

    // result
    expect(result.current.expandedIds.size).toBe(0);
    expect(result.current.hasExpanded).toBe(false);
  });
});
