// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getStarPoints } from 'utils/canvas/shapes/getStarPoints';

export const getStarVertexCountHandlePosition = (
  bounds: TDraftRect,
  points: number,
  ratio: number,
  flipX = false,
  flipY = false,
): TPoint => {
  const vertices = getStarPoints(bounds, points, ratio);
  const handleVertex = vertices[2];
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return flipPoint(handleVertex, center, flipX, flipY);
};
