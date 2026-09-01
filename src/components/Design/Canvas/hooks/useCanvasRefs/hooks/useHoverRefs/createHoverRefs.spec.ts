// hooks
import { createHoverRefs } from './createHoverRefs';

describe('createHoverRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createHoverRefs();

    // result
    expect(refs).toEqual({
      hoverRef: { current: null },
      hoveredEllipseArcHandleRef: { current: null },
      hoveredEllipseArcRotateHandleRef: { current: null },
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
