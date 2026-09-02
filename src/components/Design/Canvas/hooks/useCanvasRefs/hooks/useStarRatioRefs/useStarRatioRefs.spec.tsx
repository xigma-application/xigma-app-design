import { renderHook } from '@testing-library/react';

// hooks
import { useStarRatioRefs } from './useStarRatioRefs';

describe('useStarRatioRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useStarRatioRefs());

    // result
    expect(result.current).toEqual({ starRatioDragRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useStarRatioRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.starRatioDragRef).toBe(firstRefs.starRatioDragRef);
  });
});
