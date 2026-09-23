import { renderHook } from '@testing-library/react';

// hooks
import { useDrawingRefs } from './useDrawingRefs';

describe('useDrawingRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useDrawingRefs());

    // result
    expect(result.current).toEqual({ cancelDrawRef: { current: null } });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useDrawingRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.cancelDrawRef).toBe(firstRefs.cancelDrawRef);
  });
});
