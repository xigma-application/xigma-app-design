// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSmartSelectionCascadeSetup } from './getSmartSelectionCascadeGroups';

// utils
import { getGeometryDeltaChanges } from './getGeometryDeltaChanges';

export const computeSmartSelectionCascadeDeltas = (cascade: TSmartSelectionCascadeSetup, newGap: number): Record<string, number> => {
  let previousEnd = cascade.anchorPosition + cascade.anchorSize;
  const deltas: Record<string, number> = {};

  cascade.cascadeGroups.forEach((group) => {
    const newPosition = previousEnd + newGap;
    const positionDelta = newPosition - group.originalPosition;

    group.nodeIds.forEach((id) => {
      deltas[id] = positionDelta;
    });

    previousEnd = newPosition + group.size;
  });

  return deltas;
};

export const applySmartSelectionGapCascade = (
  dispatch: AppDispatch,
  cascade: TSmartSelectionCascadeSetup,
  axis: 'x' | 'y',
  nodeOrigins: Record<string, TNodeOrigin>,
  newGap: number,
): void => {
  const deltas = computeSmartSelectionCascadeDeltas(cascade, newGap);

  Object.entries(deltas).forEach(([id, positionDelta]) => {
    const deltaX = axis === 'x' ? positionDelta : 0;
    const deltaY = axis === 'y' ? positionDelta : 0;

    dispatch(updateNode({ changes: getGeometryDeltaChanges(nodeOrigins[id], deltaX, deltaY), id }));
  });
};
