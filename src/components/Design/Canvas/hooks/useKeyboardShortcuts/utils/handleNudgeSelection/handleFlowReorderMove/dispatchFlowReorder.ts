// store
import { moveNodes } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlowReorderTargetIndex } from '../getFlowReorderTargetIndex';

export const dispatchFlowReorder = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  frame: TFrameNode,
  movedIds: string[],
  anchorId: string | undefined,
  position: 'after' | 'before',
): void => {
  const targetIndex = getFlowReorderTargetIndex(frame.childIds, movedIds, anchorId, position);

  dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
  dispatch(moveNodes({ nodeIds: movedIds, targetIndex, targetParentId: frame.id }));
  dispatch(endHistoryGesture());
};
