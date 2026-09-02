import { renderHook } from '@testing-library/react';

// hooks
import { useGuideRefs } from './useGuideRefs';

describe('useGuideRefs behaviors', () => {
  it('should return an object of refs, starting out empty', () => {
    // before
    const { result } = renderHook(() => useGuideRefs());

    // result
    expect(result.current).toEqual({ draggingGuideRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useGuideRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.draggingGuideRef).toBe(firstRefs.draggingGuideRef);
  });
});
