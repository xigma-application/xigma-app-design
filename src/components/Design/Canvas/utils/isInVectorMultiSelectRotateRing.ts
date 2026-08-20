// others
import { ROTATE_HANDLE_OUTER_RADIUS_PX } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getRectCorners } from 'utils/canvas/getRectCorners';
import { isPointInRect } from './isPointInRect';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isInVectorMultiSelectRotateRing = (point: TPoint, bounds: TDraftRect, viewport: TViewport, rotation: number): boolean => {
  const pivot: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotatePoint(point, pivot, -rotation);

  if (isPointInRect(localPoint, bounds)) {
    return false;
  }

  const outerRadius = ROTATE_HANDLE_OUTER_RADIUS_PX / viewport.zoom;

  return getRectCorners(bounds).some((corner) => Math.hypot(localPoint.x - corner.x, localPoint.y - corner.y) <= outerRadius);
};
