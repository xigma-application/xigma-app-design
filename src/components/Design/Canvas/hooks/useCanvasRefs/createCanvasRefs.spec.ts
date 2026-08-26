// hooks
import { createCanvasRefs } from './createCanvasRefs';

describe('createCanvasRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createCanvasRefs();

    // result
    expect(refs).toEqual({
      canvasRef: { current: null },
      cornerRadiusDragRef: { current: null },
      draftRef: { current: null },
      draggedNodeIdsRef: { current: null },
      draggedVectorFillFacesRef: { current: null },
      draggedVectorNodeSnapshotsRef: { current: null },
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
      hoveredVectorWidthPointRef: { current: null },
      isVectorShapeBuilderBoxModeRef: { current: false },
      isVectorShapeBuilderSubtractRef: { current: false },
      lastVectorWidthHandleSideRef: { current: null },
      marqueeRef: { current: null },
      newVectorCutVertexIdsRef: { current: new Set() },
      penDragOriginRef: { current: null },
      penDraggedHandleIsSnappedRef: { current: false },
      penDraggedHandlePositionRef: { current: null },
      penHoveredDragArmableVertexRef: { current: false },
      penNewVertexPreviewRef: { current: null },
      penPreviewRef: { current: null },
      pencilPreviewPointsRef: { current: null },
      pencilRawPreviewPointsRef: { current: null },
      pencilShowRawPreviewRef: { current: false },
      polygonCornerRadiusDragRef: { current: null },
      preVectorMarqueeSegmentIdsRef: { current: [] },
      preVectorMarqueeVertexIdsRef: { current: [] },
      rotateDragRef: { current: null },
      selectedVectorHandlesRef: { current: [] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: [] },
      selectedVectorWidthHandlesRef: { current: [] },
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
      vectorWidthPointDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const canvas = document.createElement('canvas');
    const canvasRef = { current: canvas };

    // before
    const refs = createCanvasRefs({ canvasRef });

    // result
    expect(refs.canvasRef).toBe(canvasRef);
    expect(refs.draftRef).toEqual({ current: null });
  });
});
