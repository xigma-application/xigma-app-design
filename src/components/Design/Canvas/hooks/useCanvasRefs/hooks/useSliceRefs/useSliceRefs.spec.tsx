import { renderHook } from '@testing-library/react';

// hooks
import { useSliceRefs } from './useSliceRefs';

describe('useSliceRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useSliceRefs());

    // result
    expect(result.current).toEqual({
      sliceRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useSliceRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.sliceRef).toBe(firstRefs.sliceRef);
  });
});
