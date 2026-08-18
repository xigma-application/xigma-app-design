import { renderHook } from '@testing-library/react';

// hooks
import { useCanvasRefs } from './useCanvasRefs';

describe('useCanvasRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useCanvasRefs());

    // result
    expect(result.current).toEqual({
      canvasRef: { current: null },
      cornerRadiusDragRef: { current: null },
      draftRef: { current: null },
      ellipseArcDragRef: { current: null },
      ellipseArcRatioDragRef: { current: null },
      ellipseArcRotateDragRef: { current: null },
      hoverRef: { current: null },
      marqueeRef: { current: null },
      polygonCornerRadiusDragRef: { current: null },
      sliceRef: { current: null },
      starCornerRadiusDragRef: { current: null },
    });
  });

  it('should keep returning the same ref objects across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useCanvasRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current.canvasRef).toBe(firstRefs.canvasRef);
    expect(result.current.draftRef).toBe(firstRefs.draftRef);
  });
});
