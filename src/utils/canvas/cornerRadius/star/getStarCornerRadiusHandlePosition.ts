// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandlePositionFromVertices } from 'utils/canvas/cornerRadius/getCornerRadiusHandlePositionFromVertices';
import { getMaxStarCornerRadius } from './getMaxStarCornerRadius';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const getStarCornerRadiusHandlePosition = (
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  viewport: TViewport,
  flipX = false,
  flipY = false,
  isDragging = false,
): TPoint => {
  const vertices = getStarPoints(bounds, points, ratio);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const maxRadius = getMaxStarCornerRadius(bounds, points, ratio);

  return getCornerRadiusHandlePositionFromVertices(vertices, center, maxRadius, cornerRadius, viewport, flipX, flipY, isDragging);
};
