// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getSegmentMidpoint } from './getSegmentMidpoint';

export const getVectorSegmentMidpointAtPoint = (point: TPoint, node: TVectorNode, tolerance: number): { segmentId: string } | null => {
  const candidates = Object.values(node.segments)
    .map((segment) => {
      const midpoint = getSegmentMidpoint(
        node.vertices[segment.startId],
        node.vertices[segment.endId],
        segment.tangentStart,
        segment.tangentEnd,
      );

      return { distance: Math.hypot(point.x - midpoint.x, point.y - midpoint.y), segmentId: segment.id };
    })
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { segmentId: candidates[0].segmentId } : null;
};
