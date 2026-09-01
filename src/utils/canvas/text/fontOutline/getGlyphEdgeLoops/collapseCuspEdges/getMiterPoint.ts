// types
import { TPoint } from 'types/canvas';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { getLineIntersection } from './getLineIntersection';

const MITER_LIMIT = 4;

const getOutgoingDirection = (edge: TLoopEdge): TPoint =>
  edge.tangentEnd ? { x: -edge.tangentEnd.x, y: -edge.tangentEnd.y } : { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };

const getIncomingDirection = (edge: TLoopEdge): TPoint =>
  edge.tangentStart ?? { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };

export const getMiterPoint = (prevEdge: TLoopEdge, nextEdge: TLoopEdge): TPoint | null => {
  const point = getLineIntersection(prevEdge.end, getOutgoingDirection(prevEdge), nextEdge.start, getIncomingDirection(nextEdge));

  if (!point) {
    return null;
  }

  const gapLength = Math.hypot(nextEdge.start.x - prevEdge.end.x, nextEdge.start.y - prevEdge.end.y);
  const distance = Math.hypot(point.x - prevEdge.end.x, point.y - prevEdge.end.y);

  return distance <= gapLength * MITER_LIMIT ? point : null;
};
