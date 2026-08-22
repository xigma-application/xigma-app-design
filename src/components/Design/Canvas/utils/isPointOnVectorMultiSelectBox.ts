// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getVectorMultiSelectResizeHandle } from './getVectorMultiSelectResizeHandle';
import { isInVectorMultiSelectRotateRing } from './isInVectorMultiSelectRotateRing';
import { isPointInRect } from './isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isPointOnVectorMultiSelectBox = (point: TPoint, bounds: TDraftRect, viewport: TViewport, rotation: number): boolean => {
  if (
    getVectorMultiSelectResizeHandle(point, bounds, viewport, rotation) ||
    isInVectorMultiSelectRotateRing(point, bounds, viewport, rotation)
  ) {
    return true;
  }

  const pivot = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotatePoint(point, pivot, -rotation);

  return isPointInRect(localPoint, bounds);
};
