import { createAction } from '@reduxjs/toolkit';

// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from './constants';
import { getDesignSnapshot } from './getDesignSnapshot';
import { replaceDesignSnapshot } from 'store/design/slice';

// types
import type { AppThunk } from 'store';
import { TVectorSelectionSnapshot } from 'types/design/canvas/types';

export const beginHistoryGesture = createAction<TVectorSelectionSnapshot>('history/beginGesture');
export const endHistoryGesture = createAction('history/endGesture');

export const undo = (
  currentVectorSelection: TVectorSelectionSnapshot = EMPTY_VECTOR_SELECTION_SNAPSHOT,
): AppThunk<TVectorSelectionSnapshot | null> => {
  return (dispatch, getState, historyStack) => {
    const popped = historyStack.undo({ design: getDesignSnapshot(getState()), vectorSelection: currentVectorSelection });

    if (popped) {
      dispatch(replaceDesignSnapshot(popped.design));
    }

    return popped ? popped.vectorSelection : null;
  };
};

export const redo = (
  currentVectorSelection: TVectorSelectionSnapshot = EMPTY_VECTOR_SELECTION_SNAPSHOT,
): AppThunk<TVectorSelectionSnapshot | null> => {
  return (dispatch, getState, historyStack) => {
    const popped = historyStack.redo({ design: getDesignSnapshot(getState()), vectorSelection: currentVectorSelection });

    if (popped) {
      dispatch(replaceDesignSnapshot(popped.design));
    }

    return popped ? popped.vectorSelection : null;
  };
};
