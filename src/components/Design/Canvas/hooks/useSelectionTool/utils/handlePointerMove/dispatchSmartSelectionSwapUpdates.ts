// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getReorderedSwapPositions } from 'components/Design/Canvas/utils/getReorderedSwapPositions';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

export const dispatchSmartSelectionSwapUpdates = (dispatch: AppDispatch, dragState: TSmartSelectionSwapDragState): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    const positions = getReorderedSwapPositions(dragState.slots, dragState.fromIndex, dragState.targetIndex);

    dragState.slots.forEach(({ id, bounds }) => {
      const target = positions[id];
      const deltaX = (target ? target.x : bounds.x) - bounds.x;
      const deltaY = (target ? target.y : bounds.y) - bounds.y;

      dispatch(updateNode({ changes: getGeometryDeltaChanges(dragState.nodeOrigins[id], deltaX, deltaY), id }));
    });
  });
};
