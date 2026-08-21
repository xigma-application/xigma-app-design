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
      hoveredSegmentIdRef: { current: null },
      hoveredVectorEdgeInsertPointRef: { current: null },
      hoveredVectorHandleRef: { current: null },
      hoveredVectorSegmentIdRef: { current: null },
      hoveredVectorVertexIdRef: { current: null },
      marqueeRef: { current: null },
      penDragOriginRef: { current: null },
      penDraggedHandleIsSnappedRef: { current: false },
      penDraggedHandlePositionRef: { current: null },
      penHoveredDragArmableVertexRef: { current: false },
      penNewVertexPreviewRef: { current: null },
      penPreviewRef: { current: null },
      polygonCornerRadiusDragRef: { current: null },
      preVectorMarqueeSegmentIdsRef: { current: [] },
      preVectorMarqueeVertexIdsRef: { current: [] },
      rotateDragRef: { current: null },
      selectedVectorHandlesRef: { current: [] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: [] },
      sliceRef: { current: null },
      snappedVectorHandleRef: { current: null },
      starCornerRadiusDragRef: { current: null },
      vectorAlignmentGuideRef: { current: null },
      vectorLassoPathRef: { current: null },
      vectorMultiDragRef: { current: null },
      vectorMultiSelectBoxRef: { current: null },
      vectorMultiSelectResizeDragRef: { current: null },
      vectorMultiSelectRotateDragRef: { current: null },
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
