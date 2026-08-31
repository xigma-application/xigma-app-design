// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { getMiterPoint } from './getMiterPoint';

export const collapseBridgeRun = (prevEdge: TLoopEdge, nextEdge: TLoopEdge): boolean => {
  const miterPoint = getMiterPoint(prevEdge, nextEdge);

  if (!miterPoint) {
    return false;
  }

  prevEdge.end = miterPoint;
  nextEdge.start = miterPoint;

  return true;
};
