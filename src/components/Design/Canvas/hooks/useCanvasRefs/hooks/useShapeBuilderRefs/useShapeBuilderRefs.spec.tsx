import { renderHook } from '@testing-library/react';

// hooks
import { useShapeBuilderRefs } from './useShapeBuilderRefs';

describe('useShapeBuilderRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useShapeBuilderRefs());

    // result
    expect(result.current).toEqual({
      isVectorShapeBuilderBoxModeRef: { current: false },
      isVectorShapeBuilderSubtractRef: { current: false },
      touchedVectorShapeBuilderFacesRef: { current: {} },
      vectorShapeBuilderPathRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useShapeBuilderRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.vectorShapeBuilderPathRef).toBe(firstRefs.vectorShapeBuilderPathRef);
  });
});
