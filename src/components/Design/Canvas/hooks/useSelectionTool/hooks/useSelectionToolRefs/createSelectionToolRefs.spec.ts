// hooks
import { createSelectionToolRefs } from './createSelectionToolRefs';

describe('createSelectionToolRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createSelectionToolRefs();

    // result
    expect(refs).toEqual({
      dragStateRef: { current: null },
      endpointDragRef: { current: null },
      marqueeStartRef: { current: null },
      pathOffsetDragRef: { current: null },
      pendingVectorCornerHandleDragRef: { current: null },
      polygonVertexCountDragRef: { current: null },
      resizeDragRef: { current: null },
      starRatioDragRef: { current: null },
      starVertexCountDragRef: { current: null },
      vectorCutDragRef: { current: null },
      vectorHandleDragRef: { current: null },
      vectorMarqueeModeRef: { current: null },
      vectorMarqueeStartRef: { current: null },
      vectorSegmentBendDragRef: { current: null },
      vectorVertexDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const dragStateRef = { current: null };

    // before
    const refs = createSelectionToolRefs({ dragStateRef });

    // result
    expect(refs.dragStateRef).toBe(dragStateRef);
    expect(refs.resizeDragRef).toEqual({ current: null });
  });
});
