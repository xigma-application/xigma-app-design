// utils
import { getFlowReorderSelectionLine } from './getFlowReorderSelectionLine';
import { TFlowAxisMove } from './getFlowAxisMove';

export type TFlowReorderCandidate = { anchorId: string; position: 'after' | 'before' };

type TFlowAxisMoveKey = `${TFlowAxisMove['kind']}-${TFlowAxisMove['direction']}`;

export const getFlowReorderCandidate = (
  lineGroups: string[][],
  siblingLineGroups: string[][],
  orderedSelectedIds: string[],
  axisMove: TFlowAxisMove,
): TFlowReorderCandidate | null => {
  const flowIds = lineGroups.flat();
  const selectionLine = getFlowReorderSelectionLine(lineGroups, orderedSelectedIds);

  if (selectionLine) {
    const { firstIndex, lastIndex, lineEnd, lineIndex, lineStart } = selectionLine;
    const axisMoveKey: TFlowAxisMoveKey = `${axisMove.kind}-${axisMove.direction}`;

    switch (axisMoveKey) {
      case 'primary-1': {
        const anchorIndex = lastIndex + 1;
        return anchorIndex <= lineEnd ? { anchorId: flowIds[anchorIndex], position: 'after' } : null;
      }
      case 'primary--1': {
        const anchorIndex = firstIndex - 1;
        return anchorIndex >= lineStart ? { anchorId: flowIds[anchorIndex], position: 'before' } : null;
      }
      case 'cross-1': {
        const hasNextLine = lineIndex < lineGroups.length - 1;
        const targetLine = hasNextLine ? siblingLineGroups[lineIndex] : undefined;

        return targetLine ? { anchorId: targetLine[targetLine.length - 1], position: 'after' } : null;
      }
      default:
        return null;
    }
  }

  return null;
};
