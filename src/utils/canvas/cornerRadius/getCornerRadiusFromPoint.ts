// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxCornerRadius } from './getMaxCornerRadius';

export const getCornerRadiusFromPoint = (point: TPoint, bounds: TDraftRect, corner: TCornerRadiusHandle): number => {
  const horizontalInset = corner === 'nw' || corner === 'sw' ? point.x - bounds.x : bounds.x + bounds.width - point.x;
  const verticalInset = corner === 'nw' || corner === 'ne' ? point.y - bounds.y : bounds.y + bounds.height - point.y;
  const radius = Math.max(horizontalInset, verticalInset);

  return Math.min(Math.max(radius, 0), getMaxCornerRadius(bounds));
};
