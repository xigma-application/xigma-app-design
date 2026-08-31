// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

// utils
import { collapseBridgeRun } from './collapseBridgeRun';
import { findStraightRunEnd } from './findStraightRunEnd';
import { isDegenerateBridgeRun } from './isDegenerateBridgeRun';
import { isStraightEdge } from './isStraightEdge';

export const collapseCuspEdges = (edges: TLoopEdge[]): TLoopEdge[] => {
  const count = edges.length;
  const result = edges.map((edge) => ({ ...edge }));
  const toRemove = new Set<number>();
  let index = 0;

  while (index < count) {
    if (toRemove.has(index) || !isStraightEdge(result[index])) {
      index += 1;
      continue;
    }

    const runEnd = findStraightRunEnd(result, index);
    const prevIndex = (index - 1 + count) % count;
    const nextIndex = (runEnd + 1) % count;
    const runSpansWholeLoop = prevIndex === runEnd || nextIndex === index;

    if (!runSpansWholeLoop && isDegenerateBridgeRun(result, index, runEnd, result[prevIndex], result[nextIndex])) {
      if (collapseBridgeRun(result[prevIndex], result[nextIndex])) {
        for (let i = index; i <= runEnd; i += 1) {
          toRemove.add(i);
        }
      }
    }

    index = runEnd + 1;
  }

  return result.filter((_, i) => !toRemove.has(i));
};
