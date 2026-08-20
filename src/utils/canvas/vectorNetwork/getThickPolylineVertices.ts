// types
import { TPoint } from 'types/canvas';

// utils
import { getPolylineJoinVertices } from './getPolylineJoinVertices';
import { getPolylineSegmentOffset } from './getPolylineSegmentOffset';
import { getQuadVertices } from '../getQuadVertices';

export const getThickPolylineVertices = (points: TPoint[], halfWidth: number): number[] => {
  const offsets = points.slice(0, -1).map((point, index) => getPolylineSegmentOffset(point, points[index + 1], halfWidth));

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

    return getPolylineJoinVertices(points[index + 1], previousOffset, nextOffset, halfWidth);
  });

  return [...segmentVertices, ...joinVertices];
};
