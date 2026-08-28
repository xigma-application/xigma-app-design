// hooks
import { createPenRefs } from './createPenRefs';

describe('createPenRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createPenRefs();

    // result
    expect(refs).toEqual({
      penDragOriginRef: { current: null },
      penDraggedHandleIsSnappedRef: { current: false },
      penDraggedHandlePositionRef: { current: null },
      penHoveredDragArmableVertexRef: { current: false },
      penNewVertexPreviewRef: { current: null },
      penPreviewRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const penPreviewRef = { current: null };

    // before
    const refs = createPenRefs({ penPreviewRef });

    // result
    expect(refs.penPreviewRef).toBe(penPreviewRef);
    expect(refs.penDragOriginRef).toEqual({ current: null });
  });
});
