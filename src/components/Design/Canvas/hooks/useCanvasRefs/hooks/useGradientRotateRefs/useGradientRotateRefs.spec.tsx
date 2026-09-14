import { renderHook } from '@testing-library/react';

// hooks
import { useGradientRotateRefs } from './useGradientRotateRefs';

describe('useGradientRotateRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useGradientRotateRefs());

    // result
    expect(result.current).toEqual({ gradientRotateDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useGradientRotateRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.gradientRotateDragRef).toBe(firstRefs.gradientRotateDragRef);
  });
});
