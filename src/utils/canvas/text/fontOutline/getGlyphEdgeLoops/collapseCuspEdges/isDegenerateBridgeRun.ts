// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { getEdgeLength } from './getEdgeLength';
import { isStraightEdge } from './isStraightEdge';
import { MAX_BRIDGE_RATIO } from './constants';

export const isDegenerateBridgeRun = (
  edges: TLoopEdge[],
  runStart: number,
  runEnd: number,
  prevEdge: TLoopEdge,
  nextEdge: TLoopEdge,
): boolean => {
  if (isStraightEdge(prevEdge) || isStraightEdge(nextEdge)) {
    return false;
  }

  let runLength = 0;

  for (let i = runStart; i <= runEnd; i += 1) {
    runLength += getEdgeLength(edges[i]);
  }

  const flankAverage = (getEdgeLength(prevEdge) + getEdgeLength(nextEdge)) / 2;

  return runLength < flankAverage * MAX_BRIDGE_RATIO;
};
