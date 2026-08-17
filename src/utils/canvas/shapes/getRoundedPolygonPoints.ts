// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getMaxPolygonCornerRadius } from 'utils/canvas/cornerRadius/polygon/getMaxPolygonCornerRadius';
import { getPolygonPoints } from './getPolygonPoints';
import { getPolygonVertexAngles } from 'utils/canvas/cornerRadius/polygon/getPolygonVertexAngles';
import { normalizeVector } from 'utils/math/normalizeVector';

export type TRoundedPolygon = TDraftRect & { cornerRadius: number; sides: number };

const rotateVector = (vector: TPoint, angle: number): TPoint => ({
  x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
  y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
});

const getVertexArcPoints = (vertex: TPoint, previous: TPoint, next: TPoint, angle: number, radius: number, segments: number): TPoint[] => {
  const toPrevious = normalizeVector({ x: previous.x - vertex.x, y: previous.y - vertex.y });
  const toNext = normalizeVector({ x: next.x - vertex.x, y: next.y - vertex.y });
  const halfAngle = angle / 2;
  const tangentLength = radius / Math.tan(halfAngle);
  const bisectorLength = radius / Math.sin(halfAngle);
  const bisector = normalizeVector({ x: toPrevious.x + toNext.x, y: toPrevious.y + toNext.y });
  const center: TPoint = { x: vertex.x + bisector.x * bisectorLength, y: vertex.y + bisector.y * bisectorLength };
  const tangentToPrevious: TPoint = { x: vertex.x + toPrevious.x * tangentLength, y: vertex.y + toPrevious.y * tangentLength };
  const tangentToNext: TPoint = { x: vertex.x + toNext.x * tangentLength, y: vertex.y + toNext.y * tangentLength };
  const start: TPoint = { x: tangentToPrevious.x - center.x, y: tangentToPrevious.y - center.y };
  const end: TPoint = { x: tangentToNext.x - center.x, y: tangentToNext.y - center.y };
  const sweep = Math.atan2(start.x * end.y - start.y * end.x, start.x * end.x + start.y * end.y);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const rotated = rotateVector(start, (index / segments) * sweep);

    return { x: center.x + rotated.x, y: center.y + rotated.y };
  });
};

export const getRoundedPolygonPoints = (polygon: TRoundedPolygon, segmentsPerVertex: number): TPoint[] => {
  const vertices = getPolygonPoints(polygon, polygon.sides);
  const angles = getPolygonVertexAngles(vertices);
  const radius = Math.min(Math.max(polygon.cornerRadius, 0), getMaxPolygonCornerRadius(polygon, polygon.sides));

  return vertices.flatMap((vertex, index) => {
    const previous = vertices[(index - 1 + vertices.length) % vertices.length];
    const next = vertices[(index + 1) % vertices.length];

    return getVertexArcPoints(vertex, previous, next, angles[index], radius, segmentsPerVertex);
  });
};
