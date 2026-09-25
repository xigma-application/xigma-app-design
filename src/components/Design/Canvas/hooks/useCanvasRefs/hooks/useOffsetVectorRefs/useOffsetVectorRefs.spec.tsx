import { renderHook } from '@testing-library/react';

// hooks
import { useOffsetVectorRefs } from './useOffsetVectorRefs';

describe('useOffsetVectorRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useOffsetVectorRefs());

    // result
    expect(result.current).toEqual({ hoveredOffsetVectorEdgeRef: { current: null }, offsetVectorDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useOffsetVectorRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.offsetVectorDragRef).toBe(firstRefs.offsetVectorDragRef);
  });
});
