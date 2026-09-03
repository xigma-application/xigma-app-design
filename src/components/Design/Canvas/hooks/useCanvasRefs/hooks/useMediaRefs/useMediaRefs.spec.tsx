import { renderHook } from '@testing-library/react';

// hooks
import { useMediaRefs } from './useMediaRefs';

describe('useMediaRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useMediaRefs());

    // result
    expect(result.current).toEqual({
      armedRef: { current: null },
      queueRef: { current: [] },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useMediaRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.armedRef).toBe(firstRefs.armedRef);
  });
});
