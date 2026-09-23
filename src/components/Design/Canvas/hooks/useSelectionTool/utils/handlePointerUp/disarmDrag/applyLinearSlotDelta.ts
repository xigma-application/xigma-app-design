// store
import { moveNodes } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutFrame } from '../../handlePointerMove/continueDrag/updateDragDropTarget/types';
import { TSlotDelta } from './types';

// utils
import { getAutoLayoutOriginalIndex } from '../../handlePointerMove/continueDrag/updateDragDropTarget/armAutoLayoutDropTarget/getAutoLayoutOriginalIndex';

export const applyLinearSlotDelta = (dispatch: AppDispatch, frame: TAutoLayoutFrame, orderedIds: string[], slotDelta: TSlotDelta): void => {
  const axisSteps = frame.layoutMode === LayoutMode.horizontal ? slotDelta.x : slotDelta.y;
  const steps = slotDelta.steps ?? axisSteps;
  const remainingCount = frame.childIds.filter((id) => !orderedIds.includes(id)).length;
  const originalIndex = getAutoLayoutOriginalIndex(frame.childIds, orderedIds);
  const targetIndex = Math.min(Math.max(originalIndex + steps, 0), remainingCount);

  if (targetIndex !== originalIndex) {
    dispatch(moveNodes({ nodeIds: orderedIds, targetIndex, targetParentId: frame.id }));
  }
};
