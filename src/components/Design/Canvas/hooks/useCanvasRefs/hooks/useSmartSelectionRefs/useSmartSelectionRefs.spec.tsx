import { renderHook } from '@testing-library/react';

// hooks
import { useSmartSelectionRefs } from './useSmartSelectionRefs';

describe('useSmartSelectionRefs behaviors', () => {
  it('should return an object of refs, starting out empty', () => {
    // before
    const { result } = renderHook(() => useSmartSelectionRefs());

    // result
    expect(result.current).toEqual({ gapDragRef: { current: null }, swapDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useSmartSelectionRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.gapDragRef).toBe(firstRefs.gapDragRef);
  });
});
