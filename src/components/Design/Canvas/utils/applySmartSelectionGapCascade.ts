// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TNodeOrigin } from 'types/design/selectionTool/types';
import { TSmartSelectionCascadeSetup } from './getSmartSelectionCascadeGroups';

// utils
import { getGeometryDeltaChanges } from './getGeometryDeltaChanges';

export const applySmartSelectionGapCascade = (
  dispatch: AppDispatch,
  cascade: TSmartSelectionCascadeSetup,
  axis: 'x' | 'y',
  nodeOrigins: Record<string, TNodeOrigin>,
  newGap: number,
): void => {
  let previousEnd = cascade.anchorPosition + cascade.anchorSize;

  cascade.cascadeGroups.forEach((group) => {
    const newPosition = previousEnd + newGap;
    const positionDelta = newPosition - group.originalPosition;
    const deltaX = axis === 'x' ? positionDelta : 0;
    const deltaY = axis === 'y' ? positionDelta : 0;

    group.nodeIds.forEach((id) => {
      dispatch(updateNode({ changes: getGeometryDeltaChanges(nodeOrigins[id], deltaX, deltaY), id }));
    });

    previousEnd = newPosition + group.size;
  });
};
