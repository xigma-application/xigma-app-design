// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';
import { getVertexCountHandlePositionFromVertices } from 'utils/canvas/vertexCount/getVertexCountHandlePositionFromVertices';

export const getPolygonVertexCountHandlePosition = (
  bounds: TDraftRect,
  sides: number,
  cornerRadius: number,
  flipX = false,
  flipY = false,
): TPoint => {
  const vertices = getPolygonPoints(bounds, sides);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const maxRadius = getMaxPolygonCornerRadius(bounds, sides);

  return getVertexCountHandlePositionFromVertices(vertices, 1, center, cornerRadius, maxRadius, flipX, flipY);
};
