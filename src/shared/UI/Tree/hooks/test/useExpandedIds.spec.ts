import { renderHook } from '@testing-library/react';

// hooks
import { useExpandedIds } from '../useExpandedIds';

describe('useExpandedIds', () => {
  describe('uncontrolled', () => {
    it('should toggle an id in and out of its own internal set', () => {
      // before
      const { rerender, result } = renderHook(() => useExpandedIds());

      // action
      result.current.toggleExpanded('a');
      rerender();

      // result
      expect([...result.current.expandedIds]).toEqual(['a']);

      // action
      result.current.toggleExpanded('a');
      rerender();

      // result
      expect([...result.current.expandedIds]).toEqual([]);
    });

    it('should add or remove a whole batch of ids at once', () => {
      // before
      const { rerender, result } = renderHook(() => useExpandedIds());

      // action
      result.current.setSubtreeExpanded(['a', 'b', 'c'], true);
      rerender();

      // result
      expect([...result.current.expandedIds].sort()).toEqual(['a', 'b', 'c']);

      // action
      result.current.setSubtreeExpanded(['a', 'c'], false);
      rerender();

      // result
      expect([...result.current.expandedIds]).toEqual(['b']);
    });
  });

  describe('controlled', () => {
    it('should read the passed-in set and route every change through onExpandedIdsChange', () => {
      // mock
      const onExpandedIdsChange = vi.fn();
      const control = { expandedIds: new Set(['x']), onExpandedIdsChange };

      // before
      const { result } = renderHook(() => useExpandedIds(control));

      // result
      expect([...result.current.expandedIds]).toEqual(['x']);

      // action
      result.current.toggleExpanded('y');

      // result — the next set is computed off the controlled value, not internal state
      expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set(['x', 'y']));
    });

    it('should compute a subtree change off the controlled set', () => {
      // mock
      const onExpandedIdsChange = vi.fn();
      const control = { expandedIds: new Set(['x', 'y']), onExpandedIdsChange };

      // before
      const { result } = renderHook(() => useExpandedIds(control));

      // action
      result.current.setSubtreeExpanded(['x', 'y'], false);

      // result
      expect(onExpandedIdsChange).toHaveBeenCalledWith(new Set());
    });
  });
});
