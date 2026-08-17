// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getPolygonPoints } from 'utils/canvas/shapes/getPolygonPoints';

export const getPolygonVertexCountHandlePosition = (bounds: TDraftRect, sides: number, flipX = false, flipY = false): TPoint => {
  const [, handleVertex] = getPolygonPoints(bounds, sides);
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return flipPoint(handleVertex, center, flipX, flipY);
};
