// types
import { TPoint } from 'types/canvas';

// utils
import { getQuadVertices } from '../getQuadVertices';

const getSegmentOffset = (from: TPoint, to: TPoint, halfWidth: number): TPoint | null => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return null;
  }

  return { x: (-dy / length) * halfWidth, y: (dx / length) * halfWidth };
};

const getJoinVertices = (point: TPoint, previousOffset: TPoint, nextOffset: TPoint): number[] =>
  getQuadVertices(
    point.x + previousOffset.x,
    point.y + previousOffset.y,
    point.x + nextOffset.x,
    point.y + nextOffset.y,
    point.x - nextOffset.x,
    point.y - nextOffset.y,
    point.x - previousOffset.x,
    point.y - previousOffset.y,
  );

export const getThickPolylineVertices = (points: TPoint[], halfWidth: number): number[] => {
  const offsets = points.slice(0, -1).map((point, index) => getSegmentOffset(point, points[index + 1], halfWidth));

  const segmentVertices = offsets.flatMap((offset, index) => {
    if (!offset) {
      return [];
    }

    const point = points[index];
    const next = points[index + 1];

    return getQuadVertices(
      point.x + offset.x,
      point.y + offset.y,
      next.x + offset.x,
      next.y + offset.y,
      next.x - offset.x,
      next.y - offset.y,
      point.x - offset.x,
      point.y - offset.y,
    );
  });

  const joinVertices = offsets.slice(0, -1).flatMap((previousOffset, index) => {
    const nextOffset = offsets[index + 1];

    if (!previousOffset || !nextOffset) {
      return [];
    }

    return getJoinVertices(points[index + 1], previousOffset, nextOffset);
  });

  return [...segmentVertices, ...joinVertices];
};
