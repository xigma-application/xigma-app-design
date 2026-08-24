// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { AppDispatch } from 'store';

// types
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const dispatchAsOneGestureIfMultiNode = (
  dispatch: AppDispatch,
  owningNodeCount: number,
  run: () => void,
  vectorSelection: TVectorSelectionSnapshot = EMPTY_VECTOR_SELECTION_SNAPSHOT,
): void => {
  if (owningNodeCount > 1) {
    dispatch(beginHistoryGesture(vectorSelection));
    run();
    dispatch(endHistoryGesture());
  } else {
    run();
  }
};
