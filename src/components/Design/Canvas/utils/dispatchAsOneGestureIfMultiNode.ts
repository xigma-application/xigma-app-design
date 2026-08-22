// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { AppDispatch } from 'store';

export const dispatchAsOneGestureIfMultiNode = (dispatch: AppDispatch, owningNodeCount: number, run: () => void): void => {
  if (owningNodeCount > 1) {
    dispatch(beginHistoryGesture());
    run();
    dispatch(endHistoryGesture());
  } else {
    run();
  }
};
