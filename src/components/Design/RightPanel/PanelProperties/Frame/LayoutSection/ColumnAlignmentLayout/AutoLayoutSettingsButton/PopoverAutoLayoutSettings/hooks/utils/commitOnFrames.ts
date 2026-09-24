// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';

// store
import { AppDispatch } from 'store';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';

// types
import { TFrameNode } from 'types/design/types';

export const commitOnFrames = (dispatch: AppDispatch, frames: TFrameNode[], commit: TFunc<[TFrameNode]>): void => {
  dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
  frames.forEach(commit);
  dispatch(endHistoryGesture());
};
