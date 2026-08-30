import { renderHook } from '@testing-library/react';

// hooks
import { useVectorWidthRefs } from './useVectorWidthRefs';

describe('useVectorWidthRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorWidthRefs());

    // result
    expect(result.current).toEqual({
      editingWidthLabelRef: { current: null },
      vectorWidthPointDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorWidthRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.vectorWidthPointDragRef).toBe(firstRefs.vectorWidthPointDragRef);
  });
});
