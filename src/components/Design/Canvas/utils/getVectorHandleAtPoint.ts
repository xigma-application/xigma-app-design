// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';
import { isVectorSegmentEndpointSelected } from 'utils/canvas/vectorNetwork/isVectorSegmentEndpointSelected';

export type TVectorHandleHit = { end: 'end' | 'start'; segmentId: string; vertexId: string };

export const getVectorHandleAtPoint = (
  point: TPoint,
  node: TVectorNode,
  tolerance: number,
  selectedVertexIds: string[],
  oneHopVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
): TVectorHandleHit | null => {
  const isHandleSelected = (segmentId: string, end: 'end' | 'start'): boolean =>
    selectedHandles.some((selected) => selected.segmentId === segmentId && selected.end === end);

  const candidates = Object.values(node.segments)
    .flatMap((segment) => {
      const start = node.vertices[segment.startId];
      const end = node.vertices[segment.endId];
      const handleStart = getVectorHandlePosition(start, getEffectiveTangentStart(node.vertices, segment));
      const handleEnd = getVectorHandlePosition(end, getEffectiveTangentEnd(node.vertices, segment));
      const isSegmentDirectlyTouchingSelection = isVectorSegmentEndpointSelected(segment.startId, segment.endId, selectedVertexIds);
      const options: (TVectorHandleHit & { distance: number })[] = [];

      if (
        handleStart &&
        (isSegmentDirectlyTouchingSelection || oneHopVertexIds.includes(segment.startId) || isHandleSelected(segment.id, 'start'))
      ) {
        options.push({
          distance: Math.hypot(point.x - handleStart.x, point.y - handleStart.y),
          end: 'start',
          segmentId: segment.id,
          vertexId: segment.startId,
        });
      }

      if (
        handleEnd &&
        (isSegmentDirectlyTouchingSelection || oneHopVertexIds.includes(segment.endId) || isHandleSelected(segment.id, 'end'))
      ) {
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
