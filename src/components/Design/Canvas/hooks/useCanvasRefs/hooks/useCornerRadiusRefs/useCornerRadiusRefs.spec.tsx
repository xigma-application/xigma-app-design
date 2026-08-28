import { renderHook } from '@testing-library/react';

// hooks
import { useCornerRadiusRefs } from './useCornerRadiusRefs';

describe('useCornerRadiusRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useCornerRadiusRefs());

    // result
    expect(result.current).toEqual({
      cornerRadiusDragRef: { current: null },
      polygonCornerRadiusDragRef: { current: null },
      starCornerRadiusDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useCornerRadiusRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.cornerRadiusDragRef).toBe(firstRefs.cornerRadiusDragRef);
  });
});
