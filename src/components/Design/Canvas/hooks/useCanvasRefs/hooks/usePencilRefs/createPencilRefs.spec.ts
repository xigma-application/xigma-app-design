// hooks
import { createPencilRefs } from './createPencilRefs';

describe('createPencilRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createPencilRefs();

    // result
    expect(refs).toEqual({
      pencilPreviewPointsRef: { current: null },
      pencilRawPreviewPointsRef: { current: null },
      pencilShowRawPreviewRef: { current: false },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const pencilPreviewPointsRef = { current: [{ x: 1, y: 2 }] };

    // before
    const refs = createPencilRefs({ pencilPreviewPointsRef });

    // result
    expect(refs.pencilPreviewPointsRef).toBe(pencilPreviewPointsRef);
    expect(refs.pencilRawPreviewPointsRef).toEqual({ current: null });
  });
});
