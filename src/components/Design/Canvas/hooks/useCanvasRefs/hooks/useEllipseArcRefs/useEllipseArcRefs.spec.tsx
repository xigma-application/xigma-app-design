import { renderHook } from '@testing-library/react';

// hooks
import { useEllipseArcRefs } from './useEllipseArcRefs';

describe('useEllipseArcRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useEllipseArcRefs());

    // result
    expect(result.current).toEqual({
      ellipseArcDragRef: { current: null },
      ellipseArcRatioDragRef: { current: null },
      ellipseArcRotateDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useEllipseArcRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.ellipseArcDragRef).toBe(firstRefs.ellipseArcDragRef);
  });
});
