// hooks
import { createHoverRefs } from './createHoverRefs';

describe('createHoverRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createHoverRefs();

    // result
    expect(refs).toEqual({
      hoverRef: { current: null },
      hoveredCornerRadiusHandleRef: { current: null },
      hoveredEllipseArcHandleRef: { current: null },
      hoveredEllipseArcRatioHandleRef: { current: null },
      hoveredEllipseArcRotateHandleRef: { current: null },
      hoveredPolygonCornerRadiusHandleRef: { current: null },
      hoveredPolygonVertexCountHandleRef: { current: null },
      hoveredSegmentIdRef: { current: null },
      hoveredSmartSelectionGapRef: { current: null },
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
      isSmartSelectionBoxHoveredRef: { current: false },
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
