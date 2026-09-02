import { renderHook } from '@testing-library/react';

// hooks
import { useVertexCountRefs } from './useVertexCountRefs';

describe('useVertexCountRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVertexCountRefs());

    // result
    expect(result.current).toEqual({
      polygonVertexCountDragRef: { current: null },
      starVertexCountDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVertexCountRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.polygonVertexCountDragRef).toBe(firstRefs.polygonVertexCountDragRef);
  });
});
