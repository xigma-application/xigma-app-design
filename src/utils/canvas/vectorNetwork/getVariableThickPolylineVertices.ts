// types
import { TPoint } from 'types/canvas';

// utils
import { getPolylineSegmentOffset } from './getPolylineSegmentOffset';
import { getQuadVertices } from '../getQuadVertices';

export const getVariableThickPolylineVertices = (points: TPoint[], leftOffsets: number[], rightOffsets: number[]): number[] => {
  const normals = points.slice(0, -1).map((point, index) => getPolylineSegmentOffset(point, points[index + 1], 1));

  const segmentVertices = normals.flatMap((normal, index) => {
    if (normal) {
      const point = points[index];
      const next = points[index + 1];
      const leftAtPoint = leftOffsets[index];
      const leftAtNext = leftOffsets[index + 1];
      const rightAtPoint = rightOffsets[index];
      const rightAtNext = rightOffsets[index + 1];

      return getQuadVertices(
        point.x + normal.x * leftAtPoint,
        point.y + normal.y * leftAtPoint,
        next.x + normal.x * leftAtNext,
        next.y + normal.y * leftAtNext,
        next.x - normal.x * rightAtNext,
        next.y - normal.y * rightAtNext,
        point.x - normal.x * rightAtPoint,
        point.y - normal.y * rightAtPoint,
      );
    }

    return [];
  });

  const joinVertices = normals.slice(0, -1).flatMap((previousNormal, index) => {
    const nextNormal = normals[index + 1];

    if (previousNormal && nextNormal) {
      const point = points[index + 1];
      const leftOffset = leftOffsets[index + 1];
      const rightOffset = rightOffsets[index + 1];

      return [
        point.x,
        point.y,
        point.x + previousNormal.x * leftOffset,
        point.y + previousNormal.y * leftOffset,
        point.x + nextNormal.x * leftOffset,
        point.y + nextNormal.y * leftOffset,
        point.x,
        point.y,
        point.x - previousNormal.x * rightOffset,
        point.y - previousNormal.y * rightOffset,
        point.x - nextNormal.x * rightOffset,
        point.y - nextNormal.y * rightOffset,
      ];
    }

    return [];
  });

  return [...segmentVertices, ...joinVertices];
};
