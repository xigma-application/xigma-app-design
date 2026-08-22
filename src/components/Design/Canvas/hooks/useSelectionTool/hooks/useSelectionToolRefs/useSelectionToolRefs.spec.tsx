import { renderHook } from '@testing-library/react';

// hooks
import { useSelectionToolRefs } from './useSelectionToolRefs';

describe('useSelectionToolRefs behaviors', () => {
  it('should return an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderHook(() => useSelectionToolRefs());

    // result
    expect(result.current).toEqual({
      dragStateRef: { current: null },
      endpointDragRef: { current: null },
      marqueeStartRef: { current: null },
      pathOffsetDragRef: { current: null },
      pendingVectorCornerHandleDragRef: { current: null },
      polygonVertexCountDragRef: { current: null },
      resizeDragRef: { current: null },
      starRatioDragRef: { current: null },
      starVertexCountDragRef: { current: null },
      vectorHandleDragRef: { current: null },
      vectorMarqueeModeRef: { current: null },
      vectorMarqueeStartRef: { current: null },
      vectorSegmentBendDragRef: { current: null },
      vectorVertexDragRef: { current: null },
    });
  });

  it('should keep returning the same refs object across re-renders', () => {
    // before
    const { rerender, result } = renderHook(() => useSelectionToolRefs());
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current).toBe(firstRefs);
    expect(result.current.dragStateRef).toBe(firstRefs.dragStateRef);
  });
});
