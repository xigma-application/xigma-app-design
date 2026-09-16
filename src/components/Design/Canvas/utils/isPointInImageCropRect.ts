// types
import { TImageCrop } from 'types/design/paint/types';
import { TPoint } from 'types/canvas';

// utils
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { isPointInRect } from './isPointInRect';

export const isPointInImageCropRect = (point: TPoint, crop: TImageCrop): boolean => {
  const testPoint = getUnrotatedQueryPoint(point, crop, crop.rotation);
  return isPointInRect(testPoint, crop);
};
