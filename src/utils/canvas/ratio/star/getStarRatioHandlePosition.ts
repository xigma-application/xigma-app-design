// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxStarCornerRadius } from 'utils/canvas/cornerRadius/star/getMaxStarCornerRadius';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';
import { getVertexCountHandlePositionFromVertices } from 'utils/canvas/vertexCount/getVertexCountHandlePositionFromVertices';

export const getStarRatioHandlePosition = (
  bounds: TDraftRect,
  points: number,
  ratio: number,
  cornerRadius: number,
  flipX = false,
  flipY = false,
): TPoint => {
  const vertices = getStarPoints(bounds, points, ratio);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const maxRadius = getMaxStarCornerRadius(bounds, points, ratio);

  return getVertexCountHandlePositionFromVertices(vertices, 1, center, cornerRadius, maxRadius, flipX, flipY);
};
