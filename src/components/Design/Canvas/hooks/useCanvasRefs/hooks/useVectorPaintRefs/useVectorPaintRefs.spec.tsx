import { renderHook } from '@testing-library/react';

// hooks
import { useVectorPaintRefs } from './useVectorPaintRefs';

describe('useVectorPaintRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useVectorPaintRefs());

    // result
    expect(result.current).toEqual({
      isVectorPaintRemoveRef: { current: false },
      touchedVectorPaintLoopKeysRef: { current: {} },
      vectorPaintPathRef: { current: null },
      vectorPaintTouchedFacesRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useVectorPaintRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.vectorPaintPathRef).toBe(firstRefs.vectorPaintPathRef);
  });
});
