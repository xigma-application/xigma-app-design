// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { isStraightEdge } from './isStraightEdge';

export const findStraightRunEnd = (edges: TLoopEdge[], start: number): number => {
  let end = start;

  while (end + 1 < edges.length && isStraightEdge(edges[end + 1])) {
    end += 1;
  }

  return end;
};
