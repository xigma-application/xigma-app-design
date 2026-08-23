import { renderHook } from '@testing-library/react';

// components
import CanvasRefsProvider from './CanvasRefsProvider';

// hooks
import { useCanvasRefsContext } from './hooks/useCanvasRefsContext';

const renderCanvasRefs = (): ReturnType<typeof renderHook<ReturnType<typeof useCanvasRefsContext>, unknown>> =>
  renderHook(() => useCanvasRefsContext(), { wrapper: ({ children }) => <CanvasRefsProvider>{children}</CanvasRefsProvider> });

describe('CanvasRefsProvider behaviors', () => {
  it('should provide an object of independent refs, each starting out empty', () => {
    // before
    const { result } = renderCanvasRefs();

    // result
    expect(result.current).toEqual({
      canvasRef: { current: null },
      cornerRadiusDragRef: { current: null },
      draftRef: { current: null },
      draggedVectorFillFacesRef: { current: null },
      ellipseArcDragRef: { current: null },
      ellipseArcRatioDragRef: { current: null },
      ellipseArcRotateDragRef: { current: null },
      hoverRef: { current: null },
      hoveredSegmentIdRef: { current: null },
      hoveredVectorCutPointRef: { current: null },
      hoveredVectorCutSegmentRef: { current: null },
      hoveredVectorEdgeInsertPointRef: { current: null },
      hoveredVectorFaceSelectRef: { current: null },
      hoveredVectorHandleRef: { current: null },
      hoveredVectorPaintFaceKeyRef: { current: null },
      hoveredVectorSegmentIdRef: { current: null },
      hoveredVectorShapeBuilderFaceRef: { current: null },
      hoveredVectorVertexIdRef: { current: null },
      isVectorShapeBuilderBoxModeRef: { current: false },
      isVectorShapeBuilderSubtractRef: { current: false },
      marqueeRef: { current: null },
      newVectorCutVertexIdsRef: { current: new Set() },
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
      touchedVectorCutVertexIdsRef: { current: new Set() },
      touchedVectorShapeBuilderFacesRef: { current: {} },
      vectorAlignmentGuideRef: { current: null },
      vectorCutPreviewRef: { current: null },
      vectorLassoPathRef: { current: null },
      vectorMultiDragRef: { current: null },
      vectorMultiSelectBoxRef: { current: null },
      vectorMultiSelectResizeDragRef: { current: null },
      vectorMultiSelectRotateDragRef: { current: null },
      vectorShapeBuilderPathRef: { current: null },
    });
  });

  it('should keep returning the same ref objects across re-renders', () => {
    // before
    const { rerender, result } = renderCanvasRefs();
    const firstRefs = result.current;

    // action
    rerender();

    // result
    expect(result.current.canvasRef).toBe(firstRefs.canvasRef);
    expect(result.current.draftRef).toBe(firstRefs.draftRef);
    expect(result.current).toBe(firstRefs);
  });
});
