import { renderHook } from '@testing-library/react';

// hooks
import { useProgressiveBlurRefs } from './useProgressiveBlurRefs';

describe('useProgressiveBlurRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useProgressiveBlurRefs());

    // result
    expect(result.current).toEqual({ dragRef: { current: null }, hoveredEndpointRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useProgressiveBlurRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
  });
});
