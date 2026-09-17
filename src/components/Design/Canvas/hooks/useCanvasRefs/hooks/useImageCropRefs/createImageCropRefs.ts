// types
import { TImageCropRefs } from 'types/design/canvas/types';

export const createImageCropRefs = (overrides: Partial<TImageCropRefs> = {}): TImageCropRefs => ({
  imageCropMoveDragRef: { current: null },
  imageCropResizeDragRef: { current: null },
  imageCropRotateDragRef: { current: null },
  imageTileScaleDragRef: { current: null },
  ...overrides,
});
