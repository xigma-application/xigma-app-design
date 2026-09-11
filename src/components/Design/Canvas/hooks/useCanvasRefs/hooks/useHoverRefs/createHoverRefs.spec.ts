// hooks
import { createHoverRefs } from './createHoverRefs';

describe('createHoverRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createHoverRefs();

    // result
    expect(refs).toEqual({
      editingGridTrackValueRef: { current: null },
      hoverRef: { current: null },
      hoveredAutoLayoutGapRef: { current: null },
      hoveredAutoLayoutPaddingBandsRef: { current: null },
      hoveredAutoLayoutPaddingRef: { current: null },
      hoveredCornerRadiusHandleRef: { current: null },
      hoveredEllipseArcHandleRef: { current: null },
      hoveredEllipseArcRatioHandleRef: { current: null },
      hoveredEllipseArcRotateHandleRef: { current: null },
      hoveredGridTrackAffordanceRef: { current: null },
      hoveredPolygonCornerRadiusHandleRef: { current: null },
      hoveredPolygonVertexCountHandleRef: { current: null },
      hoveredSegmentIdRef: { current: null },
      hoveredSmartSelectionGapRef: { current: null },
      hoveredSmartSelectionSwapRef: { current: null },
      hoveredStarCornerRadiusHandleRef: { current: null },
      hoveredStarRatioHandleRef: { current: null },
      hoveredStarVertexCountHandleRef: { current: null },
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
      isAutoLayoutGapAreaHoveredRef: { current: false },
      isAutoLayoutPaddingAreaHoveredRef: { current: false },
      isSmartSelectionBoxHoveredRef: { current: false },
      rightPanelPaddingGuideRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const hoverRef = { current: 'node-1' };

    // before
    const refs = createHoverRefs({ hoverRef });

    // result
    expect(refs.hoverRef).toBe(hoverRef);
    expect(refs.hoveredSegmentIdRef).toEqual({ current: null });
  });
});
