// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { TVectorHandleHit } from './getVectorHandleAtPoint';

export const getVectorCornerHandleAtPoint = (point: TPoint, node: TVectorNode, tolerance: number): TVectorHandleHit | null => {
  const candidates = Object.values(node.vertices)
    .map((vertex) => ({ distance: Math.hypot(point.x - vertex.x, point.y - vertex.y), vertex }))
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  const nearest = candidates[0];

  if (nearest) {
    const touchingSegments = Object.values(node.segments).filter(
      (segment) => segment.startId === nearest.vertex.id || segment.endId === nearest.vertex.id,
    );
    const segment =
      touchingSegments.find(
        (candidate) =>
          (candidate.endId === nearest.vertex.id && !candidate.tangentEnd) ||
          (candidate.startId === nearest.vertex.id && !candidate.tangentStart),
      ) ?? touchingSegments[0];

    if (segment) {
      return { end: segment.endId === nearest.vertex.id ? 'end' : 'start', segmentId: segment.id, vertexId: nearest.vertex.id };
    }
  }

  return null;
};
