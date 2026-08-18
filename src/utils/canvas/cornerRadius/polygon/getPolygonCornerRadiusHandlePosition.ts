// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getCornerRadiusHandlePositionFromVertices } from 'utils/canvas/cornerRadius/getCornerRadiusHandlePositionFromVertices';
import { getMaxPolygonCornerRadius } from './getMaxPolygonCornerRadius';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

export const getPolygonCornerRadiusHandlePosition = (
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  viewport: TViewport,
  flipX = false,
  flipY = false,
  isDragging = false,
): TPoint => {
  const vertices = getPolygonPoints(bounds, sides);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const maxRadius = getMaxPolygonCornerRadius(bounds, sides);

  return getCornerRadiusHandlePositionFromVertices(vertices, center, maxRadius, cornerRadius, viewport, flipX, flipY, isDragging);
};
