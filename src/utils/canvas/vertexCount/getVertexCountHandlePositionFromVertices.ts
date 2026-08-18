// types
import { TPoint } from 'types/canvas';

// utils
import { flipPoint } from 'utils/math/flipPoint';
import { getCornerRadiusHandleSetbackMultiplier } from 'utils/canvas/cornerRadius/getCornerRadiusHandleSetbackMultiplier';
import { getVertexAngles } from 'utils/math/getVertexAngles';
import { normalizeVector } from 'utils/math/normalizeVector';

export const getVertexCountHandlePositionFromVertices = (
  vertices: TPoint[],
  handleIndex: number,
  center: TPoint,
  cornerRadius: number,
  maxRadius: number,
  flipX = false,
  flipY = false,
): TPoint => {
  const handleVertex = vertices[handleIndex];
  const previous = vertices[(handleIndex - 1 + vertices.length) % vertices.length];
  const next = vertices[(handleIndex + 1) % vertices.length];
  const toPrevious = normalizeVector({ x: previous.x - handleVertex.x, y: previous.y - handleVertex.y });
  const toNext = normalizeVector({ x: next.x - handleVertex.x, y: next.y - handleVertex.y });
  const bisector = normalizeVector({ x: toPrevious.x + toNext.x, y: toPrevious.y + toNext.y });
  const setbackMultiplier = getCornerRadiusHandleSetbackMultiplier(getVertexAngles(vertices)[handleIndex]);
  const roundedOffset = Math.min(cornerRadius, maxRadius) * (setbackMultiplier - 1);
  const roundedVertex: TPoint = { x: handleVertex.x + bisector.x * roundedOffset, y: handleVertex.y + bisector.y * roundedOffset };

  return flipPoint(roundedVertex, center, flipX, flipY);
};
