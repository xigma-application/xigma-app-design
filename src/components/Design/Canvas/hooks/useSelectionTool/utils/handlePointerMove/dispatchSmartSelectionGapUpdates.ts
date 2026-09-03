// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';

// utils
import { getGeometryDeltaChanges } from '../../../../utils/getGeometryDeltaChanges';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

export const dispatchSmartSelectionGapUpdates = (dispatch: AppDispatch, dragState: TSmartSelectionGapDragState, newGap: number): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    let previousEnd = dragState.anchorPosition + dragState.anchorSize;

    dragState.cascadeGroups.forEach((group) => {
      const newPosition = previousEnd + newGap;
      const positionDelta = newPosition - group.originalPosition;
      const deltaX = dragState.axis === 'x' ? positionDelta : 0;
      const deltaY = dragState.axis === 'y' ? positionDelta : 0;

      group.nodeIds.forEach((id) => {
        dispatch(updateNode({ changes: getGeometryDeltaChanges(dragState.nodeOrigins[id], deltaX, deltaY), id }));
      });

      previousEnd = newPosition + group.size;
    });
  });
};
