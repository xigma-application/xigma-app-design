// types
import { TPoint } from 'types/canvas';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { getLineIntersection } from './getLineIntersection';

const getOutgoingDirection = (edge: TLoopEdge): TPoint =>
  edge.tangentEnd ? { x: -edge.tangentEnd.x, y: -edge.tangentEnd.y } : { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };

const getIncomingDirection = (edge: TLoopEdge): TPoint =>
  edge.tangentStart ?? { x: edge.end.x - edge.start.x, y: edge.end.y - edge.start.y };

export const getMiterPoint = (prevEdge: TLoopEdge, nextEdge: TLoopEdge): TPoint | null =>
  getLineIntersection(prevEdge.end, getOutgoingDirection(prevEdge), nextEdge.start, getIncomingDirection(nextEdge));
