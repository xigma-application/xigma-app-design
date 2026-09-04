// hooks
import { createTransformRefs } from './createTransformRefs';

describe('createTransformRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createTransformRefs();

    // result
    expect(refs).toEqual({
      alignmentGuideRef: { current: null },
      aspectRatioLockGuideRef: { current: null },
      autoLayoutDropTargetRef: { current: null },
      contactGuidesRef: { current: null },
      distanceGuidesRef: { current: null },
      draggedNodeIdsRef: { current: null },
      dropTargetFrameIdRef: { current: null },
      equalSpacingGuidesRef: { current: null },
      matchedPairGuidesRef: { current: null },
      resizedNodeIdsRef: { current: null },
      rotateDragRef: { current: null },
      rotatedNodeIdsRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const draggedNodeIdsRef = { current: new Set(['n1']) };

    // before
    const refs = createTransformRefs({ draggedNodeIdsRef });

    // result
    expect(refs.draggedNodeIdsRef).toBe(draggedNodeIdsRef);
    expect(refs.rotateDragRef).toEqual({ current: null });
  });
});
