// hooks
import { createVectorEditRefs } from './createVectorEditRefs';

describe('createVectorEditRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorEditRefs();

    // result
    expect(refs).toEqual({
      lastVectorWidthHandleSideRef: { current: null },
      preVectorMarqueeSegmentIdsRef: { current: [] },
      preVectorMarqueeVertexIdsRef: { current: [] },
      selectedVectorHandlesRef: { current: [] },
      selectedVectorSegmentIdsRef: { current: [] },
      selectedVectorVertexIdsRef: { current: [] },
      selectedVectorWidthHandlesRef: { current: [] },
      snappedVectorHandleRef: { current: null },
      vectorAlignmentGuideRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const selectedVectorVertexIdsRef = { current: ['v1'] };

    // before
    const refs = createVectorEditRefs({ selectedVectorVertexIdsRef });

    // result
    expect(refs.selectedVectorVertexIdsRef).toBe(selectedVectorVertexIdsRef);
    expect(refs.selectedVectorSegmentIdsRef).toEqual({ current: [] });
  });
});
