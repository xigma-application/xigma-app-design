import { renderHook } from '@testing-library/react';

// hooks
import { useLayoutRefs } from './useLayoutRefs';

describe('useLayoutRefs behaviors', () => {
  it('should return an object of independent refs, each starting out at 0', () => {
    // before
    const { result } = renderHook(() => useLayoutRefs());

    // result
    expect(result.current).toEqual({
      leftPanelWidthRef: { current: 0 },
      rightPanelWidthRef: { current: 0 },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useLayoutRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.leftPanelWidthRef).toBe(firstRefs.leftPanelWidthRef);
  });
});
