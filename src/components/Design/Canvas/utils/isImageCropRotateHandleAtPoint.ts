// types
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { isInRotateRing } from './getRotateHandleAtPoint';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isImageCropRotateHandleAtPoint = (point: TPoint, crop: TImageCrop, viewport: TViewport): boolean => {
  const center: TPoint = { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 };
  const testPoint = crop.rotation === 0 ? point : rotatePoint(point, center, -crop.rotation);

  return isInRotateRing(testPoint, crop, viewport);
};
