// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';

export type TVectorHandleHit = { end: 'end' | 'start'; segmentId: string; vertexId: string };

export const getVectorHandleAtPoint = (point: TPoint, node: TVectorNode, tolerance: number): TVectorHandleHit | null => {
  const candidates = Object.values(node.segments)
    .flatMap((segment) => {
      const start = node.vertices[segment.startId];
      const end = node.vertices[segment.endId];
      const handleStart = getVectorHandlePosition(start, segment.tangentStart);
      const handleEnd = getVectorHandlePosition(end, segment.tangentEnd);
      const options: (TVectorHandleHit & { distance: number })[] = [];

      if (handleStart) {
        options.push({
          distance: Math.hypot(point.x - handleStart.x, point.y - handleStart.y),
          end: 'start',
          segmentId: segment.id,
          vertexId: segment.startId,
        });
      }

      if (handleEnd) {
        options.push({
          distance: Math.hypot(point.x - handleEnd.x, point.y - handleEnd.y),
          end: 'end',
          segmentId: segment.id,
          vertexId: segment.endId,
        });
      }

      return options;
    })
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? candidates[0] : null;
};
