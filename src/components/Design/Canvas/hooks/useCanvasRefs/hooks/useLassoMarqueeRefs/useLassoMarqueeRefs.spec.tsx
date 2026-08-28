import { renderHook } from '@testing-library/react';

// hooks
import { useLassoMarqueeRefs } from './useLassoMarqueeRefs';

describe('useLassoMarqueeRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useLassoMarqueeRefs());

    // result
    expect(result.current).toEqual({
      marqueeRef: { current: null },
      vectorLassoPathRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useLassoMarqueeRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.marqueeRef).toBe(firstRefs.marqueeRef);
  });
});
