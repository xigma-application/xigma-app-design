// hooks
import { createVectorEraseRefs } from './createVectorEraseRefs';

// others
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

describe('createVectorEraseRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createVectorEraseRefs();

    // result
    expect(refs).toEqual({
      eraseBrushCenterRef: { current: null },
      eraserDiameterRef: { current: ERASER_DEFAULT_DIAMETER_PX },
      vectorEraseStrokeRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const eraserDiameterRef = { current: 42 };

    // before
    const refs = createVectorEraseRefs({ eraserDiameterRef });

    // result
    expect(refs.eraserDiameterRef).toBe(eraserDiameterRef);
    expect(refs.vectorEraseStrokeRef).toEqual({ current: null });
  });
});
