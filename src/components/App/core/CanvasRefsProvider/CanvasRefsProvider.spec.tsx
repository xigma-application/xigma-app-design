import { renderHook } from '@testing-library/react';

// components
import CanvasRefsProvider from './CanvasRefsProvider';

// others
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

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
      colorSampleRequestRef: { current: null },
      cornerRadius: {
        cornerRadiusDragRef: { current: null },
        polygonCornerRadiusDragRef: { current: null },
        starCornerRadiusDragRef: { current: null },
      },
      draftRef: { current: null },
      ellipseArc: {
        ellipseArcDragRef: { current: null },
        ellipseArcRatioDragRef: { current: null },
        ellipseArcRotateDragRef: { current: null },
      },
      frameName: { editingLabelRef: { current: null } },
      hover: {
        hoverRef: { current: null },
        hoveredCornerRadiusHandleRef: { current: null },
        hoveredEllipseArcHandleRef: { current: null },
        hoveredEllipseArcRatioHandleRef: { current: null },
        hoveredEllipseArcRotateHandleRef: { current: null },
        hoveredPolygonCornerRadiusHandleRef: { current: null },
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
        hoveredVectorWidthLabelRef: { current: null },
        hoveredVectorWidthPointRef: { current: null },
      },
      lassoMarquee: { marqueeRef: { current: null }, vectorLassoPathRef: { current: null } },
      pen: {
        penDragOriginRef: { current: null },
        penDraggedHandleIsSnappedRef: { current: false },
        penDraggedHandlePositionRef: { current: null },
        penHoveredDragArmableVertexRef: { current: false },
        penNewVertexPreviewRef: { current: null },
        penPreviewRef: { current: null },
      },
      pencil: {
        pencilPreviewPointsRef: { current: null },
        pencilRawPreviewPointsRef: { current: null },
        pencilShowRawPreviewRef: { current: false },
      },
      sectionName: { editingLabelRef: { current: null } },
      shapeBuilder: {
        isVectorShapeBuilderBoxModeRef: { current: false },
        isVectorShapeBuilderSubtractRef: { current: false },
        touchedVectorShapeBuilderFacesRef: { current: {} },
        vectorShapeBuilderPathRef: { current: null },
      },
      slice: { sliceRef: { current: null } },
      transform: {
        alignmentGuideRef: { current: null },
        contactGuidesRef: { current: null },
        draggedNodeIdsRef: { current: null },
        resizedNodeIdsRef: { current: null },
        rotateDragRef: { current: null },
        rotatedNodeIdsRef: { current: null },
      },
      vectorCut: {
        newVectorCutVertexIdsRef: { current: new Set() },
        touchedVectorCutVertexIdsRef: { current: new Set() },
        vectorCutPreviewRef: { current: null },
      },
      vectorEdit: {
        lastVectorWidthHandleSideRef: { current: null },
        preVectorMarqueeSegmentIdsRef: { current: [] },
        preVectorMarqueeVertexIdsRef: { current: [] },
        selectedVectorHandlesRef: { current: [] },
        selectedVectorSegmentIdsRef: { current: [] },
        selectedVectorVertexIdsRef: { current: [] },
        selectedVectorWidthHandlesRef: { current: [] },
        snappedVectorHandleRef: { current: null },
        vectorAlignmentGuideRef: { current: null },
      },
      vectorErase: {
        eraseBrushCenterRef: { current: null },
        eraserDiameterRef: { current: ERASER_DEFAULT_DIAMETER_PX },
        vectorEraseStrokeRef: { current: null },
      },
      vectorMultiSelect: {
        vectorMultiDragRef: { current: null },
        vectorMultiSelectBoxRef: { current: null },
        vectorMultiSelectResizeDragRef: { current: null },
        vectorMultiSelectRotateDragRef: { current: null },
      },
      vectorPaint: {
        isVectorPaintRemoveRef: { current: false },
        touchedVectorPaintLoopKeysRef: { current: {} },
        vectorPaintPathRef: { current: null },
        vectorPaintTouchedFacesRef: { current: null },
      },
      vectorSnapshots: {
        draggedVectorFillFacesRef: { current: null },
        draggedVectorNodeSnapshotsRef: { current: null },
        resizedVectorNodeSnapshotsRef: { current: null },
        rotatedVectorNodeSnapshotsRef: { current: null },
      },
      vectorWidth: { editingWidthLabelRef: { current: null }, vectorWidthPointDragRef: { current: null } },
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
