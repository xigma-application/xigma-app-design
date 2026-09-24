// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { updateNode } from 'store/design/slice';

// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

// utils
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';

export const toggleFramesAutoLayout = (dispatch: AppDispatch, frames: TFrameNode[], isAutoLayoutSelected: boolean): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  frames.forEach((frame) => {
    if (isAutoLayoutSelected) {
      dispatch(updateNode({ changes: { layoutMode: LayoutMode.freeForm }, id: frame.id }));
    } else if (isFreeformFrame(frame)) {
      dispatch(updateNode({ changes: { layoutMode: LayoutMode.horizontal }, id: frame.id }));
    }
  });
  dispatch(endHistoryGesture());
};
