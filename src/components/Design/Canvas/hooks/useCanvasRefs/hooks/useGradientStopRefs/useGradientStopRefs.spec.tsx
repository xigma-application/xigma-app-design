import { renderHook } from '@testing-library/react';

// hooks
import { useGradientStopRefs } from './useGradientStopRefs';

describe('useGradientStopRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useGradientStopRefs());

    // result
    expect(result.current).toEqual({ gradientStopDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useGradientStopRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.gradientStopDragRef).toBe(firstRefs.gradientStopDragRef);
  });
});
