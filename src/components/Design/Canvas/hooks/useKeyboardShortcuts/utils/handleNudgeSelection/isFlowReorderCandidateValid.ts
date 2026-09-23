// utils
import { TFlowAxisMove } from './getFlowAxisMove';

const isBlockPlacementValid = (line: string[], orderedSelectedIds: string[], axisMove: TFlowAxisMove): boolean => {
  if (axisMove.direction !== -1) {
    const prefixSlice = line.slice(0, orderedSelectedIds.length);
    return orderedSelectedIds.every((id, index) => prefixSlice[index] === id);
  }

  return true;
};

export const isFlowReorderCandidateValid = (
  candidateLineGroups: string[][],
  orderedSelectedIds: string[],
  axisMove: TFlowAxisMove,
): boolean => {
  if (axisMove.kind !== 'primary') {
    const line = candidateLineGroups.find((candidateLine) => candidateLine.includes(orderedSelectedIds[0]));
    const isWholeBlockInOneLine = line !== undefined && orderedSelectedIds.every((id) => line.includes(id));

    if (line && isWholeBlockInOneLine) {
      return isBlockPlacementValid(line, orderedSelectedIds, axisMove);
    }

    return false;
  }

  return true;
};
