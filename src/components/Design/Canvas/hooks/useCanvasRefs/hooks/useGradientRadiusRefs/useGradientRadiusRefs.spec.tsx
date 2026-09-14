import { renderHook } from '@testing-library/react';

// hooks
import { useGradientRadiusRefs } from './useGradientRadiusRefs';

describe('useGradientRadiusRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useGradientRadiusRefs());

    // result
    expect(result.current).toEqual({ gradientRadiusDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useGradientRadiusRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.gradientRadiusDragRef).toBe(firstRefs.gradientRadiusDragRef);
  });
});
