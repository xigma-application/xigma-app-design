// types
import { TImageCrop } from 'types/design/paint/types';
import { TPoint, TResizeHandle } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getHandleAtBounds } from './getResizeHandleAtPoint/getHandleAtBounds';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';

export const getImageCropResizeHandleAtPoint = (point: TPoint, crop: TImageCrop, viewport: TViewport): TResizeHandle | null => {
  const testPoint = getUnrotatedQueryPoint(point, crop, crop.rotation);
  return getHandleAtBounds(testPoint, crop, viewport);
};
