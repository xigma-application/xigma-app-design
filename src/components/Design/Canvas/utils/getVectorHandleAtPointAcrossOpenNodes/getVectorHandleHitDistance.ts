// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';
import { TVectorHandleHit } from '../getVectorHandleAtPoint';

export const getVectorHandleHitDistance = (bakedNode: TVectorNode, hit: TVectorHandleHit, point: TPoint): number => {
  const segment = bakedNode.segments[hit.segmentId];
  const handlePosition = (
    hit.end === 'start'
      ? getVectorHandlePosition(bakedNode.vertices[segment.startId], getEffectiveTangentStart(bakedNode.vertices, segment))
      : getVectorHandlePosition(bakedNode.vertices[segment.endId], getEffectiveTangentEnd(bakedNode.vertices, segment))
  ) as TPoint;

  return Math.hypot(point.x - handlePosition.x, point.y - handlePosition.y);
};
