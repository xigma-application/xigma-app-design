// store
import { updateNodes } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getReorderedSwapPositions } from 'components/Design/Canvas/utils/getReorderedSwapPositions';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';

const dispatchNonEmptyUpdates = (dispatch: AppDispatch, updates: Parameters<typeof updateNodes>[0]): void => {
  if (updates.length > 0) {
    dispatch(updateNodes(updates));
  }
};

const getSwapUpdates = (
  dragState: TSmartSelectionSwapDragState,
  draggedId: string | null,
  positions: ReturnType<typeof getReorderedSwapPositions>,
  draggedDeltaX: number,
  draggedDeltaY: number,
): Parameters<typeof updateNodes>[0] =>
  dragState.slots.flatMap(({ id, bounds }) => {
    if (id !== null) {
      const isDragged = id === draggedId;
      const deltaX = isDragged ? draggedDeltaX : (positions[id]?.x ?? bounds.x) - bounds.x;
      const deltaY = isDragged ? draggedDeltaY : (positions[id]?.y ?? bounds.y) - bounds.y;

      return (dragState.slotNodeIds[id] ?? [id]).map((nodeId) => ({
        changes: getGeometryDeltaChanges(dragState.nodeOrigins[nodeId], deltaX, deltaY),
        id: nodeId,
      }));
    }

    return [];
  });

export const dispatchSmartSelectionSwapUpdates = (
  dispatch: AppDispatch,
  dragState: TSmartSelectionSwapDragState,
  draggedDeltaX: number,
  draggedDeltaY: number,
): void => {
  scheduleThrottledDispatch(dragState.dispatchThrottle, () => {
    const draggedId = dragState.slots[dragState.fromIndex].id;
    const positions = getReorderedSwapPositions(dragState.slots, dragState.fromIndex, dragState.targetIndex);
    const updates = getSwapUpdates(dragState, draggedId, positions, draggedDeltaX, draggedDeltaY);

    dispatchNonEmptyUpdates(dispatch, updates);
  });
};
