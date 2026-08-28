import { renderHook } from '@testing-library/react';

// hooks
import { useVectorMultiSelectRefs } from './useVectorMultiSelectRefs';

describe('useVectorMultiSelectRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorMultiSelectRefs());

    // result
    expect(result.current).toEqual({
      vectorMultiDragRef: { current: null },
      vectorMultiSelectBoxRef: { current: null },
      vectorMultiSelectResizeDragRef: { current: null },
      vectorMultiSelectRotateDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorMultiSelectRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.vectorMultiDragRef).toBe(firstRefs.vectorMultiDragRef);
  });
});
