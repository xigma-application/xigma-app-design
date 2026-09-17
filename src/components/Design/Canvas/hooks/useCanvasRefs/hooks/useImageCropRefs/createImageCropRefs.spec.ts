// hooks
import { createImageCropRefs } from './createImageCropRefs';

describe('createImageCropRefs behaviors', () => {
  it('should default every ref to an empty ref object', () => {
    // before
    const refs = createImageCropRefs();

    // result
    expect(refs).toEqual({
      imageCropMoveDragRef: { current: null },
      imageCropResizeDragRef: { current: null },
      imageCropRotateDragRef: { current: null },
      imageTileScaleDragRef: { current: null },
    });
  });

  it('should apply overrides on top of the defaults', () => {
    // mock
    const imageCropMoveDragRef = { current: null };

    // before
    const refs = createImageCropRefs({ imageCropMoveDragRef });

    // result
    expect(refs.imageCropMoveDragRef).toBe(imageCropMoveDragRef);
  });
});
