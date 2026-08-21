// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

export const getVectorHalfEdgeAngle = (segment: TVectorSegment, from: TVectorVertex, to: TVectorVertex): number => {
  const forward = segment.startId === from.id;
  const tangent = forward ? segment.tangentStart : segment.tangentEnd;
  const direction: TPoint = tangent ?? { x: to.x - from.x, y: to.y - from.y };

  return Math.atan2(direction.y, direction.x);
};
