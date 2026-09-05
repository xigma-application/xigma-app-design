import { renderHook } from '@testing-library/react';

// hooks
import { usePencilDragRefs } from './usePencilDragRefs';

describe('usePencilDragRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => usePencilDragRefs());

    // result
    expect(result.current).toEqual({
      axisLockRef: { current: null },
      committedPointsRef: { current: null },
      rawPointsRef: { current: null },
      shiftAnchorRef: { current: null },
      tailPointsRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => usePencilDragRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.committedPointsRef).toBe(firstRefs.committedPointsRef);
  });
});
